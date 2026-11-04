import { contact, contactLinks } from '../data/contact.js';
import { element } from './listings.js';
import { site } from '../data/site.js';

export function renderContact(container, property) {
  container.replaceChildren();
  if (!property) container.append(element('p', `${contact.phoneLabel} · ${contact.email}`, 'muted'));
  const links = element('div', undefined, 'contact-links');
  for (const [label, href] of contactLinks(property)) {
    const link = element('a', label, 'button');
    link.href = href;
    if (href.startsWith('https:')) {
      const icon = element('img');
      icon.src = 'src/assets/whatsapp.svg';
      icon.alt = '';
      icon.width = 22;
      icon.height = 22;
      link.prepend(icon);
      link.classList.add('whatsapp-link');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${label} (yeni sekme)`);
    }
    links.append(link);
  }
  if(!property){const instagram=element('a','Instagram · @toprakehli ↗','button');instagram.href='https://www.instagram.com/toprakehli/';instagram.target='_blank';instagram.rel='noopener noreferrer';instagram.setAttribute('aria-label','Instagram @toprakehli (yeni sekme)');links.append(instagram);}
  container.append(links, element('p', site.online ? 'WhatsApp ve e-posta mesajları ilgili uygulamada hazırlanır; göndermeden önce inceleyebilirsiniz.' : 'Mesaj uygulamanızda hazırlanır; göndermeden önce inceleyebilirsiniz. Bu sitede talep kaydı oluşturulmaz.', 'muted'));
}

export function renderWhatsAppShortcut() {
  const [, href] = contactLinks()[1];
  const link = element('a', undefined, 'whatsapp-float');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'WhatsApp üzerinden iletişime geç (yeni sekme)');
  const icon = element('img');
  icon.src = 'src/assets/whatsapp.svg';
  icon.alt = '';
  icon.width = 30;
  icon.height = 30;
  link.append(icon, element('span', 'WhatsApp'));
  document.body.append(link);
}
