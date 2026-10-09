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
 const add=(name:string,geo:THREE.BufferGeometry,x=0,y=0,z=0,outline=true,radial=false)=>{
  geo.translate(x,y,z);
  const positions=geo.getAttribute('position');
  for(let i=0;i<positions.count;i++){
   const px=positions.getX(i),py=positions.getY(i),pz=positions.getZ(i);
   // A rounded corner falls radially from the wall corner, so its curved
   // front edge holds the same 3° fall as the straight canopies it joins.
   const projection=radial?Math.hypot(Math.max(0,px-w/2),Math.max(0,pz)):c.profile==='corner'||(c.profile==='hood'&&c.hoodCorner)?Math.max(0,pz,px-w/2):Math.max(0,pz);
    // The sill's upper face falls from y=0 at the rear. Jambs must follow
    // that face at their lower edge, rather than exposing an open wedge.
    const sillJamb=name==='Left'||name==='Right';
    const falls=c.profile==='curved'
     ? name==='Bottom'||(p.bottom&&sillJamb&&Math.abs(py)<1e-7)
     : !sillJamb||py<=1e-7||py>=h-1e-7;
    if(falls)positions.setY(i,py-projection*FALL_SLOPE);
  }
  geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,material);mesh.name=`${name} panel`;group.add(mesh);
  if(edges&&outline)mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,28),edges));
 };
  const box=(name:string,a:number,b:number,depth:number,x:number,y:number,z:number)=>add(name,new THREE.BoxGeometry(a,b,depth),x,y,z);
  // Plan-view plate with the front corners rounded off (radius = depth).
  // Shape y becomes z after the X rotation; extrusion becomes the plate thickness.
  const roundedTop=(width:number,depth:number,plate:number,roundLeft:boolean,roundRight:boolean)=>{
   const r=Math.min(depth,width/2);
   const s=new THREE.Shape();
   s.moveTo(-width/2,0);s.lineTo(width/2,0);
   if(roundRight){s.lineTo(width/2,depth-r);s.absarc(width/2-r,depth-r,r,0,Math.PI/2,false);}else s.lineTo(width/2,depth);
   if(roundLeft){s.lineTo(-width/2+r,depth);s.absarc(-width/2+r,depth-r,r,Math.PI/2,Math.PI,false);}else s.lineTo(-width/2,depth);
   s.closePath();
   const g=new THREE.ExtrudeGeometry(s,{depth:plate,bevelEnabled:false,curveSegments:48});
   g.rotateX(Math.PI/2);
   return g;
  };
  if(c.profile==='hood'){
   // With a corner wrap the canopy reads as one folded sheet, so skip outlines.
   if(c.roundedEnds)add('Top',roundedTop(w,d,plate,true,!c.hoodCorner),0,h+plate,0,!c.hoodCorner);
   else add('Top',new THREE.BoxGeometry(w,plate,d),0,h+plate/2,d/2,!c.hoodCorner);
   const stiffener=new THREE.Shape();stiffener.moveTo(0,0);stiffener.lineTo(d,0);stiffener.lineTo(0,c.stiffenerHeight/1000);stiffener.closePath();
   const rib=new THREE.ExtrudeGeometry(stiffener,{depth:t,bevelEnabled:false});rib.rotateY(-Math.PI/2);
   // Near a rounded end the canopy edge recedes, so ribs are cut to stop at that edge.
   const endR=Math.min(d,w/2);
   const edgeDepth=(a:number,r:number)=>a>=r?d:Math.max(0.01,d-r+Math.sqrt(Math.max(0,r*r-(r-Math.max(0,a))**2)));
   const ribOf=(len:number,rotate:boolean)=>{if(len>=d-1e-9)return null;const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(len,0);s.lineTo(0,c.stiffenerHeight/1000);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false});if(rotate)g.rotateY(-Math.PI/2);return g;};
   for(const position of hoodStiffenerLayout(c.width).positions){
    const pos=position/1000;let len=d;
    if(c.roundedEnds){len=Math.min(len,edgeDepth(pos-t/2,endR));if(!c.hoodCorner)len=Math.min(len,edgeDepth(w-pos-t/2,endR));}
    add('Stiffener',ribOf(len,true)??rib.clone(),-w/2+pos+t/2,h+plate);
   }
   if(c.hoodCorner){
    // Return canopy wraps the right-hand corner, falling away from the wall.
    if(c.roundedEnds){const g=roundedTop(rw,d,plate,false,true);g.rotateY(Math.PI/2);add('Top return',g,w/2,h+plate,-rw/2,false);}
    else add('Top return',new THREE.BoxGeometry(d,plate,rw),w/2+d/2,h+plate/2,-rw/2,false);
    // Corner infill: two triangles meeting on the diagonal hip so both canopies join.
    const tri=(pts:[number,number][])=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:plate,bevelEnabled:false});g.rotateX(Math.PI/2);return g;};
    // No outline on the infill: the canopies read as one folded sheet.
    if(c.hoodCornerRounded){
     // Rounded corner: quarter-circle canopy sweeping from the front to the return.
     const s=new THREE.Shape();s.moveTo(0,0);s.absarc(0,0,d,0,Math.PI/2,false);s.lineTo(0,0);
     const g=new THREE.ExtrudeGeometry(s,{depth:plate,bevelEnabled:false,curveSegments:64});g.rotateX(Math.PI/2);
     add('Top corner',g,w/2,h+plate,0,false,true);
    }else{
    add('Top corner',tri([[0,0],[d,d],[0,d]]),w/2,h+plate,0,false);
    add('Top corner',tri([[0,0],[d,0],[d,d]]),w/2,h+plate,0,false);
    }
    // Return ribs run perpendicular to the side wall (along +x).
    const returnRib=new THREE.ExtrudeGeometry(stiffener,{depth:t,bevelEnabled:false});
    const returnR=Math.min(d,rw/2);
    for(const position of hoodStiffenerLayout(c.returnWidth).positions){
     const pos=position/1000;const len=c.roundedEnds?edgeDepth(rw-pos-t/2,returnR):d;
     add('Stiffener',ribOf(len,false)??returnRib.clone(),w/2,h+plate,-pos-t/2);
    }
    returnRib.dispose();
   }
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
  if(c.profile==='modular'){
   // Stepped internal corner joiners (per AWS detail): a double-step angle seated in the
   // inside corner where head/sill meets each jamb, running the full depth and
   // standing 2 mm proud of the front edge so the stepped profile reads at the face.
   const mm=(v:number)=>v/1000;
   const profile:[number,number][]=[[0,0],[30,0],[30,-3],[18,-3],[18,-6],[6,-6],[6,-18],[3,-18],[3,-30],[0,-30]];
   const joiner=(name:string,sx:number,top:boolean)=>{
    const sy=top?1:-1,shape=new THREE.Shape();
    profile.forEach(([x,y],i)=>{const px=sx*mm(x),py=sy*mm(y);i?shape.lineTo(px,py):shape.moveTo(px,py);});
    shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:d+0.002,bevelEnabled:false});
    add(name,g,sx*-w/2*-1*(sx<0?1:1)*(sx<0?1:1)===0?0:-sx*w/2*-1,top?h:0,0);
   };
   if(p.left)joiner('Corner joiner top left',-1,true);
   if(p.right)joiner('Corner joiner top right',1,true);
   if(p.bottom&&p.left)joiner('Corner joiner bottom left',-1,false);
   if(p.bottom&&p.right)joiner('Corner joiner bottom right',1,false);
  }
 }
 return group;
}
