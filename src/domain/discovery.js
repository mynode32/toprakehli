import { filterProperties } from './properties.js';

const normalize = value => String(value ?? '').toLocaleLowerCase('tr-TR').trim();
export function discoverProperties(properties, filters = {}) {
  const query = normalize(filters.query);
  const result = filterProperties(properties, filters).filter(property =>
    normalize(`${property.title || ""} ${property.local} ${property.region} ${property.id}`).includes(query));
  const [key, direction] = { 'price-asc': ['price', 1], 'price-desc': ['price', -1], 'area-desc': ['area', -1] }[filters.sort] || [];
  if (key) result.sort((a, b) => {
    const validA = Number.isFinite(a[key]) && a[key] > 0;
    const validB = Number.isFinite(b[key]) && b[key] > 0;
    if (validA !== validB) return validA ? -1 : 1;
    return validA ? direction * (a[key] - b[key]) : 0;
  });
  return result;
}
