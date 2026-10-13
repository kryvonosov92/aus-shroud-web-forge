import {expect,test} from 'bun:test';
import * as THREE from 'three';
import {createPanelBody} from './panel-geometry';
import {initial,selectProfile,FALL_SLOPE,FALL_DEGREES,THICKNESS} from './shroud-model';
import {configurationFields} from './configuration-pdf';
import {cornerWindowPath,cornerPlanPath,cornerProjection} from './corner-window';
import {createShroudScene,disposeShroudScene} from './shroud-scene';

test('Corner Shroud rounded option rounds both top and bottom at the projection radius',()=>{
 for(const depth of [300,450,600]){
  const c={...selectProfile(initial,'corner'),depth,cornerRounded:true};
  const material=new THREE.MeshStandardMaterial();
  const group=createPanelBody(c,material);
  const plate=THICKNESS/1000/Math.cos(FALL_DEGREES*Math.PI/180);
  for(const name of ['Top panel','Bottom panel']){
   const mesh=group.getObjectByName(name);
   expect(mesh).toBeInstanceOf(THREE.Mesh);
   const positions=mesh.geometry.getAttribute('position');
   const curve=new Set();
   for(let i=0;i<positions.count;i++){
    const x=positions.getX(i)-c.width/2000,z=positions.getZ(i);
    if(x>1e-6&&z>1e-6){
     const radius=Math.hypot(x,z);
     expect(radius).toBeCloseTo(depth/1000,5);
     curve.add(`${x.toFixed(6)},${z.toFixed(6)}`);
     const restored=positions.getY(i)+radius*FALL_SLOPE;
     const base=name==='Top panel'?c.height/1000:-plate;
     expect(Math.min(Math.abs(restored-base),Math.abs(restored-base-plate))).toBeLessThan(1e-6);
    }
   }
   expect(curve.size).toBe(63);
  }
  group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});material.dispose();
 }
});

test('Corner Shroud keeps square corners when rounding is off and respects bottom omission',()=>{
 const material=new THREE.MeshStandardMaterial();
 const c=selectProfile(initial,'corner');
 const square=createPanelBody(c,material);
 const points=square.getObjectByName('Top panel').geometry.getAttribute('position');
 expect(Array.from({length:points.count},(_,i)=>Math.abs(points.getX(i)-(c.width/2+c.depth)/1000)<1e-6&&Math.abs(points.getZ(i)-c.depth/1000)<1e-6).some(Boolean)).toBe(true);
 const rounded=createPanelBody({...c,cornerRounded:true,bottomPanel:false},material);
 expect(rounded.getObjectByName('Top panel')).toBeInstanceOf(THREE.Mesh);
 expect(rounded.getObjectByName('Bottom panel')).toBeUndefined();
 for(const group of [square,rounded])group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});material.dispose();
});

test('Corner Shroud PDF records the selected corner shape',()=>{
 const c=selectProfile(initial,'corner');
  expect(configurationFields({...c,cornerRounded:true})).toContainEqual(['Corner edge','Rounded']);
  expect(configurationFields({...c,cornerRounded:false})).toContainEqual(['Corner edge','Square']);
});

test('Rounded corner glazing is continuous around the bend with no central vertical frame',()=>{
 const c={...selectProfile(initial,'corner'),cornerWindowRounded:true};
 for(const gpu of [true,false]){
  const {scene,model}=createShroudScene(c,{windowVisible:true,studWallVisible:true,screwsVisible:false},gpu);
  const window=model.getObjectByName('Rounded corner window');
  expect(window).toBeInstanceOf(THREE.Group);
  expect(window.children.filter(o=>o.name.includes('end frame')).length).toBe(2);
  expect(window.children.length).toBe(5);
  const glass=window.getObjectByName('Continuous curved corner glass');
  const positions=glass.geometry.getAttribute('position');
  const {points,radius,center}=cornerWindowPath(c);
  expect(points.length).toBe(67);
  for(let i=1;i<=65;i++){
   expect(Math.hypot(positions.getX(i*2)-center.x,positions.getZ(i*2)-center.y)).toBeCloseTo(radius,6);
   expect(positions.getY(i*2+1)).toBeCloseTo(c.height/1000,6);
  }
  expect(glass.geometry.index.count).toBe((points.length-1)*6);
  disposeShroudScene(scene);
 }
});

