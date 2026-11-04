// Yalnız demo. Gerçek veriyle karıştırılmamalıdır.
export const properties = [
  { id: 'demo-1', region: 'Marmara Ereğlisi', local: 'Yeniçiftlik', area: 2500, price: 4750000, type: 'Müstakil', isDemo: true },
  { id: 'demo-2', region: 'Marmara Ereğlisi', local: 'Sultanköy', area: 1200, price: 3600000, type: 'Müstakil', isDemo: true },
  { id: 'demo-3', region: 'Tekirdağ', local: 'Barbaros', area: 5750, price: 6900000, type: 'Müstakil', isDemo: true },
  { id: 'demo-4', region: 'Tekirdağ', local: 'Karaağaç', area: 3000, price: 5250000, type: 'Müstakil', isDemo: true },
].map(property => ({
  ...property,
  image: 'src/assets/landscape-hero.webp',
  // Gerçek kaynak ve kontrol tarihi sağlanana kadar hiçbir alan doğrulanmış değildir.
  evidence: Object.fromEntries(['price', 'area', 'type', 'parcel', 'zoning', 'road', 'utilities']
    .map(key => [key, { status: 'unverified', source: null, checkedAt: null }])),
}));
