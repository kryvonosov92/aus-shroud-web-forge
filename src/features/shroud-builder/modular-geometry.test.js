import {expect,test} from 'bun:test';
import * as THREE from 'three';
import {createPanelBody} from './panel-geometry';
import {initial,selectProfile,FALL_SLOPE,THICKNESS,FALL_DEGREES} from './shroud-model';

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
 const outlineOf=name=>{
  const mesh=group.getObjectByName(name);
  expect(mesh).toBeInstanceOf(THREE.Mesh);
  const points=mesh.geometry.getAttribute('position');
  const out=[];
  for(let i=0;i<points.count;i++){
   if(Math.abs(points.getZ(i))>1e-7)continue;
   out.push([Math.round(points.getX(i)*1e6),Math.round(points.getY(i)*1e6)]);
  }
  return out;
 };
 const top=outlineOf('Corner joiner top right panel');
 const bottom=outlineOf('Corner joiner bottom right panel');
 // The bottom fitting is the identical F cross-section, translated down to the sill.
 const topMinY=Math.min(...top.map(([,y])=>y));
 const bottomMinY=Math.min(...bottom.map(([,y])=>y));
 const dy=bottomMinY-topMinY;
 const normalised=bottom.map(([x,y])=>`${x},${y-dy}`).sort();
 const reference=top.map(([x,y])=>`${x},${y}`).sort();
 expect(normalised).toEqual(reference);
  const plate=THICKNESS/Math.cos(FALL_DEGREES*Math.PI/180);
  expect(dy/1000).toBeCloseTo(-c.height-plate,3);
 // And it hugs the shroud width exactly like the top one.
 const xs=bottom.map(([x])=>x/1000);
 expect(Math.max(...xs)).toBeCloseTo(c.width/2+6,3);
 expect(Math.max(...xs)-Math.min(...xs)).toBeCloseTo(18.9,3);
 group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mat.dispose();
});

test('both bottom F slot walls hug the sill with the same 6.8 mm clearance as the head',()=>{
 const c=selectProfile(initial,'modular'),mat=new THREE.MeshStandardMaterial();
 const group=createPanelBody(c,mat);
 const plate=THICKNESS/Math.cos(FALL_DEGREES*Math.PI/180);
 for(const side of ['left','right'])for(const top of [true,false]){
  const mesh=group.getObjectByName(`Corner joiner ${top?'top':'bottom'} ${side} panel`);
  expect(mesh).toBeInstanceOf(THREE.Mesh);
  const points=mesh.geometry.getAttribute('position');
  const ys=[];
  for(let i=0;i<points.count;i++)if(Math.abs(points.getZ(i))<1e-7)ys.push(points.getY(i)*1000);
  const levels=[...new Set(ys.map(y=>Math.round(y*1000)/1000))].sort((a,b)=>a-b);
  // The receiving slot lies between levels 1 and 2 of the rotated F.
  const lower=levels[1],upper=levels[2];
  const plateBottom=top?c.height:-plate,plateTop=top?c.height+plate:0;
  expect(upper-lower).toBeCloseTo(6.8,2);
  expect((lower+upper)/2).toBeCloseTo((plateBottom+plateTop)/2,2);
  expect(plateBottom-lower).toBeCloseTo((6.8-plate)/2,2);
  expect(upper-plateTop).toBeCloseTo((6.8-plate)/2,2);
 }
 group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mat.dispose();
});