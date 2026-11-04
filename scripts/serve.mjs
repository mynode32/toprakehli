import { createLocalServer } from './local-server.mjs';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

let directory = process.cwd();
if (process.argv.includes('--release')) {
  const latest = JSON.parse(await readFile('releases/latest.json', 'utf8'));
  directory = resolve(latest.directory);
  if (!directory.startsWith(resolve('releases') + sep)) throw new Error('Paket yolu releases içinde olmalıdır.');
}
const port = Number(process.env.PORT || 4175);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Geçersiz port.');
const server = createLocalServer(directory);
server.listen(port, '127.0.0.1', () => console.log(`Yerel önizleme: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.code); process.exitCode = 1; });
