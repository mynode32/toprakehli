import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { HttpError } from './validation.mjs';
export const digest = value => createHash('sha256').update(value).digest('hex');
export const csrfFor = (token,secret) => createHmac('sha256',secret).update(`csrf:${token}`).digest('hex');
export function originGuard(request,config) {
  const expected = new URL(request.url).origin;
  const allowed = expected === config.origin || (config.preview && expected === config.previewOrigin);
  if (!allowed || request.headers.get('origin') !== expected || request.headers.get('sec-fetch-site') === 'cross-site') throw new HttpError(403,'İstek kaynağı reddedildi.');
}
export function sessionToken(request) {
  return /(?:^|;\s*)__Host-te_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie') || '')?.[1];
}
export function cookie(token,seconds=3600) {
  return `__Host-te_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${seconds}`;
}
export async function authenticate(request,db,config,write=false) {
  const token = sessionToken(request);
  if (!token) throw new HttpError(401,'Oturum açın.');
  const sessions = await db.select('te_sessions',`token_hash=eq.${digest(token)}&select=user_id,expires_at`);
  const session=sessions[0];
  if (!session || !Number.isFinite(Date.parse(session.expires_at)) || Date.parse(session.expires_at)<=Date.now() || !config.admins.includes(session.user_id)) throw new HttpError(401,'Oturum sona erdi. Yeniden giriş yapın.');
  if(write) {
    originGuard(request,config);
    const actual=request.headers.get('x-csrf-token') || '';
    const expected=csrfFor(token,config.secret);
    if(!/^[a-f0-9]{64}$/.test(actual) || !timingSafeEqual(Buffer.from(actual),Buffer.from(expected))) throw new HttpError(403,'Güvenlik kontrolü başarısız. Sayfayı yenileyin.');
  }
  return {user:session.user_id,token,csrf:csrfFor(token,config.secret)};
}
export async function rateLimit(request,db,config,kind,max,seconds,extra='') {
  // On Vercel this header is platform-provided. Local/test runners explicitly supply it.
  const address = kind==='login-account' ? '' : request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const key=createHmac('sha256',config.secret).update(`${kind}:${address}:${extra}`).digest('hex');
  if(!await db.rpc('te_rate',{p_key:key,p_max:max,p_seconds:seconds})) throw new HttpError(429,'Çok fazla deneme. Bir süre sonra tekrar deneyin.');
}
export const newToken = () => randomBytes(32).toString('hex');
