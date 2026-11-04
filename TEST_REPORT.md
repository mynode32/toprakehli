# Gerçek test sonuçları — 31 Ekim 2026

## Güncel sonuç — 1 Kasım 2026

49 test geçti; syntax ve lint geçti. Gerçek Supabase Auth/Storage/PostgreSQL ile panelde yayınlama, güncelleme, fotoğraf ve snapshot restore doğrulandı; test kaydı arşivlendi. Şifreli uygulama yedeği ve ayrı SQL fixture'ına geri alma testi eklendi. Ayrıntılar `docs/REAL_ACCEPTANCE_2026-11-01.md` içindedir. Aşağıdaki sonuçlar ilk sürümün tarihsel kontrolüdür.

## Otomatik

- `npm test`: **33 geçti, 0 başarısız, 0 atlanan**. Önceki 18 test korundu.
- `npm run check`: kaynak, sunucu, panel ve test JavaScript sözdizimi geçti.
- `npm run lint`: no-undef, unreachable, duplicate ve typeof statik kuralları geçti.
- `npm audit`: 0 bilinen açık. Yeni lint bağımlılığındaki minimatch uyarısı 11.0.1 override ile giderildi; lint tekrar geçti. Runtime bağımlılık taraması da temiz.
- `npm run build` + `npm run release:check`: onaylı kayıt paketi, erişim sınırı ve modüller geçti; gerçek içerik halen 0.
- `npm run build:vercel`: müşteri örnek modu geçti. İzole fixture environment ile online build de geçti; paketlenmiş portföy `[]`, API modu etkin. Fixture değerleriyle hiçbir dış servis bağlantısı yapılmadı.
- TypeScript kullanılmıyor; TypeScript implementation type-check çalıştırılmadı. Runtime şema doğrulaması ve JS lint/syntax kontrolleri yapıldı. Bunlar statik tip ispatı değildir.

## Yeni entegrasyon kapsamı

Migration PGlite PostgreSQL üzerinde gerçek SQL ile yürütüldü: şema, RLS/grant, private bucket konfigürasyonu, oturum hash'i, CSRF, draft gizleme, yayınlama, güncelleme, paralel iki yazımdan yalnız birinin başarılı olması, arşivleme, snapshot restore, fotoğraf referans koruması, kalıcı rate limit, talep/özel not/revizyon/audit ve logout.

Sharp gerçek PNG decode→WebP varyantları, metadata temizleme ve bozuk/yanlış tür/büyük dosya reddi test edildi. Supabase HTTP adaptöründe server key ve güvenli error mapping sözleşmesi test edildi.

**Auth ve Storage taşıması test fixture'ında simüle edildi. Gerçek Supabase PostgreSQL/PostgREST/Auth/Storage hesabında test yapılmadı.** PGlite testi bunu tamamlandı saydırmaz.

## Tarayıcı

Yalnız `127.0.0.1:4183` yalıtılmış QA ortamında:

- Test yöneticisiyle giriş.
- Taslak oluşturma ve kaydetme.
- Dosya seçiciyle gerçek PNG yükleme; WebP varyantları test depolamasında.
- Yayın onayı; aynı merkezi test SQL verisini okuyan site kaydı ve fotoğrafı gösterdi.
- Detay dialog'u, galeri, kaynak alanları ve yeni paylaşım URL'si görüldü.
- Form gönderildi; yönetici panelinde talep görüldü, durum ve özel not kaydedildi.
- Yayından kaldırma; site yeniden yüklendiğinde ilan bulunmadı.
- Telefon genişliğinde 390 px yatay taşma ölçülmedi; panel masaüstü görünümü kontrol edildi.
- Okunan public QA console error listesi boştu.

Bu E2E adımları CUA ile gerçekleştirildi; çalıştırılabilir testler Node test runner içindedir. Tam tarayıcı senaryolarının tümü için tekrar oynatılabilir Playwright CI paketi henüz yok. Tablet, tam klavye/WCAG taraması, yavaş ağ/bağlantı kesilmesi, yük testi ve farklı gerçek cihaz testleri tamamlanmadı.

## Vercel

Yeni sürüm Preview: https://toprak-ehli-demo-fse1cdrw3-ehli.vercel.app

Deployment `dpl_72QxQeuFWxPeuxtwoP7hjeksUT2G`: READY. Vercel koruması mevcut hesapla `vercel curl` üzerinden geçilerek admin giriş HTML'i alındı; API yapılandırma isteği beklenen **503** döndürdü; `/server/platform.mjs` **404** döndürdü. Preview hesabın Vercel korumasına tabidir; herkese açık olduğu iddia edilmiyor.

Üretim alias'ı değiştirilmedi: https://toprak-ehli-demo.vercel.app . Yeni online platform için gerçek hesap bağlantısı, gerçek storage, cihazlar arası kalıcılık ve canlı A–D kabul testi henüz doğrulanmadı.
