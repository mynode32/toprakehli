import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { request as sendHTTP } from 'node:http';
import { createAdminServer } from '../scripts/admin-server.mjs';
import { passwordHash } from '../scripts/admin-auth.mjs';

async function fixture(t, options) {
  const prefix=join(tmpdir(),'toprak-ehli-admin-');
  const root=await mkdtemp(prefix);
  await mkdir(join(root,'content')); await writeFile(join(root,'content/listings.json'),'[]\n');
  await writeFile(join(root,'index.html'),'<!doctype html><html lang="tr"><title>Test preview</title></html>');
  const password='Fixture-only-long-password!';
  const server=createAdminServer(root,await passwordHash(password),options);
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  const origin=`http://127.0.0.1:${server.address().port}`;
  t.after(async()=>{ await new Promise(done=>server.close(done)); assert.ok(resolve(root).startsWith(resolve(prefix))); await rm(root,{recursive:true}); });
  let cookie='', csrf='';
  async function request(path,data,headers={}) {
    const response=await fetch(origin+path,{method:data===undefined?'GET':'POST',headers:{...(data===undefined?{}:{'Content-Type':'application/json',Origin:origin}),Cookie:cookie,'X-CSRF-Token':csrf,...headers},body:data===undefined?undefined:JSON.stringify(data)});
    const contentType=response.headers.get('content-type');
    return {status:response.status,headers:response.headers,data:contentType?.includes('application/json')?await response.json():await response.text()};
  }
  async function login() { const response=await request('/api/login',{password}); assert.equal(response.status,200); cookie=response.headers.get('set-cookie').split(';')[0]; csrf=response.data.csrf; return response; }
  async function upload(bytes,type='image/png',headers={}) {
    const response=await fetch(origin+'/api/image',{method:'POST',headers:{'Content-Type':type,Origin:origin,Cookie:cookie,'X-CSRF-Token':csrf,...headers},body:bytes});
    return {status:response.status,data:await response.json()};
  }
  return {root,request,login,origin,upload};
}

test('admin denies unauthenticated, cross-origin, forged host and CSRF writes; logout revokes session',async t=>{
  const app=await fixture(t);
  assert.equal((await app.request('/api/records')).status,401);
  assert.equal((await app.request('/api/session')).data.authenticated,false);
  assert.equal((await app.request('/api/login',{password:'wrong'},{Origin:'https://attacker.invalid'})).status,403);
  const forgedHostStatus=await new Promise((done,reject)=>{ const request=sendHTTP(app.origin,{headers:{Host:'attacker.invalid'}},response=>{response.resume();done(response.statusCode);}); request.on('error',reject); request.end(); });
  assert.equal(forgedHostStatus,403);
  const login=await app.login();
  assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  assert.equal((await app.request('/api/records',{records:[],revision:'x'},{'X-CSRF-Token':''})).status,403);
  assert.equal((await app.request('/.private/admin-auth.json')).status,404);
  assert.equal((await app.request('/api/logout',{})).status,200);
  assert.equal((await app.request('/api/records')).status,401);
});

test('admin validates records, backs up, detects concurrent edits and restores without losing the previous version',async t=>{
  const app=await fixture(t); await app.login();
  const initial=(await app.request('/api/records')).data;
  const record={id:'test-1',region:'Test',local:'Test portföy',type:'Müstakil',price:null,area:100,isDemo:false,publicationApproved:true};
  assert.equal((await app.request('/api/records',{records:[{...record,isDemo:true}],revision:initial.revision})).status,400);
  assert.equal((await app.request('/api/records',{records:[{...record,image:'src/assets/missing.jpg',imageAlt:'Test'}],revision:initial.revision})).status,400);
  const attempts=await Promise.all([app.request('/api/records',{records:[record],revision:initial.revision}),app.request('/api/records',{records:[record],revision:initial.revision})]);
  assert.deepEqual(attempts.map(item=>item.status).sort(),[200,409]);
  const updated=(await app.request('/api/records')).data;
  assert.equal(updated.records.length,1);
  const backups=(await app.request('/api/backups')).data.backups;
  assert.equal(backups.length,1);
  assert.equal((await app.request('/api/restore',{backup:'../secret',revision:updated.revision})).status,400);
  const restored=await app.request('/api/restore',{backup:backups[0],revision:updated.revision});
  assert.equal(restored.status,200); assert.deepEqual(restored.data.records,[]);
  assert.equal((await app.request('/api/backups')).data.backups.length,2);
  assert.deepEqual(JSON.parse(await readFile(join(app.root,'content/listings.json'),'utf8')),[]);
  assert.match(await readFile(join(app.root,'.private/history.jsonl'),'utf8'),/restore/);
});

test('login attempts are limited and expired sessions cannot read records',async t=>{
  const app=await fixture(t,{maxAttempts:2,sessionMs:10});
  await app.login(); await new Promise(done=>setTimeout(done,20));
  assert.equal((await app.request('/api/records')).status,401);
  assert.equal((await app.request('/api/login',{password:'wrong'})).status,401);
  assert.equal((await app.request('/api/login',{password:'wrong'})).status,401);
  assert.equal((await app.request('/api/login',{password:'wrong'})).status,429);
});

test('photo upload validates content, size and CSRF; protected preview serves saved records and images',async t=>{
  const app=await fixture(t);
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jF1sAAAAASUVORK5CYII=','base64');
  assert.equal((await app.upload(png)).status,401);
  assert.equal((await app.request('/preview/')).status,401);
  await app.login();
  assert.equal((await app.upload(png,'image/png',{'X-CSRF-Token':''})).status,403);
  assert.equal((await app.upload(Buffer.from('<svg onload="alert(1)"></svg>'))).status,415);
  assert.equal((await app.upload(png,'image/jpeg')).status,415);
  assert.equal((await app.upload(Buffer.alloc(4*1024*1024+1))).status,413);
  const bomb=Buffer.from(png);bomb.writeUInt32BE(10001,16);
  assert.equal((await app.upload(bomb)).status,415);
  const uploaded=await app.upload(png);
  assert.equal(uploaded.status,201);
  assert.match(uploaded.data.path,/^src\/assets\/upload-[a-f0-9]{32}\.png$/);
  assert.ok((await readFile(join(app.root,uploaded.data.path))).equals(png));
  const state=(await app.request('/api/records')).data;
  const record={id:'photo-test',region:'Test',local:'Fotoğraf testi',type:'Müstakil',price:null,area:100,isDemo:false,publicationApproved:true,image:uploaded.data.path,imageAlt:'Test fotoğrafı'};
  assert.equal((await app.request('/api/records',{records:[record],revision:state.revision})).status,200);
  assert.equal((await app.request('/preview/')).status,200);
  assert.match((await app.request('/preview/src/data/properties.js')).data,/photo-test/);
  assert.match((await app.request('/preview/src/data/site.js')).data,/preview: false/);
  const image=await app.request('/preview/'+uploaded.data.path);
  assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/png/);
  assert.equal((await app.request('/preview/.private/admin-auth.json')).status,404);
});
