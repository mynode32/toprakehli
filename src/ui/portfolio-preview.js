import {element} from './listings.js';

// Presentation-only cards: never returned by the API, assistant, filters or comparison.
export function renderPortfolioPreview(container) {
  container.replaceChildren();
  let dialog=document.querySelector('#portfolio-layout-preview');
  if(!dialog){
    dialog=element('dialog',undefined,'layout-dialog');dialog.id='portfolio-layout-preview';dialog.setAttribute('aria-labelledby','layout-preview-title');
    const close=element('button','Kapat ×','layout-close');close.type='button';close.autofocus=true;close.addEventListener('click',()=>dialog.close());
    const label=element('p','GÖRÜNÜM ÖRNEĞİ · SATIŞ İLANI DEĞİLDİR','eyebrow');
    const title=element('h2','Portföye yakından bakın');title.id='layout-preview-title';
    const image=element('img');image.src='src/assets/landscape-hero.webp';image.alt='Yapay zekâyla üretilmiş temsili manzara; gerçek parsel değildir.';image.width=960;image.height=640;
    const fields=element('dl',undefined,'layout-preview-facts');
    for(const [name,value] of [['Konum','İl, ilçe ve mahalle bilgisi'],['Alan','Metrekare bilgisi'],['Fiyat','Güncel satış fiyatı'],['Tapu ve imar','Kaynağı ve kontrol tarihiyle birlikte'],['Fotoğraflar','Portföye ait izinli fotoğraflar']])fields.append(element('dt',name),element('dd',value));
    dialog.append(close,label,title,image,element('p','Bu pencere yalnız kart ve detay düzenini gösterir. Gerçek ilan veya doğrulanmış arazi bilgisi içermez.','muted'),fields);document.body.append(dialog);
    dialog.addEventListener('close',()=>dialog.trigger?.focus());
  }
  for(const [index,title] of ['Arsa seçenekleri','Arazi seçenekleri','Yeni fırsatlara yer açın'].entries()){
    const card=element('article',undefined,`listing layout-sample sample-${index}`);
    const art=element('div',undefined,'listing-art'),image=element('img');image.src='src/assets/landscape-hero.webp';image.alt='Temsili manzara — gerçek parsel fotoğrafı değildir.';image.loading='lazy';image.width=610;image.height=380;
    art.append(image,element('span','GÖRÜNÜM ÖRNEĞİ','image-note'));
    card.append(art,element('p',`0${index+1} / TOPRAK EHLİ`,'eyebrow'),element('h3',title),element('p','Konum bilgisi burada yer alacak','muted'));
    const facts=element('div',undefined,'sample-facts');
    facts.append(element('span','Alan · m² bilgisi'),element('span','Tapu · tür bilgisi'));
    card.append(facts,element('p','Fiyat bilgisi','sample-price'),element('p','Satış ilanı değildir. Bilgiler henüz eklenmedi.','sample-disclosure'));
    const button=element('button','Örnek kartı incele ↗','detail-button');button.type='button';button.setAttribute('aria-label',`${title} örnek kartını incele`);button.addEventListener('click',()=>{dialog.trigger=button;dialog.showModal();});card.append(button);container.append(card);
  }
}
