export function portfolioNote(records){
 if(!records.length)return 'Portföy alanımız hazırlanıyor. Kartlar yalnız görünüm örneğidir.';
 const source=records.some(record=>record.referenceListing);
 return source?'Görseller tanıtım amaçlıdır; güncel fiyat ve parsel bilgileri için bizimle iletişime geçin.':'Portföyleri konum, fiyat ve alan ölçütlerine göre keşfedin.';
}

export function availableDeedTypes(records){
 return [...new Set(records.map(record=>record.type).filter(type=>type && !['Doğrulanacak','Bilgi sağlanmadı'].includes(type)))].sort((a,b)=>a.localeCompare(b,'tr'));
}

export function regionSummary(records){
 const counts=new Map();
 for(const record of records){if(record.region)counts.set(record.region,(counts.get(record.region)||0)+1);}
 return [...counts].sort(([a],[b])=>a.localeCompare(b,'tr')).map(([region,count])=>{
  const [district,...parts]=region.split(/\s*\/\s*/);
  return {district,local:parts.join(' / '),count};
 });
}

export function assistantGreeting(records){
 return `Merhaba! Bütçeniz ve ilgilendiğiniz bölge nedir? Örneğin “5 milyon TL’ye kadar”.${records.some(record=>record.isDemo)?' Mevcut demo ilanlar gerçek satış kaydı değildir.':''}`;
}

export function resultSummary(records,count,assistantSelection=false){
 return `${count} portföy gösteriliyor.${assistantSelection?' Asistan seçimi; tümünü görmek için filtreleri sıfırlayın.':''}`;
}
