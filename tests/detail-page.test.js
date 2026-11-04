import test from 'node:test';
import assert from 'node:assert/strict';
import {detailPage,notFoundPage} from '../scripts/detail-pages.mjs';
import {properties} from '../src/data/properties.js';
import {createLocalServer} from '../scripts/local-server.mjs';
import {fileURLToPath} from 'node:url';
test('separate demo page contains facts, source status, gallery, contextual contact and no fabricated map',()=>{const html=detailPage(properties[0]);for(const text of ['DEMO PORTFÖY','4.750.000','2.500','m² fiyatı','demo-1','noindex','Fotoğraf galerisi'])assert.ok(html.includes(text),text);assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('showModal'));assert.ok(detailPage({...properties[0],local:'<img onerror=bad>'}).includes('&lt;img onerror=bad&gt;'));});
test('direct detail address returns a real page and unknown listing returns HTML 404',async t=>{const server=createLocalServer(fileURLToPath(new URL('../',import.meta.url)));await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const root=`http://127.0.0.1:${server.address().port}`;const ok=await fetch(root+'/ilan/demo-1');assert.equal(ok.status,200);assert.match(await ok.text(),/DEMO PORTFÖY/);const missing=await fetch(root+'/ilan/does-not-exist');assert.equal(missing.status,404);assert.match(await missing.text(),/Portföy bulunamadı/);assert.match(notFoundPage(),/noindex/);});
