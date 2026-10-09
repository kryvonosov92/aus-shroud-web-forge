'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Config, products, hasPanelOptions, panelDescription } from './shroud-model';
import {createShroudScene,disposeShroudScene,revealLouverExtrusions} from './shroud-scene';
export type ViewMode='perspective'|'front'|'side'|'top';
type Props={config:Config; windowVisible:boolean; studWallVisible:boolean; screwsVisible:boolean; dimensions:boolean; view:ViewMode; reset:number; onReady?:(ready:boolean)=>void};
export default function ShroudView({config:c,windowVisible,studWallVisible,screwsVisible,dimensions,view,reset,onReady}:Props){
 const host=useRef<HTMLDivElement>(null);const [error,setError]=useState(false);
 useEffect(()=>{
 if(!host.current)return;const el=host.current;let renderer:THREE.WebGLRenderer|SVGRenderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}catch{renderer=new SVGRenderer();renderer.setPrecision(4);renderer.overdraw=0.5;}
 setError(false);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));if(renderer instanceof THREE.WebGLRenderer){renderer.setClearColor(0xe9edef,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;}else{renderer.setClearColor(new THREE.Color(0xf6f6f5),1);}el.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label',`${products.find(p=>p.id===c.profile)?.title} interactive 3D model; ${c.width} mm wide, ${c.height} mm high, ${c.depth} mm deep${hasPanelOptions(c.profile)?`; panels: ${panelDescription(c)}`:''}`);
 const {scene,model,svgLayers}=createShroudScene(c,{windowVisible,studWallVisible,screwsVisible},renderer instanceof THREE.WebGLRenderer);
 const w=c.width/1000,h=c.height/1000,d=c.depth/1000;
 const labels:{element:HTMLDivElement;point:THREE.Vector3}[]=[];const labelLayer=document.createElement('div');labelLayer.className='dimension-labels';el.appendChild(labelLayer);
 const dimColor=0x5e6269;
 const dim=(a:THREE.Vector3,b:THREE.Vector3,label:string,vertical=false)=>{
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:dimColor}));model.add(line);
 for(const v of [a,b]){const off=vertical?new THREE.Vector3(0.03,0,0):new THREE.Vector3(0,0.03,0);model.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([v.clone().sub(off),v.clone().add(off)]),new THREE.LineBasicMaterial({color:dimColor})));}
 const item=document.createElement('div');item.className='dimension-tag';item.textContent=label;labelLayer.appendChild(item);labels.push({element:item,point:a.clone().add(b).multiplyScalar(0.5)});
 };
 if(dimensions){const gap=Math.max(w,h)*0.1;dim(new THREE.Vector3(-w/2,-gap,d+0.025),new THREE.Vector3(w/2,-gap,d+0.025),`${c.profile==='round'?'Ø ':''}${c.width.toLocaleString()}${c.profile==='round'?' INTERNAL':' W'}`);if(c.profile!=='hood'&&c.profile!=='round')dim(new THREE.Vector3(-w/2-gap,0,d+0.025),new THREE.Vector3(-w/2-gap,h,d+0.025),`${c.height.toLocaleString()} H`,true);dim(new THREE.Vector3(w/2+gap,h+gap,0),new THREE.Vector3(w/2+gap,h+gap,d),`${c.depth} D`);if(c.profile==='hood'&&c.hoodCorner){const rw=c.returnWidth/1000;dim(new THREE.Vector3(w/2+d+gap,h+gap,0),new THREE.Vector3(w/2+d+gap,h+gap,-rw),`${c.returnWidth} RETURN`);}}
 const bounds=new THREE.Box3().setFromObject(model);const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const extent=Math.max(size.x,size.y,size.z,0.5);
 const camera=view==='perspective'?new THREE.PerspectiveCamera(35,1,0.001,500):new THREE.OrthographicCamera(-1,1,1,-1,0.001,500);const controls=new OrbitControls(camera,renderer.domElement as unknown as HTMLElement);controls.enableDamping=true;controls.dampingFactor=0.12;controls.target.copy(center);controls.minDistance=extent*0.25;controls.maxDistance=extent*15;controls.enablePan=true;controls.maxPolarAngle=Math.PI*0.97;
 let base=extent*2.0;const setCam=()=>{const aspect=el.clientWidth/el.clientHeight;const distance=base/Math.min(aspect,1);if(view==='front')camera.position.copy(center).add(new THREE.Vector3(0,0,distance));else if(view==='side')camera.position.copy(center).add(new THREE.Vector3(distance,0,0.001));else if(view==='top')camera.position.copy(center).add(new THREE.Vector3(0,distance,0.001));else camera.position.copy(center).add(new THREE.Vector3(distance*0.64,distance*0.32,distance*0.92));camera.lookAt(center);controls.update();};
 const gpu=renderer instanceof THREE.WebGLRenderer;
 const resize=()=>{const width=el.clientWidth,height=el.clientHeight;if(!width||!height)return;renderer.setSize(width,height);const aspect=width/height;if(camera instanceof THREE.PerspectiveCamera)camera.aspect=aspect;else{const half=extent*0.61/Math.min(aspect,1);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;}camera.updateProjectionMatrix();};resize();setCam();const ro=new ResizeObserver(resize);ro.observe(el);let raf=0;
 // SVG has no depth buffer. Keep the rear installation layers behind the body
 // from the outside; reverse their order when orbiting to the back of the wall.
 const inspectionDirection=new THREE.Vector3();
 const render=()=>{raf=requestAnimationFrame(render);controls.update();revealLouverExtrusions(model,inspectionDirection.copy(camera.position).sub(controls.target));for(const layer of svgLayers)layer.object.renderOrder=camera.position.z>=controls.target.z?layer.front:layer.rear;renderer.render(scene,camera);for(const label of labels){const p=label.point.clone().project(camera);label.element.style.transform=`translate(-50%, -50%) translate(${(p.x*0.5+0.5)*el.clientWidth}px,${(-p.y*0.5+0.5)*el.clientHeight}px)`;label.element.style.visibility=p.z>1?'hidden':'visible';}};render();onReady?.(true);
 const keyHandler=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;e.preventDefault();if(camera instanceof THREE.OrthographicCamera&&(e.key==='+'||e.key==='-')){camera.zoom*=e.key==='+'?1.1:0.9;camera.updateProjectionMatrix();controls.update();return;}const delta=camera.position.clone().sub(controls.target);if(e.key==='+'||e.key==='-')delta.multiplyScalar(e.key==='+'?0.9:1.1);else{const spherical=new THREE.Spherical().setFromVector3(delta);if(e.key==='ArrowLeft')spherical.theta-=0.12;if(e.key==='ArrowRight')spherical.theta+=0.12;if(e.key==='ArrowUp')spherical.phi=Math.max(0.05,spherical.phi-0.12);if(e.key==='ArrowDown')spherical.phi=Math.min(Math.PI-0.05,spherical.phi+0.12);delta.setFromSpherical(spherical);}camera.position.copy(controls.target).add(delta);controls.update();};el.addEventListener('keydown',keyHandler);
 return()=>{cancelAnimationFrame(raf);ro.disconnect();controls.dispose();el.removeEventListener('keydown',keyHandler);disposeShroudScene(scene);if(renderer instanceof THREE.WebGLRenderer)renderer.dispose();renderer.domElement.remove();labelLayer.remove();};
 },[c,windowVisible,studWallVisible,screwsVisible,dimensions,view,reset,onReady]);
 return <div ref={host} className="three-host" tabIndex={0} aria-label="Interactive shroud view. Drag to rotate. Pinch or scroll to zoom. Arrow keys rotate; plus and minus zoom.">{error&&<div className="view-error">3D is unavailable in this browser. Use the elevation view or enable WebGL.</div>}</div>;
}
