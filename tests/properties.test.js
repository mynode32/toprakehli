import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProperties, pricePerSquareMeter } from '../src/domain/properties.js';
import { properties } from '../src/data/properties.js';

test('filters combine and include price and area boundaries', () => {
  assert.deepEqual(filterProperties(properties, { region: 'Tekirdağ', budget: '5250000', size: '3000', type: 'Müstakil' }).map(p => p.id), ['demo-4']);
  assert.equal(filterProperties(properties, { budget: '3600000' })[0].id, 'demo-2');
});
test('empty results and reset without mutating source', () => {
  const before = structuredClone(properties);
  assert.deepEqual(filterProperties(properties, { type: 'Hisseli' }), []);
  assert.equal(filterProperties(properties).length, 4);
  assert.deepEqual(properties, before);
});
test('invalid price and area do not produce a unit price', () => {
  for (const value of [null, undefined, 0, -1, NaN, Infinity, '10']) {
    assert.equal(pricePerSquareMeter(value, 100), null);
    assert.equal(pricePerSquareMeter(100, value), null);
  }
  assert.equal(pricePerSquareMeter(4750000, 2500), 1900);
  assert.equal(pricePerSquareMeter(Number.MAX_VALUE, Number.MIN_VALUE), null);
});
test('invalid missing numbers are excluded by numeric filters', () => {
  const invalid = [{ price: null, area: null }, { price: -1, area: -1 }];
  assert.deepEqual(filterProperties(invalid, { budget: '100', size: '100' }), []);
});
