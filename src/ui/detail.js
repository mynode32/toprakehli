import {detailMap,selectPropertyMap} from './portfolio-map.js';
import { element } from './listings.js';
import { propertyFacts } from '../domain/facts.js';
import { factContent } from './facts.js';
import { renderContact } from './contact.js';

export function createDetail(dialog) {
  let trigger;
  dialog.querySelector('#copy-property-link').addEventListener('click', async () => {
    const input = dialog.querySelector('#property-link');
    const status = dialog.querySelector('#share-status');
    try {
      await navigator.clipboard.writeText(input.value);
      status.textContent = 'Bağlantı kopyalandı.';
    } catch {
      input.focus();
      input.select();
      status.textContent = 'Bağlantı seçildi. Kopyalamak için Ctrl+C veya telefonunuzun Kopyala seçeneğini kullanın.';
    }
  });
  dialog.querySelector('#close-detail').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus());
  return (property, button) => {
    trigger = button;
    dialog.querySelector('#detail-title').textContent = property.title || property.local;
    dialog.querySelector('.online-gallery')?.remove();
    dialog.querySelector('.detail-visuals')?.remove();
    const visuals=element('div',undefined,'detail-visuals');
    const map=detailMap(property);
    visuals.append(map);
    dialog.querySelector('#detail-location').after(visuals);
    selectPropertyMap(property);
    if(property.referenceListing){const image=element('img',undefined,'detail-cover');image.src=property.image;image.alt=property.imageAlt;visuals.prepend(image);}
    if(property.photos?.length || property.description){
      const gallery=element('div',undefined,'online-gallery');
      if(property.description)gallery.append(element('p',property.description));
      for(const photo of property.photos || []){const image=element('img');image.src=`/api/platform/photo?key=${photo.key}&size=960`;image.alt=photo.alt;image.loading='lazy';image.width=960;image.height=640;gallery.append(image);}
      dialog.querySelector('#detail-location').after(gallery);
    }
    dialog.querySelector('#detail-location').textContent = property.region;
    dialog.querySelector('.dialog-head .eyebrow').textContent = property.isDemo ? 'TEMSİLİ PORTFÖY' : 'PORTFÖY BİLGİSİ';
    dialog.querySelector('.disclaimer').textContent = property.referenceListing ? 'Kaynak listeden aktarılmış ilan bilgileri. Fiyat, satış koşulları ve ada/parsel bilgileri güncel resmî kayıtlarla doğrulanmamıştır. Görseller temsili olup gerçek parsele ait değildir.' : property.isDemo
      ? 'Bu kayıt gerçek satış ilanı değildir. Tapu, imar, yol ve altyapı bilgileri doğrulanmamıştır.'
      : 'Kaynak ve kontrol tarihlerini inceleyin. Sağlanmamış bilgiler doğrulanmış kabul edilmez. Güncel tapu ve imar bilgilerini ilgili kurumlarla kontrol edin.';
    const shareUrl = new URL(location.href);
    shareUrl.search = '';
    if(property.id && !property.referenceListing)shareUrl.pathname=`/ilan/${encodeURIComponent(property.id)}`;
    else {shareUrl.pathname='/';shareUrl.searchParams.set('property', property.id);}
    shareUrl.hash = 'portfoy';
    dialog.querySelector('#property-link').value = shareUrl.href;
    dialog.querySelector('#share-status').textContent = '';
    const facts = dialog.querySelector('#detail-facts');
    facts.replaceChildren(...propertyFacts(property).map(fact => {
      const value = element('dd');
      value.append(factContent(fact));
      const card=element('div',undefined,'detail-fact-card');card.append(element('dt',fact.label),value);return card;
    }));
    renderContact(dialog.querySelector('#detail-contact'), property);
    if(!dialog.open)dialog.showModal();
    dialog.scrollTop=0;
  };
}
