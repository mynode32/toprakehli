export function portfolioNote(records){
 if(!records.length)return 'Portföy alanımız hazırlanıyor. Kartlar yalnız görünüm örneğidir.';
 const source=records.some(record=>record.referenceListing);
 return `${records.length} portföy gösteriliyor.${source?' Görseller tanıtım amaçlıdır; güncel fiyat ve parsel bilgileri için bizimle iletişime geçin.':''}`;
}

export function assistantGreeting(records){
 return `Merhaba! Bütçeniz ve ilgilendiğiniz bölge nedir? Örneğin “5 milyon TL’ye kadar”.${records.some(record=>record.isDemo)?' Mevcut demo ilanlar gerçek satış kaydı değildir.':''}`;
}

export function resultSummary(records,count,assistantSelection=false){
 return `${count} portföy gösteriliyor.${assistantSelection?' Asistan seçimi; tümünü görmek için filtreleri sıfırlayın.':''}`;
}
