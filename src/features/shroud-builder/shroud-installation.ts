import * as THREE from 'three';
import {Config, THICKNESS, archContour, includedPanels, hasPanelOptions} from './shroud-model';
import {archPanelShapes} from './arch-geometry';
import {STUD_FACE, STUD_DEPTH, PREVIEW_HOLE_DIAMETER, FixingFace, flangeFixingLayout, equalCentres} from './installation-layout';

const mm=0.001;
const rect=(left:number,bottom:number,right:number,top:number)=>new THREE.Shape([
 new THREE.Vector2(left*mm,bottom*mm),new THREE.Vector2(right*mm,bottom*mm),
 new THREE.Vector2(right*mm,top*mm),new THREE.Vector2(left*mm,top*mm),
]);
const hole=(x:number,y:number,r:number)=>{
 const p=new THREE.Path();
 for(let i=0;i<=16;i++){const a=-i*Math.PI/8,px=(x+r*Math.cos(a))*mm,py=(y+r*Math.sin(a))*mm;if(i===0)p.moveTo(px,py);else p.lineTo(px,py);}
 p.closePath();return p;
};

/** Nominal installation context only; member/lintel and fixing engineering is not inferred. */
export function createInstallation(c:Config,material:THREE.MeshStandardMaterial,options:{studWall:boolean;screws:boolean}){
 const root=new THREE.Group();root.name='Installation';
 const flanges=new THREE.Group();flanges.name='Perforated fixing flanges';root.add(flanges);
 const timber=new THREE.Group();timber.name='90 x 45 mm pine stud wall';root.add(timber);
 const screws=new THREE.Group();screws.name='Flange screws';root.add(screws);
 const layout=flangeFixingLayout(c),w=c.width,h=c.height,t=THICKNESS,fl=c.flange,p=includedPanels(c);
 const run=(name:string)=>layout.runs.find(r=>r.name===name)?.points??[];
 const place=(object:THREE.Object3D,face:FixingFace)=>{if(face==='return'){object.rotation.y=Math.PI/2;object.position.x=w/2*mm;}};
 const flange=(shape:THREE.Shape,points=layout.points.filter(p=>p.face==='front'),face:FixingFace='front')=>{
  for(const p of points)shape.holes.push(hole(p.x,p.y,PREVIEW_HOLE_DIAMETER/2));
  const geo=new THREE.ExtrudeGeometry(shape,{depth:t*mm,bevelEnabled:false,curveSegments:64});geo.translate(0,0,-t*mm);
  const obj=new THREE.Mesh(geo,material);obj.name=`${face} flange with ${points.length} holes`;place(obj,face);flanges.add(obj);
 };
 if(fl){
  if(c.profile==='hood')flange(rect(-w/2,h+t,w/2,h+t+fl));
  else if(c.profile==='round'){
   const shape=new THREE.Shape();shape.absarc(0,w/2*mm,(w/2+t+fl)*mm,0,2*Math.PI,false);
   const inner=new THREE.Path();inner.absarc(0,w/2*mm,w/2*mm,0,2*Math.PI,true);shape.holes.push(inner);flange(shape);
  }else if(c.profile==='curved'){
   const shapes=archPanelShapes(c,t+fl);flange(shapes.head,run('Arch'));
   if(p.left)flange(shapes.left,run('Left jamb'));if(p.bottom)flange(shapes.bottom,run('Sill'));if(p.right)flange(shapes.right,run('Right jamb'));
  }else if(c.profile==='corner'){
   for(const face of ['front','return'] as const){
    const a=face==='front'?-w/2-t-fl:0,b=face==='front'?w/2-t:c.returnWidth+t+fl;
    const pts=layout.points.filter(p=>p.face===face);
    flange(rect(a,h+t,b,h+t+fl),pts.filter(p=>p.y>h),face);
     // Meet the jamb flanges at y=0; ending at -t leaves a visible 6 mm slot.
     if(p.bottom)flange(rect(a,-t-fl,b,0),pts.filter(p=>p.y<0),face);
    if(face==='front'?p.left:p.right)flange(rect(face==='front'?a:b-fl,0,face==='front'?a+fl:b,h+t),pts.filter(p=>p.y>=0&&p.y<=h),face);
   }
  }else if(hasPanelOptions(c.profile)){
   const a=-w/2-t-fl,b=w/2+t+fl;
   flange(rect(a,h+t,b,h+t+fl),run('Head'));
    if(p.bottom)flange(rect(a,-t-fl,b,0),run('Sill'));
   if(p.left)flange(rect(a,0,a+fl,h+t),run('Left jamb'));
   if(p.right)flange(rect(b-fl,0,b,h+t),run('Right jamb'));
  }else{
   // One continuous frame avoids doubled corner holes and overlapping flange faces.
   const shape=rect(-w/2-t-fl,-t-fl,w/2+t+fl,h+t+fl);
   const inner=new THREE.Path();inner.moveTo((-w/2-t)*mm,-t*mm);inner.lineTo((-w/2-t)*mm,(h+t)*mm);inner.lineTo((w/2+t)*mm,(h+t)*mm);inner.lineTo((w/2+t)*mm,-t*mm);inner.closePath();shape.holes.push(inner);flange(shape);
  }
 }
 if(options.screws&&fl){
  const steel=new THREE.MeshStandardMaterial({color:0xc4c9ce,metalness:0.75,roughness:0.3});
  const slotMat=new THREE.LineBasicMaterial({color:0x303841});
  const shaft=new THREE.CylinderGeometry(2.5*mm,2.5*mm,48*mm,10);shaft.rotateX(Math.PI/2);shaft.translate(0,0,-24*mm);
  const tip=new THREE.ConeGeometry(2.5*mm,5*mm,10);tip.rotateX(-Math.PI/2);tip.translate(0,0,-50.5*mm);
  const head=new THREE.CylinderGeometry(5.5*mm,5.5*mm,3*mm,16);head.rotateX(Math.PI/2);head.translate(0,0,1.5*mm);
  const cross=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.5*mm,0,3.05*mm),new THREE.Vector3(3.5*mm,0,3.05*mm),new THREE.Vector3(0,-3.5*mm,3.05*mm),new THREE.Vector3(0,3.5*mm,3.05*mm)]);
  for(const p of layout.points){
   const screw=new THREE.Group();screw.name='Illustrative flange screw';
   for(const geo of [shaft,tip,head]){const part=new THREE.Mesh(geo,steel);part.userData.embedded=geo!==head;screw.add(part);}screw.add(new THREE.LineSegments(cross,slotMat));
   if(p.face==='front')screw.position.set(p.x*mm,p.y*mm,0);else{screw.rotation.y=Math.PI/2;screw.position.set(w/2*mm,p.y*mm,-p.x*mm);}screws.add(screw);
  }
 }
 if(options.studWall){
  const pine=[0xd7b47e,0xdcbc86,0xcfab72,0xe0bf89].map(color=>new THREE.MeshStandardMaterial({color,roughness:0.88,metalness:0}));
  const grainMat=new THREE.LineBasicMaterial({color:0x9e793f,transparent:true,opacity:0.18});let index=0;
  const wood=(width:number,height:number,x:number,y:number,face:FixingFace='front')=>{
   if(width<=0||height<=0)return;
   const group=new THREE.Group();group.name='Pine 90 x 45';
   const board=new THREE.Mesh(new THREE.BoxGeometry(width*mm,height*mm,STUD_DEPTH*mm),pine[index++%pine.length]);board.position.set(x*mm,y*mm,(-t-STUD_DEPTH/2)*mm);group.add(board);
   // Light longitudinal grain keeps the 45 mm face legible in both renderers.
   const segments:THREE.Vector3[]=[];const vertical=height>width;
   for(const k of [-0.28,0.12,0.32]){const z=(-t-0.08)*mm;if(vertical){segments.push(new THREE.Vector3((x+width*k)*mm,(y-height*.46)*mm,z),new THREE.Vector3((x+width*k+1)*mm,(y+height*.46)*mm,z));}else segments.push(new THREE.Vector3((x-width*.46)*mm,(y+height*k)*mm,z),new THREE.Vector3((x+width*.46)*mm,(y+height*k+1)*mm,z));}
   group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segments),grainMat));place(group,face);timber.add(group);
  };
  const frame=(left:number,right:number,bottom:number,top:number,face:FixingFace='front',clipLeft=-Infinity,clipRight=Infinity,openCorner?:'left'|'right')=>{
   const f=STUD_FACE,wallLeft=Math.max(left-360,clipLeft),wallRight=Math.min(right+360,clipRight),wallBottom=bottom-350,wallTop=top+350;
   const beam=(a:number,b:number,y:number)=>{a=Math.max(a,clipLeft);b=Math.min(b,clipRight);wood(b-a,f,(a+b)/2,y,face);};
   const stud=(x:number,low:number,high:number)=>{if(low<top&&high>bottom&&((openCorner==='left'&&x<=Math.max(left,clipLeft)+f)||(openCorner==='right'&&x>=Math.min(right,clipRight)-f)))return;const a=Math.max(x-f/2,clipLeft),b=Math.min(x+f/2,clipRight);wood(b-a,high-low,(a+b)/2,(low+high)/2,face);};
   beam(wallLeft,wallRight,wallBottom+f/2);beam(wallLeft,wallRight,wallTop-f/2);
   for(const x of [left-f/2,right+f/2])stud(x,wallBottom+f,top);
   for(const x of [left-f*1.5,right+f*1.5,wallLeft+f/2,wallRight-f/2])stud(x,wallBottom+f,wallTop-f);
   beam(left-f,right+f,top+f/2);beam(left-f,right+f,top+f*1.5);
   beam(left,right,bottom-f/2);beam(left,right,bottom-f*1.5);
   const positions=equalCentres(left+f/2,right-f/2,450).positions;
   for(const x of positions){stud(x,wallBottom+f,bottom-2*f);stud(x,top+2*f,wallTop-f);}
   beam(wallLeft+f,left-2*f,(bottom+top)/2);beam(right+2*f,wallRight-f,(bottom+top)/2);
  };
  const arcBacking=(radius:number,cy:number,start:number,end:number)=>{
   const n=Math.max(8,Math.ceil((end-start)*(radius+STUD_FACE/2)/160)),step=(end-start)/n;
   // Straight, mitred blocking cut from 90 x 45 pine; never bent studs.
   for(let i=0;i<n;i++){
    const a=start+i*step,b=a+step,inner=radius/Math.cos(step/2),outer=(radius+STUD_FACE)/Math.cos(step/2);
    const points:[[number,number],[number,number],[number,number],[number,number]]=[
     [inner*Math.cos(a),cy+inner*Math.sin(a)],[outer*Math.cos(a),cy+outer*Math.sin(a)],
     [outer*Math.cos(b),cy+outer*Math.sin(b)],[inner*Math.cos(b),cy+inner*Math.sin(b)],
    ];
    const shape=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x*mm,y*mm)));
    const g=new THREE.ExtrudeGeometry(shape,{depth:STUD_DEPTH*mm,bevelEnabled:false});g.translate(0,0,(-t-STUD_DEPTH)*mm);
    const part=new THREE.Mesh(g,pine[i%pine.length]);part.name='Mitred 90 x 45 pine backing';timber.add(part);
   }
  };
  if(c.profile==='corner'){
   // An open corner window has no full-height pine post through the glazing.
   // Butt the two 90 mm-deep walls together and keep timber behind both flanges.
   // This removes intersecting/coplanar wood faces at the head and sill corner.
   frame(-w/2-t,w/2,-t,h+t,'front',-Infinity,w/2-t-STUD_DEPTH,'right');
   frame(0,c.returnWidth+t,-t,h+t,'return',t,Infinity,'left');
  }else if(c.profile==='round'){
   const r=w/2+t;frame(-r-STUD_FACE,r+STUD_FACE,-t-STUD_FACE,h+t+STUD_FACE);arcBacking(r,w/2,0,2*Math.PI);
  }else if(c.profile==='curved'){
   const r=w/2+t,outer=archContour(c,t+STUD_FACE);frame(-r-STUD_FACE,r+STUD_FACE,-t,h+t+STUD_FACE);
   arcBacking(c.internalRadius+t,outer.centerY,outer.startAngle,outer.endAngle);
   for(const x of [-r-STUD_FACE/2,r+STUD_FACE/2])wood(STUD_FACE,outer.springY+t,x,(outer.springY-t)/2);
  }else frame(-w/2-(c.profile==='hood'?0:t),w/2+(c.profile==='hood'?0:t),-t,h+t);
 }
 root.userData.fixingCount=layout.points.length;root.userData.maxFixingPitchMm=layout.maxPitch;
 return root;
}
