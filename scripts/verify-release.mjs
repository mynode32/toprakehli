import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, dirname, sep } from 'node:path';
import { validateListings } from './content.mjs';

const demo = process.argv.includes('--demo');
const latest = JSON.parse(await readFile(demo ? 'releases/latest-demo.json' : 'releases/latest.json', 'utf8'));
const root = resolve(latest.directory);
assert.ok(root.startsWith(resolve('releases') + sep));
const data = await readFile(join(root, 'src/data/properties.js'), 'utf8');
const records = JSON.parse(data.replace(/^export const properties = /, '').replace(/;\s*$/, ''));
if (demo) assert.ok(records.length > 0 && records.every(record => record.isDemo === true));
else validateListings(records);
assert.equal(records.length, latest.records);
assert.ok((await readFile(join(root, 'src/data/site.js'), 'utf8')).includes(`preview: ${demo}`));
assert.ok((await readFile(join(root, 'index.html'), 'utf8')).includes('noindex, nofollow'));
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { await check(file); continue; }
    if (!entry.name.endsWith('.js')) continue;
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      assert.ok(match[1].startsWith('.'), 'Yayın paketinde harici modül bağımlılığı var.');
      const target = resolve(dirname(file), match[1]);
      assert.ok(target.startsWith(root + sep));
      assert.ok((await stat(target)).isFile(), `Eksik modül: ${target}`);
    }
  }
}
await check(join(root, 'src'));
for (const file of ['.env', '.git', '.private', '.test-environments', 'admin', 'content', 'docs', 'tests', 'scripts', 'reference', 'package.json']) {
  await assert.rejects(stat(join(root, file)), { code: 'ENOENT' });
}
console.log(`Paket kontrolü PASS: ${records.length} ${demo ? 'DEMO' : 'onaylı'} kayıt, tüm JS modülleri mevcut; proje/özel dosyalar web kökünde yok.`);
