import { describeFact } from '../domain/facts.js';

export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function renderListings(container, properties, onDetail, comparison) {
  container.replaceChildren();
  if (!properties.length) {
    const empty = element('div', undefined, 'empty');
    empty.append(element('p', 'Bu seçimlerle gösterilecek portföy bulunamadı. Filtreleri sıfırlayın veya güncel portföyler için bize ulaşın.'));
    const contact = element('a', 'Güncel portföyleri sor ↗', 'detail-button');
    contact.href = '#iletisim';
    empty.append(contact);
    container.append(empty);
    return;
  }
  for (const property of properties) {
    const article = element('article', undefined, 'listing');
    const illustration = element('div', property.isDemo ? 'TEMSİLİ KAYIT' : 'TOPRAK EHLİ', 'listing-art');
    if (property.image) {
      illustration.textContent = '';
      if (property.isDemo) illustration.classList.add('demo-art');
      const image = element('img');
      image.src = property.image;
      if(property.photos?.length)image.srcset=[480,960,1600].map(size=>`/api/platform/photo?key=${property.photos[0].key}&size=${size} ${size}w`).join(',');
      image.sizes='(max-width: 480px) 100vw, 50vw';
      image.alt = (property.isDemo || property.referenceListing) ? 'Temsili arazi görseli; bu kayıt veya konumun gerçek fotoğrafı değildir.' : property.imageAlt;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.width = 610;
      image.height = 222;
      image.addEventListener('error', () => illustration.replaceChildren(element('span', 'Görsel yüklenemedi', 'image-note')), { once: true });
      illustration.append(image);
    }
    article.append(illustration, element('p', property.region, 'eyebrow'), element('h3', property.title || property.local));
    if(property.status==='sold')article.append(element('p','Satıldı','muted'));
    const price = describeFact(property, ['price', 'Fiyat', 'TL']);
    const area = describeFact(property, ['area', 'Alan', 'm²']);
    const titleType = describeFact(property, ['type', 'Tapu türü']);
    article.append(element('p', titleType.value === 'Bilgi sağlanmadı' ? area.value : `${area.value} · ${titleType.value}`, 'muted'));
    article.append(element('p', price.value, 'price'));
    const button = element('button', property.isDemo ? 'Örnek detayı incele ↗' : 'Portföyü incele ↗', 'detail-button');
    button.type = 'button';
    button.setAttribute('aria-label', `${property.local}${property.isDemo ? ' örnek' : ''} portföy detayını incele`);
    button.dataset.id = property.id;
    button.addEventListener('click', () => onDetail(property, button));
    article.classList.add('listing-interactive');
    article.addEventListener('click',event=>{
      if(event.target.closest('a,button,input,label,select,textarea,details,summary'))return;
      if(window.getSelection()?.toString())return;
      onDetail(property,button);
    });
    article.append(button);

    const label = element('label', undefined, 'compare-choice');
    const checkbox = element('input');
    checkbox.type = 'checkbox';
    checkbox.checked = comparison.ids.includes(property.id);
    checkbox.disabled = !checkbox.checked && comparison.ids.length >= comparison.limit;
    checkbox.setAttribute('aria-label', `${property.local} karşılaştırmaya ekle`);
    checkbox.addEventListener('change', () => comparison.onToggle(property.id));
    label.append(checkbox, element('span', 'Karşılaştır'));
    article.append(label);
    container.append(article);
  }
}
