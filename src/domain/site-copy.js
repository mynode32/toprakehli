export function portfolioNote(records){
 if(!records.length)return 'Portföy alanımız hazırlanıyor. Kartlar yalnız görünüm örneğidir.';
 const source=records.filter(record=>record.referenceListing).length;
 const published=records.length-source;
 const parts=[];
 if(source)parts.push(`${source} kaynak kayıt`);
 if(published)parts.push(`${published} yayınlanmış ilan`);
 return `${parts.join(' ve ')} gösteriliyor.${source?' Kaynak liste bilgileri doğrulama bekliyor; görseller temsilidir.':''}`;
}

export function assistantGreeting(records){
 return `Merhaba! Bütçeniz ve ilgilendiğiniz bölge nedir? Örneğin “5 milyon TL’ye kadar”.${records.some(record=>record.isDemo)?' Mevcut demo ilanlar gerçek satış kaydı değildir.':''}`;
}

export function resultSummary(records,count,assistantSelection=false){
 return `${count} portföy gösteriliyor.${count && records.some(record=>record.referenceListing)?' Kaynak liste kayıtları doğrulama bekliyor.':''}${assistantSelection?' Asistan seçimi; tümünü görmek için filtreleri sıfırlayın.':''}`;
}
