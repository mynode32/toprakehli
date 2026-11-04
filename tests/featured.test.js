import test from 'node:test';
import assert from 'node:assert/strict';
import {featuredProperties} from '../src/domain/featured.js';
import {validateOnlineRecords} from '../server/validation.mjs';

test('featured gallery selects published photo records, respects explicit order and never mutates input',()=>{
  const records=[{id:'a',image:'a',status:'published'},{id:'b',image:'b',status:'published',featured:true,featuredOrder:2},{id:'c',image:'c',status:'published',featured:true,featuredOrder:1},{id:'draft',image:'x',status:'draft',featured:true},{id:'sold',image:'x',status:'sold',featured:true},{id:'empty',status:'published',featured:true}];
  assert.deepEqual(featuredProperties(records).map(r=>r.id),['c','b']);assert.equal(records[0].id,'a');assert.deepEqual(featuredProperties(records,1).map(r=>r.id),['c']);
  assert.deepEqual(featuredProperties([records[0]]).map(r=>r.id),['a']);assert.deepEqual(featuredProperties([]),[]);
  assert.deepEqual(featuredProperties([{...records[0],featured:false}]),[]);
});
test('online featured settings validate and legacy records remain supported',()=>{
  const record={id:'test',region:'Test',local:'Test',type:'Bilgi sağlanmadı',price:null,area:null,isDemo:false,publicationApproved:false,status:'draft',currency:'TRY',category:'land',photos:[]};
  assert.equal(validateOnlineRecords([record]).length,1);assert.equal(validateOnlineRecords([{...record,featured:true,featuredOrder:1}])[0].featured,true);
  for(const change of [{featured:'true'},{featuredOrder:0},{featuredOrder:100},{featuredOrder:1.5}])assert.throws(()=>validateOnlineRecords([{...record,...change}]));
});
