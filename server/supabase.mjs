import { HttpError } from './validation.mjs';

export function configuration(env = process.env) {
  env={...env,SUPABASE_URL:env.TOPRAK_SUPABASE_URL || env.SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:env.TOPRAK_SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,SUPABASE_ANON_KEY:env.TOPRAK_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY};
  const required = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','ADMIN_USER_IDS','APP_SECRET','SITE_URL'];
  if (required.some(key => !env[key])) throw new HttpError(503, 'Çevrim içi sistem henüz yapılandırılmadı. Telefon veya WhatsApp ile ulaşabilirsiniz.');
  const url = new URL(env.SUPABASE_URL);
  const origin = new URL(env.SITE_URL).origin;
  if (url.protocol !== 'https:' || new URL(origin).protocol!=='https:' || url.username || url.password || env.APP_SECRET.length < 32) throw new HttpError(503, 'Sunucu yapılandırması geçersiz.');
  return { url: url.origin, origin, service: env.SUPABASE_SERVICE_ROLE_KEY, anon: env.SUPABASE_ANON_KEY, secret: env.APP_SECRET,
    admins: env.ADMIN_USER_IDS.split(',').map(value => value.trim()).filter(Boolean), preview: env.VERCEL_ENV === 'preview',
    previewOrigin: env.VERCEL_ENV==='preview' && /^[a-z0-9-]+\.vercel\.app$/i.test(env.VERCEL_URL||'') ? `https://${env.VERCEL_URL}` : null,
    privacy: env.PRIVACY_NOTICE_TEXT || '', privacyVersion: env.PRIVACY_NOTICE_VERSION || '', controller: env.PRIVACY_CONTROLLER_NAME || '' };
}
export function createSupabase(config, fetcher = fetch) {
  async function request(path, options = {}, key = config.service) {
    let response;
    try {
      response = await fetcher(config.url + path, { ...options, signal: AbortSignal.timeout(15000),
        headers: { apikey:key, ...(!key.startsWith('sb_')?{Authorization:`Bearer ${key}`}:{ }), ...options.headers } });
    } catch { throw new HttpError(503, 'Veri servisine ulaşılamadı. Tekrar deneyin.'); }
    if (!response.ok) {
      const detail = await response.text(); // Never include provider details/secrets in logs or public errors.
      if (detail.includes('revision_conflict')) throw new HttpError(409, 'Başka bir oturum kaydı değiştirdi. Listeyi yenileyip değişikliklerinizi yeniden uygulayın.');
      if (detail.includes('media_referenced')) throw new HttpError(409, 'Fotoğraf bir ilan veya yedekte kullanılıyor; silinemez.');
      if (detail.includes('archive_required')) throw new HttpError(400, 'Kayıtlar silinmez; Arşivle işlemini kullanın.');
      if (detail.includes('media_missing')) throw new HttpError(400, 'Fotoğraf hazır değil veya bulunamadı.');
      if (path.startsWith('/auth/')) throw new HttpError(401, 'Giriş bilgileri hatalı veya hesap kullanılamıyor.');
      throw new HttpError(503, 'Veri işlemi tamamlanamadı. Yapılandırmayı kontrol edin.');
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') return null;
    return response.headers.get('content-type')?.includes('json') ? response.json() : response;
  }
  const json = data => ({ headers:{'Content-Type':'application/json',Prefer:'return=representation'}, body:JSON.stringify(data) });
  return {
    request,
    rpc: (name,data) => request(`/rest/v1/rpc/${name}`,{method:'POST',...json(data)}),
    select: (table,query='') => request(`/rest/v1/${table}?${query}`),
    insert: (table,data) => request(`/rest/v1/${table}`,{method:'POST',...json(data)}),
    patch: (table,query,data) => request(`/rest/v1/${table}?${query}`,{method:'PATCH',...json(data)}),
    remove: (table,query) => request(`/rest/v1/${table}?${query}`,{method:'DELETE',headers:{Prefer:'return=minimal'}}),
    signIn: data => request('/auth/v1/token?grant_type=password',{method:'POST',...json(data)},config.anon),
  };
}
