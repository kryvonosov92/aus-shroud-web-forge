import * as THREE from 'three';
import {Config,archContour} from './shroud-model';

/** Parallel circular/straight boundary, including the true offset jamb junction. */
export function archOutline(c:Config,offset=0,clockwise=false){
 const a=archContour(c,offset),s=.001,shape=new THREE.Shape();
 shape.moveTo(-a.halfWidth*s,-offset*s);
 if(clockwise){
  shape.lineTo(-a.halfWidth*s,a.springY*s);
  shape.absarc(0,a.centerY*s,a.radius*s,a.endAngle,a.startAngle,true);
  shape.lineTo(a.halfWidth*s,-offset*s);
 }else{
  shape.lineTo(a.halfWidth*s,-offset*s);
  shape.lineTo(a.halfWidth*s,a.springY*s);
  shape.absarc(0,a.centerY*s,a.radius*s,a.startAngle,a.endAngle,false);
 }
 shape.closePath();return shape;
}
export function archRing(c:Config,offset:number){
 const shape=archOutline(c,offset);shape.holes.push(archOutline(c,0,true));return shape;
}

/** Four adjoining pieces; the curved head remains when either jamb is omitted. */
export function archPanelShapes(c:Config,offset:number){
 const inner=archContour(c),outer=archContour(c,offset),s=.001;
 const polygon=(points:number[][])=>new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x*s,y*s)));
 const head=new THREE.Shape();
 head.moveTo(-inner.halfWidth*s,inner.springY*s);
 head.absarc(0,inner.centerY*s,inner.radius*s,inner.endAngle,inner.startAngle,true);
 head.lineTo(outer.halfWidth*s,outer.springY*s);
 head.absarc(0,outer.centerY*s,outer.radius*s,outer.startAngle,outer.endAngle,false);
 head.closePath();
 return {
  head,
  left:polygon([[-outer.halfWidth,0],[-inner.halfWidth,0],[-inner.halfWidth,inner.springY],[-outer.halfWidth,outer.springY]]),
  right:polygon([[inner.halfWidth,0],[outer.halfWidth,0],[outer.halfWidth,outer.springY],[inner.halfWidth,inner.springY]]),
  bottom:polygon([[-outer.halfWidth,-offset],[outer.halfWidth,-offset],[outer.halfWidth,0],[-outer.halfWidth,0]]),
 };
}
