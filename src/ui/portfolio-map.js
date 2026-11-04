import {element} from './listings.js';
import {portfolioLocation} from '../domain/map.js';

let selectOnMap=()=>{};
export function selectPropertyMap(property){selectOnMap(property);}
export function detailMap(property){
  const location=portfolioLocation(property),section=element('section',undefined,'property-map');section.id='property-map';
  section.append(element('p','KONUM & ÇEVRE','eyebrow'),element('h3',`${property.local} · Haritada keşfet`));
  if(location.embed){const frame=element('iframe');frame.src=location.embed;frame.title=`${property.local} ${location.kind==='region'?'bölge':'ilan'} haritası`;frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';section.append(frame,element('p',location.note,'muted'));}
  else section.append(element('p','Bu ilan için kesin koordinat veya eşleşen bölge konumu sağlanmadı. Konumu ofisimizden isteyebilirsiniz.','muted'));
  const actions=element('div',undefined,'map-links');
  for(const [label,url] of [['Haritayı büyüt ↗',location.external||location.search],['Uydu görünümü ↗',location.satellite],['Resmî parsel sorgusu ↗','https://parselsorgu.tkgm.gov.tr/']]){if(!url)continue;const link=element('a',label,'detail-button');link.href=url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);}
  section.append(actions);return section;
}
export function initializePortfolioMap(records,onDetail){
  const host=document.querySelector('.te-map-form'),frame=document.querySelector('#teExplorerMap');
  const panel=element('div',undefined,'map-selection');const label=element('label','Portföy seçerek bölgeyi keşfet');label.htmlFor='map-property';const select=element('select');select.id='map-property';
  const summary=element('p',undefined,'map-selected-summary');summary.setAttribute('role','status');
  const detail=element('button','Seçili portföyü incele ↗','button');detail.type='button';detail.hidden=true;
  panel.append(label,select,summary,detail);host.prepend(panel);
  const note=document.querySelector('.te-map-form>p');const badge=document.querySelector('.te-map-watermark');
  let current=null;
  selectOnMap=property=>{
    current=property;select.value=property.id;detail.hidden=false;
    const location=portfolioLocation(property);
    summary.textContent=`${property.title||property.local} · ${property.parcel?'Ada / parsel: '+property.parcel+' · ':''}${location.kind==='provided'?'Yönetici konumu':location.kind==='region'?'Bölge görünümü — kesin parsel konumu yok':'Konum sağlanmadı'}`;
    if(location.embed){frame.hidden=false;frame.src=location.embed;frame.title=`${property.local} bölge haritası`;}
    else{frame.hidden=true;frame.removeAttribute('src');}
    badge.textContent=location.kind==='region'?`${property.local.toLocaleUpperCase('tr')} · BÖLGE GÖRÜNÜMÜ`:location.kind==='provided'?'İLAN YÖNETİCİSİNİN GİRDİĞİ KONUM':'KESİN KONUM SAĞLANMADI';
    note.textContent=location.note||'Kesin koordinat yok. Konum bilgisi için seçili portföy üzerinden iletişime geçin.';
    document.querySelector('#teLat').value=location.kind==='provided'?location.lat:'';
    document.querySelector('#teLon').value=location.kind==='provided'?location.lon:'';
    const satellite=document.querySelector('#teSatelliteLink');satellite.hidden=!location.satellite;if(location.satellite)satellite.href=location.satellite;
    document.querySelector('#teMapError').textContent='';
    frame.classList.remove('map-arrive');void frame.offsetWidth;frame.classList.add('map-arrive');
  };
  select.addEventListener('change',()=>{const record=records.find(r=>r.id===select.value);if(record)selectOnMap(record);});
  detail.addEventListener('click',()=>{if(current)onDetail(current,detail);});
  function update(next){records=next;select.replaceChildren(...records.map(p=>new Option(`${p.local} · ${p.area?.toLocaleString('tr-TR')||'—'} m² · ${p.parcel||p.id}`,p.id)));if(records.length)selectOnMap(records.find(p=>p.id===current?.id)||records[0]);else{detail.hidden=true;summary.textContent='Gösterilecek portföy bulunamadı.';}}
  update(records);return update;
}
