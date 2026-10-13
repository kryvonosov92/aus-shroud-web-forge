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

test('bottom F extrusion is the top connection flipped upside down around the sill',()=>{
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
  // Reflect in the plane halfway between head and sill receiving-slot centres.
  const normalised=[...new Set(bottom.map(([x,y])=>`${x},${Math.round(c.height*1000)-y}`))].sort();
  const reference=[...new Set(top.map(([x,y])=>`${x},${y}`))].sort();
  expect(normalised).toEqual(reference);
 const xs=bottom.map(([x])=>x/1000);
  expect(Math.max(...xs)).toBeCloseTo(c.width/2+8.4,3);
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
  // The receiving channel runs from the spine (x=8.8) to the wall (x=2).
  // After rotation those boundaries are levels 2 and 3.
   const lower=levels[top?2:1],upper=levels[top?3:2];
  const plateBottom=top?c.height:-plate,plateTop=top?c.height+plate:0;
  expect(upper-lower).toBeCloseTo(6.8,2);
  expect((lower+upper)/2).toBeCloseTo((plateBottom+plateTop)/2,2);
  expect(plateBottom-lower).toBeCloseTo((6.8-plate)/2,2);
  expect(upper-plateTop).toBeCloseTo((6.8-plate)/2,2);
 }
 group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mat.dispose();
});

test('reference F channels receive both panels without burying either arm or tail',()=>{
 const c=selectProfile(initial,'modular'),mat=new THREE.MeshStandardMaterial();
 const group=createPanelBody(c,mat);
 const plate=THICKNESS/Math.cos(FALL_DEGREES*Math.PI/180);
 const inset=(6.8-plate)/2+2;
 for(const side of ['left','right']){
  const jamb=group.getObjectByName(`${side==='left'?'Left':'Right'} panel`);
  const bounds=jamb.geometry.boundingBox;
  expect(bounds.min.y*1000).toBeCloseTo(inset-c.depth*FALL_SLOPE,3);
  expect(bounds.max.y*1000).toBeCloseTo(c.height-inset,3);
  for(const top of [true,false]){
   const fitting=group.getObjectByName(`Corner joiner ${top?'top':'bottom'} ${side} panel`);
   const points=fitting.geometry.getAttribute('position');
   const xs=[];
   for(let i=0;i<points.count;i++)xs.push(Math.abs(points.getX(i))*1000-c.width/2);
   // Spine inner edge is 6.4 mm from the opening, tail inner edge -0.4 mm:
   // a 6.8 mm receiving channel encloses the 6 mm jamb with 0.4 mm each side.
   expect(xs.some(x=>Math.abs(x-6.4)<0.001)).toBe(true);
   expect(xs.some(x=>Math.abs(x+0.4)<0.001)).toBe(true);
   const y=fitting.geometry.boundingBox;
   expect(top?y.min.y*1000<c.height-inset:y.max.y*1000>inset).toBe(true);
  }
 }
 group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mat.dispose();
});