import {combinePortfolio} from '../data/reference-listings.js';

const sourceRecords=combinePortfolio([]);

export function sourceDrafts(existingRecords){
  const managedIds=new Set(existingRecords.map(record=>record.id));
  return sourceRecords.filter(record=>!managedIds.has(record.id)).map(record=>({
    id:record.id,
    region:record.region,
    local:record.local,
    title:record.title,
    description:record.description,
    ...(record.city?{city:record.city}:{}),
    ...(record.district?{district:record.district}:{}),
    ...(record.neighborhood?{neighborhood:record.neighborhood}:{}),
    type:['Müstakil','Hisseli'].includes(record.type)?record.type:'Bilgi sağlanmadı',
    price:record.price ?? null,
    area:record.area ?? null,
    ...(record.parcel?{parcel:record.parcel}:{}),
    evidence:structuredClone(record.evidence || {}),
    currency:'TRY',
    category:record.category==='plot'?'plot':'land',
    status:'draft',
    photos:[],
    featured:false,
    featuredOrder:50,
    isDemo:false,
    publicationApproved:false,
  }));
}
