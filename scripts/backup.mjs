import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {createSupabase} from '../server/supabase.mjs';
import {collectApplicationBackup,encryptBackup,decryptBackup,verifyApplicationBackup} from '../server/backup.mjs';

// Only private local files. This command never restores or modifies remote records.
const envFile=process.argv[2];if(!envFile)throw new Error('Kullanım: node scripts/backup.mjs .private/ayarlar.env');
process.loadEnvFile(envFile);
const url=process.env.TOPRAK_SUPABASE_URL || process.env.SUPABASE_URL;
const service=process.env.TOPRAK_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !service)throw new Error('Yedek bağlantısı eksik.');
const backup=await collectApplicationBackup(createSupabase({url,service}),new URL(url).hostname.split('.')[0]);
const directory=resolve('.private/backups');await mkdir(directory,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),key=randomBytes(32);
const file=join(directory,`application-${stamp}.tebackup`),keyFile=join(directory,`application-${stamp}.key`);
await writeFile(keyFile,key,{mode:0o600,flag:'wx'});await writeFile(file,encryptBackup(backup,key),{mode:0o600,flag:'wx'});
const verified=decryptBackup(await readFile(file),await readFile(keyFile));
console.log({backup:file,keyFile,verified:verifyApplicationBackup(verified)});
console.log('Uygulama verisi ve fotoğraf yedeği doğrulandı. Anahtarı yedekten ayrı güvenli yerde saklayın. Auth hesap/parolaları, DB şeması ve yönetilen DB kurtarma yedeğinin yerine geçmez.');
