import { builderAsset } from './assets';
import {Config,products} from './shroud-model';
/** Add the same AWS identity to saved model images. */
export async function brandModelImage(source:string,c:Config){
 const model=new Image(),logo=new Image();logo.crossOrigin='anonymous';model.src=source;logo.src=builderAsset('aws-logo.svg');
 await Promise.all([model.decode(),logo.decode(),document.fonts.load('600 24px Inter'),document.fonts.load('400 18px Inter')]);
 const width=Math.max(1200,model.naturalWidth),scale=width/model.naturalWidth,height=model.naturalHeight*scale;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height+146;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Could not prepare the image.');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,width,canvas.height);ctx.drawImage(logo,32,19,148,56);
 ctx.fillStyle='#111317';ctx.font='600 24px Inter';ctx.textAlign='right';ctx.fillText(products.find(p=>p.id===c.profile)!.title,width-32,46);
 ctx.font='400 15px Inter';ctx.fillStyle='#737b8c';ctx.fillText(c.reference||'Shroud Studio',width-32,70);
 ctx.fillStyle='#f6f6f5';ctx.fillRect(0,94,width,height);ctx.drawImage(model,0,94,width,height);
 ctx.textAlign='left';ctx.font='400 15px Inter';ctx.fillStyle='#424242';ctx.fillText('auswindowshrouds.com.au',32,canvas.height-21);
 ctx.textAlign='right';ctx.fillText('Internal dimensions in mm · Design draft',width-32,canvas.height-21);
 return canvas.toDataURL('image/png');
}
