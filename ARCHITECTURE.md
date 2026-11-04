# Mimari

## Korunan sistem

Halka açık site buildless ES modülleri; arama/filtre/sıralama/karşılaştırma yerel domain modüllerini kullanır. Yerel panel eski loopback sunucusunda ayrıca çalışır. `.private` kayıtları ve yerel parola online sisteme aktarılmaz.

## Yeni çevrim içi sistem

`online/` → aynı köken `/api/platform/*` Vercel Node Function → Supabase REST / Auth / PostgreSQL / private Storage.

- Supabase Auth parola doğrular. Yalnız ADMIN_USER_IDS listesindeki kullanıcılar uygulama oturumu alır. Auth access/refresh tokenları tarayıcıya gönderilmez; ayrı rastgele opaque oturumun SHA-256 hash'i PostgreSQL'de tutulur. Bir saat, HttpOnly/Secure/SameSite Strict cookie, CSRF ve Origin kontrolü.
- `te_state`: revizyonlu merkezi portföy belgesi. Mevcut küçük portföy mimarisini korumak için 1000 kayıt / HTTP yazım başına 2 MB sınırı var. Yoğun çok kullanıcılı katalog için satır bazlı modele geçilmelidir.
- `te_change`: transaction, advisory lock, beklenen revizyon kontrolü, önceki sürüm snapshot'ı ve audit kaydı. İlanlar fiziksel silinmez; arşivlenir. Taslak halka açılmaz. published ve sold durumları görünür.
- PostgreSQL tablolarında RLS etkin; anon/authenticated erişimi ve ayrıcalıklı RPC yetkileri kapalı. Servis anahtarı yalnız Function'dadır. Bu nedenle uygulama sunucusunun yetki kontrolleri de zorunludur.
- Private `te-photos` bucket. Sharp ile gerçek decode, metadata temizleme, WebP 480/960/1600 varyantları. 3 MB dosya / 30 MP decode / 12 fotoğraf sınırı. Vercel'in geçici diskine kalıcı kayıt yapılmaz.
- Fotoğraf proxy'si her istekte yayın/oturum kontrol eder. Taslak fotoğraf linki anonim okuyucuya açılmaz. Fotoğraflar no-store; performans karşılığında yayından kaldırma gizliliği korunur.
- Dosya yükleme pending→ready; başarısız işlem telafi edilir. Telafi de başarısızsa pending kaydı bakım ekranında görünür. Silme önce DB'de retired yapar; referans kontrolü tüm ilanlar ve snapshot'ları kapsar. İlan/yedek referansı bulunan dosya silinmez.
- `te_leads`: kişisel iletişim verisi, talep durumu, özel not, revizyon ve aydınlatma sürümü. Yalnız yetkili API'den okunur. İşlem geçmişi te_audit; notun eski metninin tam versiyon geçmişi yoktur.

## Senkronizasyon

Online modda tarayıcı paketlenmiş örnek veriye geri dönmez. Her yüklemede no-store public API okur. Açık görünür sayfalar 30 saniyede ve sekmeye dönüşte revizyon kontrol eder. Değişimde liste/karşılaştırma aynı kayıt kümesiyle güncellenir; açık eski detay kapatılır. Form yeni sayfa açıldığında güncel portföy seçeneklerini alır; sunucu gönderimde tekrar kontrol eder.

## SEO

`/ilan/:id` yalnız yayınlanmış kayıt için server metadata/OG/JSON-LD üretir. `/sitemap.xml` güncel yayınları sunar. Domain/gerçek içerik onayı verilene kadar HTML, HTTP headers ve robots üzerinden noindex/disallow korunur.

## Test sınırı

PGlite gerçek PostgreSQL motorunu WASM'da çalıştırır; SQL transaction/RLS grant/revizyon/snapshot testleri gerçek SQL yürütür. Test fixture Auth ve Storage HTTP taşımasını taklit eder. Bu testler Supabase hesabı, gerçek Auth güvenlik ayarları veya kalıcı Storage bağlantısı yerine geçmez.
