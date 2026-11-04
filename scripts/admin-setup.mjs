import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { stdin, stdout } from 'node:process';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { passwordHash } from './admin-auth.mjs';

try { await stat('.private/admin-auth.json'); console.error('Parola zaten oluşturulmuş. Mevcut hesabın üzerine yazılmadı.'); process.exitCode = 1; }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  stdout.write('Yönetim parolası belirleyin (en az 12 karakter; yazarken görünmez): ');
  let muted = true;
  const output = new Writable({ write(chunk, encoding, callback) { if (!muted) stdout.write(chunk); callback(); } });
  const terminal = createInterface({ input: stdin, output, terminal: Boolean(stdin.isTTY) });
  try {
    const password = await terminal.question('');
    stdout.write('\nParolayı tekrar girin: ');
    const confirmation = await terminal.question('');
    if (password !== confirmation) throw new Error('Parolalar eşleşmiyor.');
    const credentials = await passwordHash(password);
    await mkdir('.private', { recursive: true });
    await writeFile('.private/admin-auth.json', JSON.stringify(credentials), { flag: 'wx', mode: 0o600 });
    muted = false;
    stdout.write('\nParola özeti kaydedildi. Başlatmak için: npm run admin\n');
  } finally { terminal.close(); }
}
