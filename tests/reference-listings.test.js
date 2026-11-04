import test from 'node:test';
import assert from 'node:assert/strict';
import {referenceListings,combinePortfolio} from '../src/data/reference-listings.js';
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
  assert.equal(input.length,1);assert.equal(combined[0],record);assert.equal(combined.length,19);
  assert.equal(discoverProperties(combined,{region:'Hayrabolu / Muzruplu'}).length,3);
});
