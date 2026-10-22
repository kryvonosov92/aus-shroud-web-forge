import * as THREE from 'three';
import {Config,hasCornerReturn,isCornerShroud} from './shroud-model';

/** Shared rear-opening dimensions for live and exported models, in metres. */
export function modelDimensions(c:Config){
 const w=c.width/1000,h=c.height/1000,d=c.depth/1000,gap=Math.max(w,h)*.1;
 const dimensions:{a:THREE.Vector3;b:THREE.Vector3;text:string;vertical?:boolean}[]=[
  {a:new THREE.Vector3(-w/2,-gap,d+.025),b:new THREE.Vector3(w/2,-gap,d+.025),text:`${c.profile==='round'?'Ø ':''}${c.width.toLocaleString('en-AU')}${c.profile==='round'?' INTERNAL':isCornerShroud(c)?' A':' W'}`},
 ];
 if(c.profile!=='hood'&&c.profile!=='round')dimensions.push({a:new THREE.Vector3(-w/2-gap,0,d+.025),b:new THREE.Vector3(-w/2-gap,h,d+.025),text:`${c.height.toLocaleString('en-AU')} H`,vertical:true});
 dimensions.push({a:new THREE.Vector3(w/2+gap,h+gap,0),b:new THREE.Vector3(w/2+gap,h+gap,d),text:`${c.depth} D`});
 if(hasCornerReturn(c))dimensions.push({a:new THREE.Vector3(w/2+d+gap,-gap,0),b:new THREE.Vector3(w/2+d+gap,-gap,-c.returnWidth/1000),text:`${c.returnWidth.toLocaleString('en-AU')}${isCornerShroud(c)?' B':' RETURN'}`});
 return dimensions;
}