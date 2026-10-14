import {expect,test} from 'bun:test';
import {initial,selectProfile,validate,updateConfiguration,MAX_ARCH_WIDTH} from './shroud-model';

test('the arch shroud width limit is 3,000 mm',()=>{
 expect(MAX_ARCH_WIDTH).toBe(3000);
});

test('selecting the arch shroud clamps an oversized width to 3,000 mm',()=>{
 const c=selectProfile({...initial,profile:'box',width:5000},'curved');
 expect(c.width).toBe(3000);
 expect(validate(c)).toEqual([]);
});

test('an arch shroud wider than 3,000 mm is rejected',()=>{
 const c=selectProfile(initial,'curved');
 const problems=validate(updateConfiguration(c,{width:3001}));
 expect(problems.some(p=>p.includes('3,000'))).toBe(true);
});

test('an arch shroud at exactly 3,000 mm is accepted',()=>{
 const c=selectProfile(initial,'curved');
 expect(validate(updateConfiguration(c,{width:3000,height:1800,internalRadius:2000}))).toEqual([]);
});

test('other profiles still accept widths above 3,000 mm',()=>{
 expect(validate({...initial,profile:'box',width:5000})).toEqual([]);
});
