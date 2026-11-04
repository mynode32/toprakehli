// Muhammet Yusuf'un 03.11.2026 tarihli sekiz kayıtlık listesi.
// Tapu/pay, fiyat ve alan belgelerle doğrulanana kadar kaynak kaydı olarak gösterilir.
const items = [
  ['Kırklareli','Lüleburgaz','Düğüncübaşı','0 / 1223',534,500000],
  ['Kırklareli','Lüleburgaz','Emirali','0 / 2482',330,300000],
  ['Tekirdağ','Ergene','İğneler','153 / 46',850,800000],
  ['Tekirdağ','Ergene','İğneler','132 / 259',1370,1200000],
  ['Tekirdağ','Saray','Beyazköy','193 / 20',730,550000],
  ['Tekirdağ','Saray','Beyazköy','239 / 19',130,100000],
  ['Tekirdağ','Saray','Beyazköy','239 / 24',150,100000],
  ['Tekirdağ','Saray','Beyazköy','239 / 26',140,105000],
];
const source='Muhammet_Yusuf_8_Yeni_Ilan_Listesi.txt — 03.11.2026';
const unverified=key=>({status:'unverified',source:['price','area','parcel'].includes(key)?source:null,checkedAt:null});

export const incomingListings=items.map(([city,district,neighborhood,parcel,area,price],index)=>({
  id:`incoming-2026-11-03-${index+1}`,
  city,district,neighborhood,
  region:`${district} / ${neighborhood}`,
  local:neighborhood,
  title:`${neighborhood} · ${new Intl.NumberFormat('tr-TR').format(area)} m²`,
  parcel,area,price,
  type:'Doğrulanacak',
  description:'Kaynak listede tapudaki nitelik TARLA olarak bildirilmiştir. Tapu/pay oranı, alan ve fiyat belgelerle doğrulanmadan kesin satış bilgisi kabul edilmemelidir.',
  image:`src/assets/reference-land-${index}.jpg`,
  imageAlt:'Temsili manzara; gerçek parsel fotoğrafı değildir.',
  referenceListing:true,isDemo:false,publicationApproved:false,currency:'TRY',category:'land',
  evidence:Object.fromEntries(['price','area','type','parcel','zoning','road','utilities'].map(key=>[key,unverified(key)])),
}));
