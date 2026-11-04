export function initializeExperience(){
  const menu=document.querySelector('#mobile-nav-toggle'),nav=document.querySelector('#main-nav');
  const closeMenu=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('nav-open');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('nav-open',open);});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  document.documentElement.dataset.theme='light';
  const map=document.querySelector('#teExplorerMap');
  function showMap(){
    const a=document.querySelector('#teLat').value.trim().replace(',','.');const b=document.querySelector('#teLon').value.trim().replace(',','.');
    const lat=Number(a),lon=Number(b);const error=document.querySelector('#teMapError');
    if(!a||!b||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){error.textContent='Geçerli enlem (−90 / 90) ve boylam (−180 / 180) girin.';return;}
    error.textContent='';const d=.022;const bounds=[lon-d,lat-d,lon+d,lat+d].join(',');
    map.src=`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik&marker=${lat},${lon}`;
    const satellite=document.querySelector('#teSatelliteLink');satellite.hidden=false;satellite.href=`https://www.google.com/maps/@${lat},${lon},17z/data=!3m1!1e3`;
    map.hidden=false;
    document.querySelector('.te-map-watermark').textContent='GİRDİĞİNİZ KOORDİNAT · PARSEL DOĞRULAMASI DEĞİLDİR';
    document.querySelector('.te-map-form>p').textContent='Bu konum elle girdiğiniz koordinattır; seçili portföyün doğrulanmış konumu olarak kaydedilmez.';
    const selection=document.querySelector('#map-property');if(selection)selection.selectedIndex=-1;
    const summary=document.querySelector('.map-selected-summary');if(summary)summary.textContent='Serbest koordinat keşfi · Bir ilan seçerek o bölgeye dönebilirsiniz.';
    const detail=document.querySelector('.map-selection button');if(detail)detail.hidden=true;
  }
  document.querySelector('.te-map-actions button').addEventListener('click',showMap);
  for(const id of ['teLat','teLon'])document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();showMap();}});
  for(const button of document.querySelectorAll('#platform button'))button.addEventListener('click',()=>document.querySelector('.site-chat-launcher')?.click());
  for(const button of document.querySelectorAll('#rehber button')){const article=button.closest('article');const note=document.createElement('p');note.hidden=true;note.textContent=['Ada/parsel ve tapu niteliğini güncel resmî kayıtlarla karşılaştırın. Hisse, şerh ve takyidat bilgilerini yetkili uzmanlarla inceleyin.','Güncel imar planı ve plan notlarını ilgili belediye veya yetkili idareden edinin. İlan açıklaması tek başına yapılaşma hakkını doğrulamaz.','Konumu, ulaşımı, yola erişimi ve kullanım niteliğini birlikte araştırın. Şematik harita parsel sınırı göstermez.'][[...article.parentNode.children].indexOf(article)];article.append(note);button.setAttribute('aria-expanded','false');button.addEventListener('click',()=>{note.hidden=!note.hidden;button.setAttribute('aria-expanded',String(!note.hidden));});}
  document.querySelector('#bolgeler .btn')?.addEventListener('click',()=>document.querySelector('#rehber').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
}
