import * as THREE from 'three';
import {Config,THICKNESS,FALL_SLOPE,palette} from './shroud-model';
import {archOutline} from './arch-geometry';
import {createInstallation} from './shroud-installation';
import {createPanelBody} from './panel-geometry';
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
 model.add(createPanelBody(c,mat,edges));
 if(c.profile==='louvered'){
 const angle=c.bladeAngle*Math.PI/180,bladeDepth=Math.min(d,0.16),pitch=c.bladePitch/1000;
 // Fit the unchanged blade angle between the sloping head and sill.
 const v=bladeDepth*Math.abs(Math.sin(angle)+FALL_SLOPE*Math.cos(angle))+t*Math.abs(Math.cos(angle)-FALL_SLOPE*Math.sin(angle));
 for(let yy=v/2+0.012;yy<=h-v/2-0.012;yy+=pitch){const blade=box(w,t,bladeDepth,0,yy-FALL_SLOPE*d/2,d/2);blade.rotation.x=angle;}
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

export function disposeShroudScene(scene:THREE.Scene){
 scene.traverse(ob=>{if(ob instanceof THREE.Mesh||ob instanceof THREE.Line){ob.geometry?.dispose();const materials=Array.isArray(ob.material)?ob.material:[ob.material];materials.forEach(m=>m.dispose());}});
}
