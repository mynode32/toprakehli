import { site } from '../data/site.js';
import { portfolioNote,availableDeedTypes,regionSummary } from '../domain/site-copy.js';

export function initializeSite(properties) {
  const select = document.querySelector('select[name="region"]');
  const selectedRegion=select.value;
  select.replaceChildren(new Option('Tüm bölgeler','all'));
  for (const region of [...new Set(properties.map(property => property.region))].sort((a, b) => a.localeCompare(b, 'tr'))) {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    select.append(option);
  }
  if([...select.options].some(option=>option.value===selectedRegion))select.value=selectedRegion;
  const typeSelect=document.querySelector('select[name="type"]');
  const selectedType=typeSelect.value;
  const types=availableDeedTypes(properties);
  typeSelect.replaceChildren(new Option('Tümü','all'),...types.map(type=>new Option(type,type)));
  if(types.includes(selectedType))typeSelect.value=selectedType;
  typeSelect.closest('label').hidden=!types.length;
  const regions=regionSummary(properties);
  const proof=document.querySelector('#envanter');
  proof.querySelector('.intro').textContent=properties.length
    ?`${properties.length} portföy kaydı gösteriliyor. Ada/parsel ve güncel satış koşulları portföy yöneticisinden ve resmî kaynaklardan doğrulanmalıdır.`
    :'Portföy coğrafyamız güncel ilanlar yayına alındığında burada görünecek.';
  const grid=proof.querySelector('.proof-grid');
  grid.replaceChildren(...regions.map(({district,local,count})=>{
    const item=document.createElement('div');item.className='proof-item';
    const title=document.createElement('b');title.textContent=district;
    const detail=document.createElement('span');detail.textContent=`${local?`${local} · `:''}${count} kayıt`;
    item.append(title,detail);return item;
  }));
  if (site.preview) {
    const note=document.createElement('p');note.className='muted';note.textContent='Demo inceleme ortamı: iletişim bilgilerinin firma sahipliği henüz doğrulanmadı. Ticari yayından önce onay gerekir.';
    document.querySelector('#contact-actions')?.after(note);
    return;
  }
  document.querySelector('.hero .button').textContent = 'Portföyleri incele ↗';
  document.querySelector('#portfolio-note').textContent = portfolioNote(properties);
  document.querySelector('#footer-tagline').textContent = 'Arsa & Arazi · Trakya';
  document.querySelector('#source-principle').textContent = 'Portföy bilgileri kaynak ve kontrol tarihiyle birlikte değerlendirilir. Eksik bilgiler açıkça belirtilir.';
  document.querySelector('#filters').hidden = false;
  for(const control of document.querySelector('#filters').elements)control.disabled=!properties.length;
  document.querySelector('.comparison').hidden = !properties.length;
  document.querySelector('#results').hidden = false;
}
