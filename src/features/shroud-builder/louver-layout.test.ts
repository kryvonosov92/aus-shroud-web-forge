import {describe,expect,test} from 'bun:test';
import * as THREE from 'three';
import {initial,selectProfile,updateConfiguration,validate,measurements} from './shroud-model';
import {louverLayout} from './louver-layout';
import {createShroudScene,disposeShroudScene} from './shroud-scene';

const base=selectProfile(initial,'louvered');
function bladeBounds(spacing:0|9,orientation:'up'|'down'){
 const c={...base,louverSpacing:spacing,louverOrientation:orientation};
 const {scene,model}=createShroudScene(c,{windowVisible:false,studWallVisible:false,screwsVisible:false},true);
 const group=model.getObjectByName('Louver blades');
 if(!group)throw new Error('Louver blades missing');
 const bounds=group.children.map(blade=>new THREE.Box3().setFromObject(blade));
 disposeShroudScene(scene);return bounds;
}
describe('Louver section rules',()=>{
 test('0 mm spacing blocks front-view visibility between every blade',()=>{
  for(const direction of ['up','down'] as const){const bounds=bladeBounds(0,direction);expect(bounds.length).toBeGreaterThan(2);for(let i=1;i<bounds.length;i++)expect((bounds[i].min.y-bounds[i-1].max.y)*1000).toBeCloseTo(0,3);}
 });
 test('9 mm spacing leaves exact front-view gaps and 25% nominal transparency',()=>{
  expect(louverLayout({...base,louverSpacing:9}).transparency).toBe(25);
  for(const direction of ['up','down'] as const){const bounds=bladeBounds(9,direction);for(let i=1;i<bounds.length;i++)expect((bounds[i].min.y-bounds[i-1].max.y)*1000).toBeCloseTo(9,3);}
 });
 test('up and down orientations reverse the blade fall',()=>{
  expect(louverLayout({...base,louverOrientation:'down'}).rotation).toBeGreaterThan(0);
  expect(louverLayout({...base,louverOrientation:'up'}).rotation).toBeLessThan(0);
 });
 test('section height changes both blade extent and overall model height',()=>{
  const c=updateConfiguration(base,{height:900});const layout=louverLayout(c);
  expect(layout.sections.at(-1)?.top).toBe(900);
  expect(measurements(base).outerHeight-measurements(c).outerHeight).toBeCloseTo(900,6);
  expect(validate(c)).toEqual([]);
 });
});