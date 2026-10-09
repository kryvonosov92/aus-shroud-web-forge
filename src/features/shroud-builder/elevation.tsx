import { Config, measurements, hoodStiffenerLayout, archContour,hasPanelOptions,includedPanels,panelDescription } from './shroud-model';
import {louverLayout} from './louver-layout';
export default function Elevation({config:c}: {config:Config}) {
 const m=measurements(c),w=c.width,h=c.height,f=m.face;const padding=Math.max(w,h)*0.2;const vx=w+padding*2,vy=h+padding*2;const stroke=Math.max(w,h)/650;const font=Math.max(w,h)/35;const dim=(x1:number,y1:number,x2:number,y2:number,text:string)=> <g stroke="#737b8c" strokeWidth={stroke}><path d={`M${x1},${y1} L${x2},${y2}`}/>{[[x1,y1],[x2,y2]].map(([x,y],i)=><path key={i} d={x1===x2?`M${x-10},${y}h20`:`M${x},${y-10}v20`}/>)}<text x={(x1+x2)/2+(x1===x2?-font:0)} y={(y1+y2)/2-(y1===y2?font/2:0)} textAnchor="middle" dominantBaseline="middle" stroke="none" fill="#424242" fontSize={font} transform={x1===x2?`rotate(-90 ${(x1+x2)/2-font} ${(y1+y2)/2})`:undefined}>{text}</text></g>;
 const arch=c.profile==='curved',round=c.profile==='round',hood=c.profile==='hood',ribs=hoodStiffenerLayout(w);
 const selectable=hasPanelOptions(c.profile),panels=includedPanels(c);
 const outerArch=arch?archContour(c,f):null,innerArch=arch?archContour(c):null;
 const shape=arch?`M${-f} ${h+f}V${h-outerArch!.springY} A${outerArch!.radius} ${outerArch!.radius} 0 0 1 ${w+f} ${h-outerArch!.springY}V${h+f}Z M0 ${h}H${w}V${h-innerArch!.springY} A${innerArch!.radius} ${innerArch!.radius} 0 0 0 0 ${h-innerArch!.springY}Z`:`M${-f} ${-f}H${w+f}V${h+f}H${-f}Z M0 0V${h}H${w}V0Z`;
 const hoodExtra=hood?Math.max(0,c.stiffenerHeight+font-padding*.6):0;
 return <svg className="elevation-svg" viewBox={`${-padding} ${-padding-hoodExtra} ${vx} ${vy+hoodExtra}`} role="img" aria-label={round?`Front elevation: ${w} mm internal diameter; ${c.internalRadius} mm internal radius; 6 mm material`:`Front elevation: ${w} mm internal width, ${h} mm internal height; ${f} mm material${selectable?`; included panels: ${panelDescription(c)}`:''}${arch?`; ${c.internalRadius} mm internal radius`:''}${hood?`; ${ribs.count} stiffeners at ${ribs.pitch.toFixed(1)} mm equal centres`:''}${hood&&c.hoodCorner?`; ${c.returnWidth} mm corner return`:''}`}>
 {!hood&&!round&&!selectable&&<path d={shape} fill={c.colour} fillRule="evenodd"/>}
 {selectable&&<g fill={c.colour}>
  {arch?<>
   <path d={`M0 ${h-innerArch!.springY}A${innerArch!.radius} ${innerArch!.radius} 0 0 1 ${w} ${h-innerArch!.springY}L${w+f} ${h-outerArch!.springY}A${outerArch!.radius} ${outerArch!.radius} 0 0 0 ${-f} ${h-outerArch!.springY}Z`}/>
   {panels.left&&<path d={`M${-f} ${h}H0V${h-innerArch!.springY}L${-f} ${h-outerArch!.springY}Z`}/>}
   {panels.right&&<path d={`M${w} ${h}H${w+f}V${h-outerArch!.springY}L${w} ${h-innerArch!.springY}Z`}/>}
  </>:<>
   <rect x={-f} y={-f} width={w+(c.profile==='corner'?f:2*f)} height={f}/>
   {panels.left&&<rect x={-f} y={0} width={f} height={h}/>}
   {panels.right&&c.profile!=='corner'&&<rect x={w} y={0} width={f} height={h}/>}
  </>}
  {panels.bottom&&<rect x={-f} y={h} width={w+(c.profile==='corner'?f:2*f)} height={f}/>}
 </g>}
 {round&&<circle cx={w/2} cy={w/2} r={w/2+3} fill="none" stroke={c.colour} strokeWidth={6}/>}
 {hood&&<><rect x="0" y="-6" width={w} height={6} fill={c.colour}/><rect x="0" y="0" width={w} height={h} fill="none" stroke="#b9bdc5" strokeWidth={stroke} strokeDasharray="10 10"/>{ribs.positions.map(x=><rect key={x} x={x-3} y={-6-c.stiffenerHeight} width={6} height={c.stiffenerHeight} fill={c.colour}/>)}</>}
 {c.profile==='louvered'&&louverLayout(c).sections.map(section=><rect key={section.bottom} x={0} y={h-section.top} width={w} height={section.top-section.bottom} fill={c.colour}/>)}
 {dim(0,h+padding*.43,w,h+padding*.43,`${round?'Ø ':''}${w.toLocaleString()} INTERNAL`)}{!round&&dim(-padding*.43,0,-padding*.43,h,`${h.toLocaleString()} ${hood?'WINDOW HEIGHT':c.profile==='louvered'?'INTERNAL HEIGHT':'INTERNAL'}`)}
 {c.profile==='louvered'&&dim(w+padding*.43,h-c.louverSectionHeight,w+padding*.43,h,`${c.louverSectionHeight.toLocaleString()} LOUVER SECTION HEIGHT`)}
 <text x={w/2} y={h/2} textAnchor="middle" fill="#737b8c" fontSize={font*.8}>{c.profile==='corner'?'FACE A · RETURN SHOWN IN 3D':(arch||round)?`R ${c.internalRadius.toLocaleString()} INTERNAL`:hood?'WINDOW REFERENCE':c.profile==='louvered'?'':'CLEAR OPENING'}</text>
 <text x={w/2} y={-padding*.65-hoodExtra} textAnchor="middle" fill="#424242" fontSize={font*.75}>6 mm material · {c.depth} mm depth</text>
  {hood&&<text x={w/2} y={-padding*.42-hoodExtra} textAnchor="middle" fill="#424242" fontSize={font*.6}>{ribs.count} stiffeners · 150 mm end centres · {Number(ribs.pitch.toFixed(1))} mm equal spacing</text>}
  {hood&&c.hoodCorner&&<text x={w/2} y={h+padding*.75} textAnchor="middle" fill="#424242" fontSize={font*.6}>Corner return {c.returnWidth.toLocaleString()} mm · shown in 3D</text>}
 </svg>;
}
