import {readFile,writeFile} from 'node:fs/promises';
async function replace(file,old,value){let text=await readFile(file,'utf8');if(!text.includes(old))throw Error(file);await writeFile(file,text.replace(old,value));}
await replace('scripts/build.mjs',"import { properties as demoProperties } from '../src/data/properties.js';","import { properties as demoProperties } from '../src/data/properties.js';\nimport {detailPage} from './detail-pages.mjs';");
await replace('scripts/build.mjs',"await writeFile(join(output, 'index.html'), html);","await writeFile(join(output, 'index.html'), html);\nfor(const record of records){const folder=join(output,'ilan',record.id);await mkdir(folder,{recursive:true});await writeFile(join(folder,'index.html'),detailPage(record));}");
await replace('src/ui/detail.js',"if(property.photos)shareUrl.pathname=", "if(property.id)shareUrl.pathname=");
await replace('src/ui/listings.js',"article.append(button);","article.append(button);\n    const page=element('a','Ayrı detay sayfasını aç ↗','detail-button');page.href='/ilan/'+encodeURIComponent(property.id);article.append(page);");
await replace('scripts/local-server.mjs',"import { resolve, extname, sep } from 'node:path';","import { resolve, extname, sep } from 'node:path';\nimport {properties} from '../src/data/properties.js';\nimport {detailPage,notFoundPage} from './detail-pages.mjs';\nimport {fileURLToPath} from 'node:url';\nconst devRoot=fileURLToPath(new URL('../',import.meta.url));");
await replace('scripts/local-server.mjs',"if (pathname !== '/'",`if(/^\/ilan\/[a-z0-9-]+\/?$/.test(pathname)){
        const id=pathname.split('/')[2];let page;try{page=await readFile(resolve(root,'ilan',id,'index.html'),'utf8');}catch{if(resolve(root)===resolve(devRoot)){const record=properties.find(p=>p.id===id);if(record)page=detailPage(record);}}
        response.writeHead(page?200:404,{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}).end(request.method==='HEAD'?undefined:page||notFoundPage());return;
      }
      if (pathname !== '/'`);
await replace('scripts/vercel-build.mjs',"'sitemap.xml']);","'sitemap.xml','ilan']);");
const config=JSON.parse(await readFile('vercel.json','utf8'));config.rewrites.unshift({source:'/ilan/demo-:id',destination:'/ilan/demo-:id/index.html'});await writeFile('vercel.json',JSON.stringify(config,null,2)+'\n');
await replace('.vercelignore','!/scripts/content.mjs','!/scripts/content.mjs\n!/scripts/detail-pages.mjs');
