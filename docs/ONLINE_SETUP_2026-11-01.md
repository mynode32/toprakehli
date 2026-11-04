# Online kurulum — 1 Kasım 2026

Güncel: Yönetici hesabı oluşturuldu, gerçek kabul testleri geçti ve onaylı production yayını tamamlandı. Kullanıcı canlı panelde kendi parolasıyla giriş yaptı. Aşağıdaki kurulum günlüğündeki bekleyen maddelerin güncel karşılığı HANDOVER.md içindedir.

Kullanıcı yalnız ücretsiz plan istedi. İki aktif ücretsiz proje sınırı nedeniyle yeni proje oluşturulmadı. Kullanıcının son talimatıyla daha önce açılmış `amlhvnzojwckvummqviz` projesi seçildi. Vercel'in eski entegrasyonundaki farklı Supabase projesine dokunulmadı.

- Kurulum öncesi public şemasında tablo olmadığı SQL Editor ile doğrulandı.
- 001_platform.sql gerçek Supabase üzerinde başarıyla uygulandı; veri silinmedi.
- te_state, te_media ve te_leads sunucu erişimi doğrulandı.
- te-photos private bucket, 4 MB depolama sınırı ve anonim tablo erişiminin 401 ile reddedildiği doğrulandı.
- Modern secret anahtarları yanlış Bearer JWT olarak göndermeyen adaptör düzeltildi ve regresyon testi eklendi.
- Preview için TOPRAK_SUPABASE_* ayarları mevcut entegrasyon değişkenlerinden ayrı oluşturuldu. APP_SECRET, SITE_URL ve online modu eklendi. Gizli değerler rapora/Git'e yazılmadı.
- Otomatik test: 48 geçti; lint geçti.

Bekleyen: Kullanıcının kendi parolasıyla yönetici Auth hesabı oluşturması, UUID allowlist, gerçek preview oturumu ve portföy/medya akışı, ayrı production ayarları ve onaylı yayın. İşletme onaylı aydınlatma henüz olmadığı için talep formu production'da açılmayacak. Gerçek ilanlar, domain ve tam dış yedek/felaket kurtarma doğrulaması hâlâ gerekli.
