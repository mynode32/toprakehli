import test from 'node:test';
import assert from 'node:assert/strict';
import {referenceListings,combinePortfolio} from '../src/data/reference-listings.js';
import {incomingListings} from '../src/data/incoming-listings.js';
import {discoverProperties} from '../src/domain/discovery.js';

test('source catalogue retains 18 separate segments with unverified evidence',()=>{
  assert.equal(referenceListings.length,18);
  assert.equal(new Set(referenceListings.map(p=>p.id)).size,18);
  assert.deepEqual(Object.values(Object.groupBy(referenceListings,p=>p.region)).map(a=>a.length),[4,3,7,4]);
  for(const p of referenceListings){assert.ok(p.area>0&&p.price>0);assert.ok(p.referenceListing);assert.ok(Object.values(p.evidence).every(e=>e.status==='unverified'&&e.checkedAt===null));}
});
test('managed records remain intact alongside source catalogue and use existing filters',()=>{
  const record={id:'real',region:'Test',local:'Test',price:100,area:300};
  const input=[record];const combined=combinePortfolio(input);
  assert.equal(input.length,1);assert.equal(combined[0],record);assert.equal(combined.length,27);
  assert.equal(discoverProperties(combined,{region:'Hayrabolu / Muzruplu'}).length,3);
});
test('eight new source listings join the original eighteen without pretending to be verified',()=>{
  assert.equal(incomingListings.length,8);
  const combined=combinePortfolio([]);
  assert.equal(combined.length,26);
  assert.equal(new Set(combined.map(record=>record.id)).size,26);
  assert.deepEqual(incomingListings.map(record=>record.price),[500000,300000,800000,1200000,550000,100000,100000,105000]);
  for(const record of incomingListings){
    assert.equal(record.referenceListing,true);
    assert.equal(record.isDemo,false);
    assert.equal(record.publicationApproved,false);
    assert.ok(Object.values(record.evidence).every(item=>item.status==='unverified'));
  }
});
test('withdrawn or archived managed source records do not reappear in the source catalogue',()=>{
  const visible=combinePortfolio([]);
  assert.equal(visible.length,26);
  assert.equal(combinePortfolio([],['source-1','incoming-2026-11-03-1']).length,24);
  assert.ok(!combinePortfolio([],['source-1']).some(record=>record.id==='source-1'));
  assert.equal(combinePortfolio([{id:'source-1',status:'published'}],['source-1']).filter(record=>record.id==='source-1').length,1);
});
