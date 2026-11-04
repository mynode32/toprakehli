import {formatNumber as fmt} from './properties.js';
export const normalize=value=>String(value).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/²/g,'2').trim();
export const defaults=()=>({location:'',min:0,max:0,areaMin:0,areaMax:0});
const number=value=>/^\d{1,3}(\.\d{3})+$/.test(value)?Number(value.replaceAll('.','')):Number(value.replace(',','.'));
const units={milyon:1e6,bin:1000,tl:1,lira:1};
export function parsePreferences(text,rows){
 const t=normalize(text),values={},errors=[];
 const places=[...new Set(rows.flatMap(p=>[p.local,p.region]).filter(Boolean))].sort((a,b)=>b.length-a.length);
 const place=places.find(p=>t.includes(normalize(p)));if(place)values.location=place;
 if(/tum bolge|bolge fark etmez/.test(t))values.location='';
 if(/(?:arsa|tarla|hisseli|mustakil)\s+(?:istem|olmas|haric)|hisseli|mustakil/.test(t))errors.push('Tapu ve nitelik bilgileri henüz teyitli değil. Bu konuda kesin uygunluk seçemem; bölge, bütçe veya alanla daraltabiliriz.');
 const range=t.match(/(-?\d[\d.,]*)\s*(milyon|bin|tl|lira)?\s*(?:-|ile)\s*(-?\d[\d.,]*)\s*(milyon|bin|tl|lira)\b/);
 const money=t.match(/(-?\d[\d.,]*)\s*(milyon|bin|tl|lira)\b/);
 if(range){const min=number(range[1])*units[range[2]||range[4]],max=number(range[3])*units[range[4]];if(!Number.isFinite(min)||!Number.isFinite(max)||min<=0||max<min||max>1e12)errors.push('Geçerli bir bütçe aralığı yazın: 3–5 milyon TL gibi.');else Object.assign(values,{min,max});}
 else if(money){const value=number(money[1])*units[money[2]],before=t.slice(Math.max(0,money.index-15),money.index),after=t.slice(money.index+money[0].length,money.index+money[0].length+16);if(!Number.isFinite(value)||value<=0||value>1e12)errors.push('Pozitif bir bütçe yazın: 5 milyon TL gibi.');else if(/en az|minimum/.test(before)||/^\s*(?:tl\s*)?(?:uzeri|ustu)/.test(after))Object.assign(values,{min:value,max:0});else Object.assign(values,{min:0,max:value});}
 if(/butce siniri yok|butceyi kaldir/.test(t))Object.assign(values,{min:0,max:0});
 const area=t.match(/(-?\d[\d.,]*)\s*(?:m2|metrekare)/);
 if(area){const value=number(area[1]),before=t.slice(Math.max(0,area.index-12),area.index),after=t.slice(area.index+area[0].length,area.index+area[0].length+10);if(!Number.isFinite(value)||value<=0)errors.push('Pozitif bir alan yazın: 2.000 m² gibi.');else if(!/en az/.test(before)&&(/en fazla/.test(before)||/altinda|kadar/.test(after)))Object.assign(values,{areaMin:0,areaMax:value});else Object.assign(values,{areaMin:value,areaMax:0});}
 return {values,errors};
}
export function answer(message,previous,rows){
 const t=normalize(message),context={preferences:{...defaults(),...previous?.preferences},results:[...(previous?.results||[])]};
 const hasDemo=rows.some(row=>row.isDemo);
 const reply=(text,actions=[],results=[])=>({text,actions,results,context});
 const a=(label,type,payload)=>({label,type,payload});
 const help=[a('Bütçeme göre bul','prompt','5 milyon TL’ye kadar'),a('Neyi kontrol etmeliyim?','prompt','Kontrol listesi'),a('İletişim','contact')];
 if(!t||t.length>600)return reply('1–600 karakter arasında bir soru yazabilirsiniz.',help);
 if(/gizlilik|verilerim/.test(t))return reply('Bu asistan API kullanmaz. Mesajlar yalnızca açık sayfada tutulur; Yeni sohbet veya sayfa yenileme ile silinir. Sohbet şirkete gönderilmez.');
 if(/garanti|kesin kazan|hangisini almali|yatirim tavsiye/.test(t))return reply(`Kazanç garantisi veremem veya satın alma kararı seçemem. Yalnızca mevcut kayıtlardaki fiyat ve alanı karşılaştırmaya yardımcı olurum.${hasDemo?' Demo kayıtlar gerçek satış ilanı değildir.':''}`,help);
 if(/iletisim|telefon|whatsapp|e-posta|randevu|danisman/.test(t))return reply('İletişim bölümündeki telefon/WhatsApp/e-posta bağlantılarıyla uygulamanızda arama veya mesaj taslağı açabilirsiniz. Ben mesaj gönderemem ya da randevu onaylayamam. Firma sahipliği teyidi ticari yayın öncesinde gereklidir.',[a('İletişimi aç','contact')]);
 if(/imar|tapu|kontrol list|parsel|ruhsat/.test(t))return reply(`Karardan önce il/ilçe/mahalle ve ada-parsel eşleşmesini, mülkiyet/hisseyi, güncel imarı, yol ve altyapıyı, satış yetkisini ve ödeme koşullarını ilgili kurum ve uzmanlarla doğrulatın.${hasDemo?' Sitedeki demo bilgiler resmî kayıt değildir.':' Site bilgileri resmî kayıtların yerine geçmez.'}`);
 if(/sifirla|bastan|tum ilan|tum portfoy/.test(t)){context.preferences=defaults();context.results=rows.map(p=>p.id);return reply('Arama tercihlerini sıfırladım.',[a('Tümünü göster','results',context.results)],context.results);}
 let ids=[...t.matchAll(/(?:demo-|ilan\s*|#)(\d+)\b/g)].map(m=>rows.find(p=>p.id===`demo-${m[1]}`||p.id===m[1])?.id).filter(Boolean);
 if(/ilk iki/.test(t))ids=context.results.slice(0,2);else if(/ilkini|ilk ilan/.test(t))ids=context.results.slice(0,1);
 if(/karsilastir|kiyasla/.test(t)){if(!ids.length)ids=context.results.slice(0,3);return ids.length>=2?reply('Bu kayıtları yan yana açabilirim.',[a('Karşılaştırmayı aç','compare',[...new Set(ids)].slice(0,3))]):reply('Önce bütçe veya bölgeyle en az iki kayıt bulalım.',help);}
 if(ids.length){const p=rows.find(p=>p.id===ids[0]);return reply(`${p.local} · ${p.region}\n${fmt(p.price)} TL · ${fmt(p.area)} m²\n${p.isDemo?'Temsili demo kaydı; gerçek satış ilanı değildir.':'Güncellik ve doğrulama bilgilerini detayda inceleyin.'}`,[a('Detayı aç','detail',p.id)]);}
 const parsed=parsePreferences(message,rows);if(parsed.errors.length)return reply(parsed.errors.join('\n'),help);
 if(Object.keys(parsed.values).length||/arazi|portfoy|goster|en ucuz|uygun|butce/.test(t)){
  Object.assign(context.preferences,parsed.values);const p=context.preferences;
  let matches=rows.filter(r=>(!p.location||[r.local,r.region].includes(p.location))&&(!(p.min||p.max)||(Number.isFinite(r.price)&&r.price>0&&r.price>=p.min&&(!p.max||r.price<=p.max)))&&(!(p.areaMin||p.areaMax)||(Number.isFinite(r.area)&&r.area>0&&r.area>=p.areaMin&&(!p.areaMax||r.area<=p.areaMax))));
  if(/en ucuz/.test(t))matches=[...matches].sort((a,b)=>(a.price||Infinity)-(b.price||Infinity));
  context.results=matches.map(r=>r.id);const summary=[p.location,p.min?`En az ${fmt(p.min)} TL`:'',p.max?`En fazla ${fmt(p.max)} TL`:'',p.areaMin?`En az ${fmt(p.areaMin)} m²`:'',p.areaMax?`En fazla ${fmt(p.areaMax)} m²`:''].filter(Boolean).join(' · ');
  return reply(`${matches.length} kayıt eşleşti. ${summary}\n${matches.some(r=>r.isDemo)?'Bunlar temsili demo seçenekleridir; gerçek satış önerisi değildir.':'Bu eşleştirme doğrulanmış yatırım tavsiyesi değildir.'}${matches.length?'':' Tercihleri genişletebilir veya sıfırlayabilirsiniz.'}`,[a('Sonuçları sayfada göster','results',context.results),...(matches.length>=2?[a('İlk ikisini karşılaştır','compare',context.results.slice(0,2))]:[]),a('Tercihleri sıfırla','prompt','Aramayı sıfırla')],context.results);
 }
 return reply('Merhaba! Siteye özel, kurallara dayalı yardımcınızım. Genel amaçlı yapay zekâ değilim. Bütçe, bölge ve alanla kayıt bulabilir, detay ve karşılaştırmaya yardımcı olabilirim. Örneğin “Tekirdağ’da 6 milyon TL’ye kadar”.',help);
}
