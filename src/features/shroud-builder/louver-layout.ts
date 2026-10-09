import type { Config } from './shroud-model';

// A 27 mm projected face plus a 9 mm gap gives 9 / 36 = 25% openness.
export const LOUVER_FACE_HEIGHT = 27;
export const LOUVER_THICKNESS = 6;
export function louverLayout(c: Pick<Config, 'height' | 'depth' | 'bladeAngle' | 'louverSpacing' | 'louverOrientation'>) {
 const angle=c.bladeAngle*Math.PI/180;
 const bladeDepth=(LOUVER_FACE_HEIGHT-LOUVER_THICKNESS*Math.cos(angle))/Math.sin(angle);
 const pitch=LOUVER_FACE_HEIGHT+c.louverSpacing;
 const sections:Array<{bottom:number;top:number;center:number}>=[];
 // Trim the last blade to the section height without changing the selected gap.
 for(let bottom=0;bottom<c.height;bottom+=pitch)sections.push({bottom,top:Math.min(c.height,bottom+LOUVER_FACE_HEIGHT),center:bottom+LOUVER_FACE_HEIGHT/2});
 return {pitch,faceHeight:LOUVER_FACE_HEIGHT,bladeDepth,rotation:(c.louverOrientation==='down'?1:-1)*angle,transparency:c.louverSpacing/pitch*100,sections};
}