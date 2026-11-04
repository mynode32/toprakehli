# Güvenlik kontrolü

## Uygulanan ve otomatik sınanan

- Sunucu tarafında her özel API için kalıcı oturum + UUID yönetici allowlist.
- Parola işlemi Supabase Auth'a devredildi; kaynakta gerçek parola yok.
- Opaque oturum: DB'de yalnız SHA-256 hash, Secure/HttpOnly/SameSite Strict cookie, bir saat.
- Yazma işlemlerinde aynı köken ve session HMAC CSRF kontrolü.
- PostgreSQL tabanlı atomic rate limiter; giriş IP ve hesap, form ve yükleme limitleri.
- Anon/authenticated tablo ve ayrıcalıklı RPC grant'leri kapalı; RLS etkin.
- Service role yalnız Function environment; hata yanıtlarında sağlayıcı ayrıntısı/anahtar yok.
- DOM textContent, metadata HTML escaping, JSON-LD `<` escaping, CSP ve nosniff.
- Yayında olmayan ilan ve medya anonim erişime kapalı; no-store.
- Sharp decode/reencode/metadata temizleme; dosya, piksel ve fotoğraf sayısı sınırları.
- Optimistic revision + transactional snapshot/audit; restore öncesi şema ve medya referansı doğrulaması.
- İlan arşivleme, snapshot'larda kullanılan dosya silmeyi engelleme.
- Talep kişisel verilerinin özel API dışında okunmaması; onaylı aydınlatma yoksa form kapalı.

## Gerçek ortamda bekleyen

- Supabase Auth, service role/anon anahtarları, private bucket politikaları ve Storage gerçek ağ testi.
- Yönetici hesabı, güçlü parola, signup kapatma ve e-posta doğrulama/SMTP akışı.
- Gerçek PostgREST, Vercel ileri IP başlıkları ve rate limit davranışı.
- Staging/production ayrımı, anahtar rotasyonu ve operatör yetkileri.
- DB + object storage harici yedek ve ayrı ortamda felaket kurtarma.
- İşletme/hukuk onaylı KVKK metni, saklama süreleri, veri silme ve erişim prosedürü.
- Trafik yükü, bağımsız penetrasyon testi, izleme/uyarı kurulumu.

MFA, genel parola sıfırlama UI'sı, çok rollü kullanıcı yönetimi, otomatik zararlı yazılım taraması yok. Görseller yeniden kodlanır; bu tek başına tüm dosya güvenliği sorunlarını çözmez. Admin sayfasının giriş kabuğu açıktır, korunan içerik/API oturumsuz açılmaz.
