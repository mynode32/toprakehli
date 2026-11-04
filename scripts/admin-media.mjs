import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { AdminError } from './admin-store.mjs';

export const imageLimit = 4 * 1024 * 1024;
export function identifyImage(data) {
  let width, height, extension, mime;
  if (data.length >= 45 && data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a','hex'))
    && data.readUInt32BE(8) === 13 && data.toString('ascii',12,16) === 'IHDR'
    && data.subarray(-8).equals(Buffer.from('49454e44ae426082','hex'))) {
    width=data.readUInt32BE(16); height=data.readUInt32BE(20); extension='png'; mime='image/png';
  } else if (data.length >= 16 && data[0] === 255 && data[1] === 216 && data[data.length-2] === 255 && data[data.length-1] === 217) {
    let position=2;
    while (position+4<data.length) {
      if (data[position++] !== 255) break;
      while (data[position] === 255) position++;
      const marker=data[position++];
      if (marker === 218 || marker === 217) break;
      if (position+2>data.length) break;
      const size=data.readUInt16BE(position);
      if (size<2 || position+size>data.length) break;
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker) && size>=8) {
        height=data.readUInt16BE(position+3); width=data.readUInt16BE(position+5); extension='jpg'; mime='image/jpeg'; break;
      }
      position+=size;
    }
  }
  if (!extension || !width || !height || width>10000 || height>10000 || width*height>30_000_000) throw new AdminError(415,'Geçerli bir PNG veya JPEG fotoğraf seçin (en fazla 30 megapiksel).');
  return { extension,mime,width,height };
}

async function receive(request) {
  if (Number(request.headers['content-length'])>imageLimit) { request.resume(); throw new AdminError(413,'Fotoğraf en fazla 4 MB olabilir.'); }
  return new Promise((resolve,reject)=>{
    let chunks=[],size=0,finished=false;
    const fail=error=>{if(!finished){finished=true;chunks=[];reject(error);}};
    request.on('data',chunk=>{
      if(finished)return;
      size+=chunk.length;
      if(size>imageLimit)fail(new AdminError(413,'Fotoğraf en fazla 4 MB olabilir.'));
      else chunks.push(chunk);
    });
    request.on('end',()=>{if(!finished){finished=true;resolve(Buffer.concat(chunks));}});
    request.on('error',fail);
    request.on('aborted',()=>fail(new AdminError(400,'Fotoğraf aktarımı yarıda kaldı.')));
  });
}

export async function saveUploadedImage(root,request) {
  const type=request.headers['content-type']?.split(';')[0];
  if(!['image/png','image/jpeg'].includes(type)){request.resume();throw new AdminError(415,'Yalnız PNG veya JPEG yüklenebilir.');}
  const data=await receive(request);
  const image=identifyImage(data);
  if(image.mime!==type)throw new AdminError(415,'Dosyanın içeriği seçilen türle eşleşmiyor.');
  const filename=`upload-${randomBytes(16).toString('hex')}.${image.extension}`;
  await mkdir(join(root,'src/assets'),{recursive:true});
  await writeFile(join(root,'src/assets',filename),data,{flag:'wx',mode:0o600});
  return { path:`src/assets/${filename}`,width:image.width,height:image.height };
}
