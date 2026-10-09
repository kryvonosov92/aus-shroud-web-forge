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

test('bottom F extrusion has the pictured 6.8 mm slot around the side panel',()=>{
 const c=selectProfile(initial,'modular'),mat=new THREE.MeshStandardMaterial();
 const group=createPanelBody(c,mat);
 const mesh=group.getObjectByName('Corner joiner bottom right panel');
 expect(mesh).toBeInstanceOf(THREE.Mesh);
 const points=mesh.geometry.getAttribute('position');
 const channelWalls=[];
 for(let i=0;i<points.count;i++){
  if(Math.abs(points.getZ(i))<1e-7&&Math.abs(points.getY(i)-0.0169)<1e-7)channelWalls.push(points.getX(i)*1000);
 }
 const unique=[...new Set(channelWalls.map(v=>Math.round(v*1000)/1000))].sort((a,b)=>a-b);
 expect(unique).toHaveLength(4);
 expect(unique[2]-unique[1]).toBeCloseTo(6.8,3);
 expect(unique[1]).toBeLessThan(c.width/2);
 expect(unique[2]).toBeGreaterThan(c.width/2+6);
 group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mat.dispose();
});