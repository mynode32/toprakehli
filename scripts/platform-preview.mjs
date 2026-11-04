// Explicitly isolated QA: real PostgreSQL WASM, simulated Supabase Auth/Storage transports.
// Never connects to production, never accepts real credentials, no real customer data.
import { createServer } from 'node:http';
import { mkdir,mkdtemp,cp,writeFile,readFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { createSqlFixture } from '../tests/support/platform-fixture.mjs';
import { createPlatform } from '../server/platform.mjs';
import { createLocalServer } from './local-server.mjs';
const actor='16e12d07-b478-4d6e-8255-44450adf745c',port=4183,origin=`http://127.0.0.1:${port}`;
const {sql,db}=await createSqlFixture(actor);
await mkdir('.test-environments',{recursive:true});
const root=resolve(await mkdtemp('.test-environments/platform-'));
await cp('src',join(root,'src'),{recursive:true});
await writeFile(join(root,'src/data/site.js'),'export const site={preview:false,online:true};');
await writeFile(join(root,'src/data/properties.js'),'export const properties=[];');
const html=(await readFile('index.html','utf8')).replace('<body>','<body><p class="notice">YALITILMIŞ TEST ORTAMI — gerçek müşteri verisi girmeyin.</p>');
await writeFile(join(root,'index.html'),html);
const handle=createPlatform({env:{SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'fixture-anon',SUPABASE_SERVICE_ROLE_KEY:'fixture-service',ADMIN_USER_IDS:actor,APP_SECRET:'test-only-more-than-32-characters-long',SITE_URL:origin,PRIVACY_NOTICE_TEXT:'YALNIZ TEST — hukuki aydınlatma metni değildir.',PRIVACY_NOTICE_VERSION:'fixture-v1',PRIVACY_CONTROLLER_NAME:'Test ortamı'},db});
const staticServer=createLocalServer(root);
const server=createServer(async(req,res)=>{
  try{
    if(req.url.startsWith('/api/platform/')){
      const options={method:req.method,headers:req.headers};if(req.method!=='GET'){options.body=req;options.duplex='half';}
      const response=await handle(new Request(new URL(req.url,origin),options));res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(req.url.startsWith('/admin/')){
      const assets={'/admin/':['online/index.html','text/html'],'/admin/app.js':['online/app.js','text/javascript'],'/admin/style.css':['admin/style.css','text/css']};
      const asset=assets[req.url];if(asset){let bytes=await readFile(asset[0]);if(req.url.endsWith('style.css'))bytes=Buffer.concat([bytes,await readFile('online/style.css')]);res.writeHead(200,{'Content-Type':asset[1]+'; charset=utf-8'});res.end(bytes);return;}
    }
    staticServer.emit('request',req,res);
  }catch{res.writeHead(500);res.end('QA server error');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Isolated platform QA: ${origin}/admin/ (test account only)`));
process.on('SIGINT',()=>server.close(async()=>{await sql.close();process.exit();}));
