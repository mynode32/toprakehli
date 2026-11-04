import { readFile, writeFile, mkdir, rename, readdir, appendFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { validateListings } from './content.mjs';

export class AdminError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const revisionOf = text => createHash('sha256').update(text).digest('hex');

export function createAdminStore(root) {
  const file = join(root, 'content/listings.json');
  const backupDirectory = join(root, '.private/backups');
  let pending = Promise.resolve();
  async function read() {
    const text = await readFile(file, 'utf8');
    return { records: validateListings(JSON.parse(text)), revision: revisionOf(text), text };
  }
  function save(records, expectedRevision, action = 'save') {
    const operation = pending.then(async () => {
      validateListings(records);
      for (const record of records) if (record.image) {
        try { if (!(await stat(join(root, record.image))).isFile()) throw new Error(); }
        catch { throw new AdminError(400, 'Fotoğraf dosyası bulunamadı. Önce dosyayı assets klasörüne koyun.'); }
      }
      const current = await read();
      if (current.revision !== expectedRevision) throw new AdminError(409, 'Kayıtlar değişti. Sayfayı yenileyip tekrar deneyin.');
      await mkdir(backupDirectory, { recursive: true });
      const name = `${Date.now()}-${randomBytes(6).toString('hex')}.json`;
      await writeFile(join(backupDirectory, name), current.text, { flag: 'wx', mode: 0o600 });
      const text = JSON.stringify(records, null, 2) + '\n';
      const temporary = `${file}.${randomBytes(6).toString('hex')}.tmp`;
      await writeFile(temporary, text, { flag: 'wx', mode: 0o600 });
      await appendFile(join(root, '.private/history.jsonl'), JSON.stringify({ at: new Date().toISOString(), action, event: 'change-prepared', count: records.length, backup: name }) + '\n', { mode: 0o600 });
      await rename(temporary, file);
      return { records, revision: revisionOf(text) };
    });
    pending = operation.catch(() => {});
    return operation;
  }
  return {
    read,
    save,
    async backups() {
      try { return (await readdir(backupDirectory)).filter(name => /^\d+-[a-f0-9]{12}\.json$/.test(name)).sort().reverse(); }
      catch (error) { if (error.code === 'ENOENT') return []; throw error; }
    },
    async restore(name, revision) {
      if (!/^\d+-[a-f0-9]{12}\.json$/.test(name)) throw new AdminError(400, 'Geçersiz yedek.');
      let text;
      try { text = await readFile(join(backupDirectory, name), 'utf8'); }
      catch (error) { if (error.code === 'ENOENT') throw new AdminError(404, 'Yedek bulunamadı.'); throw error; }
      return save(JSON.parse(text), revision, 'restore');
    },
  };
}
