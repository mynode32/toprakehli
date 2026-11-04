# Toprak Ehli — teslim durumu, 1 Kasım 2026

Site: https://toprak-ehli-demo.vercel.app/
Yönetim: https://toprak-ehli-demo.vercel.app/admin/
Kaynak: https://github.com/TTRAIK/toprak-ehli (private)

Kullanıcı onayıyla online sürüm production'a alındı. Deployment dpl_Dg3vPrEmkENB32nYVYStfxyayGQC READY. Kullanıcı kendi Auth e-posta/parolasıyla production paneline girdi; dashboard ve kalıcı veriler görüldü. Varsayılan parola yoktur. Ücretli plan/domain/servis alınmadı; ücret gerektiren sonraki adımlar kullanıcı talimatıyla iptal edilecek.

## Doğrulanan kapsam

Gerçek Supabase Auth/PostgreSQL/private Storage; taslak/yayın/satıldı/arşiv; çoklu optimize fotoğraf; arama/filtre/karşılaştırma/detay; panel-site senkronizasyonu; revizyon koruması, snapshot/restore/audit. Preview üzerinde test ilanı ve fotoğraf oluşturuldu, yayınlandı, güncellendi, yedekten geri dönüldü ve arşivlendi. Fotoğraf HTTP 200 ve tarayıcı decode ile doğrulandı. Test kaydı production listesinde görünmez.

51 test, syntax ve lint geçti. Production site/admin/public API 200; oturumsuz özel API 401; özel kaynak ve env dosyaları 404; sitemap/robots 200. Online mod açık, noindex korunuyor.

Şifreli uygulama yedeği gerçek veriyle oluşturuldu ve bütünlük kontrolü geçti: 1 arşiv kayıt, 5 snapshot, 3 görsel nesnesi. Ayrı PGlite veritabanına portföy/talep geri yükleme testi geçti. Dosya ve anahtar Git dışında .private/backups altındadır; anahtarı arşivden ayrı güvenli yerde saklayın.

## Kalan dış bağımlılıklar ve sınırlar

- Gerçek ilanlar, izinli fotoğraflar ve özel domain sağlanmadı. Mevcut Vercel adresi kullanılabilir; gerçek ilan yokken açıkça örnek işaretli kartlar gösterilir.
- İşletme onaylı aydınlatma yok; kişisel veri formu kapalı. WhatsApp/telefon/e-posta açık. CRM kodu ve fixture testleri var; gerçek kişisel veri form/CRM kabulü yapılmadı.
- E-posta bildirimi/SMTP bağlı değil.
- Uygulama yedeği Auth parola hash'leri, PostgreSQL şeması ve yönetilen tam DB kurtarması değildir. Ayrı gerçek Supabase projesinde tam felaket kurtarma testi bekliyor.
- Bağımsız güvenlik denetimi, tam erişilebilirlik/cihaz/yük testleri ve otomatik operasyon izleme tamamlanmadı.

Online portföy yönetimi kullanıma açıldı. İlk kapsam belgesindeki bütün maddelerin sınırsız üretim kabulü tamamlandı iddiası yoktur. Ayrıntı: docs/REAL_ACCEPTANCE_2026-11-01.md.

## Portföy tasarımı güncellemesi

Kullanıcı onayıyla koyu/polaroid tasarım ve görünür arsa kartları canlıya alındı. Site/admin 200; public API 0 kayıt, revizyon 5; oturumsuz özel API 401. Canlı tarayıcıda 3 örnek kart ve detay aç/kapat doğrulandı. Veritabanına örnek ilan eklenmedi. Önceki açık tasarımın geri dönüş etiketi korunuyor. Bu tasarım turlarında kullanıcı isteğiyle GitHub push yapılmadı.

Vitrin kartları tıklanabilir. Online panelden Anasayfada öne çıkar ve 1–99 Vitrin sırası seçilir; yalnız fotoğraflı, yayında, satılmamış kayıtlar gösterilir. Detay: docs/FEATURED_PORTFOLIOS.md.
