// Original vanilla JS implementation inspired by Kedhareswer Naidu's MIT polaroid concept.
// No React migration, third-party runtime, tracking, autoplay or paid API.
import { element } from './listings.js';
import { featuredProperties } from '../domain/featured.js';

export function initializePolaroids(host,initialRecords,onDetail) {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let current=[],cards=[],drag=null,dragged=false,frame=0;
  const stage=element('div',undefined,'polaroid-stage');
  const track=element('div',undefined,'polaroid-track');
  track.tabIndex=0;track.setAttribute('role','region');track.setAttribute('aria-label','Asılı fotoğraf galerisi. Ok tuşlarıyla veya kaydırarak gezinin.');
  const rope=document.createElementNS('http://www.w3.org/2000/svg','svg');rope.setAttribute('viewBox','0 0 1440 130');rope.setAttribute('preserveAspectRatio','none');rope.setAttribute('aria-hidden','true');rope.classList.add('polaroid-rope');
  const path=document.createElementNS(rope.namespaceURI,'path');path.setAttribute('d','M-40 20 Q720 150 1480 20');rope.append(path);
  const controls=element('div',undefined,'polaroid-controls wrap');
  const note=element('p',undefined,'polaroid-note'),navigation=element('div',undefined,'polaroid-navigation');
  const previous=element('button','←','polaroid-arrow'),next=element('button','→','polaroid-arrow'),position=element('span',undefined,'polaroid-position');
  previous.type=next.type='button';previous.setAttribute('aria-label','Önceki fotoğraflar');next.setAttribute('aria-label','Sonraki fotoğraflar');
  position.setAttribute('aria-live','polite');navigation.append(previous,position,next);controls.append(note,navigation);stage.append(rope,track);host.replaceChildren(stage,controls);
  function update(){
    frame=0;const bounds=track.getBoundingClientRect(),center=bounds.left+bounds.width/2;
    let nearest=0,distance=Infinity;
    cards.forEach((card,index)=>{const rect=card.getBoundingClientRect(),difference=Math.abs(rect.left+rect.width/2-center);if(difference<distance){distance=difference;nearest=index;}});
    position.textContent=`${String(nearest+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    previous.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;
  }
  function move(direction){track.scrollBy({left:direction*(cards[0]?.offsetWidth+36 || 300),behavior:motion.matches?'instant':'smooth'});}
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  track.addEventListener('keydown',event=>{if(event.target!==track)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();if(event.key==='Home'||event.key==='End')track.scrollTo({left:event.key==='Home'?0:track.scrollWidth,behavior:motion.matches?'instant':'smooth'});else move(event.key==='ArrowLeft'?-1:1);}});
  track.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0)return;drag={x:event.clientX,left:track.scrollLeft};dragged=false;});
  track.addEventListener('pointermove',event=>{
    if(!drag)return;const distance=event.clientX-drag.x;
    if(Math.abs(distance)>6){dragged=true;if(!track.hasPointerCapture(event.pointerId))track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');}
    if(dragged){track.scrollLeft=drag.left-distance;if(!motion.matches)track.style.setProperty('--swing',`${Math.max(-7,Math.min(7,distance*.025))}deg`);}
  });
  const settle=()=>{drag=null;track.classList.remove('is-dragging');track.style.setProperty('--swing','0deg');};
  track.addEventListener('pointerup',settle);track.addEventListener('pointercancel',settle);track.addEventListener('lostpointercapture',settle);
  track.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},true);
  window.addEventListener('resize',update,{passive:true});
  function render(records){
    current=featuredProperties(records);
    const editorial=!current.length;
    if(editorial)current=['Ufkun çizgisi','Toprağın dokusu','Yolun izinde','Günün son ışığı'].map((title,index)=>({title,image:'src/assets/landscape-hero.webp',imageAlt:'Yapay zekâyla üretilmiş temsili manzaranın farklı kadrajı; gerçek parsel değildir.',editorial:true,index}));
    note.textContent=editorial?'TEMSİLİ MANZARA SERİSİ · Kartlara dokunarak portföy alanına geçin. Gerçek parsel değildir.':current.some(record=>record.isDemo)?'TEMSİLİ PORTFÖYLER · Gerçek satış ilanı değildir.':'ÖNE ÇIKAN PORTFÖYLER · Fotoğrafa dokunarak inceleyin.';
    cards=current.map((record,index)=>{
      const card=element('figure',undefined,`polaroid-card polaroid-${index%4}`);card.style.setProperty('--tilt',`${[-7,4,-4,7][index%4]}deg`);
      const surface=element(record.editorial?'a':'button',undefined,'polaroid-paper');
      if(record.editorial){surface.href='#portfoy';surface.setAttribute('aria-label',`${record.title}: portföyleri keşfet`);}
      if(!record.editorial){surface.type='button';surface.setAttribute('aria-label',`${record.title || record.local} portföyünü incele`);surface.addEventListener('click',()=>onDetail(record,surface));}
      const image=element('img');image.src=record.image;image.alt=record.imageAlt || (record.isDemo?'Temsili portföy görseli':record.title || record.local);image.loading='lazy';image.decoding='async';image.width=400;image.height=400;image.draggable=false;
      const photo=element('div',undefined,'polaroid-photo');photo.append(image);
      surface.append(photo,element('span',record.title || record.local,'polaroid-caption'),element('small',record.editorial?'BİR MANZARA, DÖRT BAKIŞ':record.region || 'TOPRAK EHLİ','polaroid-subtitle'));
      card.append(surface);return card;
    });
    track.replaceChildren(...cards);track.scrollLeft=0;requestAnimationFrame(update);
  }
  render(initialRecords);return render;
}
