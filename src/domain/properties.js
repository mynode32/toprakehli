export function filterProperties(properties, { region = 'all', budget = 'all', type = 'all', size = 'all' } = {}) {
  return properties.filter(p => (region === 'all' || p.region === region)
    && (budget === 'all' || (Number.isFinite(p.price) && p.price > 0 && p.price <= Number(budget)))
    && (type === 'all' || p.type === type)
    && (size === 'all' || (Number.isFinite(p.area) && p.area > 0 && p.area >= Number(size))));
}

export function pricePerSquareMeter(price, area) {
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(area) || area <= 0) return null;
  const result = price / area;
  return Number.isFinite(result) && result > 0 ? result : null;
}

const numberFormat = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
export function formatNumber(value) { return Number.isFinite(value) ? numberFormat.format(value) : 'Bilgi sağlanmadı'; }
