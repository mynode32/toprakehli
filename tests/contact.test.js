import test from 'node:test';
import assert from 'node:assert/strict';
import { contactLinks } from '../src/data/contact.js';

test('contact links use international phone and encode the demo record context', () => {
  const links = contactLinks({ local: 'Yeniçiftlik & örnek', id: 'demo-1', isDemo: true });
  assert.equal(links[0][1], 'tel:+905304627659');
  const whatsapp = new URL(links[1][1]);
  assert.equal(whatsapp.pathname, '/905304627659');
  assert.match(whatsapp.searchParams.get('text'), /Yeniçiftlik & örnek \(demo-1\)/);
  assert.match(whatsapp.searchParams.get('text'), /gerçek satış ilanı olmadığını/);
  const mail = new URL(links[2][1]);
  assert.equal(mail.pathname, 'toprakehli.ofis@gmail.com');
  assert.equal(mail.searchParams.get('body'), whatsapp.searchParams.get('text'));
  assert.doesNotMatch(new URL(contactLinks()[1][1]).searchParams.get('text'), /undefined|demo-/);
});
