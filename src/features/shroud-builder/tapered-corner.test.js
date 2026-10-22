import {test,expect} from 'bun:test';
import * as THREE from 'three';
import {initial,validate} from './shroud-model';
import {createPanelBody} from './panel-geometry';
import {modelDimensions} from './model-dimensions';
import {configurationFields} from './configuration-pdf';
import {flangeFixingLayout} from './installation-layout';

test('Corner Shroud width B dimension tracks the entered rear return length',()=>{
 const c={...initial,profile:'corner',returnWidth:2345};
 const b=modelDimensions(c).find(item=>item.text==='2,345 B');
 expect(b).toBeDefined();
 expect(b.a.distanceTo(b.b)).toBeCloseTo(2.345,8);
});

test('widths A and B have equal clearance from the shroud on corner and tapered models',()=>{
 for(const profile of ['corner','tapered'])for(const depth of [150,300,600]){
  const c={...initial,profile,taperedCorner:true,depth,height:2400,returnWidth:2345};
  const dimensions=modelDimensions(c);
  const a=dimensions.find(item=>item.text.endsWith(' A'));
  const b=dimensions.find(item=>item.text.endsWith(' B'));
  expect(a).toBeDefined();
  expect(b).toBeDefined();
  for(const endpoint of ['a','b']){
   expect(b[endpoint].x-c.width/2000-c.depth/1000).toBeCloseTo(a[endpoint].z-c.depth/1000,8);
   expect(b[endpoint].y).toBe(a[endpoint].y);
  }
 }
});

test('90 degree tapered corner has width B with distinct head and sill depths',()=>{
 const c={...initial,profile:'tapered',taperedCorner:true,returnWidth:2100,depth:600,bottomDepth:150};
 const body=createPanelBody(c,new THREE.MeshStandardMaterial());
 const head=new THREE.Box3().setFromObject(body.getObjectByName('Top panel'));
 const sill=new THREE.Box3().setFromObject(body.getObjectByName('Bottom panel'));
 expect(head.max.x).toBeCloseTo(1.2,6);
 expect(head.max.z).toBeCloseTo(.6,6);
 expect(sill.max.x).toBeCloseTo(.75,6);
 expect(sill.max.z).toBeCloseTo(.15,6);
 expect(head.min.z).toBeCloseTo(-2.106,6);
 expect(sill.min.z).toBeCloseTo(-2.106,6);
 const right=new THREE.Box3().setFromObject(body.getObjectByName('Right panel'));
 expect(right.min.z).toBeCloseTo(-2.106,6);
 expect(right.max.z).toBeCloseTo(-2.1,6);
 expect(modelDimensions(c).find(item=>item.text==='2,100 B').a.distanceTo(modelDimensions(c).find(item=>item.text==='2,100 B').b)).toBeCloseTo(2.1,8);
 expect(configurationFields(c)).toContainEqual(['Internal return width B','2,100 mm']);
 expect(flangeFixingLayout(c).runs.some(run=>run.name==='Head B')).toBe(true);
});

test('tapered corner is optional and validates width B only when enabled',()=>{
 const c={...initial,profile:'tapered',returnWidth:0};
 expect(validate(c)).toEqual([]);
 expect(modelDimensions(c).some(item=>item.text.endsWith(' B'))).toBe(false);
 expect(validate({...c,taperedCorner:true})).toContain('Return width must be between 50 and 6,000 mm.');
});

test('tapered corner omitted panels remain omitted on both faces',()=>{
 const body=createPanelBody({...initial,profile:'tapered',taperedCorner:true,leftPanel:false,rightPanel:false,bottomPanel:false},new THREE.MeshStandardMaterial());
 expect(body.children.map(item=>item.name)).toEqual(['Top panel']);
});