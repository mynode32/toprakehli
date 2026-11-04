# Yerel yönetim teslimi — 31 Ekim 2026

## Teslim

Tek yönetici için yerel portföy paneli eklendi. Giriş, gerçek içerik ekleme/düzenleme, yedeklenerek kaldırma, JSON dışa aktarma ve tarihli yedekten geri yükleme vardır. Parola kurulumunu kullanıcı kendi terminalinde yapar. Otomatik/parolasız yönetici hesabı yoktur; gerçek proje için parola oluşturulmadı.

- `scripts/admin-auth.mjs`: tuzlanmış scrypt özeti ve sabit zamanlı karşılaştırma.
- `scripts/admin-server.mjs`: yalnız loopback, Host/Origin kontrolü, HttpOnly/SameSite oturum, CSRF koruması, giriş deneme sınırı ve oturum süresi. Güvenlik başlıkları ve özel dosya erişim reddi.
- `scripts/admin-store.mjs`: mevcut içerik doğrulaması, sürüm çakışması reddi, sıralı atomik dosya güncellemesi; önceki içerik yedeği ve işlem hazırlığı kaydı. Yedekler aynı disktedir; felaket kurtarma yerine geçmez.
- `admin/`: etiketli responsive giriş/form/liste/yedek arayüzü. Kaldırma ve geri yükleme için panel içi dialog. Kaydetme başarı mesajı sunucu yanıtından sonra gösterilir; ağ hatası başarı sayılmaz.
- `scripts/admin-setup.mjs`, `scripts/admin-start.mjs`: kendi parolasını oluşturma ve 4180 portunda paneli açma komutları. Gizli ve test dosyaları Git/paket dışında; yayın kontrolü bunu da denetler.
- `tests/admin.test.js`, mevcut HTTP testleri: auth, CSRF/Origin/Host, yedek, restore, invalid veri, eksik fotoğraf, paralel kayıt çakışması, giriş sınırlaması ve süre sonu. Sözdizimi kontrolüne admin JS dahil edildi.

## Testler

- `npm test`: 17 test, 0 hata. `npm run check`: PASS. Yayın/demo paket bütünlüğü kontrolleri PASS.
- İlk Host testi Node fetch'in özel Host başlığını uygulamaması nedeniyle başarısızdı. Ham HTTP isteğine düzeltilerek gerçek Host reddi doğrulandı; başarısız test başarı sayılmadı.
- Tarayıcı kontrolleri, gerçek `content/listings.json` yerine ayrı ve geçici test klasöründe yapıldı: giriş, kayıt, düzenleme, yenilemeden sonra kalıcılık, onayla geri yükleme, kaldırmadan vazgeçme/kaldırma ve çıkış çalıştı. Özel test parolası gerçek kullanıcı hesabına ait değildir.
- Native tarayıcı confirm otomasyonu kilitledi. Panel içi etiketli dialoga geçildi ve aynı geri yükleme akışı yeniden başarılı doğrulandı.
- 390×844 görünümde yatay taşma yok. İncelenen son akışlarda console error/warn yok. Kanıt: `screenshots/admin-mobile.jpg`, `screenshots/admin-desktop.jpg` (tamamı izole test verisi).
- Gerçek proje portföy dosyası değişmedi. Gerçek müşteri talebi/verisi, yayın veya ücretli hizmet yok. Geçici test sunucusu kapatıldı.

## Sınırlar

Bu yerel panel internete açılmamalıdır. Çok kullanıcılı roller, uzak kimlik sağlayıcı, dosya yükleme, canlı yayın iş akışı ve müşteri talep backend'i yapılmadı. Panel tek yönetici içindir. Kaynak/tarih doğrulaması belgeyi kendisi doğrulamaz. İşlem geçmişi hazırlık kaydıdır; tam denetim/audit sistemi değildir. Üretimde Windows izinleri, HTTPS, saklama, izleme ve uzak yedek politikaları ayrıca tasarlanmalıdır.

Faz 4'ün yerel tek yönetici alt kapsamı tamamlandı; tüm faz tamamlandı sayılmaz. Kullanım: `ADMIN_GUIDE.md`. Geri dönüş: bu görev öncesi `31ce43b` Git kaydı. `.private` dosyaları Git'te bulunmadığından geri alma bunları geri yüklemez veya silmez; içerik yedeği ayrıca korunmalıdır.
