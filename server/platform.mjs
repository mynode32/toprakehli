import { configuration,createSupabase } from './supabase.mjs';
import { HttpError,validateOnlineRecords,publicRecord,validateLead,leadStates } from './validation.mjs';
import { authenticate,originGuard,rateLimit,newToken,cookie,digest,csrfFor } from './security.mjs';
import { optimizePhoto,uploadPhoto,photoSizes,deleteObjects } from './media.mjs';
import { propertyHtml,sitemap } from './seo.mjs';
import { readFile } from 'node:fs/promises';
import {combinePortfolio} from '../src/data/reference-listings.js';

const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}});
async function body(request,max=300_000) {
  if(!request.headers.get('content-type')?.startsWith('application/json')) throw new HttpError(415,'JSON isteği gerekli.');
  const bytes=await readBytes(request,max);
  try { const data=JSON.parse(bytes.toString()); if(!data || typeof data!=='object' || Array.isArray(data))throw new Error(); return data; }
  catch { throw new HttpError(400,'Geçersiz JSON.'); }
}
async function readBytes(request,max) {
  const chunks=[];let count=0;
  if(Number(request.headers.get('content-length'))>max)throw new HttpError(413,'İstek çok büyük.');
  if(request.body) for await(const chunk of request.body){count+=chunk.length;if(count>max)throw new HttpError(413,'İstek çok büyük.');chunks.push(Buffer.from(chunk));}
  return Buffer.concat(chunks);
}
const loadState=async db=>(await db.select('te_state','id=eq.true&select=records,revision'))[0];
export function createPlatform({env=process.env,db:injected,readTemplate=()=>readFile(new URL('../.deploy/site/index.html',import.meta.url),'utf8')}={}) {
  return async function handle(request) {
    try {
      const config=configuration(env),db=injected || createSupabase(config);
      const url=new URL(request.url);
      let path=url.pathname.replace(/^\/api\/platform\/?/,'');
      const propertyPath=url.pathname.match(/^\/ilan\/([a-z0-9-]{1,60})$/);
      if(propertyPath){path='property';url.searchParams.set('id',propertyPath[1]);}
      if(url.pathname==='/sitemap.xml')path='sitemap';
      const write=request.method!=='GET';
      if(!['GET','POST'].includes(request.method))throw new HttpError(405,'Yöntem desteklenmiyor.');
      if(path==='config' && !write) return json({online:true,contactEnabled:Boolean(config.privacy && config.privacyVersion && config.controller),privacy:config.privacy,privacyVersion:config.privacyVersion,controller:config.controller});
      if(path==='public' && !write) {
        const state=await loadState(db);return json({records:state.records.map(publicRecord).filter(Boolean),revision:state.revision});
      }
      if(path==='sitemap' && !write)return new Response(sitemap((await loadState(db)).records.map(publicRecord).filter(Boolean),config.origin),{headers:{...headers,'Content-Type':'application/xml; charset=utf-8'}});
      if(path==='property' && !write){
        const id=url.searchParams.get('id');
        const published=(await loadState(db)).records.map(publicRecord).filter(Boolean);
        const record=combinePortfolio(published).find(record=>record.id===id);
        if(!record)throw new HttpError(404,'İlan bulunamadı veya yayından kaldırıldı.');
        const html=await readTemplate();
        return new Response(propertyHtml(html,record,config.origin),{headers:{...headers,'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow'}});
      }
      if(path==='login' && write) {
        originGuard(request,config);
        const data=await body(request,2000);
        await rateLimit(request,db,config,'login-ip',20,600);
        if(typeof data.email!=='string' || data.email.length>200 || typeof data.password!=='string' || data.password.length>256)throw new HttpError(400,'E-posta ve parolayı kontrol edin.');
        await rateLimit(request,db,config,'login-account',5,600,data.email.toLowerCase().trim());
        const auth=await db.signIn({email:data.email,password:data.password});
        if(!auth.user?.id || !config.admins.includes(auth.user.id))throw new HttpError(403,'Bu hesabın yönetici yetkisi yok.');
        const token=newToken();
        await db.remove('te_sessions',`expires_at=lt.${encodeURIComponent(new Date().toISOString())}`);
        await db.insert('te_sessions',{token_hash:digest(token),user_id:auth.user.id,expires_at:new Date(Date.now()+3600_000).toISOString()});
        await db.insert('te_audit',{actor:auth.user.id,action:'auth.login'});
        return json({csrf:csrfFor(token,config.secret)},200,{'Set-Cookie':cookie(token)});
      }
      if(path==='leads' && write) {
        originGuard(request,config);
        if(!config.privacy || !config.privacyVersion || !config.controller)throw new HttpError(503,'İletişim formu henüz kullanıma açılmadı.');
        await rateLimit(request,db,config,'contact',5,600);
        const data=validateLead(await body(request,10000));
        if(data.propertyId && !(await loadState(db)).records.some(record=>record.id===data.propertyId && publicRecord(record)))throw new HttpError(400,'İlan artık yayında değil.');
        await db.insert('te_leads',{name:data.name,contact:data.contact,message:data.message,property_id:data.propertyId,privacy_version:config.privacyVersion});
        return json({ok:true},201);
      }
      if((path==='photo' || path.startsWith('media/')) && !write) {
        const key=path==='photo'?url.searchParams.get('key'):path.slice(6);if(!/^[a-f0-9-]{36}$/.test(key || ''))throw new HttpError(404,'Fotoğraf bulunamadı.');
        const state=await loadState(db);
        if(!state.records.some(record=>publicRecord(record) && record.photos.some(photo=>photo.key===key)))await authenticate(request,db,config);
        const media=await db.select('te_media',`id=eq.${key}&state=eq.ready&select=id`);if(!media.length)throw new HttpError(404,'Fotoğraf bulunamadı.');
        const size=photoSizes.includes(Number(url.searchParams.get('size')))?Number(url.searchParams.get('size')):960;
        const result=await db.request(`/storage/v1/object/authenticated/te-photos/${key}/${size}.webp`);
        return new Response(result.body,{headers:{...headers,'Content-Type':'image/webp'}});
      }
      const session=await authenticate(request,db,config,write);
      if(path==='session' && !write)return json({authenticated:true,csrf:session.csrf});
      if(path==='logout' && write){await db.remove('te_sessions',`token_hash=eq.${digest(session.token)}`);return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
      if(path==='records' && !write)return json(await loadState(db));
      if(path==='records' && write) {
        const input=await body(request,2_000_000),records=validateOnlineRecords(input.records);
        if(!Number.isSafeInteger(input.revision) || input.revision<0)throw new HttpError(400,'Revizyon gerekli.');
        return json(await db.rpc('te_change',{p_revision:input.revision,p_records:records,p_actor:session.user}));
      }
      if(path==='backups' && !write)return json({backups:await db.select('te_snapshots','select=id,revision,created_at&order=created_at.desc&limit=100')});
      if(path==='restore' && write) {
        const input=await body(request);
        if(!/^[a-f0-9-]{36}$/.test(input.backup) || !Number.isSafeInteger(input.revision))throw new HttpError(400,'Geçersiz yedek.');
        const snapshot=(await db.select('te_snapshots',`id=eq.${input.backup}&select=records`))[0];if(!snapshot)throw new HttpError(404,'Yedek bulunamadı.');
        const current=await loadState(db);
        // Preserve IDs introduced after the snapshot, archived, keeping lead/media references valid.
        const ids=new Set(snapshot.records.map(record=>record.id));
        const records=validateOnlineRecords([...snapshot.records,...current.records.filter(record=>!ids.has(record.id)).map(record=>({...record,status:'archived'}))]);
        return json(await db.rpc('te_change',{p_revision:input.revision,p_records:records,p_actor:session.user,p_action:'portfolio.restore'}));
      }
      if(path==='image' && write) {
        await rateLimit(request,db,config,'upload',30,600);
        return json(await uploadPhoto(db,session.user,await optimizePhoto(await readBytes(request,3*1024*1024),request.headers.get('content-type'))),201);
      }
      if(path==='media' && !write)return json({media:await db.select('te_media','select=id,state,created_at&order=created_at.desc&limit=1000')});
      if(path==='media-delete' && write) {
        const input=await body(request);if(!/^[a-f0-9-]{36}$/.test(input.key))throw new HttpError(400,'Geçersiz fotoğraf.');
        await db.rpc('te_retire_media',{p_id:input.key,p_actor:session.user});
        await deleteObjects(db,input.key);await db.remove('te_media',`id=eq.${input.key}`);return json({ok:true});
      }
      if(path==='admin-leads' && !write)return json({leads:await db.select('te_leads','select=*&order=created_at.desc&limit=1000')});
      if(path==='admin-leads' && write) {
        const input=await body(request);
        if(!/^[a-f0-9-]{36}$/.test(input.id) || !Number.isSafeInteger(input.revision) || !leadStates.includes(input.status) || typeof input.note!=='string' || input.note.length>5000)throw new HttpError(400,'Talep güncellemesi geçersiz.');
        return json(await db.rpc('te_update_lead',{p_id:input.id,p_revision:input.revision,p_status:input.status,p_note:input.note,p_actor:session.user}));
      }
      if(path==='audit' && !write)return json({events:await db.select('te_audit','select=*&order=created_at.desc&limit=200')});
      throw new HttpError(404,'Uç nokta bulunamadı.');
    } catch(error) {
      return json({error:error instanceof HttpError ? error.message : 'Beklenmeyen sunucu hatası. İşlem tamamlanamadı.'},error instanceof HttpError ? error.status : 500);
    }
  };
}
