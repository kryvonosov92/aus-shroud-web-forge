import * as THREE from 'three';
import {Config,THICKNESS,FALL_SLOPE,FALL_DEGREES,includedPanels,hoodStiffenerLayout} from './shroud-model';
import {archPanelShapes} from './arch-geometry';

/** Independent plates. Internal dimensions are measured at the rear fixing plane. */
export function createPanelBody(c:Config,material:THREE.MeshStandardMaterial,edges?:THREE.LineBasicMaterial){
 const group=new THREE.Group();group.name='Shroud panels';
 if(c.profile==='round')return group;
 const p=includedPanels(c),w=c.width/1000,h=c.height/1000,d=c.depth/1000,t=THICKNESS/1000,rw=c.returnWidth/1000,bd=c.bottomDepth/1000;
 // Vertical separation of parallel 3° faces retains a true 6 mm plate thickness.
 const plate=t/Math.cos(FALL_DEGREES*Math.PI/180);
 const add=(name:string,geo:THREE.BufferGeometry,x=0,y=0,z=0,outline=true)=>{
  geo.translate(x,y,z);
  const positions=geo.getAttribute('position');
  for(let i=0;i<positions.count;i++){
   const px=positions.getX(i),py=positions.getY(i),pz=positions.getZ(i);
   const projection=c.profile==='corner'?Math.max(0,pz,px-w/2):Math.max(0,pz);
   // Leave the circular arch untouched; only extend jamb bottoms to meet its sill.
   const falls=c.profile!=='curved'||name==='Bottom'||(p.bottom&&(name==='Left'||name==='Right')&&Math.abs(py)<1e-7);
   if(falls)positions.setY(i,py-projection*FALL_SLOPE);
  }
  geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,material);mesh.name=`${name} panel`;group.add(mesh);
  if(edges&&outline)mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,28),edges));
 };
 const box=(name:string,a:number,b:number,depth:number,x:number,y:number,z:number)=>add(name,new THREE.BoxGeometry(a,b,depth),x,y,z);
 if(c.profile==='hood'){
  box('Top',w,plate,d,0,h+plate/2,d/2);
  const stiffener=new THREE.Shape();stiffener.moveTo(0,0);stiffener.lineTo(d,0);stiffener.lineTo(0,c.stiffenerHeight/1000);stiffener.closePath();
  const rib=new THREE.ExtrudeGeometry(stiffener,{depth:t,bevelEnabled:false});rib.rotateY(-Math.PI/2);
  for(const position of hoodStiffenerLayout(c.width).positions)add('Stiffener',rib.clone(),-w/2+position/1000+t/2,h+plate);
  rib.dispose();
 }else if(c.profile==='curved'){
  const shapes=archPanelShapes(c,THICKNESS);
  for(const key of ['head','left','right'] as const)add(key==='head'?'Top':key[0].toUpperCase()+key.slice(1),new THREE.ExtrudeGeometry(shapes[key],{depth:d,steps:Math.max(1,Math.ceil(d/.06)),bevelEnabled:false,curveSegments:80}),0,0,0,false);
  if(p.bottom)box('Bottom',w+2*t,plate,d,0,-plate/2,d/2);
 }else if(c.profile==='corner'){
  // Two planes meet on the diagonal hip. Explicit triangles preserve the crease;
  // only the outside perimeter has thickness faces, so no doubled corner seam.
  const points=[[-w/2-t,0],[w/2,0],[w/2,-rw-t],[w/2+d,-rw-t],[w/2+d,d],[-w/2-t,d]];
  const vertices:number[]=[];
  const vertex=(i:number,y:number)=>vertices.push(points[i][0],y,points[i][1]);
  const tri=(a:number,b:number,cc:number,y:number)=>{vertex(a,y);vertex(b,y);vertex(cc,y);};
  for(const [a,b,cc] of [[0,1,4],[0,4,5],[1,2,3],[1,3,4]]){tri(a,cc,b,plate);tri(a,b,cc,0);}
  for(let i=0;i<points.length;i++){const j=(i+1)%points.length;vertex(i,0);vertex(j,plate);vertex(j,0);vertex(i,0);vertex(i,plate);vertex(j,plate);}
  const head=new THREE.BufferGeometry();head.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  add('Top',head.clone(),0,h);
  if(p.bottom)add('Bottom',head.clone(),0,-plate);
  head.dispose();
  if(p.left)box('Left',t,h,d,-w/2-t/2,h/2,d/2);
  if(p.right)box('Right',d,h,t,w/2+d/2,h/2,-rw-t/2);
 }else{
  box('Top',w+2*t,plate,d,0,h+plate/2,d/2);
  const sillDepth=c.profile==='tapered'?bd:d;
  if(p.bottom)box('Bottom',w+2*t,plate,sillDepth,0,-plate/2,sillDepth/2);
  if(c.profile==='tapered'){
   const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(bd,0);shape.lineTo(d,h);shape.lineTo(0,h);shape.closePath();
   const side=new THREE.ExtrudeGeometry(shape,{depth:t,bevelEnabled:false});side.rotateY(-Math.PI/2);
   if(p.left)add('Left',side.clone(),-w/2);if(p.right)add('Right',side.clone(),w/2+t);side.dispose();
  }else{
   if(p.left)box('Left',t,h,d,-w/2-t/2,h/2,d/2);
   if(p.right)box('Right',t,h,d,w/2+t/2,h/2,d/2);
  }
 }
 return group;
}
