import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchPortfolioOrFallback} from '../src/data/remote.js';

test('temporary API failure keeps the source catalogue available',async()=>{
  const fallback=[{id:'source-1'}];
  const result=await fetchPortfolioOrFallback('/api/platform/public',fallback,async()=>{throw new Error('Bağlantı kesildi');});
  assert.deepEqual(result.records,fallback);
  assert.equal(result.error,'Bağlantı kesildi');
});

test('successful API response replaces the fallback with current records',async()=>{
  const result=await fetchPortfolioOrFallback('/api/platform/public',[{id:'old'}],async()=>({records:[{id:'new'}],revision:3}));
  assert.deepEqual(result,{records:[{id:'new'}],revision:3,suppressedSourceIds:[],error:''});
});
test('withdrawn source identifiers survive the portfolio fetch',async()=>{
  const result=await fetchPortfolioOrFallback('/api/platform/public',[],async()=>({records:[],revision:4,suppressedSourceIds:['source-1']}));
  assert.deepEqual(result.suppressedSourceIds,['source-1']);
});
