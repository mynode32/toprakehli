import test from 'node:test';
import assert from 'node:assert/strict';
import { describeFact, propertyFacts } from '../src/domain/facts.js';
import { toggleComparison } from '../src/domain/comparison.js';

test('missing, zero and invalid financial fields never appear as valid values', () => {
  for (const value of [null, undefined, 0, -1, NaN, Infinity, '100']) {
    const facts = propertyFacts({ price: value, area: value });
    assert.equal(facts[0].value, 'Bilgi sağlanmadı');
    assert.equal(facts[1].value, 'Bilgi sağlanmadı');
    assert.equal(facts[2].value, 'Hesaplanamadı');
  }
});

test('verification requires value, source and valid date; demo cannot be verified', () => {
  const field = ['type', 'Tapu türü'];
  const record = { type: 'Müstakil', evidence: { type: { status: 'verified', source: 'Test belgesi', checkedAt: '2026-10-31' } } };
  assert.equal(describeFact(record, field).status, 'Doğrulanmış kayıt');
  assert.equal(describeFact({ ...record, isDemo: true }, field).status, 'Temsili · doğrulanmadı');
  for (const change of [{ source: '' }, { checkedAt: '2026-02-30' }, { checkedAt: null }, { status: 'unverified' }]) {
    assert.equal(describeFact({ ...record, evidence: { type: { ...record.evidence.type, ...change } } }, field).status, 'Doğrulanmadı');
  }
  assert.equal(describeFact({ ...record, type: '' }, field).status, 'Bilgi eksik');
});

test('comparison rejects unknown records, caps at three and allows removal', () => {
  const available = ['a', 'b', 'c', 'd'];
  const initial = ['a', 'b'];
  assert.deepEqual(toggleComparison(initial, 'c', available), ['a', 'b', 'c']);
  assert.deepEqual(toggleComparison(['a', 'b', 'c'], 'd', available), ['a', 'b', 'c']);
  assert.deepEqual(toggleComparison(initial, 'a', available), ['b']);
  assert.deepEqual(toggleComparison(initial, 'unknown', available), initial);
  assert.deepEqual(initial, ['a', 'b']);
});
