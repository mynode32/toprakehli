const $ = selector => document.querySelector(selector);
const form = $('#record-form');
const fields = [['price','Fiyat'],['area','Alan'],['type','Tapu türü'],['parcel','Ada / parsel'],['zoning','İmar'],['road','Yol erişimi'],['utilities','Altyapı']];
let records = [], revision = '', csrf = '', editing = null, busy = false;
const node = (tag, text) => { const result = document.createElement(tag); if (text != null) result.textContent = text; return result; };
function status(message, error = false) { $('#status').textContent = message; $('#status').dataset.error = String(error); }
function locked(value) { busy = value; document.querySelectorAll('button,#photo-upload').forEach(control => { control.disabled = value; }); }
async function api(path, data) {
  const response = await fetch(path, { credentials: 'same-origin', headers: data ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf } : {}, method: data ? 'POST' : 'GET', body: data ? JSON.stringify(data) : undefined });
  const result = await response.json();
  if (response.status === 401 && path !== '/api/login') showLogin();
  if (!response.ok) throw new Error(result.error || 'İşlem başarısız.');
  return result;
}
function showLogin() { document.body.classList.add('signed-out'); $('#workspace').hidden = true; $('#login').hidden = false; csrf = ''; records = []; revision = ''; $('#records').replaceChildren(); $('#editor').hidden = true; }
function button(label, action, name) { const result = node('button', label); result.type = 'button'; if (name) result.setAttribute('aria-label', name); result.addEventListener('click', action); return result; }
function ask(message) {
  return new Promise(done=>{
    const dialog=$('#confirmation');
    $('#confirmation-message').textContent=message;
    dialog.returnValue='cancel';
    dialog.addEventListener('close',()=>done(dialog.returnValue==='confirm'),{once:true});
    dialog.showModal();
  });
}
function edit(record = null) {
  editing = record?.id || null;
  form.reset();
  for (const control of form.elements) {
    if (!control.name) continue;
    if (control.name === 'publicationApproved') control.checked = Boolean(record?.publicationApproved);
    else {
      if (control.name==='type' && record && ![...control.options].some(option=>option.value===record.type)) { const option=node('option',record.type); option.value=record.type; control.append(option); }
      control.value = record?.[control.name] ?? (control.name === 'type' ? 'Bilgi sağlanmadı' : '');
    }
  }
  form.elements.id.readOnly = Boolean(editing);
  if(!editing)form.elements.id.value='ilan-'+crypto.randomUUID();
  $('#evidence').replaceChildren();
  for (const [key, label] of fields) {
    const fieldset = node('fieldset'); fieldset.append(node('legend', label));
    const grid = node('div'); grid.className = 'grid';
    for (const [part, title] of [['status','Durum'],['source','Kaynak'],['checkedAt','Kontrol tarihi']]) {
      const wrapper = node('label', title);
      const control = node(part === 'status' ? 'select' : 'input');
      control.name = `evidence-${key}-${part}`;
      if (part === 'status') for (const [value,text] of [['unverified','Doğrulanmadı'],['verified','Doğrulanmış kayıt']]) { const option = node('option',text); option.value = value; control.append(option); }
      else { control.type = part === 'checkedAt' ? 'date' : 'text'; if (part === 'source') control.maxLength = 500; }
      control.value = record?.evidence?.[key]?.[part] || (part === 'status' ? 'unverified' : '');
      wrapper.append(control); grid.append(wrapper);
    }
    fieldset.append(grid); $('#evidence').append(fieldset);
  }
  $('#editor-title').textContent = editing ? `${record.local} — Düzenle` : 'Yeni portföy';
  $('#editor').hidden = false; $('#editor').scrollIntoView({block:'start'}); form.elements.id.focus({preventScroll:true}); status('');
}
async function refresh() {
  const data = await api('/api/records'); records = data.records; revision = data.revision;
  renderRecords();
  $('#metric-total').textContent=records.length;
  $('#metric-photo').textContent=records.filter(record=>record.image).length;
  $('#metric-missing').textContent=records.filter(record=>!record.price||!record.area).length;
  const saved = await api('/api/backups');
  $('#metric-backups').textContent=saved.backups.length;
  renderBackups(saved.backups);
}
function renderRecords() {
  const query=$('#record-search').value.trim().toLocaleLowerCase('tr-TR');
  const matches=records.filter(record=>`${record.local} ${record.region} ${record.id}`.toLocaleLowerCase('tr-TR').includes(query));
  $('#records').replaceChildren();
  if (!matches.length) { const empty=node('div');empty.className='empty-state';empty.append(node('strong',records.length?'Eşleşen portföy bulunamadı.':'İlk portföyünüzü ekleyin.'),node('p',records.length?'Farklı bir konum veya kayıt numarası deneyin.':'Bilgileri ve fotoğrafı ekleyerek başlayın.'));empty.append(button('+ Portföy ekle',()=>edit()));$('#records').append(empty); }
  $('#record-count').textContent=`${matches.length} / ${records.length} portföy gösteriliyor`;
  for (const record of matches) {
    const row = node('div'); row.className = 'record-row';
    const title = node('div'); title.append(node('strong',record.local),node('span',`${record.region} · ${record.id}`));
    title.className='record-title';
    const summary=node('div');summary.className='record-summary';
    summary.append(node('strong',record.price?`${new Intl.NumberFormat('tr-TR').format(record.price)} TL`:'Fiyat bekleniyor'),node('span',`${record.area?new Intl.NumberFormat('tr-TR').format(record.area)+' m²':'Alan bekleniyor'} · ${record.type}`));
    const badge=node('small',record.image?'Fotoğraf eklendi':'Fotoğraf bekleniyor');badge.className=record.image?'badge':'badge muted-badge';summary.append(badge);
    const actions = node('div'); actions.className = 'toolbar';
    actions.append(button('Düzenle',()=>edit(record),`${record.local} düzenle`),button('Kaldır',async()=>{
      if (busy || !await ask(`${record.local} kaydı kaldırılsın mı? Önceki sürüm yedeklenecek.`)) return;
      locked(true);
      try { await api('/api/records',{ records:records.filter(item=>item.id!==record.id),revision }); await refresh(); $('#editor').hidden=true; status('Kayıt kaldırıldı; önceki sürüm yedeklendi.'); }
      catch(error) { status(error.message,true); } finally { locked(false); }
    },`${record.local} kaldır`)); row.append(title,summary,actions); $('#records').append(row);
  }
}
function renderBackups(backups) {
  $('#backups').replaceChildren();
  if (!backups.length) $('#backups').append(node('p','İlk değişiklikten sonra yedek oluşur.'));
  for (const backup of backups) {
    const row = node('div'); row.className = 'backup-row';
    row.append(node('span',new Date(Number(backup.split('-')[0])).toLocaleString('tr-TR')),button('Bu sürüme dön',async()=>{
      if (busy || !await ask('Seçilen yedek geri yüklensin mi? Mevcut kayıtlar da yedeklenecek.')) return;
      locked(true);
      try { await api('/api/restore',{ backup,revision }); await refresh(); $('#editor').hidden=true; status('Yedek geri yüklendi.'); }
      catch(error) { status(error.message,true); } finally { locked(false); }
    },`${backup} yedeğini geri yükle`)); $('#backups').append(row);
  }
}
$('#login-form').addEventListener('submit',async event=>{
  event.preventDefault(); if (busy) return; locked(true);
  try { csrf=(await api('/api/login',{password:event.target.elements.password.value})).csrf; event.target.reset(); await refresh(); $('#login').hidden=true; $('#workspace').hidden=false; document.body.classList.remove('signed-out'); status('Giriş yapıldı.'); }
  catch(error) { status(error.message,true); } finally { locked(false); }
});
$('#new').addEventListener('click',()=>edit());
$('#record-search').addEventListener('input',renderRecords);
$('#photo-upload').addEventListener('change',async event=>{
  const file=event.target.files[0];
  if(!file||busy)return;
  if(file.size>4*1024*1024){status('Fotoğraf en fazla 4 MB olabilir.',true);event.target.value='';return;}
  locked(true);status('Fotoğraf yükleniyor…');
  try{
    const response=await fetch('/api/image',{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type,'X-CSRF-Token':csrf},body:file});
    const result=await response.json();
    if(response.status===401)showLogin();
    if(!response.ok)throw new Error(result.error||'Fotoğraf yüklenemedi.');
    form.elements.image.value=result.path;
    status('Fotoğraf hazır. Açıklamasını yazıp Kaydet ile portföye bağlayın.');
  }catch(error){status(error.message,true);}finally{locked(false);event.target.value='';}
});
$('#cancel').addEventListener('click',()=>{ $('#editor').hidden=true; });
$('#logout').addEventListener('click',async()=>{ locked(true); try { await api('/api/logout',{}); showLogin(); status('Çıkış yapıldı.'); } catch(error) { status(error.message,true); } finally { locked(false); } });
form.addEventListener('submit',async event=>{
  event.preventDefault(); if(busy) return;
  const values=Object.fromEntries(new FormData(form));
  const record={id:values.id.trim(),region:values.region.trim(),local:values.local.trim(),type:values.type,price:values.price===''?null:Number(values.price),area:values.area===''?null:Number(values.area),isDemo:false,publicationApproved:form.elements.publicationApproved.checked,evidence:{}};
  for(const key of ['parcel','zoning','road','utilities']) if(values[key].trim()) record[key]=values[key].trim();
  if(values.image.trim()) { record.image=values.image.trim(); record.imageAlt=values.imageAlt.trim(); }
  for(const [key] of fields) record.evidence[key]={status:values[`evidence-${key}-status`],source:values[`evidence-${key}-source`].trim()||null,checkedAt:values[`evidence-${key}-checkedAt`]||null};
  if(!editing&&records.some(item=>item.id===record.id)) { status('Bu kayıt numarası zaten kullanılıyor.',true); return; }
  const next=editing?records.map(item=>item.id===editing?record:item):[...records,record];
  locked(true);
  try { await api('/api/records',{records:next,revision}); await refresh(); $('#editor').hidden=true; status('Kaydedildi. Önceki sürüm yedeklendi. Canlı siteye yayın yapılmadı.'); }
  catch(error) { status(error.message,true); } finally { locked(false); }
});
$('#export').addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(records,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const link=node('a'); link.href=url; link.download='toprak-ehli-portfoyler.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); });
try { const session=await api('/api/session'); if(session.authenticated) { csrf=session.csrf; await refresh(); $('#login').hidden=true; $('#workspace').hidden=false; document.body.classList.remove('signed-out'); } }
catch(error) { if(error.message!=='Oturum açın.') status(error.message,true); }
