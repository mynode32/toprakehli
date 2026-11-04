const noindexMeta='<meta name="robots" content="noindex, nofollow">';

export function indexingEnabled(env){
  return env.VERCEL_ENV==='production'&&['online','live'].includes(env.TOPRAK_DEPLOY_MODE);
}

export function robotsContent(indexable,origin){
  return indexable
    ?`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
    :'User-agent: *\nDisallow: /\n';
}

export function indexableHomeHtml(html){
  if(!html.includes(noindexMeta))throw new Error('Ana sayfanın noindex etiketi bulunamadı.');
  return html.replace(noindexMeta,'');
}
