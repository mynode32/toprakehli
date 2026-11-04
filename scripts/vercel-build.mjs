import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, cp, rename, lstat, readdir } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {deploymentMode} from './deployment-mode.mjs';
import {indexingEnabled,robotsContent,indexableHomeHtml} from './search-indexing.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const {live,online,demo,catalogue}=deploymentMode(process.env.TOPRAK_DEPLOY_MODE);
const indexable=indexingEnabled(process.env);
if(process.env.TOPRAK_SUPABASE_URL)process.env.SUPABASE_URL=process.env.TOPRAK_SUPABASE_URL;
if(process.env.TOPRAK_SUPABASE_SERVICE_KEY)process.env.SUPABASE_SERVICE_ROLE_KEY=process.env.TOPRAK_SUPABASE_SERVICE_KEY;
if(process.env.TOPRAK_SUPABASE_ANON_KEY)process.env.SUPABASE_ANON_KEY=process.env.TOPRAK_SUPABASE_ANON_KEY;
if(online && ['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','ADMIN_USER_IDS','APP_SECRET','SITE_URL'].some(key=>!process.env[key]))throw new Error('Online yayın için gerekli sunucu environment değerleri eksik.');
execFileSync(process.execPath,[join(root,'scripts/build.mjs'),...(demo?['--demo']:catalogue?['--catalogue']:[])],{cwd:root,stdio:'inherit'});
const latest=JSON.parse(await readFile(join(root,demo?'releases/latest-demo.json':'releases/latest.json'),'utf8'));
const source=resolve(latest.directory);
if(!source.startsWith(resolve(root,'releases')+sep))throw new Error('Geçersiz paket kaynağı.');
const parent=resolve(root,'.deploy');
await mkdir(parent,{recursive:true});
const staging=await mkdtemp(join(parent,'staging-'));
await cp(source,staging,{recursive:true,filter:path=>!path.endsWith(`${sep}_headers`)});
await mkdir(join(staging,'admin'),{recursive:true});
await cp(join(root,'online/index.html'),join(staging,'admin/index.html'));
await cp(join(root,'online/app.js'),join(staging,'admin/app.js'));
await writeFile(join(staging,'admin/style.css'),(await readFile(join(root,'admin/style.css'),'utf8'))+'\n'+(await readFile(join(root,'online/style.css'),'utf8')));
if(online){
  await writeFile(join(staging,'src/data/site.js'),'export const site = { preview: false, online: true };\n');
  await writeFile(join(staging,'src/data/properties.js'),'export const properties = [];\n');
}
if(process.env.SITE_URL){
  const canonical=new URL(process.env.SITE_URL);
  if(canonical.protocol!=='https:')throw new Error('SITE_URL HTTPS origin olmalıdır.');
  const {escapeHtml}=await import('../server/seo.mjs');
  const htmlPath=join(staging,'index.html');
  let html=await readFile(htmlPath,'utf8');
  const websiteSchema=JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'Toprak Ehli',url:`${canonical.origin}/`});
  html=html.replace('</head>',`<link rel="canonical" href="${escapeHtml(canonical.origin)}/"><meta property="og:title" content="Toprak Ehli — Arsa ve Arazi"><meta property="og:site_name" content="Toprak Ehli"><meta property="og:description" content="Arsa ve arazi portföylerini inceleyin, Toprak Ehli ile iletişime geçin."><meta property="og:url" content="${escapeHtml(canonical.origin)}/"><meta property="og:type" content="website"><meta property="og:image" content="${escapeHtml(canonical.origin)}/src/assets/landscape-hero.webp"><script type="application/ld+json">${websiteSchema}</script></head>`);
  if(indexable)html=indexableHomeHtml(html);
  await writeFile(htmlPath,html);
  if(indexable)await writeFile(join(staging,'robots.txt'),robotsContent(true,canonical.origin));
}
if(indexable&&!process.env.SITE_URL)throw new Error('Arama motoruna açık yayın için SITE_URL gereklidir.');
const allowed=new Set(['index.html','404.html','robots.txt','src','admin','sitemap.xml','ilan']);
for(const entry of await readdir(staging))if(!allowed.has(entry))throw new Error('Dağıtım kökünde beklenmeyen dosya.');
const output=join(parent,'site');
try{
  const current=await lstat(output);
  if(current.isSymbolicLink()||!current.isDirectory())throw new Error('Dağıtım yolu normal klasör olmalıdır.');
  const archive=join(parent,`previous-${Date.now()}`);
  if(!resolve(output).startsWith(parent+sep)||!resolve(archive).startsWith(parent+sep))throw new Error('Güvensiz taşıma yolu.');
  await rename(output,archive);
}catch(error){if(error.code!=='ENOENT')throw error;}
if(!resolve(staging).startsWith(parent+sep)||!resolve(output).startsWith(parent+sep))throw new Error('Güvensiz çıktı yolu.');
await rename(staging,output);
console.log(`Vercel hazır: ${online?'merkezi API ve kaynak portföy':live?'onaylı gerçek içerik':demo?'açıkça etiketli demo':'doğrulama bekleyen kaynak portföy'} · .deploy/site`);
