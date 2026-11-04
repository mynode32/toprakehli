import { element } from './listings.js';

export function factContent(fact, { showStatus = true } = {}) {
  const content = element('div', undefined, 'fact-content');
  content.append(element('span', fact.value, 'fact-value'));
  if (showStatus) content.append(element('small', fact.status, 'fact-status'));
  if(fact.source && fact.source!=='Sağlanmadı'){
    const details=element('details',undefined,'fact-evidence');details.append(element('summary','Kaynak bilgisi'));
    details.append(element('small',`Kaynak: ${fact.source}`));
    if(fact.date && fact.date!=='Sağlanmadı')details.append(element('small',`Kontrol: ${fact.date}`));
    content.append(details);
  }
  return content;
}
