import { readFile } from 'node:fs/promises';
import { createAdminServer } from './admin-server.mjs';

try {
  const credentials = JSON.parse(await readFile('.private/admin-auth.json', 'utf8'));
  const server = createAdminServer(process.cwd(), credentials);
  server.listen(4180, '127.0.0.1', () => console.log('Yerel yönetim: http://127.0.0.1:4180'));
  server.on('error', error => { console.error(error.code); process.exitCode = 1; });
} catch {
  console.error('Önce kendi parolanızı oluşturun: npm run admin:setup'); process.exitCode = 1;
}
