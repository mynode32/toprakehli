# Kurulum ve yayın rehberi

## 4 Kasım 2026: yeni hesaplarda temiz kurulum

Bu depo eski Vercel veya Supabase projesine bağlı değildir. Eski URL, kullanıcılar, ilanlar, medya ve ortam değişkenleri otomatik taşınmaz. Önce yeni Supabase projesini ve yönetici hesabını oluşturun, migration'ı uygulayın; ardından yeni Vercel projesini bu GitHub deposuna bağlayın. Yeni Vercel URL'sini `SITE_URL` olarak kullanın. Önceki kabul raporları eski hesaplardaki kurulumun tarihsel kayıtlarıdır.

## 1 Kasım 2026 eski kurulum kaydı

Ücretsiz mevcut Supabase projesi kullanıcı onayıyla bağlandı; gerçek kabul sonuçları `docs/REAL_ACCEPTANCE_2026-11-01.md` içindedir. Vercel'de `TOPRAK_SUPABASE_URL`, `TOPRAK_SUPABASE_ANON_KEY`, `TOPRAK_SUPABASE_SERVICE_KEY` kullanılarak eski Marketplace entegrasyonu korunur. Modern anahtarlar yalnız apikey başlığına gider; legacy JWT de desteklenir. Yönetici kendi Auth hesabını oluşturdu.

`npm run backup -- .private/ayarlar.env` uygulama tablolarını ve ready fotoğraf varyantlarını şifreli `.tebackup` dosyasına alır, anahtarını ayrı `.key` dosyasına yazar ve okuyup hash kontrolü yapar. İkisi Git dışında `.private/backups` altındadır. Anahtarı arşivden ayrı güvenli yere taşıyın. Bu komut hiçbir uzak kaydı geri yüklemez/değiştirmez; tam yönetilen DB/Auth yedeğinin yerine geçmez.

## 1. Supabase: kullanıcı hesabında proje

https://supabase.com/dashboard üzerinden ücretsiz proje oluşturun. Hesap/sözleşme adımlarını hesap sahibi tamamlar. Veritabanı parolasını burada veya Git'te paylaşmayın. Önce staging için ayrı proje kullanın; üretim veritabanını test hedefi yapmayın.

SQL Editor'da `supabase/migrations/001_platform.sql` içeriğini inceleyip çalıştırın. Yeni tablolar ve private bucket oluşturur, var olan tabloları düşürmez. Mevcut projeye uygulanmadan önce yedek alın. Migration gerçek Supabase'de henüz uygulanmadı; yalnız PGlite'da yürütüldü.

Authentication → Users üzerinden yönetici kullanıcısını kendiniz oluşturun, güçlü parola seçin. Genel self-signup'ı kapatın; Auth rate limit ve e-posta doğrulama ayarlarını kontrol edin. User UUID'yi ADMIN_USER_IDS için alın. Yerel admin parolası kullanılmaz. Parola sıfırlamayı Supabase kullanıcı yönetiminden yürütün; e-posta akışı kullanılacaksa gerçek SMTP yapılandırıp test edin.

API ayarlarından proje URL'si ve legacy anon/service_role JWT anahtarlarını alın. Service role anahtarını yalnız Vercel sunucu environment alanına girin; sohbete veya frontend'e yazmayın.

## 2. Environment

`.env.example` ad listesidir, gerçek değer içermez. Vercel Settings → Environment Variables veya interaktif `vercel env add ADI preview` ile girin:

| Değişken | Anlam |
|---|---|
| SUPABASE_URL | Gerçek projenin HTTPS adresi |
| SUPABASE_ANON_KEY | Auth parola girişinde kullanılan legacy anon JWT |
| SUPABASE_SERVICE_ROLE_KEY | Yalnız sunucuda legacy service_role JWT |
| ADMIN_USER_IDS | Yönetici Auth UUID listesi |
| APP_SECRET | Özel olarak üretilmiş 32+ karakter rastgele sır |
| SITE_URL | Onaylı site origin'i; şu an gerçek Vercel alias'ı kullanılabilir |
| TOPRAK_DEPLOY_MODE | Bağlantı hazır olduğunda `online`; mevcut örnek site için `demo` |
| PRIVACY_NOTICE_TEXT | İşletmece onaylı gerçek aydınlatma metni |
| PRIVACY_NOTICE_VERSION | Metnin sürümü |
| PRIVACY_CONTROLLER_NAME | Onaylı veri sorumlusu unvanı |

Son üç alan boşsa form açılmaz. E-posta bildirimi entegrasyonu yoktur; talep panelde saklanır, bildirim gönderildiği iddia edilmez. Preview ve Production aynı veri kaynağına bağlanmamalı. Anahtarları ekran görüntüsüne/loga dahil etmeyin.

## 3. Kontroller

`npm ci` → `npm test` → `npm run check` → `npm run build:vercel`.

Online build gerekli environment eksikse durur. Demo modunda çevrim içi API yapılandırılmamışsa 503 verir; örnek site eski davranışını korur.

`node scripts/platform-preview.mjs` yalnız yalıtılmış yerel QA'dır. Test hesabı `admin@example.test` / `test-password`; üretimde böyle bir hesap yoktur. Test parolası gerçek hesapta kullanılmaz.

## 4. Preview, sonra üretim

Yeni Vercel hesabında GitHub'dan bu depoyu içe aktararak preview oluşturun. Gerçek staging Supabase bağlandıktan sonra tarayıcı A–D senaryolarını çalıştırın: yayınla/güncelle/yayından kaldır, anonim yetki reddi, üçlü karşılaştırma, talep/CRM. Başka cihazdan yeni ilanı ve fotoğrafı doğrulayın.

Üretim migration, dış servis bağlantısı ve production yayın öncesi hesap sahibinin somut değişiklik onayı gerekir. Sonra ayrı production environment değerlerini tanımlayıp production build'i staging olarak doğrulayın ve yayınlayın. Bu sürüm üretime yükseltilmedi.

## Domain ve HTTPS

Domain sağlanmadı. Satın alma yapılmadı. Vercel Project → Settings → Domains üzerinden gerçek domain eklendiğinde Vercel'in o domain için gösterdiği A/CNAME kayıtlarını DNS sağlayıcısına girin; hayali sabit DNS kullanmayın. Apex/www için tek canonical origin seçin ve diğerini 308 ile yönlendirin. Vercel sertifikasının hazır olduğunu ve HTTPS yönlendirmesini doğrulayın. SITE_URL'yi güncelleyin.

## Veritabanı ve dosya felaket kurtarma

Panel snapshot'ları yalnız portföy geri alma içindir; tam DB/Storage yedeği değildir. Üretim öncesi PostgreSQL şema+veri ve private Storage dosyaları birlikte dış yedeklenmeli; te_media kimlikleri korunmalı. Supabase hesabındaki planın backup/restore olanaklarını doğrulayın, ayrı staging projede DB+dosya geri yüklemesi deneyin. Bu gerçek felaket kurtarma testi henüz yapılmadı. Yalnız portföy snapshot restore SQL/API testi geçti. İletişim verilerinin saklama/silme süresini işletme belirlemeli.
