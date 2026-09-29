import {Config, THICKNESS, archContour, includedPanels, hasPanelOptions} from './shroud-model';

export const STUD_FACE = 45;
export const STUD_DEPTH = 90;
export const FIXING_MAX_PITCH = 250;
export const FIXING_OFFSET = STUD_FACE / 2;
export const PREVIEW_HOLE_DIAMETER = 7;
export type FixingFace = 'front' | 'return';
export type FixingPoint = {x:number;y:number;face:FixingFace};
export type FixingRun = {name:string;points:FixingPoint[];pitch:number;closed:boolean};

/** Equal centres including both ends; ceiling keeps every interval <= maximum. */
export function equalCentres(start:number,end:number,maximum=FIXING_MAX_PITCH){
 const length=Math.abs(end-start);
 const intervals=Math.max(1,Math.ceil(length/maximum));
 return {pitch:length/intervals,positions:Array.from({length:intervals+1},(_,i)=>start+(end-start)*i/intervals)};
}

/** Coordinates are mm in each flange's local XY plane. Return X points along -Z. */
export function flangeFixingLayout(c:Config){
 const runs:FixingRun[]=[];
 if(!c.flange)return {runs,points:[] as FixingPoint[],maxPitch:0};
 const o=THICKNESS+FIXING_OFFSET,w=c.width,h=c.height,p=includedPanels(c);
 const line=(name:string,ax:number,ay:number,bx:number,by:number,face:FixingFace='front',trim=false)=>{
  if(trim){const length=Math.hypot(bx-ax,by-ay),ratio=length?Math.min(30,length/4)/length:0,dx=(bx-ax)*ratio,dy=(by-ay)*ratio;ax+=dx;ay+=dy;bx-=dx;by-=dy;}
  const length=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(length/FIXING_MAX_PITCH));
  runs.push({name,closed:false,pitch:length/n,points:Array.from({length:n+1},(_,i)=>({x:ax+(bx-ax)*i/n,y:ay+(by-ay)*i/n,face}))});
 };
 const arc=(name:string,r:number,cy:number,start:number,end:number,closed=false,trim=false)=>{
  if(trim){const inset=Math.min(30/r,Math.abs(end-start)/4);start+=inset;end-=inset;}
  const length=r*Math.abs(end-start),n=Math.max(closed?4:2,Math.ceil(length/FIXING_MAX_PITCH));
  runs.push({name,closed,pitch:length/n,points:Array.from({length:n+(closed?0:1)},(_,i)=>({x:r*Math.cos(start+(end-start)*i/n),y:cy+r*Math.sin(start+(end-start)*i/n),face:'front'}))});
 };
 if(c.profile==='hood'){
  const end=Math.min(30,w/4);line('Head',-w/2+end,h+o,w/2-end,h+o);
 }else if(c.profile==='round'){
  arc('Circular flange',w/2+o,w/2,0,Math.PI*2,true);
 }else if(c.profile==='curved'){
  const a=archContour(c,o);
  if(p.bottom)line('Sill',-a.halfWidth,-o,a.halfWidth,-o,'front',true);
  if(p.left&&a.springY>0)line('Left jamb',-a.halfWidth,0,-a.halfWidth,a.springY,'front',true);
  if(p.right&&a.springY>0)line('Right jamb',a.halfWidth,0,a.halfWidth,a.springY,'front',true);
  arc('Arch',a.radius,a.centerY,a.startAngle,a.endAngle,false,true);
 }else if(c.profile==='corner'){
  const left=-w/2-o,right=w/2-FIXING_OFFSET,far=c.returnWidth+o;
  line('Head A',left,h+o,right,h+o,'front',true);if(p.bottom)line('Sill A',left,-o,right,-o,'front',true);if(p.left)line('Jamb A',left,0,left,h,'front',true);
  line('Head B',FIXING_OFFSET,h+o,far,h+o,'return',true);if(p.bottom)line('Sill B',FIXING_OFFSET,-o,far,-o,'return',true);if(p.right)line('Jamb B',far,0,far,h,'return',true);
 }else if(hasPanelOptions(c.profile)){
  const left=-w/2-o,right=w/2+o;
  line('Head',left,h+o,right,h+o,'front',true);if(p.bottom)line('Sill',left,-o,right,-o,'front',true);
  if(p.left)line('Left jamb',left,0,left,h,'front',true);if(p.right)line('Right jamb',right,0,right,h,'front',true);
 }else{
  const left=-w/2-o,right=w/2+o;
  line('Head',left,h+o,right,h+o);line('Sill',left,-o,right,-o);line('Left jamb',left,-o,left,h+o);line('Right jamb',right,-o,right,h+o);
 }
 const unique=new Map<string,FixingPoint>();
 for(const run of runs)for(const p of run.points)unique.set(`${p.face}:${p.x.toFixed(5)}:${p.y.toFixed(5)}`,p);
 return {runs,points:[...unique.values()],maxPitch:Math.max(0,...runs.map(r=>r.pitch))};
}
