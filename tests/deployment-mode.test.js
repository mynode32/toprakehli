import test from 'node:test';
import assert from 'node:assert/strict';
import {deploymentMode} from '../scripts/deployment-mode.mjs';

test('the public deployment defaults to the source catalogue, never sample or bogus published records',()=>{
  assert.deepEqual(deploymentMode(undefined),{demo:false,catalogue:true,online:false,live:false});
  assert.deepEqual(deploymentMode('catalogue'),{demo:false,catalogue:true,online:false,live:false});
  assert.deepEqual(deploymentMode('online'),{demo:false,catalogue:true,online:true,live:false});
  assert.deepEqual(deploymentMode('demo'),{demo:true,catalogue:false,online:false,live:false});
  assert.deepEqual(deploymentMode('live'),{demo:false,catalogue:false,online:false,live:true});
});
