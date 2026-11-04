// Sadece yayınlanması işletmece onaylanmış kayıtlar bu kontrolden geçirilir.
export function validateListings(records) {
  if (!Array.isArray(records)) throw new Error('Portföy verisi liste olmalıdır.');
  const ids = new Set();
  for (const record of records) {
    if (!record || record.isDemo !== false || record.publicationApproved !== true) throw new Error('Gerçek kayıt ve açık yayın onayı gereklidir.');
    if (!/^[a-z0-9-]{1,60}$/.test(record.id) || ids.has(record.id)) throw new Error('Kayıt kimliği geçersiz veya tekrarlı.');
    ids.add(record.id);
    for (const key of ['region', 'local', 'type']) {
      if (typeof record[key] !== 'string' || !record[key].trim() || record[key].length > 150) throw new Error(`${record.id}: ${key} gerekli.`);
    }
    for (const key of ['price', 'area']) {
      if (record[key] != null && (!Number.isFinite(record[key]) || record[key] <= 0)) throw new Error(`${record.id}: ${key} pozitif sayı veya null olmalıdır.`);
    }
    for (const key of ['parcel', 'zoning', 'road', 'utilities']) {
      if (record[key] != null && (typeof record[key] !== 'string' || record[key].length > 1000)) throw new Error(`${record.id}: ${key} metin veya null olmalıdır.`);
    }
    if (record.image != null && (!/^src\/assets\/[a-zA-Z0-9_-]+\.(webp|jpg|png)$/.test(record.image)
      || typeof record.imageAlt !== 'string' || !record.imageAlt.trim() || record.imageAlt.length > 300)) throw new Error(`${record.id}: Yerel görsel ve açıklaması gerekli.`);
    const allowed = ['id', 'region', 'local', 'type', 'price', 'area', 'parcel', 'zoning', 'road', 'utilities', 'isDemo', 'publicationApproved', 'evidence', 'image', 'imageAlt'];
    if (Object.keys(record).some(key => !allowed.includes(key))) throw new Error(`${record.id}: Yayın şemasında olmayan alan var.`);
    if (record.evidence != null && (typeof record.evidence !== 'object' || Array.isArray(record.evidence))) throw new Error(`${record.id}: Kaynak bilgileri nesne olmalıdır.`);
    for (const [key, fact] of Object.entries(record.evidence || {})) {
      if (!['price', 'area', 'type', 'parcel', 'zoning', 'road', 'utilities'].includes(key)
        || !fact || !['unverified', 'verified'].includes(fact.status)
        || (fact.source != null && (typeof fact.source !== 'string' || fact.source.length > 500))
        || (fact.checkedAt != null && (typeof fact.checkedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fact.checkedAt)
          || !Number.isFinite(Date.parse(fact.checkedAt)) || new Date(fact.checkedAt).toISOString().slice(0, 10) !== fact.checkedAt))) throw new Error(`${record.id}: Alan kaynak bilgisi geçersiz.`);
      if (Object.keys(fact).some(field => !['status', 'source', 'checkedAt'].includes(field))) throw new Error(`${record.id}: Kaynak bilgisinde yayın dışı alan var.`);
      if (fact.status === 'verified' && (!fact.source?.trim() || !fact.checkedAt || !Number.isFinite(Date.parse(fact.checkedAt))
        || new Date(fact.checkedAt).toISOString().slice(0, 10) !== fact.checkedAt || record[key] == null || (typeof record[key] === 'string' && !record[key].trim()))) throw new Error(`${record.id}: Doğrulama kaynağı, tarihi ve değer gerekli.`);
    }
  }
  return records;
}
