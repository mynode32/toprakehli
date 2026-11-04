import { validateListings } from '../scripts/content.mjs';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const states = ['draft', 'published', 'sold', 'archived'];
export const leadStates = ['new', 'reviewing', 'contacted', 'completed'];
const fields = ['title','description','city','district','neighborhood','category','currency','status','photos','updatedAt','publishedAt','featured','featuredOrder','latitude','longitude'];
export function validateOnlineRecords(input) {
  if (!Array.isArray(input) || input.length > 1000) throw new HttpError(400, 'En fazla 1000 portföy desteklenir.');
  const clean = input.map(record => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new HttpError(400, 'Geçersiz kayıt.');
    const { image, imageAlt, ...base } = record;
    for (const key of fields) delete base[key];
    if (image != null || imageAlt != null || record.isDemo !== false || typeof record.publicationApproved !== 'boolean') throw new HttpError(400, 'Gerçek kayıt ve geçerli onay durumu gerekli.');
    try { validateListings([{ ...base, publicationApproved: true }]); }
    catch(error) { throw new HttpError(400,error.message); }
    if (!states.includes(record.status)) throw new HttpError(400, 'İlan durumu geçersiz.');
    if(record.featured!==undefined && typeof record.featured!=='boolean')throw new HttpError(400,'Öne çıkarma seçimi geçersiz.');
    if(record.featuredOrder!==undefined && (!Number.isInteger(record.featuredOrder)||record.featuredOrder<1||record.featuredOrder>99))throw new HttpError(400,'Vitrin sırası 1–99 arasında tam sayı olmalıdır.');
    if(record.latitude!=null || record.longitude!=null){
      if(!Number.isFinite(record.latitude)||!Number.isFinite(record.longitude)||Math.abs(record.latitude)>90||Math.abs(record.longitude)>180)throw new HttpError(400,'Enlem ve boylam birlikte, geçerli sayı olarak girilmelidir.');
    }
    if (['published','sold'].includes(record.status) && !record.publicationApproved) throw new HttpError(400, 'Yayın için işletme onayı gerekli.');
    for (const key of ['title','city','district','neighborhood']) {
      if (record[key] != null && (typeof record[key] !== 'string' || record[key].length > 150)) throw new HttpError(400, `${key} en fazla 150 karakter olmalıdır.`);
    }
    if (record.description != null && (typeof record.description !== 'string' || record.description.length > 5000)) throw new HttpError(400, 'Açıklama en fazla 5000 karakter olmalıdır.');
    if (record.currency !== 'TRY' || !['land','plot'].includes(record.category)) throw new HttpError(400, 'Para birimi veya kategori geçersiz.');
    if (!Array.isArray(record.photos) || record.photos.length > 12) throw new HttpError(400, 'En fazla 12 fotoğraf eklenebilir.');
    const keys = new Set();
    for (const photo of record.photos) {
      if (!photo || !/^[a-f0-9-]{36}$/.test(photo.key) || keys.has(photo.key) || typeof photo.alt !== 'string' || !photo.alt.trim() || photo.alt.length > 300 || Object.keys(photo).some(key => !['key','alt'].includes(key))) throw new HttpError(400, 'Fotoğraf kimliği/açıklaması geçersiz veya tekrarlı.');
      keys.add(photo.key);
    }
    // Client timestamps never determine publication/audit chronology.
    return Object.fromEntries(Object.entries(record).filter(([key]) => !['updatedAt','publishedAt'].includes(key)));
  });
  if (new Set(clean.map(record => record.id)).size !== clean.length) throw new HttpError(400, 'Tekrarlı ilan kimliği.');
  return clean;
}
export function publicRecord(record) {
  if (!['published','sold'].includes(record.status) || !record.publicationApproved || record.isDemo !== false) return null;
  const { publicationApproved, ...result } = record;
  const first = record.photos[0];
  return { ...result, ...(first ? { image: `/api/platform/photo?key=${first.key}&size=960`, imageAlt: first.alt } : {}) };
}
export function validateLead(input) {
  if (!input || typeof input !== 'object' || input.website) throw new HttpError(400, 'Talep gönderilemedi.');
  const clean = {};
  for (const [key,max] of [['name',150],['contact',200],['message',3000]]) {
    if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > max) throw new HttpError(400, 'Ad, iletişim ve mesaj alanlarını kontrol edin.');
    clean[key] = input[key].trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.contact) && !/^\+?[\d ()-]{10,25}$/.test(clean.contact)) throw new HttpError(400, 'Geçerli telefon veya e-posta girin.');
  if (input.acknowledged !== true) throw new HttpError(400, 'Aydınlatma metnini okuduğunuzu belirtin.');
  clean.propertyId = input.propertyId || null;
  if (clean.propertyId && !/^[a-z0-9-]{1,60}$/.test(clean.propertyId)) throw new HttpError(400, 'Portföy kimliği geçersiz.');
  return clean;
}
