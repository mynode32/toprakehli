# Teslim hazırlığı — 31 Ekim 2026

## Logo ve WhatsApp devamı

- Kullanıcının verdiği logo değiştirilmeden `src/assets/toprak-ehli-logo.jpg` olarak eklendi; başlıktaki metin markası yerine kullanıldı. Orijinal dosya korundu.
- Yerel SVG WhatsApp ikonu iletişim ve ilan detayındaki bağlantılara eklendi. Sağ alttaki erişilebilir sabit bağlantı aynı işletme numarasına gider; yeni sekme açar, mesaj göndermez. Mobilde yalnız ikon görünür. Yazdırmada sabit düğme gizlenir.
- Logo ve SVG MIME kontrolleri mevcut HTTP testine eklendi. Paketleme SVG'yi de içerir. Demo/yayın/kaynak ZIP'leri yenilendi.
- Chrome tabanlı uygulama içi tarayıcıda masaüstü ve 390×844 mobil görünüm incelendi. Logo ve ikonlar yüklendi, yatay taşma yok; ilan detayındaki ikon doğrulandı. Console error/warn listesi boş. Dış mesaj gönderimi yapılmadı.
- Ekran kanıtları: `screenshots/brand-whatsapp-desktop.jpg`, `screenshots/brand-whatsapp-mobile.jpg`. Değişen uygulama alanları: `index.html`, `src/ui/contact.js`, `src/main.js`, `src/styles.css`, iki yerel marka varlığı; sunucu, paketleme ve HTTP kontrolü güncellendi.
- Geri dönüş noktası: `9641267`. Backend/yönetim ve yayın durumu aşağıdaki raporla aynı.

## Sonuç

Müşteriye gösterilebilen dört örnek portföylü demo, gerçek iletişim bağlantıları, kaynak kod ve ayrı statik paketler hazırlandı. Domain ve gerçek fotoğraflar kullanıcı kararıyla sonra sağlanacak. Bu teslim altı fazın veya tam üretim sisteminin tamamlandığı iddiasını taşımaz.

## Değişiklikler

- `src/domain/discovery.js`: Türkçe arama ve fiyat/alan sıralaması; eksik sayılar sıralamada sona gelir. Filtre/sıralama URL'de korunur.
- `src/main.js`, `src/ui/site.js`, `src/data/site.js`: demo/yayın ayrımı, bölge seçeneklerini veriden oluşturma, URL'den filtre ve ilan detayı açma. Yayında gerçek kayıt yoksa filtre ve karşılaştırma yerine iletişime yönlendiren boş durum gösterilir.
- `src/ui/detail.js`, `index.html`: paylaşılabilir bağlantı ve kopyalama; clipboard başarısızsa seçme ve elle kopyalama açıklaması. Ürün hatası durumunda sahte başarı gösterilmez.
- `src/assets/`, `src/data/properties.js`, `src/ui/listings.js`, `src/styles.css`: özgün referanstan çıkarılmış dört örnek görsel, açık temsili görsel etiketi, lazy loading, yüklenememe durumu. Görsellerin üstündeki referans rozetleri CSS kadrajıyla görünümden çıkarıldı. Referans dosyası değiştirilmedi; yeni görseller gerçek ilanlara bağlanmadı.
- `src/data/contact.js`, `src/ui/comparison.js`: gerçek ve demo kayıtlar için uygun mesaj/karşılaştırma metni.
- `content/listings.json`, `scripts/content.mjs`: yayın içeriği ayrı; demo, yayın onayı eksik, geçersiz fiyat/alan/tarih, tekrarlı kimlik, dış görsel yolu ve şema dışı alanlar reddedilir. Gerçek fotoğraf için yerel yol ve alt metin desteği.
- `scripts/build.mjs`, `scripts/verify-release.mjs`: önceki paketi silmeden ayrı demo ve yayın paketleri; modül bütünlüğü ve web kökünde proje dosyası bulunmadığı kontrolü. Güvenlik başlıkları için `_headers`, `robots.txt`, 404 sayfası. Bunların hostingde uygulanması ayrıca doğrulanmalıdır.
- `scripts/local-server.mjs`, `scripts/serve.mjs`: görsel MIME türleri, paket önizlemesi ve port seçimi. Varsayılan demo adresi artık 4175; eski çalışan 4173 süreci nedeniyle yeni sürüm ayrı portta doğrulandı.
- `ONIZLEMEYI_BASLAT.cmd`, `TESLIM_NOTLARI.md`, `README.md`, `.gitignore`, `package.json`: çalıştırma, kullanım, içerik şeması, paket/yayın ve geri dönüş talimatları; paket/secret dosyaları Git dışında.

## Kontroller

- `npm test`: **PASS, 14 test, 0 hata**. Yeni arama/sıralama, yayın şeması ve görsel MIME kontrolleri dahil.
- `npm run check`: **PASS**. Sözdizimi kontrolüdür; lint/typecheck değildir.
- `npm run build` ve `npm run build:demo`: **PASS**. Yayın paketinde 0 gerçek kayıt; demo paketinde 4 temsili kayıt. İki paket noindex durumunda.
- Paket kontrolü: modül import hedefleri mevcut; `.git`, `.env`, docs, scripts, tests, reference ve içerik kaynak klasörleri web kökünde yok.
- Chrome: büyük harfle Türkçe Yeniçiftlik araması, URL'den aramanın korunması, fiyat sırası (Sultanköy/Yeniçiftlik/Karaağaç/Barbaros), doğrudan paylaşım bağlantısıyla dialog açılması ve bağlantı kopyalama başarı bildirimi doğrulandı.
- Detay Escape ile kapandı. Fare ve Space ile karşılaştırmaya ekleme; iki kayıt/sekiz alan tablosu görüldü. Bir otomasyon `check()` komutu beklenen seçimi değiştirmedi; başarılı sayılmadı. DOM incelenip gerçek click ve Space ile seçim akışı ayrıca doğrulandı.
- 320×740, 390×844, 768×1024 ve normal masaüstü görünümünde yatay belge taşması görülmedi. Viewport override sonunda kaldırıldı. Örnek görseller yüklendi; incelenen son akışlarda console error/warn kaydı boş.
- Yayın paketi Chrome'da ayrıca açıldı: demo kartı yok; filtre/karşılaştırma gizli; iletişim hedefleri doğru.
- Referans SHA-256 değeri başlangıçla aynı. Ekran kanıtları `screenshots/delivery-mobile.jpg`, `screenshots/delivery-desktop.jpg`.
- Fiziksel cihaz, ekran okuyucu, tam WCAG, gerçek hosting başlıkları, HTTPS, dış mesaj teslimi ve canlı performans ölçümü yapılmadı. Harici mesaj gönderilmedi, ücretli servis veya yayın açılmadı.

## Kalan iş ve geri dönüş

Gerçek backend talep kaydı; yetkili yönetim paneli/hesaplar; audit log; dosya yükleme; veri saklama, yedek ve geri yükleme; üretim izleme yok. Bunlar hosting/backend, yetki modeli, veri saklama süresi ve onaylı hukuki metinler olmadan tamamlanmış sayılmaz. Gerçek portföy ve domain sonraya bırakıldı. Kullanılabilir kapsam şu an portföy demosu ve iletişim sitesidir.

Önceki güvenli Git noktası `dee8741`; bu teslim ayrı yerel commit olarak kaydedilir. ZIP'ler ve sürüm klasörleri `releases/` içindedir, Git'e eklenmez. Kaynak ZIP'i web köküne yüklenmemelidir.
