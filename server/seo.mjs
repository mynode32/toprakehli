import {detailPage} from '../scripts/detail-pages.mjs';
export const escapeHtml=value=>String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function propertyHtml(template,record,origin,indexable=false) {
  template=detailPage(record);
  if(indexable&&!record.referenceListing&&!record.isDemo)template=template.replace('<meta name="robots" content="noindex, nofollow">','');
  const title=`${record.title || record.local} | Toprak Ehli`;
  const description=(record.description || `${record.region}, ${record.local}. Güncel portföy bilgileri ve iletişim.`).slice(0,180);
  const url=`${origin}/ilan/${encodeURIComponent(record.id)}`;
  const schema=record.referenceListing?null:{'@context':'https://schema.org','@type':'RealEstateListing',name:record.title || record.local,description,url,dateModified:record.updatedAt};
  const image=record.photos?.[0]?`${origin}/api/platform/photo?key=${record.photos[0].key}&size=960`:null;
  if(image&&schema)schema.image=image;
  return template.replace(/<title>.*?<\/title>/s,`<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escapeHtml(description)}">`)
    .replace('</head>',`<base href="/"><link rel="icon" type="image/png" href="/src/assets/favicon.png"><link rel="canonical" href="${escapeHtml(url)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${escapeHtml(url)}">${image?`<meta property="og:image" content="${escapeHtml(image)}">`:''}${schema?`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`:''}</head>`);
}
export function sitemap(records,origin) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHtml(origin)}/</loc></url>${records.map(record=>`<url><loc>${escapeHtml(origin)}/ilan/${escapeHtml(record.id)}</loc></url>`).join('')}</urlset>`;
}
