import {expect,test} from 'bun:test';
import * as THREE from 'three';
import {createPanelBody} from './panel-geometry';
import {initial,selectProfile,FALL_SLOPE} from './shroud-model';

test('modular corner profiles measure 18.9 by 18.9 mm, not the frame width',()=>{
 const c=selectProfile(initial,'modular'),mat=new THREE.MeshStandardMaterial();
 const group=createPanelBody(c,mat);
 const joiners=group.children.filter(o=>o.name.startsWith('Corner joiner'));
 expect(joiners).toHaveLength(4);
 for(const mesh of joiners){
  const points=mesh.geometry.getAttribute('position');
  const bounds=new THREE.Box3();
  for(let i=0;i<points.count;i++)bounds.expandByPoint(new THREE.Vector3(points.getX(i),points.getY(i)+points.getZ(i)*FALL_SLOPE,points.getZ(i)));
  const size=bounds.getSize(new THREE.Vector3());
  expect(size.x*1000).toBeCloseTo(18.9,3);
  expect(size.y*1000).toBeCloseTo(18.9,3);
 }
 group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mat.dispose();
});

test('bottom F extrusion matches the top profile, hugging the shroud the same way',()=>{
 const c=selectProfile(initial,'modular'),mat=new THREE.MeshStandardMaterial();
 const group=createPanelBody(c,mat);
 const mesh=group.getObjectByName('Corner joiner bottom right panel');
 expect(mesh).toBeInstanceOf(THREE.Mesh);
 const points=mesh.geometry.getAttribute('position');
 const outline=[];
 let minY=Infinity,maxY=-Infinity;
 for(let i=0;i<points.count;i++){
  if(Math.abs(points.getZ(i))>1e-7)continue;
  const x=points.getX(i),y=points.getY(i);
  outline.push([x,y]);
  minY=Math.min(minY,y);maxY=Math.max(maxY,y);
 }
 // Same profile as the top fitting: the channel mouth is the highest edge and
 // its four wall ends give the 6.8 mm slot.
 const mouth=outline.filter(([,y])=>Math.abs(y-maxY)<1e-7).map(([x])=>x*1000);
 const unique=[...new Set(mouth.map(v=>Math.round(v*1000)/1000))].sort((a,b)=>a-b);
 expect(unique).toHaveLength(4);
 expect(unique[2]-unique[1]).toBeCloseTo(6.8,3);
 expect(unique[1]).toBeLessThan(c.width/2);
 expect(unique[2]).toBeGreaterThan(c.width/2+6);
 // The closed back of the F sits below the mouth, exactly like the top fitting.
 const back=outline.filter(([,y])=>Math.abs(y-minY)<1e-7).map(([x])=>x*1000);
 const backUnique=[...new Set(back.map(v=>Math.round(v*1000)/1000))].sort((a,b)=>a-b);
 expect(backUnique).toHaveLength(2);
 expect(backUnique[1]-backUnique[0]).toBeCloseTo(18.9,3);
 group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mat.dispose();
});