import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createSqlFixture } from './support/platform-fixture.mjs';
import sharp from 'sharp';
import { createPlatform } from '../server/platform.mjs';
import { validateOnlineRecords,publicRecord,validateLead,HttpError } from '../server/validation.mjs';
import { optimizePhoto } from '../server/media.mjs';
import { propertyHtml,sitemap } from '../server/seo.mjs';
import { createSupabase } from '../server/supabase.mjs';

const actor='16e12d07-b478-4d6e-8255-44450adf745c';
const env={SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'test-anon',SUPABASE_SERVICE_ROLE_KEY:'test-service',ADMIN_USER_IDS:actor,APP_SECRET:'test-only-secret-more-than-32-characters',SITE_URL:'https://test.example',PRIVACY_NOTICE_TEXT:'TEST ONLY — approved notice fixture',PRIVACY_NOTICE_VERSION:'test-v1',PRIVACY_CONTROLLER_NAME:'TEST ONLY'};
const record=(id='listing-1')=>({id,region:'Tekirdağ',local:'Test konumu',type:'Müstakil',price:100,area:10,isDemo:false,publicationApproved:false,currency:'TRY',category:'land',status:'draft',photos:[]});
test('online validation retains existing fact checks and excludes non-public states',()=>{
  assert.equal(validateOnlineRecords([record()]).length,1);
  for(const change of [{isDemo:true},{status:'published'},{currency:'USD'},{price:-1},{privateNotes:'secret'},{photos:[{key:'../../x',alt:'x'}]}])assert.throws(()=>validateOnlineRecords([{...record(),...change}]));
  assert.throws(()=>validateOnlineRecords([record(),record()]));
  assert.equal(publicRecord(record()),null);assert.equal(publicRecord({...record(),status:'archived'}),null);
  const result=publicRecord({...record(),status:'published',publicationApproved:true});assert.equal(result.id,'listing-1');assert.ok(!('publicationApproved' in result));
});
test('lead validation rejects missing notice acknowledgment, spam and invalid contact',()=>{
  const input={name:'Test',contact:'test@example.test',message:'Test mesajı',acknowledged:true};
  assert.equal(validateLead(input).name,'Test');
  for(const change of [{acknowledged:false},{website:'bot'},{contact:'bad'},{name:''},{message:'x'.repeat(3001)}])assert.throws(()=>validateLead({...input,...change}));
});
test('photo processing decodes, strips metadata, resizes and rejects disguised/broken input',async()=>{
  const bytes=await sharp({create:{width:1800,height:100,channels:3,background:'green'}}).png().toBuffer();
  const photo=await optimizePhoto(bytes,'image/png');assert.equal(photo.variants.length,3);
  const meta=await sharp(photo.variants[0].bytes).metadata();assert.equal(meta.width,480);assert.equal(meta.format,'webp');assert.equal(meta.exif,undefined);
  await assert.rejects(optimizePhoto(bytes,'image/jpeg'));await assert.rejects(optimizePhoto(Buffer.from('<svg/>'),'image/png'));await assert.rejects(optimizePhoto(Buffer.alloc(3*1024*1024+1),'image/png'));
});
test('metadata escapes executable markup and emits real property canonical URLs',()=>{
  const html=propertyHtml('<head><title>Old</title><meta name="description" content="Old"></head>',{...record(),title:'<script>alert(1)</script>',description:'" bad <tag>',photos:[]},env.SITE_URL);
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('https://test.example/ilan/listing-1'));assert.ok(!html.includes('<script>alert(1)'));
  assert.ok(sitemap([record()],env.SITE_URL).includes('/ilan/listing-1'));
});
test('source portfolio has a working, clearly unverified direct URL',async()=>{
  const {sql,db}=await createSqlFixture(actor);
  try{
    const handle=createPlatform({env,db,readTemplate:async()=>'<html><head><title>Test</title><meta name="description" content="Test"></head><body></body></html>'});
    const response=await handle(new Request(`${env.SITE_URL}/ilan/source-1`));
    assert.equal(response.status,200);
    assert.equal(response.headers.get('X-Robots-Tag'),'noindex, nofollow');
    const html=await response.text();
    assert.match(html,/Küçükkarıştıran/);
    assert.match(html,/Kaynak listeden aktarılmış/);
    assert.doesNotMatch(html,/Demo ortamındaki iletişim hedeflerinin/);
    assert.match(html,/class="skip"/);
    assert.doesNotMatch(html,/nocturne\.css/);
    assert.equal((await handle(new Request(`${env.SITE_URL}/ilan/source-999`))).status,404);
  }finally{await sql.close();}
});
test('Supabase adapter uses server credentials, bounded requests and safe errors',async()=>{
  let observed;
  const db=createSupabase({url:env.SUPABASE_URL,service:'server-secret',anon:'public-key'},async(url,options)=>{observed={url,options};return new Response(JSON.stringify({message:'revision_conflict server-secret'}),{status:400,headers:{'Content-Type':'application/json'}});});
  await assert.rejects(db.rpc('te_change',{}),error=>error.status===409 && !error.message.includes('server-secret'));
  assert.equal(observed.options.headers.apikey,'server-secret');assert.ok(observed.options.signal);
});
test('modern Supabase keys are never sent as invalid bearer JWTs',async()=>{
  let headers;
  const db=createSupabase({url:env.SUPABASE_URL,service:'sb_secret_fixture',anon:'sb_publishable_fixture'},async(_url,options)=>{headers=options.headers;return new Response('[]',{headers:{'Content-Type':'application/json'}});});
  await db.select('te_state');assert.equal(headers.apikey,'sb_secret_fixture');assert.equal(headers.Authorization,undefined);
});

