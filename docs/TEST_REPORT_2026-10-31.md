# Toprak Ehli — Toplu test raporu

Tarih: 31 Ekim 2026 · Test edilen uygulama: `c311aac` · Adres: `http://127.0.0.1:4175/`

**Sonuç:** Test edilen yerel demo akışlarında uygulama hatası tespit edilmedi. Müşteri sunumu için kullanılabilir. Tam üretim kabulü değildir; talep backend'i ve yönetim paneli mevcut değildir.

## Otomatik kontroller

| Kontrol | Sonuç | Kapsam |
| --- | --- | --- |
| `npm test` | PASS — 14 test, 0 hata | Filtre sınırları, boş/geçersiz sayılar, m² hesabı/taşma, Türkçe arama, sıralama, doğrulama koşulları, üçlü seçim, yayın şeması, iletişim URL kodlama, HTTP erişim sınırları |
| `npm run check` | PASS | JS/MJS sözdizimi; lint/typecheck değildir |
| `npm run release:check` | PASS | Yayın paketi: 0 gerçek kayıt, demo verisi yok, import hedefleri mevcut, proje dosyaları web kökü dışında |
| `node scripts/verify-release.mjs --demo` | PASS | Demo paketi: 4 açıkça temsili kayıt, modül bütünlüğü |
| Demo ve yayın ZIP doğrulaması | PASS | Her ZIP'te 25 dosyanın SHA-256 değeri son paket klasörüyle aynı; proje/özel dosya sınırları kontrol edildi |
| Referans bütünlüğü | PASS | SHA-256: `1e4a331a8e8b20bb44ba9d488a67f49a6139e60a5b173ae15a412eb88f742691` |

HTTP testleri GET/HEAD davranışı, POST/PUT/DELETE reddi, HTML/JS/CSS/WebP/JPEG/SVG MIME türleri, nosniff, gizli proje dosyaları ve ham/encoded traversal/bozuk URL reddini kapsar. Bunlar tam güvenlik veya sızma testi değildir.

## Tarayıcı regresyonu

Uygulama içi Chromium tarayıcısında mevcut kaynak sürüm test edildi.

| Senaryo | Gözlenen sonuç |
| --- | --- |
| `YENİÇİFTLİK` araması | 1 temsili kayıt; Türkçe karakterler doğru eşleşti |
| Sıfırlama | 4 kayıt ve varsayılan filtreler geri geldi |
| Tekirdağ + en fazla 4.000.000 TL | 0 sonuç, iletişime yönlendiren boş durum |
| Fiyat artan sıralama | Sultanköy → Yeniçiftlik → Karaağaç → Barbaros |
| Fare ve Space ile karşılaştırma | 3 seçim; dördüncü kayıt seçimi devre dışı |
| Seçim varken Hisseli filtresi | Liste 0 sonuç; karşılaştırmadaki 3 seçim korundu |
| Karşılaştırmadan Sultanköy kaldırma | Seçim sayısı 2'ye düştü |
| Enter ile Yeniçiftlik detayı | Dialog açıldı; odak kapatma butonunda |
| Fiyat ve eksik alanlar | 1.900 TL/m²; eksik bilgiler açıkça işaretli |
| Bağlantıyı kopyala | “Bağlantı kopyalandı.” bildirimi |
| Escape ve kapatma butonu | Dialog kapandı; Escape sonrası odak açan butona döndü |
| Paylaşım URL'sine doğrudan gitme | İlgili detay otomatik açıldı |
| Logo ve WhatsApp | Logo ve SVG yüklendi; sabit ve ilanla ilişkili hedef numara doğru |
| İletişim bağlantıları | `tel:+905304627659`, doğru WhatsApp numarası ve `toprakehli.ofis@gmail.com`; demo mesajı açıkça temsili |

Dış WhatsApp/e-posta uygulaması açılmadı, arama veya mesaj gönderilmedi. Kopyalama fallback'i, JavaScript kapalı kullanım ve yazdırma bu turda yeniden test edilmedi.

## Ekran ve temel yapı kontrolleri

| Viewport | Belge genişliği | Sonuç |
| --- | --- | --- |
| 320×740 | 305 px | Yatay taşma yok |
| 390×844 | 375 px | Yatay taşma yok |
| 768×1024 | 753 px | Yatay taşma yok |
| 1440×1000 | 1425 px | Yatay taşma yok |

Her ölçüde logo/WhatsApp ikonu yüklendi, sabit düğme ekran içinde kaldı. Ölçümde scrollbar payı vardır; geçici viewport sonunda sıfırlandı. Masaüstü görüntüsü görsel olarak incelendi. Bu turdaki ölçüler fiziksel telefon/tablet testi değildir.

Son DOM kontrolünde: `lang=tr`, 1 adet H1, tekrarlı ID yok, kırık sayfa içi bağlantı yok, yüklenemeyen görsel yok. Yakalanan console error/warn listesi boş. Kaydedilen ekran: `screenshots/audit-2026-10-31.jpg`.

## Bulgular, sınırlar ve kalanlar

- İlk mevcut sekmeye erişimde `browser.user is unavailable` araç hatası alındı. Aynı tarayıcıda yeni test sekmesi açılarak kontroller tamamlandı. İlk arama ölçümü güncellenmeden önce 4 sonucu okudu; girdisi ve tamamlanmış DOM'u ayrı adımlarda yeniden kontrol edildi, 1 sonuç doğrulandı. Erken okuma başarılı test sayılmadı.
- Örnek fotoğraflar düşük çözünürlüklü ve yakın kadrajlıdır; gerçek fotoğraf kalitesi kabulü yapılamaz. Kullanıcı gerçek görselleri sonraya bıraktı.
- Ekran okuyucu, tam WCAG/kontrast denetimi, diğer tarayıcılar, fiziksel cihaz, gerçek hosting güvenlik başlıkları/HTTPS, canlı performans ve ağ/HAR denetimi yapılmadı.
- Domain ve gerçek portföy yok. Sunucuda talep kaydı, yetkili yönetim paneli, hesap/roller, audit log, yükleme, yedek/geri yükleme ve izleme uygulanmadı; bunlara PASS verilmedi.
- Bu görevde uygulama kodu veya yayın değiştirilmedi. Yalnız bu rapor ve ekran kanıtı eklendi. Başlangıçta Git çalışma alanı temizdi. Ücretli işlem ve dış mesaj gönderimi yok.

**Kabul kararı:** Yerel portföy demosu ve iletişim bağlantıları test edilen kapsamda geçti. Altı fazın tamamı veya üretime hazır tam emlak sistemi olarak kabul edilmemelidir.
