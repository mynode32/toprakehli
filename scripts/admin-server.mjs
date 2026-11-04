import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { createAdminStore, AdminError } from './admin-store.mjs';
import { passwordMatches } from './admin-auth.mjs';
import { saveUploadedImage } from './admin-media.mjs';
import { createLocalServer } from './local-server.mjs';

const assets = fileURLToPath(new URL('../admin/', import.meta.url));
const routes = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'] };
async function body(request) {
  if (!request.headers['content-type']?.startsWith('application/json')) throw new AdminError(415, 'JSON isteği gerekli.');
  request.setEncoding('utf8');
  let text = '';
  for await (const chunk of request) {
    text += chunk;
    if (Buffer.byteLength(text) > 256_000) throw new AdminError(413, 'İstek çok büyük.');
  }
  try { const value = JSON.parse(text); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; } catch { throw new AdminError(400, 'Geçersiz JSON.'); }
}

export function createAdminServer(root, credentials, { maxAttempts = 5, sessionMs = 3_600_000 } = {}) {
  const store = createAdminStore(root);
  const previewServer = createLocalServer(root);
  const sessions = new Map();
  let failures = 0;
  let blockedUntil = 0;
  const server = createServer(async (request, response) => {
    const send = (status, value) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(value)); };
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    try {
      const host = `127.0.0.1:${server.address().port}`;
      if (request.headers.host !== host) throw new AdminError(403, 'Yalnız yerel yönetim adresi kullanılabilir.');
      if (!['GET', 'POST'].includes(request.method)) throw new AdminError(405, 'Yöntem desteklenmiyor.');
      if (request.method === 'POST' && request.headers.origin !== `http://${host}`) throw new AdminError(403, 'İstek kaynağı reddedildi.');
      const path = new URL(request.url, `http://${host}`).pathname;
      if (request.method === 'GET' && routes[path]) {
        const [file, type] = routes[path];
        response.writeHead(200, { 'Content-Type': type }); response.end(await readFile(join(assets, file))); return;
      }
      const now = Date.now();
      for (const [key, session] of sessions) if (session.expires <= now) sessions.delete(key);
      if (path === '/api/login' && request.method === 'POST') {
        if (blockedUntil && now >= blockedUntil) { failures = 0; blockedUntil = 0; }
        if (now < blockedUntil) throw new AdminError(429, 'Çok fazla giriş denemesi. 10 dakika sonra tekrar deneyin.');
        const input = await body(request);
        if (!await passwordMatches(input.password, credentials)) {
          if (++failures >= maxAttempts) blockedUntil = now + 600_000;
          throw new AdminError(401, 'Parola hatalı.');
        }
        failures = 0;
        const token = randomBytes(32).toString('hex');
        const csrf = randomBytes(24).toString('hex');
        if (sessions.size >= 10) sessions.delete(sessions.keys().next().value);
        sessions.set(token, { csrf, expires: now + sessionMs });
        response.setHeader('Set-Cookie', `te_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(sessionMs / 1000)}`);
        send(200, { csrf }); return;
      }
      const token = /(?:^|;\s*)te_admin=([a-f0-9]{64})(?:;|$)/.exec(request.headers.cookie || '')?.[1];
      const session = sessions.get(token);
      if (path === '/api/session' && request.method === 'GET') { send(200, { authenticated: Boolean(session), ...(session ? { csrf: session.csrf } : {}) }); return; }
      if (!session) throw new AdminError(401, 'Oturum açın.');
      if (request.method === 'POST' && request.headers['x-csrf-token'] !== session.csrf) throw new AdminError(403, 'Güvenlik kontrolü başarısız. Sayfayı yenileyin.');
      if(path==='/api/image' && request.method==='POST'){send(201,await saveUploadedImage(root,request));return;}
      if(request.method==='GET' && path.startsWith('/preview/')){
        if(path==='/preview/src/data/properties.js'){
          const {records}=await store.read();response.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8'});response.end(`export const properties = ${JSON.stringify(records)};`);return;
        }
        if(path==='/preview/src/data/site.js'){
          response.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8'});response.end('export const site = { preview: false, localManaged: true };');return;
        }
        request.url=request.url.replace(/^\/preview/,'');
        previewServer.emit('request',request,response);return;
      }
      if (path === '/api/records' && request.method === 'GET') {
        const { records, revision } = await store.read(); send(200, { records, revision }); return;
      }
      if (path === '/api/backups' && request.method === 'GET') { send(200, { backups: await store.backups() }); return; }
      if (path === '/api/logout' && request.method === 'POST') {
        sessions.delete(token); response.setHeader('Set-Cookie', 'te_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); send(200, { ok: true }); return;
      }
      if (request.method === 'POST' && ['/api/records', '/api/restore'].includes(path)) {
        const input = await body(request);
        if (typeof input.revision !== 'string') throw new AdminError(428, 'Kayıt sürümü gerekli.');
        let result;
        try { result = path === '/api/records' ? await store.save(input.records, input.revision) : await store.restore(input.backup, input.revision); }
        catch (error) { if (error instanceof AdminError) throw error; if (!error.code) throw new AdminError(400, error.message); throw error; }
        send(200, result); return;
      }
      throw new AdminError(404, 'Bulunamadı.');
    } catch (error) {
      send(error.status || 500, { error: error.status ? error.message : 'İşlem tamamlanamadı. Önceki kayıtları kontrol edin.' });
    }
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  return server;
}
