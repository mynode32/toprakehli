export const contact = {
  phone: '+905304627659',
  phoneLabel: '0530 462 76 59',
  email: 'toprakehli.ofis@gmail.com',
};

export function contactLinks(property) {
  const message = property
    ? `Merhaba, ${property.local} (${property.id}) ${property.isDemo ? 'temsili demo kaydı' : 'portföyü'} hakkında bilgi almak istiyorum.${property.isDemo ? ' Bunun gerçek satış ilanı olmadığını gördüm.' : ''}`
    : 'Merhaba, Toprak Ehli hakkında bilgi almak istiyorum.';
  return [
    ['Telefonla ara', `tel:${contact.phone}`],
    ['WhatsApp’ta mesaj hazırla', `https://wa.me/${contact.phone.slice(1)}?text=${encodeURIComponent(message)}`],
    ['E-posta hazırla', `mailto:${contact.email}?subject=${encodeURIComponent('Toprak Ehli bilgi talebi')}&body=${encodeURIComponent(message)}`],
  ];
}
