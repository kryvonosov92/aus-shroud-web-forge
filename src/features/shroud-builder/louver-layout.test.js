import {describe,expect,test} from 'bun:test';
import * as THREE from 'three';
import {initial,selectProfile,updateConfiguration,validate,measurements,FALL_SLOPE} from './shroud-model';
import {louverLayout} from './louver-layout';
import {createShroudScene,disposeShroudScene,revealLouverExtrusions} from './shroud-scene';

const base=selectProfile(initial,'louvered');
function bladeBounds(spacing,orientation,patch={}){
 const c={...base,louverSpacing:spacing,louverOrientation:orientation,...patch};
 const {scene,model}=createShroudScene(c,{windowVisible:false,studWallVisible:false,screwsVisible:false},true);
 const group=model.getObjectByName('Louver blades');
 if(!group)throw new Error('Louver blades missing');
 const bounds=group.children.map(blade=>new THREE.Box3().setFromObject(blade));
 disposeShroudScene(scene);return bounds;
}
describe('Louver section rules',()=>{
 test('side inspection reveals the extrusion through the jambs and restores them from the front',()=>{
  const {scene,model}=createShroudScene(base,{windowVisible:false,studWallVisible:false,screwsVisible:false},true);
  for(const side of [-1,1]){
   revealLouverExtrusions(model,new THREE.Vector3(side,0,0));
   expect(model.getObjectByName(side<0?'Left panel':'Right panel').material.opacity).toBeLessThan(1);
   expect(model.getObjectByName(side<0?'Right panel':'Left panel').material.opacity).toBeLessThan(1);
   expect(model.getObjectByName('Louver side extrusions').children[0].children[0].material.opacity).toBe(1);
  }
  revealLouverExtrusions(model,new THREE.Vector3(0,0,1));
  for(const name of ['Left panel','Right panel'])expect(model.getObjectByName(name).material.opacity).toBe(1);
  disposeShroudScene(scene);
 });
 test('0 mm spacing blocks front-view visibility between every blade',()=>{
  for(const direction of ['up','down']){const bounds=bladeBounds(0,direction);expect(bounds.length).toBeGreaterThan(2);for(let i=1;i<bounds.length;i++)expect((bounds[i].min.y-bounds[i-1].max.y)*1000).toBeCloseTo(0,3);}
 });
 test('9 mm spacing leaves exact front-view gaps',()=>{
  for(const direction of ['up','down']){const bounds=bladeBounds(9,direction);for(let i=1;i<bounds.length;i++)expect((bounds[i].min.y-bounds[i-1].max.y)*1000).toBeCloseTo(9,3);}
 });
 test('up and down orientations reverse the blade fall',()=>{
  expect(louverLayout({...base,louverOrientation:'down'}).rotation).toBeGreaterThan(0);
  expect(louverLayout({...base,louverOrientation:'up'}).rotation).toBeLessThan(0);
 });
 test('section height changes blades independently of shroud height',()=>{
  const c=updateConfiguration(base,{louverSectionHeight:900});const layout=louverLayout(c);
  expect(layout.sectionHeight).toBe(900);
  expect(layout.sections[0]?.bottom).toBe(0);
  expect(layout.sections[layout.sections.length-1]?.top).toBeCloseTo(Math.floor(900/layout.faceHeight)*layout.faceHeight,6);
  expect(c.height).toBe(1800);
  expect(measurements(c).outerHeight).toBe(measurements(base).outerHeight);
  const bounds=bladeBounds(0,'down',{louverSectionHeight:900});
  expect(bounds[0].min.y*1000).toBeCloseTo(0,3);
  expect(bounds[bounds.length-1].max.y*1000).toBeCloseTo(Math.floor(900/layout.faceHeight)*layout.faceHeight,3);
  expect(validate(c)).toEqual([]);
 });
 test('blade width remains 88 mm at the fixed angle',()=>{
  expect(louverLayout(base).bladeDepth).toBe(88);
 });
 test('0 mm spacing has no flat terminal louver at the section top',()=>{
  for(const direction of ['up','down'])for(const height of [1800,900]){
   const c={...base,louverSpacing:0,louverOrientation:direction,louverSectionHeight:height};
   const layout=louverLayout(c),bounds=bladeBounds(0,direction,{louverSectionHeight:height});
   expect(bounds.length).toBe(Math.floor(layout.sectionHeight/layout.faceHeight));
   for(const box of bounds)expect((box.max.y-box.min.y)*1000).toBeCloseTo(layout.faceHeight,3);
   expect(bounds[bounds.length-1].max.y*1000).toBeLessThanOrEqual(height+0.001);
  }
 });
 test('150 mm offset places blades in the middle of a 300 mm projection',()=>{
  for(const direction of ['up','down'])for(const box of bladeBounds(9,direction,{depth:300,louverOffset:150}))expect((box.min.z+box.max.z)*500).toBeCloseTo(150,3);
 });
 test('0 mm offset puts the foremost blade surface at the front, without protruding',()=>{
  for(const direction of ['up','down'])for(const box of bladeBounds(9,direction,{depth:300,louverOffset:0}))expect(box.max.z*1000).toBeCloseTo(300,3);
 });
 test('offset is measured inward from the front at every depth',()=>{
  for(const depth of [300,450,600])for(const direction of ['up','down']){
   const bounds=bladeBounds(9,direction,{depth,louverOffset:depth/2});
   for(const box of bounds)expect((box.min.z+box.max.z)*500).toBeCloseTo(depth/2,3);
  }
 });
 test('left and right receiving extrusions are closed rectangles 60 mm wide and 40 mm deep',()=>{
  const c={...base,louverSectionHeight:900,louverOffset:150};
  const {scene,model}=createShroudScene(c,{windowVisible:false,studWallVisible:false,screwsVisible:false},true);
  const rails=model.getObjectByName('Louver side extrusions');if(!rails)throw new Error('Extrusions missing');
  expect(rails.children.length).toBe(2);
  for(const rail of rails.children){
   expect(rail.children.length).toBe(1);
   expect(rail.children[0].geometry.type).toBe('BoxGeometry');
   const bounds=new THREE.Box3().setFromObject(rail),size=bounds.getSize(new THREE.Vector3());
   expect(size.x*1000).toBeCloseTo(60,3);expect(size.z*1000).toBeCloseTo(40,3);expect(size.y*1000).toBeCloseTo(900,3);
   expect((bounds.min.z+bounds.max.z)*500).toBeCloseTo(150,3);
  }
  disposeShroudScene(scene);
 });
 test('blade ends are concealed at the inner faces of both rectangular extrusions',()=>{
  for(const direction of ['up','down'])for(const offset of [0,150])for(const spacing of [0,9]){
   const bounds=bladeBounds(spacing,direction,{depth:300,louverOffset:offset});
   for(const blade of bounds){
    expect(blade.min.x*1000).toBeCloseTo(-base.width/2+60,3);
    expect(blade.max.x*1000).toBeCloseTo(base.width/2-60,3);
   }
  }
 });
 test('full-height blades and extrusion tops stay below the sloped head, and within the projection at zero offset',()=>{
  for(const depth of [300,450,600])for(const orientation of ['up','down'])for(const spacing of [0,9]){
   const c={...base,depth,louverOffset:0,louverSectionHeight:base.height,louverOrientation:orientation,louverSpacing:spacing};
   const {scene,model}=createShroudScene(c,{windowVisible:false,studWallVisible:false,screwsVisible:false},true);
   model.updateWorldMatrix(true,true);
   for(const name of ['Louver blades','Louver side extrusions'])model.getObjectByName(name).traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    const positions=object.geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++){
     const point=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld);
     expect(point.z*1000).toBeLessThanOrEqual(depth+0.001);
     expect(point.z*1000).toBeGreaterThanOrEqual(-0.001);
     expect(point.y*1000).toBeLessThanOrEqual(c.height-point.z*1000*FALL_SLOPE+0.001);
    }
   });
   disposeShroudScene(scene);
  }
 });
});
test('Louver Section Height follows Internal Height until changed manually', () => {
  const { updateConfiguration, initial } = require('./shroud-model');
  let c = updateConfiguration({ ...initial, profile: 'louvered' }, { height: 2100 });
  expect(c.louverSectionHeight).toBe(2100);
  c = updateConfiguration(c, { louverSectionHeight: 900 });
  c = updateConfiguration(c, { height: 2400 });
  expect(c.louverSectionHeight).toBe(900);
});
