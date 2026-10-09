import { builderAsset } from './assets';
import {PDFDocument,PDFFont,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {Config,products,THICKNESS,archContour,includedPanels,hasPanelOptions,panelDescription,finishSpecification,hoodStiffenerLayout,measurements,validate,fallDescription} from './shroud-model';
import {louverLayout} from './louver-layout';
import logoPaths from './aws-logo-paths.json';
import {flangeFixingLayout} from './installation-layout';

const ink=rgb(17/255,19/255,23/255),muted=rgb(115/255,123/255,140/255),rule=rgb(.85,.86,.88),pale=rgb(246/255,246/255,245/255);
const fmt=(v:number)=>v.toLocaleString('en-AU',{maximumFractionDigits:1});
const mm=(v:number)=>`${fmt(v)} mm`;
type Field=[string,string];
export function configurationFields(c:Config):Field[]{
 const f=finishSpecification(c),p=includedPanels(c),fix=flangeFixingLayout(c),m=measurements(c);
 const fields:Field[]=[];
 if(c.profile==='round')fields.push(['Internal diameter',mm(c.width)],['Internal radius',mm(c.internalRadius)]);
 else fields.push([c.profile==='corner'?'Internal width A':c.profile==='hood'?'Clear canopy span':'Internal width',mm(c.width)],[c.profile==='hood'?'Window height (reference)':c.profile==='louvered'?'Internal Height':'Internal height',mm(c.height)]);
 if(c.profile==='corner')fields.push(['Internal return width B',mm(c.returnWidth)]);
 if(c.profile==='curved'){const a=archContour(c);fields.push(['Internal radius',mm(c.internalRadius)],['Arch rise / straight jamb',`${mm(a.rise)} / ${mm(a.springY)}`]);}
 fields.push([c.profile==='tapered'?'Head depth':'Projection depth',mm(c.depth)],['Material thickness',mm(THICKNESS)],['Drainage fall',fallDescription(c)]);
 if(c.profile==='tapered')fields.push(['Sill / lower side depth',mm(c.bottomDepth)]);
 if(hasPanelOptions(c.profile))fields.push(['Included panels',panelDescription(c)]);
 fields.push(['Powder coat colour',f.finish]);
 if(f.otherColour)fields.push(['Preview finish only',c.finish]);else fields.push(['Powder reference / sheen',`${f.powderBrand} ${f.powderCode} · ${f.powderSheen??''}`]);
 fields.push(['Rear fixing flange',c.flange?mm(c.flange):'None']);
 if(c.flange)fields.push(['Fixings (illustrative)',`${fix.points.length} screws · ≤ ${mm(fix.maxPitch)} centres`]);
 if(c.profile!=='corner')fields.push([c.profile==='round'?'Outside diameter':'Body overall width × height',c.profile==='round'?mm(m.outerWidth):`${fmt(m.outerWidth)} × ${fmt(m.outerHeight)} mm`]);
 if(c.profile==='hood'){const ribs=hoodStiffenerLayout(c.width);fields.push(['Hood stiffeners',`${ribs.count} × 6 mm triangular plates`],['Stiffener rear height',mm(c.stiffenerHeight)],['Stiffener spacing',`150 mm ends · ${mm(ribs.pitch)} equal centres`],['Stiffener centres from left',ribs.positions.map(fmt).join(', ')+' mm']);if(c.hoodCorner)fields.push(['Corner return length',mm(c.returnWidth)]);}
 if(c.profile==='louvered')fields.push(['Louver Section Height',mm(c.louverSectionHeight)],['Louver width',mm(88)],['Louver Offset',mm(c.louverOffset)],['Side extrusions','2 × 60 mm wide × 40 mm deep'],['Louver spacing',mm(c.louverSpacing)],['Transparency',`${fmt(louverLayout(c).transparency)}%`],['Louver orientation',`Facing ${c.louverOrientation}`]);
 if(c.profile==='corner')fields.push(['Panel orientation','Left: face A end. Right: return B end. Bottom: both faces.']);
 return fields;
}
function wrap(value:string,font:PDFFont,size:number,width:number){
 const lines:string[]=[];let line='';
 for(const word of value.replace(/[\r\n]+/g,' ').split(/\s+/)){if(font.widthOfTextAtSize(word,size)>width){if(line){lines.push(line);line='';}for(const char of word){if(font.widthOfTextAtSize(line+char,size)>width){lines.push(line);line='';}line+=char;}}else if(line&&font.widthOfTextAtSize(line+' '+word,size)>width){lines.push(line);line=word;}else line+=(line?' ':'')+word;}
 if(line)lines.push(line);return lines.length?lines:[''];
}
export type PdfFonts={regular:Uint8Array;bold:Uint8Array};
export async function createConfigurationPdf(c:Config,fonts:PdfFonts,perspective:string|Uint8Array){
 const errors=validate(c);if(errors.length)throw new Error(errors.join(' '));
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const regular=await doc.embedFont(fonts.regular),bold=await doc.embedFont(fonts.bold);
 const product=products.find(p=>p.id===c.profile)!;
 doc.setTitle(`${c.reference||'AWS'} - ${product.title} configuration`);doc.setAuthor('Aus Window Shrouds');doc.setSubject('Perspective model and selected shroud configuration');
 const page=doc.addPage([595.28,841.89]);
 const text=(value:string,x:number,y:number,size=9.5,font=regular,color=ink)=>page.drawText(value,{x,y,size,font,color});
 // Original AWS logo paths, cropped by placement, remain vector-sharp in print.
 const logoScale=.148;for(const path of logoPaths)page.drawSvgPath(path,{x:32-39*logoScale,y:804+166*logoScale,scale:logoScale,color:rgb(0,0,0)});
 text('SHROUD STUDIO',383,793,11,bold);text('CLIENT CONFIGURATION',383,777,8,regular,muted);
 page.drawLine({start:{x:32,y:751},end:{x:563,y:751},thickness:.7,color:rule});
 text(product.title,32,725,21,bold);text('DESIGN DRAFT',478,728,8,bold,muted);
 const reference=wrap(`Reference: ${c.reference||'Untitled design'}`,regular,9.5,531);
 reference.forEach((line,i)=>text(line,32,708-i*12,9.5));
 const imageTop=reference.length>1?677:689;
 const fields=configurationFields(c),full=fields.filter(([label])=>['Stiffener centres from left','Panel orientation'].includes(label)),grid=fields.filter(f=>!full.includes(f));
 const colWidth=169,gap=12,size=9.2,labelSize=7.4,lineHeight=11.6;
 const rows:Array<{cells:Field[];height:number;full:boolean}>=[];
 for(let i=0;i<grid.length;i+=3){const cells=grid.slice(i,i+3);rows.push({cells,height:Math.max(38,...cells.map(([label,value])=>wrap(label.toUpperCase(),bold,labelSize,colWidth).length*9+wrap(value,regular,size,colWidth).length*lineHeight+12)),full:false});}
 for(const field of full)rows.push({cells:[field],height:Math.max(35,9+wrap(field[1],regular,size,531).length*lineHeight+12),full:true});
 const tableHeight=rows.reduce((sum,row)=>sum+row.height,0),imageHeight=Math.min(287,imageTop-137-tableHeight);
 if(imageHeight<170)throw new Error('This configuration has too much text for a readable one-page PDF. Please shorten the reference or custom colour.');
 const imageBottom=imageTop-imageHeight;
 page.drawRectangle({x:32,y:imageBottom,width:531,height:imageHeight,color:pale});
 const model=await doc.embedJpg(perspective),fitted=model.scaleToFit(515,imageHeight-23);
 page.drawImage(model,{x:32+(531-fitted.width)/2,y:imageBottom+8+(imageHeight-23-fitted.height)/2,width:fitted.width,height:fitted.height});
 text('3D PERSPECTIVE · NOT TO SCALE',43,imageTop-13,7,bold,muted);
 text('YOUR SPECIFICATION',32,imageBottom-22,9,bold);let cursor=imageBottom-40;
 for(const row of rows){
  row.cells.forEach(([label,value],j)=>{const x=32+j*(colWidth+gap),width=row.full?531:colWidth;
   const labels=wrap(label.toUpperCase(),bold,labelSize,width);labels.forEach((line,k)=>text(line,x,cursor-k*9,labelSize,bold,muted));
   wrap(value,regular,size,width).forEach((line,k)=>text(line,x,cursor-labels.length*9-5-k*lineHeight,size));
   page.drawLine({start:{x,y:cursor-row.height+8},end:{x:x+width,y:cursor-row.height+8},thickness:.45,color:rule});
  });cursor-=row.height;
 }
 const notes='Internal sizes are measured at the rear fixing plane. Overall sizes exclude fixing flanges. The 3D view, colours, pine framing and fixings are indicative. AWS confirms fabrication details before manufacture.';
 page.drawLine({start:{x:32,y:80},end:{x:563,y:80},color:rule,thickness:.7});
 wrap(notes,regular,7.3,531).forEach((line,i)=>text(line,32,67-i*9.5,7.3,regular,muted));
 text('auswindowshrouds.com.au',32,30,8,bold);text('(03) 9020 1422  ·  info@auswindowshrouds.com.au',246,30,8,regular,muted);
 return doc.save();
}
let fontData:Promise<PdfFonts>|undefined;
export async function downloadConfigurationPdf(c:Config,perspective:string){
 if(!fontData)fontData=Promise.all([builderAsset('fonts/inter-400.ttf'),builderAsset('fonts/inter-600.ttf')].map(async path=>{const response=await fetch(path);if(!response.ok)throw new Error('Could not load PDF fonts.');return new Uint8Array(await response.arrayBuffer());})).then(([regular,bold])=>({regular,bold})).catch(error=>{fontData=undefined;throw error;});
 const bytes=await createConfigurationPdf(c,await fontData,perspective),url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'application/pdf'}));
 const link=document.createElement('a');link.href=url;link.download=`${c.reference.replace(/[^a-zA-Z0-9_-]/g,'_')||'AWS'}-shroud.pdf`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
