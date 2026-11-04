import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceDrafts} from '../src/domain/source-import.js';
import {validateOnlineRecords,publicRecord} from '../server/validation.mjs';

test('all 26 source listings can be copied into safe unpublished drafts',()=>{
  const drafts=sourceDrafts([]);
  assert.equal(drafts.length,26);
  assert.equal(new Set(drafts.map(record=>record.id)).size,26);
  assert.equal(validateOnlineRecords(drafts).length,26);
  for(const record of drafts){
    assert.equal(record.status,'draft');
    assert.equal(record.publicationApproved,false);
    assert.deepEqual(record.photos,[]);
    assert.equal(record.featured,false);
    assert.equal(publicRecord(record),null);
    assert.equal(record.type,'Bilgi sağlanmadı');
  }
});

test('source import skips records already managed in the panel without changing them',()=>{
  const existing=[{id:'source-1',title:'Müşterinin düzenlediği ilan'},{id:'incoming-2026-11-03-1',status:'published'}];
  const snapshot=structuredClone(existing);
  const drafts=sourceDrafts(existing);
  assert.equal(drafts.length,24);
  assert.ok(!drafts.some(record=>existing.some(item=>item.id===record.id)));
  assert.deepEqual(existing,snapshot);
  assert.equal(sourceDrafts([...existing,...drafts]).length,0);
});
