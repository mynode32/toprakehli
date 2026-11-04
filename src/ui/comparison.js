import { element } from './listings.js';
import { propertyFacts } from '../domain/facts.js';
import { factContent } from './facts.js';

export function renderComparison(container, properties, onRemove) {
  container.replaceChildren();
  if (!properties.length) {
    container.append(element('p', 'Karşılaştırmak için portföy kartlarından en fazla 3 kayıt seçin.', 'muted'));
    return;
  }
  container.append(element('p', 'Dar ekranda tüm portföyleri görmek için tabloyu yana kaydırın.', 'muted'));
  const scroll = element('div', undefined, 'comparison-scroll');
  scroll.tabIndex = 0;
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', 'Portföy karşılaştırma tablosu; dar ekranda yatay kaydırılabilir');
  const table = element('table', undefined, 'comparison-table');
  table.append(element('caption', properties.some(property => property.isDemo) ? 'Temsili portföyler · Bilgiler doğrulanmamıştır.' : 'Portföy karşılaştırması · Kaynak ve kontrol tarihlerini inceleyin.'));
  const head = element('thead');
  const headings = element('tr');
  const corner = element('th', 'Bilgi');
  corner.scope = 'col';
  headings.append(corner);
  for (const property of properties) {
    const th = element('th');
    th.scope = 'col';
    const remove = element('button', 'Kaldır', 'reset');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${property.local} karşılaştırmadan kaldır`);
    remove.addEventListener('click', () => onRemove(property.id));
    th.append(element('strong', property.local), element('small', property.region), remove);
    headings.append(th);
  }
  head.append(headings);
  const body = element('tbody');
  const columns = properties.map(propertyFacts);
  columns[0].forEach((fact, index) => {
    const row = element('tr');
    const heading = element('th', fact.label);
    heading.scope = 'row';
    row.append(heading);
    for (const column of columns) {
      const cell = element('td');
      cell.append(factContent(column[index]));
      row.append(cell);
    }
    body.append(row);
  });
  table.append(head, body);
  scroll.append(table);
  container.append(scroll);
}
