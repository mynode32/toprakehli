import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createSqlFixture} from './support/platform-fixture.mjs';
import {encryptBackup,decryptBackup,verifyApplicationBackup} from '../server/backup.mjs';

test('encrypted application backup restores records and leads into a separate SQL database; tampering fails',async t=>{
  const actor='16e12d07-b478-4d6e-8255-44450adf745c';
  const source=await createSqlFixture(actor),target=await createSqlFixture(actor);t.after(async()=>{await source.sql.close();await target.sql.close();});
  const record={id:'backup-test',region:'Test',local:'Test',type:'Müstakil',price:null,area:100,isDemo:false,publicationApproved:false,status:'draft',currency:'TRY',category:'land',photos:[]};
  await source.db.rpc('te_change',{p_revision:0,p_records:[record],p_actor:actor});
  await source.db.insert('te_leads',{name:'Test',contact:'test@example.test',message:'Test',privacy_version:'test'});
  const tables={};for(const name of ['te_state','te_media','te_snapshots','te_leads','te_audit'])tables[name]=await source.db.select(name);
  const backup={format:1,project:'test',tables,objects:[]},key=randomBytes(32),encrypted=encryptBackup(backup,key),decoded=decryptBackup(encrypted,key);
  assert.equal(verifyApplicationBackup(decoded).leads,1);
  await target.sql.query('update te_state set records=$1,revision=$2 where id=true',[JSON.stringify(decoded.tables.te_state[0].records),decoded.tables.te_state[0].revision]);
  for(const lead of decoded.tables.te_leads)await target.db.insert('te_leads',lead);
  assert.deepEqual((await target.db.select('te_state'))[0].records,(await source.db.select('te_state'))[0].records);
  assert.equal((await target.db.select('te_leads'))[0].message,'Test');
  encrypted[encrypted.length-1]^=1;assert.throws(()=>decryptBackup(encrypted,key));assert.throws(()=>decryptBackup(encryptBackup(backup,key),randomBytes(32)));
});
