import {sourceDrafts} from '/src/domain/source-import.js';

const $=selector=>document.querySelector(selector);
const node=(tag,text,className)=>{const result=document.createElement(tag);if(text!=null)result.textContent=text;if(className)result.className=className;return result;};
const themeToggle=$('#admin-theme-toggle');
function applyTheme(value){const dark=value==='dark';document.documentElement.dataset.theme=dark?'dark':'light';themeToggle.textContent=dark?'☀ Açık mod':'☾ Koyu mod';themeToggle.setAttribute('aria-label',dark?'Açık modu aç':'Karanlık modu aç');themeToggle.setAttribute('aria-pressed',String(dark));}
try{applyTheme(localStorage.getItem('te-theme'));}catch{applyTheme('light');}
themeToggle.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(theme);try{localStorage.setItem('te-theme',theme);}catch{/* Theme remains available without storage. */}});
window.addEventListener('storage',event=>{if(event.key==='te-theme')applyTheme(event.newValue);});
const form=$('#record-form'), labels={draft:'Taslak',published:'Satışta / yayında',sold:'Satıldı / yayında',archived:'Arşiv'};
const leadLabels={new:'Yeni',reviewing:'İnceleniyor',contacted:'İletişime geçildi',completed:'Tamamlandı'};
const leadDrafts=new Map();
const facts=[['price','Fiyat'],['area','Alan'],['type','Tapu türü'],['parcel','Ada / parsel'],['zoning','İmar'],['road','Yol erişimi'],['utilities','Altyapı']];
let editingRevision=0,records=[],revision=0,csrf='',editing=null,photos=[],dirty=false,busy=false,leads=[],authEpoch=0;
function status(text,error=false){$('#status').textContent=text;$('#status').dataset.error=String(error);}
function lock(value){busy=value;document.querySelectorAll('button:not(#admin-theme-toggle),#photo-upload').forEach(button=>button.disabled=value);}
function action(text,callback){const button=node('button',text);button.type='button';button.addEventListener('click',()=>{if(!busy)callback();});return button;}
function ask(text){return new Promise(done=>{const dialog=$('#confirmation');$('#confirmation-message').textContent=text;dialog.returnValue='cancel';dialog.addEventListener('close',()=>done(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});}
async function api(path,data){
  const response=await fetch(`/api/platform/${path}`,{method:data===undefined?'GET':'POST',cache:'no-store',headers:data===undefined?{}:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:data===undefined?undefined:JSON.stringify(data)});
  const result=await response.json();if(response.status===401 && path!=='login')signedOut();
  if(!response.ok)throw new Error(result.error || 'İşlem tamamlanamadı.');return result;
}
function signedOut(){authEpoch++;document.body.classList.add('signed-out');$('#workspace').hidden=true;$('#login').hidden=false;$('#editor').hidden=true;records=[];leads=[];photos=[];csrf='';dirty=false;editing=null;leadDrafts.clear();form.reset();$('#login-form').reset();for(const id of ['records','leads','backups','audit','media-list','photo-list','evidence','preview-content'])$('#'+id).replaceChildren();for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();}
function signedIn(){document.body.classList.remove('signed-out');$('#workspace').hidden=false;$('#login').hidden=true;}
async function run(callback){if(busy)return;lock(true);try{await callback();}catch(error){status(error.message || 'Ağ bağlantısı kurulamadı.',true);}finally{lock(false);}}
async function refresh(){
  const epoch=authEpoch;
  const [data,backups,inbox,audit]=await Promise.all([api('records'),api('backups'),api('admin-leads'),api('audit')]);
  if(epoch!==authEpoch)throw new Error('Oturum değişti. Yeniden giriş yapın.');
  records=data.records;revision=data.revision;leads=inbox.leads;
  const availableSourceDrafts=sourceDrafts(records).length;
  $('#import-source').hidden=!availableSourceDrafts;
  $('#import-source').textContent=`${availableSourceDrafts} kaynak portföyü taslağa al`;
  $('#source-import-note').textContent=availableSourceDrafts
    ?'Sitedeki kaynak portföyler panel kayıtlarından ayrıdır. Taslağa aldıktan sonra kaynak kartları görünmeye devam eder; her kaydı ve gerçek fotoğrafını kontrol ederek ayrıca yayımlayın.'
    :'Kaynak portföylerin tamamı panel kayıtlarında mevcut. Taslakları düzenleyip yayın onayını ayrıca verebilirsiniz.';
  $('#metric-total').textContent=records.filter(r=>r.status!=='archived').length;
  $('#metric-photo').textContent=records.filter(r=>r.photos.length && r.status!=='archived').length;
  $('#metric-missing').textContent=records.filter(r=>(!r.price || !r.area) && r.status!=='archived').length;
  $('#metric-backups').textContent=backups.backups.length;
  renderRecords();renderLeads();renderBackups(backups.backups);
  $('#audit').replaceChildren(...audit.events.map(event=>node('p',`${new Date(event.created_at).toLocaleString('tr-TR')} · ${event.action} · ${event.target || ''}`)));
}
function renderRecords(){
  const query=$('#record-search').value.toLocaleLowerCase('tr-TR').trim(),state=$('#record-state').value;
  const matches=records.filter(r=>(state==='all' || r.status===state) && `${r.title || ''} ${r.local} ${r.region} ${r.id}`.toLocaleLowerCase('tr-TR').includes(query));
  const sort=$('#record-sort').value;matches.sort((a,b)=>sort==='price'?(a.price ?? Infinity)-(b.price ?? Infinity):sort==='title'?(a.title || a.local).localeCompare(b.title || b.local,'tr'):String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  $('#records').replaceChildren();
  if(!matches.length){const empty=node('div',null,'empty-state');empty.append(node('strong','Gösterilecek portföy yok.'),node('p','Yeni portföy ekleyebilir veya filtreleri değiştirebilirsiniz.'));$('#records').append(empty);}
  $('#record-count').textContent=`${matches.length} / ${records.length} portföy`;
  for(const record of matches){
    const row=node('div',null,'record-row'),title=node('div',null,'record-title'),summary=node('div',null,'record-summary'),buttons=node('div',null,'toolbar');
    title.append(node('strong',record.title || record.local),node('span',`${record.region} · ${record.id}`));
    summary.append(node('strong',record.price?`${record.price.toLocaleString('tr-TR')} TL`:'Fiyat sağlanmadı'),node('span',`${record.area || '—'} m² · ${record.photos.length} fotoğraf`),node('small',labels[record.status],'badge'));
    buttons.append(action('Düzenle',()=>edit(record)),action('Önizle',()=>preview(record)));
    if(record.status!=='archived')buttons.append(action('Arşivle',()=>changeState(record,'archived')));
    if(['published','sold'].includes(record.status))buttons.append(action('Yayından kaldır',()=>changeState(record,'draft')));
    row.append(title,summary,buttons);$('#records').append(row);
  }
}
async function changeState(record,state){if(!await ask(`${record.title || record.local}: ${labels[state]} olarak kaydedilsin mi?`))return;await run(async()=>{await api('records',{records:records.map(r=>r.id===record.id?{...r,status:state}:r),revision});await refresh();status('Durum güncellendi.');});}
async function edit(record=null){
  if(dirty && !await ask('Kaydedilmemiş değişiklikler var. Vazgeçilsin mi?'))return;
  editing=record?.id || null;editingRevision=revision;form.reset();photos=structuredClone(record?.photos || []);
  for(const control of form.elements){if(!control.name)continue;if(control.type==='checkbox')control.checked=Boolean(record?.[control.name]);else control.value=record?.[control.name] ?? ({id:crypto.randomUUID(),status:'draft',category:'land',type:'Müstakil'}[control.name] || '');}
  form.elements.id.readOnly=Boolean(editing);
  $('#evidence').replaceChildren();
  for(const [key,label] of facts){const field=node('fieldset'),grid=node('div',null,'grid');field.append(node('legend',label));
    for(const [part,title] of [['status','Durum'],['source','Kaynak'],['checkedAt','Kontrol tarihi']]){const wrapper=node('label',title),control=node(part==='status'?'select':'input');control.name=`evidence-${key}-${part}`;if(part==='status'){for(const [value,label] of [['unverified','Doğrulanmadı'],['verified','Doğrulanmış kayıt']]){const option=node('option',label);option.value=value;control.append(option);}}else{control.type=part==='checkedAt'?'date':'text';control.maxLength=500;}control.value=record?.evidence?.[key]?.[part] || (part==='status'?'unverified':'');wrapper.append(control);grid.append(wrapper);}field.append(grid);$('#evidence').append(field);}
  renderPhotos();dirty=false;$('#editor-title').textContent=editing?'Portföyü düzenle':'Yeni portföy';$('#editor').hidden=false;$('#editor').scrollIntoView();form.elements.title.focus({preventScroll:true});status('');
}
function collect(){
  const values=Object.fromEntries(new FormData(form)),record={id:values.id.trim(),region:values.region.trim(),local:values.local.trim(),type:values.type,price:values.price===''?null:Number(values.price),area:values.area===''?null:Number(values.area),isDemo:false,publicationApproved:form.elements.publicationApproved.checked,currency:'TRY',category:values.category,status:values.status,photos:structuredClone(photos),featured:form.elements.featured.checked,featuredOrder:values.featuredOrder===''?50:Number(values.featuredOrder),evidence:{}};
  for(const key of ['latitude','longitude'])if(values[key]?.trim())record[key]=Number(values[key]);
  for(const key of ['title','description','city','district','neighborhood','parcel','zoning','road','utilities'])if(values[key]?.trim())record[key]=values[key].trim();
  for(const [key] of facts)record.evidence[key]={status:values[`evidence-${key}-status`],source:values[`evidence-${key}-source`]?.trim() || null,checkedAt:values[`evidence-${key}-checkedAt`] || null};
  return record;
}
function renderPhotos(){
  $('#photo-list').replaceChildren();
  photos.forEach((photo,index)=>{const card=node('article',null,'photo-card'),img=node('img');img.src=`/api/platform/photo?key=${photo.key}&size=480`;img.alt=photo.alt;img.width=240;img.height=160;
    const label=node('label',index===0?'Kapak fotoğrafı açıklaması':'Fotoğraf açıklaması'),input=node('input');input.value=photo.alt;input.maxLength=300;input.required=true;input.addEventListener('input',()=>{photo.alt=input.value;dirty=true;});label.append(input);
    const buttons=node('div',null,'toolbar');
    if(index>0)buttons.append(action('Kapak yap',()=>{photos.unshift(...photos.splice(index,1));dirty=true;renderPhotos();}),action('← Önce',()=>{[photos[index-1],photos[index]]=[photos[index],photos[index-1]];dirty=true;renderPhotos();}));
    if(index<photos.length-1)buttons.append(action('Sonra →',()=>{[photos[index+1],photos[index]]=[photos[index],photos[index+1]];dirty=true;renderPhotos();}));
    buttons.append(action('Listeden çıkar',()=>{photos.splice(index,1);dirty=true;renderPhotos();}));card.append(img,label,buttons);$('#photo-list').append(card);
  });
}
function upload(file){return new Promise((resolve,reject)=>{const xhr=new XMLHttpRequest();xhr.open('POST','/api/platform/image');xhr.setRequestHeader('Content-Type',file.type);xhr.setRequestHeader('X-CSRF-Token',csrf);xhr.upload.onprogress=event=>{if(event.lengthComputable)$('#upload-progress').value=event.loaded/event.total*100;};xhr.onload=()=>{try{const result=JSON.parse(xhr.responseText);if(xhr.status===401)signedOut();if(xhr.status>=400)throw new Error(result.error);resolve(result);}catch(error){reject(error);}};xhr.onerror=()=>reject(new Error('Fotoğraf yüklenemedi.'));xhr.timeout=60000;xhr.ontimeout=()=>reject(new Error('Yükleme zaman aşımına uğradı.'));xhr.send(file);});}
$('#photo-upload').addEventListener('change',event=>{const files=[...event.target.files];run(async()=>{if(files.length+photos.length>12)throw new Error('En fazla 12 fotoğraf eklenebilir.');$('#upload-progress').hidden=false;
  try{for(const file of files){if(file.size>3*1024*1024)throw new Error('Her fotoğraf en fazla 3 MB olabilir.');status(`${file.name} yükleniyor…`);const data=await upload(file);photos.push({key:data.key,alt:file.name.replace(/\.[^.]+$/,'')});dirty=true;renderPhotos();}status('Fotoğraflar hazır. Kaydet ile portföye bağlayın.');}finally{$('#upload-progress').hidden=true;event.target.value='';}
});});
function preview(record){const content=$('#preview-content');content.replaceChildren(node('p',`${labels[record.status]} · Yönetici önizlemesi`,'eyebrow'),node('h2',record.title || record.local),node('p',`${record.region} · ${record.local}`),node('p',record.description || ''),node('p',`${record.price || '—'} TL · ${record.area || '—'} m²`));for(const photo of record.photos){const img=node('img');img.src=`/api/platform/photo?key=${photo.key}&size=960`;img.alt=photo.alt;content.append(img);}$('#record-preview').showModal();}
function renderBackups(backups){$('#backups').replaceChildren();if(!backups.length)$('#backups').append(node('p','Henüz yedek yok.'));for(const backup of backups){const row=node('div',null,'backup-row');row.append(node('span',`${new Date(backup.created_at).toLocaleString('tr-TR')} · Sürüm ${backup.revision}`),action('Geri yükle',async()=>{if(!await ask('Bu portföy sürümü geri yüklensin mi? Mevcut sürüm yedeklenir. Daha sonra oluşturulan kayıtlar arşivlenir.'))return;await run(async()=>{await api('restore',{backup:backup.id,revision});dirty=false;$('#editor').hidden=true;await refresh();status('Yedek geri yüklendi.');});}));$('#backups').append(row);}}
function renderLeads(){
  const query=$('#lead-search').value.toLocaleLowerCase('tr-TR'),state=$('#lead-state').value;$('#leads').replaceChildren();
  for(const lead of leads.filter(lead=>(state==='all' || lead.status===state) && `${lead.name} ${lead.contact} ${lead.message}`.toLocaleLowerCase('tr-TR').includes(query))){
    const card=node('article',null,'lead-card');card.append(node('strong',lead.name),node('p',`${lead.contact} · ${new Date(lead.created_at).toLocaleString('tr-TR')} · ${lead.property_id || 'Genel talep'}`),node('p',lead.message));
    const label=node('label','Durum'),select=node('select');for(const [value,text] of Object.entries(leadLabels)){const option=node('option',text);option.value=value;select.append(option);}select.value=leadDrafts.get(lead.id)?.status || lead.status;label.append(select);
    const notes=node('label','Yönetici notu'),input=node('textarea');input.value=leadDrafts.get(lead.id)?.note ?? lead.note;input.maxLength=5000;input.rows=3;notes.append(input);const remember=()=>leadDrafts.set(lead.id,{revision:leadDrafts.get(lead.id)?.revision ?? lead.revision,status:select.value,note:input.value});input.addEventListener('input',remember);select.addEventListener('change',remember);
    card.append(label,notes,action('Talebi güncelle',()=>run(async()=>{await api('admin-leads',{id:lead.id,revision:leadDrafts.get(lead.id)?.revision ?? lead.revision,status:select.value,note:input.value});leadDrafts.delete(lead.id);await refresh();status('Talep güncellendi.');})));$('#leads').append(card);
  }if(!$('#leads').children.length)$('#leads').append(node('p','Gösterilecek talep yok.'));
}
form.addEventListener('input',()=>dirty=true);form.addEventListener('change',()=>dirty=true);
window.addEventListener('beforeunload',event=>{if(dirty || leadDrafts.size){event.preventDefault();event.returnValue='';}});
form.addEventListener('submit',async event=>{event.preventDefault();const record=collect();if(['published','sold'].includes(record.status) && !await ask(`Bu kayıt halka açık sitede gösterilecek.${record.photos.length?'':' Henüz gerçek fotoğraf eklenmedi; kart görselsiz görünebilir.'} Kaydedilsin mi?`))return;await run(async()=>{const next=editing?records.map(r=>r.id===editing?record:r):[...records,record];await api('records',{records:next,revision:editingRevision});dirty=false;$('#editor').hidden=true;await refresh();status('Kaydedildi. Yayındaki kayıtlar canlı sitede sayfa yenilendiğinde görünür. Açık sayfalar 30 saniyede güncellenir.');});});
$('#preview-record').addEventListener('click',()=>preview(collect()));$('#close-preview').addEventListener('click',()=>$('#record-preview').close());
$('#new').addEventListener('click',()=>edit());$('#cancel').addEventListener('click',async()=>{if(!dirty || await ask('Kaydedilmemiş değişikliklerden vazgeçilsin mi?')){dirty=false;$('#editor').hidden=true;}});
$('#import-source').addEventListener('click',async()=>{
  const drafts=sourceDrafts(records);
  if(!drafts.length){status('Aktarılacak yeni kaynak portföy yok.');return;}
  if(dirty || leadDrafts.size){status('Önce açık portföy veya talep değişikliklerini kaydedin ya da iptal edin.',true);return;}
  if(!await ask(`${drafts.length} kaynak portföy taslak olarak panele alınacak. Mevcut kayıtlar korunur; fotoğraf ve yayın onayı eklenmez. Devam edilsin mi?`))return;
  await run(async()=>{await api('records',{records:[...records,...drafts],revision});$('#editor').hidden=true;editing=null;await refresh();status(`${drafts.length} kaynak portföy taslağa alındı. Her kaydı kontrol edip gerçek fotoğrafları ekleyin; yayın onayını ayrıca verin.`);});
});
for(const id of ['record-search','record-state','record-sort'])$('#'+id).addEventListener('input',renderRecords);
for(const id of ['lead-search','lead-state'])$('#'+id).addEventListener('input',renderLeads);
$('#reload').addEventListener('click',async()=>{if(dirty && !await ask('Liste yenilenecek; açık formunuz korunacak ancak kaydetmeden önce değişiklikleri karşılaştırmanız gerekebilir. Devam edilsin mi?'))return;run(refresh);});
$('#login-form').addEventListener('submit',event=>{event.preventDefault();run(async()=>{csrf=(await api('login',Object.fromEntries(new FormData(event.target)))).csrf;event.target.reset();await refresh();signedIn();status('Giriş yapıldı.');});});
$('#logout').addEventListener('click',async()=>{if((dirty || leadDrafts.size) && !await ask('Kaydedilmemiş değişiklikler var. Çıkılsın mı?'))return;run(async()=>{await api('logout',{});signedOut();status('Çıkış yapıldı.');});});
$('#export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,revision,records},null,2)],{type:'application/json'})),link=node('a');link.href=url;link.download='toprak-ehli-portfoyler.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('#load-media').addEventListener('click',()=>run(async()=>{const data=await api('media');$('#media-list').replaceChildren();for(const media of data.media){const row=node('div',null,'backup-row');row.append(node('span',`${media.id} · ${media.state} · ${new Date(media.created_at).toLocaleDateString('tr-TR')}`),action('Kullanılmıyorsa temizle',async()=>{if(!await ask('Bu fotoğraf kalıcı depolamadan kaldırılacak. İlan veya yedekte kullanılıyorsa işlem engellenir. Devam edilsin mi?'))return;run(async()=>{await api('media-delete',{key:media.id});row.remove();status('Kullanılmayan fotoğraf temizlendi.');});}));$('#media-list').append(row);}}));
run(async()=>{try{const session=await api('session');csrf=session.csrf;await refresh();signedIn();}catch(error){signedOut();if(!/Oturum/.test(error.message))status(error.message,true);}});
// Recheck server authorization without extending the one-hour session.
let checkingSession=false;
async function checkSession(){if(!csrf||checkingSession||document.hidden)return;checkingSession=true;try{await api('session');}catch{/* API clears private UI on 401; transient network failures do not log out. */}finally{checkingSession=false;}}
setInterval(checkSession,60000);
document.addEventListener('visibilitychange',checkSession);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
window.addEventListener('pagehide',()=>signedOut());
