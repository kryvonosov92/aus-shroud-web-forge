import {describe,expect,test} from 'bun:test';
import * as THREE from 'three';
import {initial,selectProfile,updateConfiguration,validate,measurements} from './shroud-model';
import {louverLayout} from './louver-layout';
import {createShroudScene,disposeShroudScene} from './shroud-scene';

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
   expect(bounds.length).toBe(Math.floor(height/layout.faceHeight));
   for(const box of bounds)expect((box.max.y-box.min.y)*1000).toBeCloseTo(layout.faceHeight,3);
   expect(bounds[bounds.length-1].max.y*1000).toBeLessThanOrEqual(height+0.001);
  }
 });
 test('blade centres are halfway through the projection depth',()=>{
  for(const depth of [300,450,600])for(const direction of ['up','down']){
   const bounds=bladeBounds(9,direction,{depth});
   for(const box of bounds)expect((box.min.z+box.max.z)*500).toBeCloseTo(depth/2,3);
  }
 });
});