test('Curved glass forces both panel edges to follow the curve regardless of the edge-only switch',()=>{
 const c=selectProfile(initial,'corner');
 for(const edge of [false,true]){
  const {scene,model}=createShroudScene({...c,cornerRounded:edge,cornerWindowRounded:true},{windowVisible:true,studWallVisible:false,screwsVisible:false},true);
  expect(model.getObjectByName('Rounded corner window')).toBeInstanceOf(THREE.Group);
  const points=model.getObjectByName('Top panel').geometry.getAttribute('position');
  const hasSquareTip=Array.from({length:points.count},(_,i)=>Math.abs(points.getX(i)-(c.width/2+c.depth)/1000)<1e-6&&Math.abs(points.getZ(i)-c.depth/1000)<1e-6).some(Boolean);
   expect(hasSquareTip).toBe(false);
  disposeShroudScene(scene);
 }
 const {scene,model}=createShroudScene({...c,cornerWindowRounded:true},{windowVisible:false,studWallVisible:false,screwsVisible:false},true);
 expect(model.getObjectByName('Rounded corner window')).toBeUndefined();
 disposeShroudScene(scene);
});

test('Curved glass shroud head and sill have concentric inner and outer arcs and 3 degree fall',()=>{
 for(const depth of [300,450,600]){
  const c={...selectProfile(initial,'corner'),cornerWindowRounded:true,depth};
  const {scene,model}=createShroudScene(c,{windowVisible:true,studWallVisible:true,screwsVisible:true},true);
  const {radius,center}=cornerPlanPath(c),plate=THICKNESS/1000/Math.cos(FALL_DEGREES*Math.PI/180);
  for(const name of ['Top panel','Bottom panel']){
   const positions=model.getObjectByName(name).geometry.getAttribute('position');
   let inner=0,outer=0;
   for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i);
    if(x>center.x+1e-5&&z>center.y+1e-5){
     const r=Math.hypot(x-center.x,z-center.y);
     expect(Math.min(Math.abs(r-radius),Math.abs(r-radius-depth/1000))).toBeLessThan(1e-6);
     if(Math.abs(r-radius)<1e-6)inner++;else outer++;
    }
    const restored=positions.getY(i)+cornerProjection(c,x,z)*FALL_SLOPE;
    const base=name==='Top panel'?c.height/1000:-plate;
    expect(Math.min(Math.abs(restored-base),Math.abs(restored-base-plate))).toBeLessThan(1e-6);
   }
   expect(inner).toBeGreaterThan(60);expect(outer).toBeGreaterThan(60);
  }
  const timber=model.getObjectByName('Curved corner timber frame');
  expect(timber).toBeInstanceOf(THREE.Group);
  const bands=timber.children.filter(o=>o.name==='Curved 90 x 45 pine band');
  expect(bands.length).toBe(6);
  for(const band of bands){
   const positions=band.geometry.getAttribute('position');
   for(let i=0;i<positions.count;i++){
    const r=Math.hypot(positions.getX(i)-center.x,positions.getZ(i)-center.y);
    expect(Math.min(Math.abs(r-(radius-0.006)),Math.abs(r-(radius-0.096)))).toBeLessThan(1e-6);
   }
  }
  expect(model.getObjectByName('Curved head fixing flange')).toBeInstanceOf(THREE.Mesh);
  expect(model.getObjectByName('Curved sill fixing flange')).toBeInstanceOf(THREE.Mesh);
  disposeShroudScene(scene);
 }
});

test('Corner specification records curved glass separately from rounded edges',()=>{
 const c=selectProfile(initial,'corner');
 expect(configurationFields({...c,cornerWindowRounded:true,cornerRounded:false})).toContainEqual(['Corner window','Rounded glass · no corner frame']);
 expect(configurationFields({...c,cornerWindowRounded:true,cornerRounded:false})).toContainEqual(['Corner edge','Rounded']);
 expect(configurationFields(c)).toContainEqual(['Corner window','Square']);
});