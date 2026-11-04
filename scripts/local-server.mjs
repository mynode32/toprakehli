import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import {properties} from '../src/data/properties.js';
import {detailPage,notFoundPage} from './detail-pages.mjs';
import {fileURLToPath} from 'node:url';
const devRoot=fileURLToPath(new URL('../',import.meta.url));

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

export function createLocalServer(directory) {
  const root = resolve(directory);
  return createServer(async (request, response) => {
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
      }
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if(/^\/ilan\/[a-z0-9-]+\/?$/.test(pathname)){
        const id=pathname.split('/')[2];let page;try{page=await readFile(resolve(root,'ilan',id,'index.html'),'utf8');}catch{if(resolve(root)===resolve(devRoot)){const record=properties.find(p=>p.id===id);if(record)page=detailPage(record);}}
        response.writeHead(page?200:404,{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}).end(request.method==='HEAD'?undefined:page||notFoundPage());return;
      }
      if (pathname !== '/' && pathname !== '/index.html' && !pathname.startsWith('/src/')) {
        response.writeHead(404).end('Not found'); return;
      }
      const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + sep) || !types[extname(file)]) { response.writeHead(404).end('Not found'); return; }
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': types[extname(file)], 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch { response.writeHead(404).end('Not found'); }
  });
}
