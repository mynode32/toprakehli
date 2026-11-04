import { readFile, writeFile, mkdir, readdir, copyFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateListings } from './content.mjs';
import { properties as demoProperties } from '../src/data/properties.js';
import {detailPage} from './detail-pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const preview = process.argv.includes('--demo');
const records = preview ? demoProperties : validateListings(JSON.parse(await readFile(join(root, 'content/listings.json'), 'utf8')));
for (const record of records) if (record.image && !(await stat(join(root, record.image))).isFile()) throw new Error('Portföy görseli bulunamadı.');
// Her paket ayrı klasördedir; önceki teslim silinmez.
const output = join(root, 'releases', `${preview ? 'demo' : 'site'}-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await mkdir(output, { recursive: true });
async function copySource(relative) {
  for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
    const path = join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Kaynakta sembolik bağlantı paketlenemez.');
    if (entry.isDirectory()) { await mkdir(join(output, path), { recursive: true }); await copySource(path); }
    else if (/\.(js|css|webp|png|jpg|svg)$/.test(entry.name)) await copyFile(join(root, path), join(output, path));
  }
}
await mkdir(join(output, 'src'), { recursive: true });
await copySource('src');
await writeFile(join(output, 'src/data/site.js'), `export const site = { preview: ${preview} };\n`);
await writeFile(join(output, 'src/data/properties.js'), `export const properties = ${JSON.stringify(records, null, 2)};\n`);
let html = await readFile(join(root, 'index.html'), 'utf8');
if (!preview) html = html.replace('Toprak Ehli yerel geliştirme önizlemesi. Portföyler temsili örnektir.', 'Toprak Ehli: Trakya arsa ve arazi portföyleri. Konum, tapu ve kaynak bilgilerini inceleyin; güncel bilgi için iletişime geçin.');
if (!preview) html = html.replace('Geliştirme önizlemesi · Tüm portföyler temsili, bilgiler doğrulanmamıştır.', 'Toprak Ehli · Arsa ve arazi')
  .replace('Örnek portföyleri incele ↗', 'Portföyleri incele ↗')
  .replace('Temsili kayıtlar. Satış ilanı değildir.', 'Güncel portföy bilgisi için bizimle iletişime geçin.')
  .replace('Yerel geliştirme · Temsili içerik', 'Arsa & Arazi · Trakya')
  .replace('Bu önizleme yatırım tavsiyesi içermez.', 'İçerikler yatırım tavsiyesi değildir.');
await writeFile(join(output, 'index.html'), html);
for(const record of records){const folder=join(output,'ilan',record.id);await mkdir(folder,{recursive:true});await writeFile(join(folder,'index.html'),detailPage(record));}
await writeFile(join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
await writeFile(join(output, '404.html'), '<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sayfa bulunamadı | Toprak Ehli</title><main><h1>Sayfa bulunamadı</h1><p>Bağlantı değişmiş olabilir.</p><a href="/">Ana sayfaya dön</a></main></html>');
await writeFile(join(output, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Content-Security-Policy: default-src \'self\'; script-src \'self\'; style-src \'self\'; img-src \'self\' data:; object-src \'none\'; base-uri \'self\'; frame-ancestors \'none\'; form-action \'none\'\n');
await writeFile(join(root, preview ? 'releases/latest-demo.json' : 'releases/latest.json'), JSON.stringify({ directory: resolve(output), records: records.length }, null, 2));
console.log(`Paket: ${output}\nKayıt: ${records.length}\n${preview ? 'DEMO: örnek kayıt ve fotoğraflar içerir.' : 'YAYIN: demo kayıtları dahil edilmedi.'} Arama motoru görünürlüğü kapalı.`);
