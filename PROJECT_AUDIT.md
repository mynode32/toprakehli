# Başlangıç denetimi — 31 Ekim 2026

Kaynak: dc2aa0a. Buildless HTML/CSS ve tarayıcı ES modülleri; React/Next.js yok. Node yerel sunucusu yalnız loopback üzerinde çalışıyor. Vercel statik paket yayımlıyor.

## Bulgular

- Portföy arama, URL filtre durumu, sıralama, üçlü karşılaştırma, native dialog detay ve paylaşım mevcut.
- Yerel yönetim salted scrypt, HttpOnly/SameSite oturum, CSRF, Host/Origin kontrolü ve giriş limiti kullanıyor. Oturum ve limitler bellekte; serverless üretim için uygun değil.
- Onaylı içerik content/listings.json dosyasında; yerel disk ve yedekler canlı Vercel'e senkronize değil.
- Yerel yükleme PNG/JPEG üstbilgilerini kontrol ediyor; yeniden kodlama yok. Çoklu fotoğraf, merkezi depolama, kapak sırası yok.
- Kayıtların revizyon hash'i ile eşzamanlı düzenleme korunuyor; yerel yedek ve geri yükleme var. Çevrim içi audit/veritabanı yedeği yok.
- Form/CRM yok. WhatsApp, telefon ve e-posta bağlantıları gerçek; sahte gönderim bildirimi yok.
- noindex korunuyor. Özel domain, ilan başına sunucu metadata, sitemap yok. Gerçek ilanlar ve işletmece onaylı kişisel veri aydınlatması sağlanmadı.
- İlk yükleme yaklaşık 2.8 MB PNG hero kullanıyor; aynı görsel örnek kartlarda kullanılıyor. Yeni fotoğraflarda optimize varyantlar gerekli.
- 18 test yeniden çalıştırıldı: 18 geçti. Birim filtre/fact/contact ve gerçek yerel HTTP admin CRUD, oturum, CSRF, limit, revizyon, yedek, medya testleri var. Merkezi PostgreSQL/Storage/Auth, production senkronizasyonu ve CRM testleri yok.
- Gerçek Supabase projesi, anahtarları, yönetici hesabı ve migration erişimi yok. Docker/psql komutları bulunamadı. Üretim kabulü bu bağımlılıklar olmadan doğrulanamaz.

## Yaklaşım

Mevcut site ve yerel panel korunacak. Ayrı çevrim içi panel + Vercel Node API + Supabase PostgreSQL/Auth/private Storage eklenecek. Gizli anahtarlar yalnız sunucuda; hiçbir servis anahtarı tarayıcıya verilmeyecek. Yeni yayın önce preview olacak; mevcut production otomatik değiştirilmeyecek.
