import { formatNumber, pricePerSquareMeter } from './properties.js';

export const factFields = [
  ['price', 'Fiyat', 'TL'], ['area', 'Alan', 'm²'], ['type', 'Tapu türü'],
  ['parcel', 'Ada / parsel'], ['zoning', 'İmar'], ['road', 'Yol erişimi'], ['utilities', 'Altyapı'],
];

export function hasValue(value, unit) {
  return unit ? Number.isFinite(value) && value > 0 : typeof value === 'string' && value.trim().length > 0;
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function describeFact(property, [key, label, unit]) {
  const value = property[key];
  const metadata = property.evidence?.[key];
  const present = hasValue(value, unit);
  const source = typeof metadata?.source === 'string' && metadata.source.trim() ? metadata.source.trim() : null;
  const date = validDate(metadata?.checkedAt) ? metadata.checkedAt : null;
  const verified = !property.isDemo && present && metadata?.status === 'verified' && source && date;
  return {
    label,
    value: present ? (unit ? `${formatNumber(value)} ${unit}` : value) : 'Bilgi sağlanmadı',
    status: !present ? 'Bilgi eksik' : property.isDemo ? 'Temsili · doğrulanmadı' : verified ? 'Doğrulanmış kayıt' : 'Doğrulanmadı',
    source: source || 'Sağlanmadı',
    date: date ? date.split('-').reverse().join('.') : 'Sağlanmadı',
  };
}

export function propertyFacts(property) {
  const facts = factFields.map(field => describeFact(property, field));
  const unitPrice = pricePerSquareMeter(property.price, property.area);
  facts.splice(2, 0, {
    label: 'm² fiyatı', value: unitPrice === null ? 'Hesaplanamadı' : `${formatNumber(unitPrice)} TL/m²`,
    status: 'Hesaplanan değer', source: 'Fiyat / alan', date: 'Bağlı alanlara bakın',
  });
  return facts;
}
