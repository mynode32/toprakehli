import { site } from '../data/site.js';
import { portfolioNote } from '../domain/site-copy.js';

export function initializeSite(properties) {
  const select = document.querySelector('select[name="region"]');
  for (const region of [...new Set(properties.map(property => property.region))].sort((a, b) => a.localeCompare(b, 'tr'))) {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    select.append(option);
  }
  if (site.preview) {
    const note=document.createElement('p');note.className='muted';note.textContent='Demo inceleme ortamı: iletişim bilgilerinin firma sahipliği henüz doğrulanmadı. Ticari yayından önce onay gerekir.';
    document.querySelector('#contact-actions')?.after(note);
    return;
  }
  document.querySelector('.notice').textContent = 'Portföy bilgileri doğrulama sürecindedir · Görseller temsilidir.';
  document.querySelector('.hero .button').textContent = 'Portföyleri incele ↗';
  document.querySelector('#portfolio-note').textContent = portfolioNote(properties);
  document.querySelector('footer span').textContent = 'Arsa & Arazi · Trakya';
  document.querySelector('#source-principle').textContent = 'Portföy bilgileri kaynak ve kontrol tarihiyle birlikte değerlendirilir. Eksik bilgiler açıkça belirtilir.';
  document.querySelector('#filters').hidden = false;
  for(const control of document.querySelector('#filters').elements)control.disabled=!properties.length;
  document.querySelector('.comparison').hidden = !properties.length;
  document.querySelector('#results').hidden = false;
}
