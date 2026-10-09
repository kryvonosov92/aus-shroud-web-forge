import { builderAsset } from './assets';
export type Profile = 'box' | 'hood' | 'corner' | 'tapered' | 'louvered' | 'modular' | 'curved' | 'round';
export const THICKNESS = 6;
export const FALL_DEGREES = 3;
export const FALL_SLOPE = Math.tan(FALL_DEGREES*Math.PI/180);
export function fallDescription(c:Config){
 if(c.profile==='round')return 'None';
 if(c.profile==='curved')return includedPanels(c).bottom?'3° outward · bottom only':'None · bottom omitted';
 return c.profile==='hood'||!includedPanels(c).bottom?'3° outward · top':'3° outward · top and bottom';
}
export const products: {id: Profile; name: string; title: string; description: string; image: string; slug: string}[] = [
  {id:'box',name:'Box shroud',title:'Box Shroud',description:'A rectangular shroud with optional side and bottom panels.',image:'6e9df5ed-0dcb-49b9-87b2-7ff3d65c9a3c',slug:'thermacorec-box-shroud'},
  {id:'hood',name:'Hood',title:'Hood',description:'A canopy with tapered stiffeners on its upper face.',image:'f38e65a6-2cb1-4fec-af7f-4dbb44a17727',slug:'thermacorec-hood'},
  {id:'corner',name:'Corner shroud',title:'Corner Shroud',description:'A frame wrapping an external 90° corner.',image:'4c540c3d-436e-4ef8-8851-99fd968efdf7',slug:'thermacorec-corner-shroud'},
  {id:'tapered',name:'Tapered shroud',title:'Tapered Shroud',description:'Deeper at the head, shallower at the sill.',image:'21405166-0770-45e7-9b2e-c638b3e83a9b',slug:'thermacorec-tapered-shroud'},
  {id:'louvered',name:'Louvered shroud',title:'Louvered Shroud',description:'A box frame with horizontal screening blades.',image:'fe454c42-8c67-41e4-9a9b-9183ff8c4e81',slug:'thermacorec-louvered-shroud'},
  {id:'modular',name:'Modular shroud',title:'Modular Shroud',description:'A four-piece frame, assembled on site.',image:'537bf89b-003a-4dc2-ab5c-451b2e2bf8bb',slug:'thermacorec-modular-shroud'},
  {id:'curved',name:'Arch shroud',title:'Arch Shroud',description:'An adjustable circular arch with fixed sides and an optional bottom panel.',image:'1aae726f-762a-4c16-b289-5dcdf8e70726',slug:'thermacorec-curved-shroud'},
  {id:'round',name:'Round shroud',title:'Round Shroud',description:'A full circular shroud, sized by its internal radius or diameter.',image:'round',slug:'thermacorec-curved-shroud'},
];
export type Config = { profile:Profile; width:number; height:number; internalRadius:number; depth:number; returnWidth:number; bottomDepth:number; colour:string; finish:string; otherColour:string; louverSectionHeight:number; louverSpacing:0|9; louverOrientation:'down'|'up'; bladeAngle:number; flange:number; stiffenerHeight:number; reference:string; leftPanel:boolean; bottomPanel:boolean; rightPanel:boolean; hoodCorner:boolean; hoodCornerRounded?:boolean; roundedEnds?:boolean };
export const hasPanelOptions=(profile:Profile)=>['box','corner','tapered','curved'].includes(profile);
export function includedPanels(c:Config){
 const selectable=hasPanelOptions(c.profile);
 return {left:c.profile==='curved'||!selectable||c.leftPanel!==false,bottom:!selectable||c.bottomPanel!==false,right:c.profile==='curved'||!selectable||c.rightPanel!==false};
}
export function panelDescription(c:Config){
 const p=includedPanels(c);
 return ['Top',...(p.left?['Left']:[]),...(p.bottom?['Bottom']:[]),...(p.right?['Right']:[])].join(' · ');
}
export type PowderColour = {name:string;hex:string;brand:string;code:string;sheen:string;source:string;image?:string};
// Interpon RGB values: official Living Colors LRV/RGB chart, verified against
// the current product listings. See docs/colour-references.md for provenance.
export const palette:PowderColour[] = [
 {name:'Night Sky',hex:'#303533',brand:'Interpon',code:'GN231A',sheen:'Matt',source:'https://shop.interpon.com/au/en/gn231a.html'},
 {name:'Monument',hex:'#484c4b',brand:'Interpon',code:'GL229A',sheen:'Matt',source:'https://shop.interpon.com/au/en/gl229a.html'},
 {name:'Surfmist',hex:'#e6e9e0',brand:'Interpon',code:'GA236A',sheen:'Matt',source:'https://shop.interpon.com/au/en/ga236a.html'},
 {name:'Woodland Grey',hex:'#5c6059',brand:'Interpon',code:'GL205A',sheen:'Matt',source:'https://shop.interpon.com/au/en/gl205a.html'},
 {name:'Pearl White',hex:'#f9ffff',brand:'Interpon',code:'GA029A',sheen:'Gloss',source:'https://shop.interpon.com/au/en/ga029a.html'},
 // Electro is a Dulux range. Representative RGB sampled from its official
 // Medium Bronze Kinetic swatch; this is not a measured coating specification.
 {name:'Electro Bronze Medium',hex:'#5c4b36',brand:'Dulux',code:'9068183F',sheen:'Flat',source:'https://www.duluxpowders.com.au/products/electro/',image:builderAsset('colours/electro-medium-bronze.webp')},
];
export const initial:Config = {profile:'box',width:1200,height:1800,internalRadius:600,depth:300,returnWidth:1200,bottomDepth:150,colour:palette[0].hex,finish:palette[0].name,otherColour:'',louverSectionHeight:1800,louverSpacing:0,louverOrientation:'down',bladeAngle:45,flange:50,stiffenerHeight:50,reference:'AWS-001',leftPanel:true,bottomPanel:true,rightPanel:true,hoodCorner:false};
export const MAX_ARCH_RADIUS = 100000;
export function minimumArchRadius(width:number,height:number){
 const a=width/2;
 return height>=a?a:(a*a+height*height)/(2*height);
}
export function maximumArchWidth(radius:number,height:number){
 return height>=radius?radius*2:2*Math.sqrt(Math.max(0,2*radius*height-height*height));
}
/** Circular segment with its apex at the total internal height; units are mm. */
export function archContour(c:Config,offset=0){
 const halfWidth=c.width/2+offset,radius=c.internalRadius+offset;
 const root=Math.sqrt(Math.max(0,(radius-halfWidth)*(radius+halfWidth)));
 // Stable sagitta avoids subtracting nearly equal large numbers for flat arches.
 const rise=halfWidth*halfWidth/(radius+root);
 const centerY=c.height-c.internalRadius;
 return {halfWidth,radius,centerY,rise,springY:c.height+offset-rise,startAngle:Math.acos(Math.min(1,halfWidth/radius)),endAngle:Math.PI-Math.acos(Math.min(1,halfWidth/radius))};
}
export function updateConfiguration(c:Config,patch:Partial<Config>):Config{
 const next={...c,...patch};
 if(next.profile==='round'){
  if(patch.internalRadius!==undefined)next.width=next.height=next.internalRadius*2;
  else if(patch.height!==undefined&&patch.width===undefined)next.width=next.height;
  else next.height=next.width;
  next.internalRadius=next.width/2;
 }
 if(next.profile==='louvered')next.louverSectionHeight=Math.min(next.height,next.louverSectionHeight);
 if(next.profile==='curved'){next.leftPanel=true;next.rightPanel=true;}
 return next;
}
export function finishSpecification(c:Config){
 const custom=c.otherColour.trim();const selected=palette.find(p=>p.hex===c.colour);
 return {finish:custom||c.finish,powderBrand:custom?null:selected?.brand??null,powderCode:custom?null:selected?.code??null,powderSheen:custom?null:selected?.sheen??null,otherColour:custom||null,previewFinish:c.finish,previewColour:c.colour};
}
export function limits(_c:Config){ return {min:50,max:850,presets:[300,450,600]}; }
export const HOOD_EDGE_OFFSET = 150;
export const HOOD_MAX_PITCH = 450;
export const HOOD_MIN_WIDTH = HOOD_EDGE_OFFSET * 2 + THICKNESS;
export function hoodStiffenerLayout(width:number){
 if(!Number.isFinite(width)||width<HOOD_MIN_WIDTH) return {count:0,pitch:0,positions:[] as number[]};
 const span=width-2*HOOD_EDGE_OFFSET;
 const intervals=Math.ceil(span/HOOD_MAX_PITCH);
 const pitch=span/intervals;
 const positions=Array.from({length:intervals+1},(_,i)=>HOOD_EDGE_OFFSET+i*pitch);
 return {count:positions.length,pitch,positions};
}
export function validate(c:Config):string[]{
 const e:string[]=[];const l=limits(c);if(!Number.isFinite(c.internalRadius)||c.internalRadius<25||c.internalRadius>MAX_ARCH_RADIUS)e.push('Enter a valid internal radius.'); if(!products.some(p=>p.id===c.profile))e.push('Select a valid profile.');
 for(const key of ['leftPanel','bottomPanel','rightPanel'] as const)if(c[key]!==undefined&&typeof c[key]!=='boolean')e.push('Panel selections must be on or off.');
 for(const [k,label] of [['width','Internal width'],['height','Internal height']] as const){if(!Number.isFinite(c[k])||c[k]<50||c[k]>6000)e.push(`${label} must be between 50 and 6,000 mm.`);}
 if(!Number.isFinite(c.depth)||c.depth<l.min||c.depth>l.max)e.push(`Depth must be between ${l.min} and ${l.max} mm for this profile.`);
 if(c.profile==='corner'&&(!Number.isFinite(c.returnWidth)||c.returnWidth<50||c.returnWidth>6000))e.push('Return width must be between 50 and 6,000 mm.');
 if(c.profile==='round'&&c.height!==c.width)e.push('A round shroud must have equal internal width and height; enter its diameter.');
 if(c.profile==='round'&&(!Number.isFinite(c.internalRadius)||c.internalRadius<25||c.internalRadius>3000||Math.abs(c.width-c.internalRadius*2)>0.0001))e.push('Round internal radius must be 25–3,000 mm, with diameter equal to twice the radius.');
 if(c.profile==='hood'&&c.width<HOOD_MIN_WIDTH)e.push(`Canopy span must be at least ${HOOD_MIN_WIDTH} mm to fit two 6 mm stiffeners at 150 mm from each side.`);
  if(c.profile==='hood'&&(!Number.isFinite(c.stiffenerHeight)||c.stiffenerHeight<6||c.stiffenerHeight>300))e.push('Stiffener rear height must be between 6 and 300 mm.');
  if(c.profile==='hood'&&c.hoodCorner&&(!Number.isFinite(c.returnWidth)||c.returnWidth<50||c.returnWidth>6000))e.push('Corner return length must be between 50 and 6,000 mm.');
 if(c.profile==='curved'&&(!Number.isFinite(c.internalRadius)||c.internalRadius+0.000001<minimumArchRadius(c.width,c.height)||c.internalRadius>MAX_ARCH_RADIUS))e.push('Arch radius must span the opening and fit within the overall height.');
 if(c.profile==='tapered'&&(!Number.isFinite(c.bottomDepth)||c.bottomDepth<50||c.bottomDepth>c.depth))e.push('Sill depth must be between 50 mm and the head depth.');
 if(c.profile==='louvered'){
  if(!Number.isFinite(c.louverSectionHeight)||c.louverSectionHeight<50||c.louverSectionHeight>c.height)e.push('Louver section height must be between 50 mm and the shroud height.');
  if(![0,9].includes(c.louverSpacing))e.push('Select 0 mm or 9 mm louvre spacing.');
  if(!['down','up'].includes(c.louverOrientation))e.push('Select louvers facing down or up.');
  if(!Number.isFinite(c.bladeAngle)||c.bladeAngle<30||c.bladeAngle>75)e.push('Use a blade angle of 30–75°.');
 }
 if(!/^#[0-9a-f]{6}$/i.test(c.colour))e.push('Select a valid colour.');
 if(![0,50,100].includes(c.flange))e.push('Select a 50 mm or 100 mm flange, or no flange.');
 return e;
}
export function measurements(c:Config){
 const face=THICKNESS,p=includedPanels(c),plate=face/Math.cos(FALL_DEGREES*Math.PI/180);
 const lowerDepth=c.profile==='tapered'?c.bottomDepth:c.depth;
 const bodyHeight=c.profile==='round'?c.height+face*2:c.profile==='curved'?c.height+face+(p.bottom?plate+c.depth*FALL_SLOPE:0):c.profile==='hood'?plate+c.stiffenerHeight+c.depth*FALL_SLOPE:p.bottom?c.height+2*plate+lowerDepth*FALL_SLOPE:p.left||p.right?c.height+plate+lowerDepth*FALL_SLOPE:plate+c.depth*FALL_SLOPE;
 return {outerWidth:c.width+(c.profile==='hood'?(c.hoodCorner?c.depth:0):face*2),outerHeight:bodyHeight,face,depth:c.depth,archRadius:c.internalRadius};
}
export function selectProfile(c:Config,profile:Profile):Config{const next={...c,profile};const l=limits(next);next.depth=Math.max(l.min,Math.min(l.max,next.depth));next.bottomDepth=Math.min(next.depth,next.bottomDepth);if(profile==='round'){next.height=next.width;next.internalRadius=next.width/2;}if(profile==='hood')next.width=Math.max(HOOD_MIN_WIDTH,next.width);if(profile==='curved'){next.leftPanel=true;next.rightPanel=true;next.internalRadius=Math.max(next.internalRadius,minimumArchRadius(next.width,next.height));}if(profile!=='hood')next.roundedEnds=false;return next;}
