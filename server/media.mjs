import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { HttpError } from './validation.mjs';
export const photoSizes=[480,960,1600];
export async function optimizePhoto(bytes,type) {
  if(bytes.length>3*1024*1024) throw new HttpError(413,'Fotoğraf en fazla 3 MB olabilir.');
  if(!['image/jpeg','image/png','image/webp'].includes(type)) throw new HttpError(415,'PNG, JPEG veya WebP seçin.');
  try {
    const options={limitInputPixels:30_000_000,animated:false,failOn:'warning'};
    const info=await sharp(bytes,options).metadata();
    if(!['jpeg','png','webp'].includes(info.format) || `image/${info.format}`!==type || (info.pages || 1)>1) throw new Error();
    const variants=await Promise.all(photoSizes.map(async size=>({size,bytes:await sharp(bytes,options).rotate().resize({width:size,withoutEnlargement:true}).webp({quality:80}).toBuffer()})));
    return {width:info.width,height:info.height,variants};
  } catch { throw new HttpError(415,'Görsel çözümlenemedi. Geçerli bir fotoğraf seçin.'); }
}
export async function uploadPhoto(db,actor,photo) {
  const key=randomUUID();
  await db.insert('te_media',{id:key,state:'pending',created_by:actor,width:photo.width,height:photo.height});
  try {
    for(const variant of photo.variants) await db.request(`/storage/v1/object/te-photos/${key}/${variant.size}.webp`,{method:'POST',headers:{'Content-Type':'image/webp','x-upsert':'false'},body:variant.bytes});
    await db.patch('te_media',`id=eq.${key}`,{state:'ready'});
    return {key};
  } catch(error) {
    // Keep pending DB marker on failed cleanup so a later maintenance retry can find it.
    try { await deleteObjects(db,key); await db.remove('te_media',`id=eq.${key}`); } catch {}
    throw error;
  }
}
export function deleteObjects(db,key) {
  return db.request('/storage/v1/object/te-photos',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:photoSizes.map(size=>`${key}/${size}.webp`)})});
}
