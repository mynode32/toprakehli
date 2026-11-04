import test from 'node:test';
import assert from 'node:assert/strict';
import {portfolioLocation} from '../src/domain/map.js';
import {referenceListings} from '../src/data/reference-listings.js';
import {validateOnlineRecords,publicRecord} from '../server/validation.mjs';

test('all source properties open their own region without fabricated parcel markers',()=>{
  for(const p of referenceListings){const map=portfolioLocation(p);assert.equal(map.kind,'region');assert.match(map.embed,/bbox=/);assert.ok(!map.embed.includes('marker='));assert.ok(map.note.includes('kesin parsel'));}
  assert.notEqual(portfolioLocation(referenceListings[0]).embed,portfolioLocation(referenceListings[4]).embed);
  assert.equal(portfolioLocation({local:'Unknown',region:'Unknown'}).kind,'unknown');
});
test('provided coordinates include an explicit marker, including valid zero coordinates',()=>{
  const map=portfolioLocation({local:'Test',latitude:0,longitude:0});assert.equal(map.kind,'provided');assert.match(map.embed,/marker=0,0/);
  assert.equal(portfolioLocation({latitude:91,longitude:27}).kind,'unknown');
  assert.equal(portfolioLocation({latitude:'41',longitude:27}).kind,'unknown');
});
test('online coordinate validation rejects incomplete and invalid pairs and retains public values',()=>{
  const base={id:'test',region:'Test',local:'Test',type:'Bilgi sağlanmadı',price:null,area:null,isDemo:false,publicationApproved:true,status:'published',currency:'TRY',category:'land',photos:[]};
  const valid=validateOnlineRecords([{...base,latitude:41.2,longitude:27.4}])[0];assert.equal(publicRecord(valid).latitude,41.2);
  assert.equal(validateOnlineRecords([base]).length,1);
  for(const change of [{latitude:41},{latitude:91,longitude:27},{latitude:41,longitude:181},{latitude:'41',longitude:27},{latitude:NaN,longitude:27}])assert.throws(()=>validateOnlineRecords([{...base,...change}]));
});
