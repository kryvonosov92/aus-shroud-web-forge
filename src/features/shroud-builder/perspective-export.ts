import * as THREE from 'three';
import {SVGRenderer} from 'three/examples/jsm/renderers/SVGRenderer.js';
import {Config} from './shroud-model';
import {createShroudScene,disposeShroudScene,ModelOptions} from './shroud-scene';

/** Fixed perspective, independent of the live camera, active tab and device size. */
export function exportCamera(model:THREE.Group,width:number,height:number){
 const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3());
 const camera=new THREE.PerspectiveCamera(35,width/height,.001,500);
 const direction=new THREE.Vector3(.64,.32,.92).normalize();camera.position.copy(center).add(direction);camera.lookAt(center);camera.updateMatrixWorld(true);
 // Fit every corner in camera space, including long hoods and corner returns.
 const rotation=new THREE.Matrix4().extractRotation(camera.matrixWorld).invert(),tanV=Math.tan(THREE.MathUtils.degToRad(35/2)),tanH=tanV*width/height;
 let distance=.5;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const point=new THREE.Vector3(x,y,z).sub(center).applyMatrix4(rotation);
  distance=Math.max(distance,point.z+Math.abs(point.x)/tanH*1.12,point.z+Math.abs(point.y)/tanV*1.12);
 }
 camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);camera.updateMatrixWorld(true);return camera;
}
export async function capturePerspective(c:Config,options:ModelOptions):Promise<string>{
 const width=1600,height=900;
 let renderer:THREE.WebGLRenderer|SVGRenderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}
 catch{renderer=new SVGRenderer();renderer.setPrecision(5);renderer.overdraw=.5;}
 const gpu=renderer instanceof THREE.WebGLRenderer;
 renderer.setSize(width,height);renderer.setPixelRatio(1);
 renderer.setClearColor(new THREE.Color(0xf6f6f5),1);
 if(renderer instanceof THREE.WebGLRenderer){renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;}
 const {scene,model,svgLayers}=createShroudScene(c,options,gpu);
 const labels=addDimensions(model,c);
 try{
  for(const layer of svgLayers)layer.object.renderOrder=layer.front;
  const camera=exportCamera(model,width,height);
  renderer.render(scene,camera);
  const finish=(source:CanvasImageSource)=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Could not prepare the perspective image.');ctx.fillStyle='#f6f6f5';ctx.fillRect(0,0,width,height);ctx.drawImage(source,0,0,width,height);drawLabels(ctx,labels,model,camera,width,height);return canvas.toDataURL('image/jpeg',.93);};
  if(renderer instanceof THREE.WebGLRenderer)return finish(renderer.domElement);
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(renderer.domElement)],{type:'image/svg+xml'}));
  try{const img=new Image();img.src=url;await img.decode();return finish(img);}finally{URL.revokeObjectURL(url);}
 }finally{disposeShroudScene(scene);if(renderer instanceof THREE.WebGLRenderer)renderer.dispose();}
}

type Label={text:string;point:THREE.Vector3};
/** Same dimension lines as the live 3D view, added to the export model. */
function addDimensions(model:THREE.Group,c:Config):Label[]{
 const w=c.width/1000,h=c.height/1000,d=c.depth/1000,labels:Label[]=[],mat=new THREE.LineBasicMaterial({color:0x3d4046});
 const dim=(a:THREE.Vector3,b:THREE.Vector3,text:string,vertical=false)=>{
  model.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat));
  for(const v of [a,b]){const off=vertical?new THREE.Vector3(.03,0,0):new THREE.Vector3(0,.03,0);model.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([v.clone().sub(off),v.clone().add(off)]),mat));}
  labels.push({text,point:a.clone().add(b).multiplyScalar(.5)});
 };
 const gap=Math.max(w,h)*.1;
 dim(new THREE.Vector3(-w/2,-gap,d+.025),new THREE.Vector3(w/2,-gap,d+.025),`${c.profile==='round'?'Ø ':''}${c.width.toLocaleString()}${c.profile==='round'?' INTERNAL':' W'}`);
 if(c.profile!=='hood'&&c.profile!=='round')dim(new THREE.Vector3(-w/2-gap,0,d+.025),new THREE.Vector3(-w/2-gap,h,d+.025),`${c.height.toLocaleString()} H`,true);
 dim(new THREE.Vector3(w/2+gap,h+gap,0),new THREE.Vector3(w/2+gap,h+gap,d),`${c.depth} D`);
 return labels;
}
function drawLabels(ctx:CanvasRenderingContext2D,labels:Label[],model:THREE.Group,camera:THREE.Camera,width:number,height:number){
 model.updateMatrixWorld(true);
 ctx.font='600 30px Inter, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 for(const l of labels){
  const p=model.localToWorld(l.point.clone()).project(camera);
  const x=Math.min(width-20,Math.max(20,(p.x+1)/2*width)),y=Math.min(height-20,Math.max(20,(1-p.y)/2*height));
  const tw=ctx.measureText(l.text).width+28,th=46;
  ctx.fillStyle='#ffffff';ctx.strokeStyle='#3d4046';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(Math.min(width-tw-4,Math.max(4,x-tw/2)),y-th/2,tw,th,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#1f2226';ctx.fillText(l.text,Math.min(width-tw/2-4,Math.max(tw/2+4,x)),y+1);
 }
}
