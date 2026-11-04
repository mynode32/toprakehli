import test from 'node:test';
import assert from 'node:assert/strict';
import {portfolioNote,assistantGreeting,resultSummary} from '../src/domain/site-copy.js';

test('portfolio note follows the visible record set',()=>{
 assert.match(portfolioNote([]),/hazırlanıyor/);
 assert.match(portfolioNote([{referenceListing:true}]),/1 kaynak kayıt/);
 assert.match(portfolioNote([{id:'new-1',isDemo:false}]),/1 yayınlanmış ilan/);
 assert.doesNotMatch(portfolioNote([{id:'new-1',isDemo:false}]),/18 kaynak/);
});
test('assistant greeting does not label live listings demo',()=>{
 assert.match(assistantGreeting([{isDemo:true}]),/demo/);
 assert.doesNotMatch(assistantGreeting([{isDemo:false}]),/demo/);
});
test('result summary warns about source records only when they are shown',()=>{
 assert.doesNotMatch(resultSummary([{id:'live-1'}],1),/Kaynak liste/);
 assert.match(resultSummary([{referenceListing:true}],1),/Kaynak liste/);
 assert.doesNotMatch(resultSummary([{referenceListing:true}],0),/Kaynak liste/);
});
