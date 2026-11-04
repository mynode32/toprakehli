import { element } from './listings.js';
export async function initializeInquiry(records) {
  const host=document.querySelector('#inquiry');
  if(!host)return;
  let config;
  try {const response=await fetch('/api/platform/config',{cache:'no-store'});if(!response.ok)return;config=await response.json();}catch{return;}
  if(!config.contactEnabled)return;
  document.querySelector('.contact-panel>.muted').textContent='WhatsApp, telefon veya e-postayla ulaşabilir; aşağıdaki formdan da bilgi talebi bırakabilirsiniz.';
  const contactNote=document.querySelector('#contact-actions>p:last-child');
  if(contactNote)contactNote.textContent='WhatsApp ve e-posta mesajları ilgili uygulamada hazırlanır. Aşağıdaki form talepleri ayrıca kaydeder.';
  host.hidden=false;
  const title=element('h3','Bilgi talebi bırakın');
  const form=element('form');form.className='inquiry-form';
  const field=(label,name,type='text',max=200)=>{const wrapper=element('label',label);const input=element('input');input.name=name;input.type=type;input.required=true;input.maxLength=max;wrapper.append(input);form.append(wrapper);return input;};
  field('Ad soyad','name','text',150).autocomplete='name';field('Telefon veya e-posta','contact');
  const label=element('label','İlgilendiğiniz portföy');const select=element('select');select.name='propertyId';const all=element('option','Genel bilgi');all.value='';select.append(all);
  for(const record of records){const option=element('option',record.title || record.local);option.value=record.id;select.append(option);}label.append(select);form.append(label);
  const messageLabel=element('label','Mesajınız');const message=element('textarea');message.name='message';message.maxLength=3000;message.required=true;message.rows=4;messageLabel.append(message);form.append(messageLabel);
  const trap=field('Bu alanı boş bırakın','website');trap.required=false;trap.autocomplete='off';trap.parentElement.hidden=true;trap.tabIndex=-1;
  const disclosure=element('details');disclosure.append(element('summary','Kişisel veriler hakkında aydınlatma'),element('p',config.privacy));
  const acknowledgment=element('label',undefined,'check');const check=element('input');check.type='checkbox';check.required=true;check.name='acknowledged';acknowledgment.append(check,element('span',`${config.controller} tarafından sunulan aydınlatma metnini okudum.`));
  const result=element('p',undefined,'muted');result.setAttribute('role','status');
  const button=element('button','Talebi gönder','button');button.type='submit';form.append(disclosure,acknowledgment,button,result);
  form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;result.textContent='Gönderiliyor…';
    try{const response=await fetch('/api/platform/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(new FormData(form)),acknowledged:check.checked})});const data=await response.json();if(!response.ok)throw new Error(data.error || 'Talep gönderilemedi.');result.textContent='Talebiniz kaydedildi. Ekibimiz inceleyecek.';form.reset();}
    catch(error){result.textContent=error.message || 'Bağlantı kurulamadı. WhatsApp veya telefonu kullanabilirsiniz.';}finally{button.disabled=false;}
  });host.replaceChildren(title,form);
}
