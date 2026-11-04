# Faz 2 — Alan bilgisi ve karşılaştırma

31 Ekim 2026 · Yerel demo kapsamında tamamlandı.

## Kapsam ve uygulama

Mevcut modüler yapı korundu. Küçük görev: her alanın kaynak/kontrol tarihi/durum bilgisini ortak sunmak ve en fazla üç portföyü karşılaştırmak. Yeni bağımlılık, backend, gerçek veri veya yayın yok.

- `src/data/properties.js`: alan bazında `evidence` modeli (`status`, `source`, `checkedAt`). Demo kayıtlarının gerçek kaynak ve tarihleri boş bırakıldı.
- `src/domain/facts.js`: eksik/geçersiz değer, tarih ve doğrulama sunumu. Demo hiçbir koşulda doğrulanmış kayıt gösterilmez. Demo dışı kayıtta doğrulanmış durumu için değer, kaynak, geçerli tarih ve açık `verified` durumu gerekir. Bu bir sunum kuralıdır; belgeyi kendisi doğrulamaz, güvenli yönetim iş akışının yerini tutmaz.
- `src/domain/comparison.js`: geçerli kayıt kimlikleri, üçlü seçim sınırı, kaldırma. Seçim sayfa belleğindedir; yenilemede sıfırlanır. Filtreler seçimleri silmez.
- `src/ui/facts.js`, `src/ui/comparison.js`: ortak alan gösterimi ve başlık hücreleriyle semantik tablo. Dar ekranda tablo kendi içinde kaydırılır; görünür açıklama ve klavye odağı vardır.
- `src/ui/detail.js`, `src/ui/listings.js`, `src/main.js`, `index.html`, `src/styles.css`: detay, kart, seçim kontrolleri, durum bildirimi ve odak yönetimi. Fiyat/alan sıfır, negatif veya geçersizse bilgi eksik gösterilir.
- `src/domain/properties.js`: m² hesabında sonucun taşarak Infinity olması da reddedilir.
- `tests/facts.test.js`, `tests/properties.test.js`: yeni iş kuralları ve sayısal taşma regresyonu.

## Doğrulama

- `npm test`: **PASS**, 11 test, 0 hata. Eksik/sıfır/geçersiz fiyat-alan; geçersiz takvim tarihi; kaynak/tarih olmadan doğrulanmama; demo koruması; üçüncü/dördüncü seçim; bilinmeyen kimlik; kaldırma ve önceki HTTP/filtre kontrolleri.
- `npm run check`: **PASS**, JS/MJS sözdizimi. Lint/typecheck değildir.
- Chrome: checkbox ve Space ile seçim; üçüncü seçimde dördüncünün kapanması; Hisseli filtresiyle 0 sonuçta üç seçimin korunması; karşılaştırmadan kaldırma; sıfırlama; Enter/Escape ile detay; tüm seçimleri temizleme ve odak dönüşü doğrulandı.
- Yeniçiftlik detayı: 4.750.000 TL / 2.500 m² = 1.900 TL/m²; alan bazında temsili/doğrulanmadı, kaynak/tarih sağlanmadı ve eksik imar/erişim/altyapı metinleri görüldü.
- 390×844, 768×1024 ve 1440×1000 viewport kontrolü yapıldı. Telefon/tablet görüntüleri incelendi, sayfa yatay taşmadı. Mobil tablo kendi içinde kaydırıldı. Viewport sonunda sıfırlandı. Fiziksel cihaz testi yapılmadı.
- İncelenen akışlarda yakalanan console error/warn listesi boş. Ayrı network/HAR, ekran okuyucu ve tam WCAG denetimi yapılmadı.
- Kanıt: `docs/screenshots/phase-2-mobile.jpg`, `docs/screenshots/phase-2-desktop.jpg`.

## Sınırlar ve sonraki adım

Gerçek doğrulama kriteri, zorunlu alanlar ve bilginin eskime süresi işletmeyle belirlenecek; otomatik süre atanmadı. Gerçek kayıt yayınlama veya doğrulama yetkisi henüz yok. Kaynak metinleri HTML olarak işlenmez (`textContent`).

Faz 3 gerçek talepler için onaylı iletişim kanalları, backend/hosting tercihi, veri saklama süresi ve hukuki metinler gerektirir. Bu kararlar olmadan gerçek talep toplama açılmayacak.

Geri dönüş: Faz 1 Git kayıt noktası `361ceaa` mevcut. Faz 2 ayrı yerel commit olarak kaydedilir; uzak depoya gönderim veya canlı ortam değişikliği yok.
