import { createPlatform } from '../../server/platform.mjs';
import {notFoundPage} from '../../scripts/detail-pages.mjs';
const handle=createPlatform();
// Node bridge keeps the API testable with standard Request/Response outside Vercel.
export default async function handler(req,res) {
  const path=new URL(req.url,'https://localhost').pathname;
  if(process.env.TOPRAK_DEPLOY_MODE!=='online' && ['GET','HEAD'].includes(req.method) && (path.startsWith('/ilan/') || path==='/api/platform/property')){
    res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex, nofollow');res.end(req.method==='HEAD'?undefined:notFoundPage());return;
  }
  const origin=`https://${req.headers.host}`;
  const headers=new Headers();
  for(const [key,value] of Object.entries(req.headers))if(value!=null)headers.set(key,Array.isArray(value)?value.join(','):value);
  const options={method:req.method,headers};
  if(!['GET','HEAD'].includes(req.method)){
    options.body=req.body == null ? req : Buffer.isBuffer(req.body)? req.body : typeof req.body==='string'? req.body : JSON.stringify(req.body);
    options.duplex='half';
  }
  const response=await handle(new Request(new URL(req.url,origin),options));
  res.statusCode=response.status;
  for(const [key,value] of response.headers)res.setHeader(key,value);
  res.end(Buffer.from(await response.arrayBuffer()));
}
export const config={api:{bodyParser:false}};
