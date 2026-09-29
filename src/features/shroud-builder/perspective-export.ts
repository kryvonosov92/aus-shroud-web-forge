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
 try{
  for(const layer of svgLayers)layer.object.renderOrder=layer.front;
  renderer.render(scene,exportCamera(model,width,height));
  if(renderer instanceof THREE.WebGLRenderer)return renderer.domElement.toDataURL('image/jpeg',.93);
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(renderer.domElement)],{type:'image/svg+xml'}));
  try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Could not prepare the perspective image.');ctx.fillStyle='#f6f6f5';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);return canvas.toDataURL('image/jpeg',.93);}finally{URL.revokeObjectURL(url);}
 }finally{disposeShroudScene(scene);if(renderer instanceof THREE.WebGLRenderer)renderer.dispose();}
}
