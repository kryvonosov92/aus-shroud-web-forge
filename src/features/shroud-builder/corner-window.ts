import * as THREE from 'three';
import {Config} from './shroud-model';

/** A tangent quarter-circle joining the two rear glazing planes, in metres. */
export function cornerWindowPath(c:Config){
 const w=c.width/1000,rw=c.returnWidth/1000;
 const radius=Math.min(0.6,w*0.45,rw*0.45),rear=0.012;
 const cx=w/2-rear-radius,cz=-rear-radius;
 const points=[new THREE.Vector2(-w/2,-rear)];
 for(let i=0;i<=64;i++){
  const angle=Math.PI/2-i*Math.PI/128;
  points.push(new THREE.Vector2(cx+radius*Math.cos(angle),cz+radius*Math.sin(angle)));
 }
 points.push(new THREE.Vector2(w/2-rear,-rw));
 return {points,radius,center:new THREE.Vector2(cx,cz)};
}

/** Continuous glass and perimeter rails only: no vertical frame at the bend. */
export function createRoundedCornerWindow(c:Config,glass:THREE.Material,frame:THREE.Material){
 const group=new THREE.Group();group.name='Rounded corner window';
 const {points}=cornerWindowPath(c),height=c.height/1000;
 const vertices:number[]=[],indices:number[]=[];
 for(const p of points)vertices.push(p.x,0,p.y,p.x,height,p.y);
 for(let i=0;i<points.length-1;i++){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const pane=new THREE.Mesh(geometry,glass);pane.name='Continuous curved corner glass';group.add(pane);
 // Perimeter rails follow the same path rather than cutting across the glass.
 const outer:THREE.Vector2[]=[],inner:THREE.Vector2[]=[];
 points.forEach((p,i)=>{
  const previous=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
  const tangent=next.clone().sub(previous).normalize(),normal=new THREE.Vector2(-tangent.y,tangent.x);
  outer.push(p.clone().addScaledVector(normal,0.006));
  inner.push(p.clone().addScaledVector(normal,-0.030));
 });
 const shape=new THREE.Shape([...outer,...inner.reverse()]);
 const railGeometry=new THREE.ExtrudeGeometry(shape,{depth:0.028,bevelEnabled:false});railGeometry.rotateX(Math.PI/2);
 for(const [name,y] of [['Curved window head rail',height],['Curved window sill rail',0.028]] as const){
  const rail=new THREE.Mesh(railGeometry.clone(),frame);rail.name=name;rail.position.y=y;group.add(rail);
 }
 railGeometry.dispose();
 for(const [i,name] of [[0,'Window face A end frame'],[points.length-1,'Window return B end frame']] as const){
  const p=points[i],end=new THREE.Mesh(new THREE.BoxGeometry(0.028,height,0.036),frame);
  if(i>0)end.rotation.y=Math.PI/2;
  end.position.set(p.x+(i===0?0.014:-0.012),height/2,p.y+(i===0?-0.012:0.014));end.name=name;group.add(end);
 }
 return group;
}