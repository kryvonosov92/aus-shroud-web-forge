import * as THREE from 'three';
import {Config,THICKNESS,FALL_SLOPE,palette} from './shroud-model';
import {archOutline} from './arch-geometry';
import {createInstallation} from './shroud-installation';
import {createPanelBody} from './panel-geometry';
import {louverLayout,LOUVER_EXTRUSION_WIDTH,LOUVER_EXTRUSION_DEPTH} from './louver-layout';
export type ModelOptions={windowVisible:boolean;studWallVisible:boolean;screwsVisible:boolean};
/** Shared geometry, material and lighting for the live model and PDF perspective. */
export function createShroudScene(c:Config,{windowVisible,studWallVisible,screwsVisible}:ModelOptions,gpu:boolean){
 const scene=new THREE.Scene();const model=new THREE.Group();scene.add(model);
 const w=c.width/1000,h=c.height/1000,d=c.depth/1000,t=THICKNESS/1000,rw=c.returnWidth/1000;
 const powder=palette.find(p=>p.hex===c.colour);
 const mat=new THREE.MeshStandardMaterial({color:c.colour,roughness:powder?.sheen==='Gloss'?0.28:0.65,metalness:powder?.brand==='Dulux'?0.5:0});const glass=new THREE.MeshStandardMaterial({color:gpu?0xb9d0da:0xd8e5eb,roughness:0.18,metalness:0.25,transparent:gpu,opacity:gpu?0.38:1,side:THREE.DoubleSide,depthWrite:false});const windowMat=new THREE.MeshStandardMaterial({color:0x596269,roughness:0.75});const edges=new THREE.LineBasicMaterial({color: new THREE.Color(c.colour).getHSL({h:0,s:0,l:0}).l>0.6?0x899095:0x535d65,transparent:true,opacity:0.5});
 const mesh=(geo:THREE.BufferGeometry,x=0,y=0,z=0,material=mat,outline=true)=>{const ob=new THREE.Mesh(geo,material);ob.position.set(x,y,z);model.add(ob);if(outline){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo,28),edges);ob.add(edge);}return ob;};
 const box=(a:number,b:number,cc:number,x:number,y:number,z:number,material=mat)=>mesh(new THREE.BoxGeometry(a,b,cc),x,y,z,material);


 const windowFrame=(group:THREE.Group,width:number,height:number,arch=false)=>{
 const pane= new THREE.Mesh(new THREE.PlaneGeometry(width,height),glass);pane.position.set(0,height/2,-0.012);group.add(pane);
 if(arch){group.remove(pane);pane.geometry.dispose();const ag=new THREE.Mesh(new THREE.ShapeGeometry(archOutline(c),80),glass);ag.position.z=-0.012;group.add(ag);return;}
 [[width,0.028,0.036,0,0.014,-0.026],[width,0.028,0.036,0,height-0.014,-0.026],[0.028,height,0.036,-width/2+0.014,height/2,-0.026],[0.028,height,0.036,width/2-0.014,height/2,-0.026]].forEach(a=>{const ob=new THREE.Mesh(new THREE.BoxGeometry(a[0],a[1],a[2]),windowMat);ob.position.set(a[3],a[4],a[5]);group.add(ob);});
 };
 if(c.profile==='round'){
 const radius=w/2,cy=radius;
 const ring=(outerRadius:number)=>{const shape=new THREE.Shape();shape.absarc(0,cy,outerRadius,0,Math.PI*2,false);const inner=new THREE.Path();inner.absarc(0,cy,radius,0,Math.PI*2,true);shape.holes.push(inner);return shape;};
 mesh(new THREE.ExtrudeGeometry(ring(radius+t),{depth:d,steps:Math.max(1,Math.ceil(d/0.06)),bevelEnabled:false,curveSegments:96}),0,0,0,mat,false);
 }else{
 const panels=createPanelBody(c,mat,edges);model.add(panels);
 if(c.profile==='louvered')for(const name of ['Left panel','Right panel']){
  const panel=panels.getObjectByName(name);
  if(panel instanceof THREE.Mesh)panel.material=mat.clone();
 }
 if(c.profile==='louvered'){
 const layout=louverLayout(c),blades=new THREE.Group();blades.name='Louver blades';model.add(blades);
 const rails=new THREE.Group();rails.name='Louver side extrusions';model.add(rails);
 const railWidth=LOUVER_EXTRUSION_WIDTH/1000,railDepth=LOUVER_EXTRUSION_DEPTH/1000,railHeight=layout.sectionHeight/1000;
 for(const side of [-1,1]){
  const rail=new THREE.Group();rail.name=side<0?'Left louver extrusion':'Right louver extrusion';
  rail.position.set(side*(w/2-railWidth/2),railHeight/2,layout.depthCenter/1000);rails.add(rail);
  // Closed rectangular exterior: blade sockets and inserted ends are concealed inside it.
  rail.add(new THREE.Mesh(new THREE.BoxGeometry(railWidth,railHeight,railDepth),mat));
 }
 for(const section of layout.sections){
  // Render only the exposed span; the inserted ends are hidden by the rectangular extrusions.
  const geo=new THREE.BoxGeometry(Math.max(w-2*railWidth,0.001),t,layout.bladeDepth/1000);
  geo.rotateX(layout.rotation);geo.translate(0,section.center/1000,layout.depthCenter/1000);
  // Clip terminal blades at the head/sill while keeping all internal front gaps exact.
  const positions=geo.getAttribute('position');
  for(let i=0;i<positions.count;i++)positions.setY(i,Math.max(layout.sectionBottom/1000,Math.min((layout.sectionBottom+layout.sectionHeight)/1000,positions.getY(i))));
  geo.computeVertexNormals();
  const blade=new THREE.Mesh(geo,mat);blade.name='Louver blade';blades.add(blade);
 }
 }
 }
 const windowLayers:THREE.Object3D[]=[];
 if(windowVisible){const win=new THREE.Group();if(c.profile==='round'){const pane=new THREE.Mesh(new THREE.CircleGeometry(w/2,96),glass);pane.position.set(0,w/2,-0.012);win.add(pane);const frame=new THREE.Mesh(new THREE.RingGeometry(Math.max(0,w/2-0.028),w/2,96),windowMat);frame.position.set(0,w/2,-0.006);win.add(frame);}else windowFrame(win,w,h,c.profile==='curved');model.add(win);win.traverse(o=>{if(o instanceof THREE.Mesh)windowLayers.push(o);});if(c.profile==='corner'||(c.profile==='hood'&&c.hoodCorner)){const ret=new THREE.Group();windowFrame(ret,rw,h);ret.rotation.y=Math.PI/2;ret.position.set(w/2,0,-rw/2);model.add(ret);ret.traverse(o=>{if(o instanceof THREE.Mesh)windowLayers.push(o);});}}
 const installation=createInstallation(c,mat,{studWall:studWallVisible,screws:screwsVisible});model.add(installation);
 if(gpu)scene.add(new THREE.HemisphereLight(0xffffff,0x687780,2.8));else scene.add(new THREE.AmbientLight(new THREE.Color(0.42,0.42,0.42)));
 const key=new THREE.DirectionalLight(0xffffff,gpu?3.3:0.8);key.position.set(-3,5,6);scene.add(key);const rim=new THREE.DirectionalLight(0xd8eaff,gpu?3:0.45);rim.position.set(4,2,-4);scene.add(rim);
 const svgLayers:{object:THREE.Object3D;front:number;rear:number}[]=[];
 if(!gpu){for(const object of windowLayers)svgLayers.push({object,front:-1,rear:3});installation.getObjectByName('90 x 45 mm pine stud wall')?.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Line)svgLayers.push({object,front:-4,rear:4});});installation.getObjectByName('Perforated fixing flanges')?.traverse(object=>{if(object instanceof THREE.Mesh)svgLayers.push({object,front:-3,rear:2});});installation.getObjectByName('Flange screws')?.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Line)svgLayers.push({object,front:object.userData.embedded?-5:-2,rear:1});});}
 return {scene,model,svgLayers};
}

/** Side inspection fades the jambs, without moving the actual extrusion. */
export function revealLouverExtrusions(model:THREE.Group,direction:THREE.Vector3){
 if(!model.getObjectByName('Louver side extrusions'))return;
 for(const name of ['Left panel','Right panel']){
  const panel=model.getObjectByName(name);
  if(!(panel instanceof THREE.Mesh)||!(panel.material instanceof THREE.MeshStandardMaterial))continue;
  const reveal=Math.abs(direction.x)>Math.abs(direction.z)*1.2;
  panel.material.transparent=reveal;panel.material.opacity=reveal?0.12:1;panel.material.depthWrite=!reveal;
 }
}

export function disposeShroudScene(scene:THREE.Scene){
 scene.traverse(ob=>{if(ob instanceof THREE.Mesh||ob instanceof THREE.Line){ob.geometry?.dispose();const materials=Array.isArray(ob.material)?ob.material:[ob.material];materials.forEach(m=>m.dispose());}});
}
