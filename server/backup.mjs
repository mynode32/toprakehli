import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {validateOnlineRecords} from './validation.mjs';

export const backupTables=['te_state','te_media','te_snapshots','te_leads','te_audit'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function collectApplicationBackup(db,project) {
  const tables={};
  for(const table of backupTables){
    tables[table]=[];
    for(let offset=0;;offset+=500){
      const rows=await db.select(table,`select=*&order=${table==='te_state'?'id':table==='te_audit'?'id':'created_at'}.asc&limit=500&offset=${offset}`);
      tables[table].push(...rows);if(rows.length<500)break;
      if(offset>=100_000)throw new Error('Yedek sınırı aşıldı; yönetilen veritabanı yedeğini kullanın.');
    }
  }
  const objects=[];
  for(const media of tables.te_media.filter(row=>row.state==='ready'))for(const size of [480,960,1600]){
    const path=`${media.id}/${size}.webp`;
    const response=await db.request(`/storage/v1/object/authenticated/te-photos/${path}`);
    const bytes=Buffer.from(await response.arrayBuffer());objects.push({path,sha256:sha(bytes),data:bytes.toString('base64')});
  }
  const result={format:1,project,createdAt:new Date().toISOString(),tables,objects};
  verifyApplicationBackup(result);return result;
}
export function verifyApplicationBackup(backup) {
  if(backup?.format!==1 || !backup.tables || !Array.isArray(backup.objects))throw new Error('Yedek biçimi geçersiz.');
  for(const table of backupTables)if(!Array.isArray(backup.tables[table]))throw new Error('Yedek tablosu eksik.');
  if(backup.tables.te_state.length!==1)throw new Error('Merkezi kayıt sürümü eksik.');
  const media=new Set(backup.tables.te_media.filter(row=>row.state==='ready').map(row=>row.id));
  const paths=new Set();
  for(const object of backup.objects){
    if(!/^[a-f0-9-]{36}\/(480|960|1600)\.webp$/.test(object.path)||paths.has(object.path)||sha(Buffer.from(object.data,'base64'))!==object.sha256)throw new Error('Yedek fotoğraf bütünlüğü bozuk.');
    paths.add(object.path);
  }
  for(const source of [...backup.tables.te_state,...backup.tables.te_snapshots]){
    const records=validateOnlineRecords(source.records);
    for(const record of records)for(const photo of record.photos){
      if(!media.has(photo.key)||[480,960,1600].some(size=>!paths.has(`${photo.key}/${size}.webp`)))throw new Error('İlan veya yedek fotoğrafı eksik.');
    }
  }
  return {records:backup.tables.te_state[0].records.length,snapshots:backup.tables.te_snapshots.length,leads:backup.tables.te_leads.length,objects:backup.objects.length};
}
export function encryptBackup(backup,key) {
  if(key.length!==32)throw new Error('Yedek anahtarı 32 bayt olmalıdır.');
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
  const bytes=Buffer.concat([cipher.update(JSON.stringify(backup)),cipher.final()]);
  return Buffer.concat([Buffer.from('TEBK1'),iv,cipher.getAuthTag(),bytes]);
}
export function decryptBackup(bytes,key) {
  if(bytes.subarray(0,5).toString()!=='TEBK1')throw new Error('Yedek başlığı geçersiz.');
  const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(5,17));decipher.setAuthTag(bytes.subarray(17,33));
  const backup=JSON.parse(Buffer.concat([decipher.update(bytes.subarray(33)),decipher.final()]).toString());verifyApplicationBackup(backup);return backup;
}