test('PostgreSQL migration and API integration (PGlite; Auth/Storage transport simulated)',async t=>{
  const {sql,db,objects}=await createSqlFixture(actor);t.after(()=>sql.close());
  const handle=createPlatform({env,db,readTemplate:async()=>'<html><head><title>Test</title><meta name="description" content="Test"></head><body></body></html>'});let cookie='',csrf='';
  async function request(path,data,extra={}){const response=await handle(new Request(`${env.SITE_URL}/api/platform/${path}`,{method:data===undefined?'GET':'POST',headers:{Origin:env.SITE_URL,'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf,'x-vercel-forwarded-for':'203.0.113.1',...extra},body:data===undefined?undefined:JSON.stringify(data)}));return {status:response.status,headers:response.headers,data:response.headers.get('content-type')?.includes('json')?await response.json():await response.arrayBuffer()};}
  await t.test('unauthorized, cross-origin and unconfigured requests fail closed',async()=>{
    assert.equal((await request('records')).status,401);assert.equal((await request('login',{}, {Origin:'https://evil.test'})).status,403);
    const response=await createPlatform({env:{}})(new Request(env.SITE_URL+'/api/platform/public'));assert.equal(response.status,503);
  });
  await t.test('anon/authenticated roles cannot read tables or execute privileged RPC',async()=>{
    for(const role of ['anon','authenticated']){await sql.exec(`set role ${role}`);await assert.rejects(sql.query('select * from public.te_leads'));await assert.rejects(sql.query("select public.te_rate('x',1,60)"));await sql.exec('reset role');}
    const row=(await sql.query("select public from storage.buckets where id='te-photos'")).rows[0];assert.equal(row.public,false);
  });
  await t.test('login creates opaque secure session and CSRF blocks writes',async()=>{
    const response=await request('login',{email:'admin@example.test',password:'test-password'});assert.equal(response.status,200);cookie=response.headers.get('set-cookie').split(';')[0];csrf=response.data.csrf;
    assert.match(response.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);assert.equal((await request('records',{records:[],revision:0},{'X-CSRF-Token':''})).status,403);
    assert.equal((await request('session')).status,200);assert.equal((await db.select('te_sessions'))[0].token_hash.length,64);assert.ok(!(await db.select('te_sessions'))[0].token_hash.includes(cookie.split('=')[1]));
    await sql.exec("update te_sessions set expires_at=now()-interval '1 second'");assert.equal((await request('records')).status,401);
    await sql.exec("update te_sessions set expires_at=now()+interval '1 hour'");
    const denied=await createPlatform({env:{...env,ADMIN_USER_IDS:randomUUID()},db})(new Request(env.SITE_URL+'/api/platform/login',{method:'POST',headers:{Origin:env.SITE_URL,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.test',password:'test-password'})}));assert.equal(denied.status,403);
  });
  let revision=0,photoKey;
  await t.test('upload persists optimized variants and private media denies anonymous access',async()=>{
    const bytes=await sharp({create:{width:100,height:80,channels:3,background:'green'}}).png().toBuffer();
    const response=await handle(new Request(env.SITE_URL+'/api/platform/image',{method:'POST',headers:{Cookie:cookie,Origin:env.SITE_URL,'X-CSRF-Token':csrf,'Content-Type':'image/png'},body:bytes}));assert.equal(response.status,201);photoKey=(await response.json()).key;assert.equal(objects.size,3);
    assert.equal((await request('media/'+photoKey,undefined,{Cookie:''})).status,401);
  });
  await t.test('draft save persists but stays private; publish is immediately public',async()=>{
    const draft={...record(),featured:true,featuredOrder:2,photos:[{key:photoKey,alt:'Test image'}]};let result=await request('records',{records:[draft],revision});assert.equal(result.status,200);revision=result.data.revision;assert.equal((await request('public')).data.records.length,0);
    result=await request('records',{records:[{...draft,status:'published',publicationApproved:true}],revision});assert.equal(result.status,200);revision=result.data.revision;
    const publicData=(await request('public')).data;assert.equal(publicData.records.length,1);assert.ok(publicData.records[0].publishedAt);assert.equal(publicData.records[0].featured,true);assert.equal(publicData.records[0].featuredOrder,2);assert.match(publicData.records[0].image,/photo\?key=/);
    assert.equal((await request('photo?key='+photoKey,undefined,{Cookie:''})).status,200);
    const detail=await handle(new Request(env.SITE_URL+'/ilan/listing-1'));assert.equal(detail.status,200);assert.ok((await detail.text()).includes('rel="canonical"'));
    const production=createPlatform({env:{...env,VERCEL_ENV:'production'},db,readTemplate:async()=>'<html><head><title>Test</title><meta name="description" content="Test"></head><body></body></html>'});
    const indexable=await production(new Request(env.SITE_URL+'/ilan/listing-1'));
    assert.equal(indexable.headers.get('X-Robots-Tag'),null);
    assert.doesNotMatch(await indexable.text(),/<meta name="robots" content="noindex, nofollow">/);
    const map=await handle(new Request(env.SITE_URL+'/sitemap.xml'));assert.equal(map.status,200);assert.ok((await map.text()).includes('/ilan/listing-1'));
  });
  await t.test('stale revision cannot overwrite concurrent edits; archive preserves record',async()=>{
    const current=(await request('records')).data.records;
    assert.equal((await request('records',{records:current,revision:0})).status,409);
    const contenders=await Promise.all([request('records',{records:current.map(r=>({...r,title:'Updated title'})),revision}),request('records',{records:current.map(r=>({...r,title:'Updated title'})),revision})]);
    assert.deepEqual(contenders.map(item=>item.status).sort(),[200,409]);revision++;
    assert.equal((await request('public')).data.records[0].title,'Updated title');
    const result=await request('records',{records:current.map(r=>({...r,status:'archived'})),revision});assert.equal(result.status,200);revision=result.data.revision;assert.equal((await request('public')).data.records.length,0);
    assert.equal((await request('records',{records:[],revision})).status,400);
  });
  await t.test('snapshot restore recovers publication and keeps referenced photos',async()=>{
    const backup=(await db.select('te_snapshots',`revision=eq.${revision-1}`))[0];assert.ok(backup);
    const result=await request('restore',{backup:backup.id,revision});assert.equal(result.status,200);revision=result.data.revision;assert.equal((await request('public')).data.records.length,1);
    assert.equal((await request('media-delete',{key:photoKey})).status,409);assert.equal(objects.size,3);
    assert.ok((await request('audit')).data.events.some(event=>event.action==='portfolio.restore'));
  });
  await t.test('contact persists lead; admin updates status with revision and history',async()=>{
    const response=await request('leads',{name:'Test customer',contact:'test@example.test',message:'Test request',propertyId:'listing-1',acknowledged:true});assert.equal(response.status,201);
    const lead=(await request('admin-leads')).data.leads[0];assert.equal(lead.status,'new');assert.equal((await request('admin-leads',undefined,{Cookie:''})).status,401);
    const update={id:lead.id,revision:lead.revision,status:'contacted',note:'Test note'};assert.equal((await request('admin-leads',update)).status,200);assert.equal((await request('admin-leads',update)).status,409);
    assert.equal((await request('admin-leads')).data.leads[0].note,'Test note');assert.ok((await request('audit')).data.events.some(event=>event.action==='lead.update'));
  });
  await t.test('durable rate limiter counts independent requests and logout revokes token',async()=>{
    assert.equal(await db.rpc('te_rate',{p_key:'test-limit',p_max:1,p_seconds:600}),true);assert.equal(await db.rpc('te_rate',{p_key:'test-limit',p_max:1,p_seconds:600}),false);
    assert.equal((await request('logout',{})).status,200);assert.equal((await request('records')).status,401);
  });
});
