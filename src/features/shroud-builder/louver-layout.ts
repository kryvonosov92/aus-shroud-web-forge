import type { Config } from './shroud-model';

export const LOUVER_WIDTH = 88;
export const LOUVER_THICKNESS = 6;
export const LOUVER_ANGLE_DEGREES = 45;
export function louverLayout(c: Pick<Config, 'height' | 'louverSectionHeight' | 'depth' | 'louverSpacing' | 'louverOrientation'>) {
 const angle=LOUVER_ANGLE_DEGREES*Math.PI/180;
 const bladeDepth=LOUVER_WIDTH;
 const faceHeight=bladeDepth*Math.sin(angle)+LOUVER_THICKNESS*Math.cos(angle);
 const pitch=faceHeight+c.louverSpacing;
 const sectionHeight=Math.min(c.height,c.louverSectionHeight),sectionBottom=0;
 const sections:Array<{bottom:number;top:number;center:number}>=[];
 // Zero spacing uses complete angled blades only, never a flattened terminal strip.
 for(let bottom=sectionBottom;bottom<sectionHeight;bottom+=pitch){
  if(c.louverSpacing===0&&bottom+faceHeight>sectionHeight+1e-7)break;
  sections.push({bottom,top:Math.min(sectionHeight,bottom+faceHeight),center:bottom+faceHeight/2});
 }
 return {pitch,faceHeight,bladeDepth,depthCenter:c.depth/2,sectionBottom,sectionHeight,rotation:(c.louverOrientation==='down'?1:-1)*angle,transparency:c.louverSpacing/pitch*100,sections};
}