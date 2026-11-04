import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverProperties } from '../src/domain/discovery.js';
import { validateListings } from '../scripts/content.mjs';
import { properties } from '../src/data/properties.js';

test('Turkish search, sorting and filters work together without mutating records', () => {
  assert.deepEqual(discoverProperties(properties, { query: 'YENİÇİFTLİK' }).map(p => p.id), ['demo-1']);
  assert.deepEqual(discoverProperties(properties, { region: 'Tekirdağ', sort: 'price-asc' }).map(p => p.id), ['demo-4', 'demo-3']);
  assert.equal(discoverProperties(properties, { query: '<script>' }).length, 0);
  const records = [{ price: null }, { price: 100 }, { price: 50 }];
  assert.deepEqual(discoverProperties(records, { sort: 'price-desc' }).map(p => p.price), [100, 50, null]);
  assert.equal(records[0].price, null);
});

test('publication rejects demos, missing approval, duplicate ids and invalid facts', () => {
  const record = { id: 'real-1', local: 'Test', region: 'Test', type: 'Müstakil', price: null, area: 100, isDemo: false, publicationApproved: true };
  assert.deepEqual(validateListings([]), []);
  assert.equal(validateListings([record]).length, 1);
  for (const change of [{ isDemo: true }, { publicationApproved: false }, { area: 0 }, { price: '100' }, { privateNote: 'not public' }, { image: 'https://example.com/image.jpg', imageAlt: 'Test' }, { image: 'src/assets/../../secret.jpg', imageAlt: 'Test' }, { evidence: { area: { status: 'verified', source: '', checkedAt: null } } }]) {
    assert.throws(() => validateListings([{ ...record, ...change }]));
  }
  assert.throws(() => validateListings([record, record]));
  assert.throws(() => validateListings(properties));
  assert.throws(() => validateListings([{ ...record, evidence: [] }]));
  assert.throws(() => validateListings([{ ...record, evidence: { area: { status: 'unverified', checkedAt: '2026-02-30' } } }]));
});
