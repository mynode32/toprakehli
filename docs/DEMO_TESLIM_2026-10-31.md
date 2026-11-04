# Demo teknik teslimi — 31 Ekim 2026

Bu rapor demo kabulünü gerçek yayın kabulünden ayırır. Önceki HANDOVER.md ve TEST_REPORT.md içindeki gerçek Supabase bağlantısı eksikleri halen geçerlidir.

## 1. Tamamlanan işler

- Güncel proje incelendi; önceki kaynaklar üzerine yazılmadı. Tasarım dili korundu.
- Arama, birleşik filtreler, sıralama, sıfırlama ve üçlü karşılaştırma mevcut ve testli.
- Demo ilanlara `/ilan/demo-1` biçiminde ayrı HTML sayfaları eklendi. Kartta ayrı sayfa bağlantısı, detayda bu adresi paylaşma var; hızlı detay penceresi korundu.
- Fiyat, alan, m² fiyatı ve doğrulama/kaynak durumu düzenli sunuluyor. Eksik koordinat için boş harita yerine açıklama var. Tek temsili fotoğraf gerçek bir galeri alanında gösterilir; olmayan fotoğraflar için çalışmayan kontroller üretilmez.
- Yerel ve çevrim içi ilan sayfası aynı render işlevini kullanır. HTML kaçışları uygulanır; özel admin notları render edilmez.
- Bilinmeyen ilan için HTTP 404 ve dönüş bağlantısı eklendi.
- Demo noindex/robots korunur; yayına sunulan demoda global demo ibaresi görünür. İletişim sahipliği beklediği belirtilir.
- Çalışmayan talep formu eklenmedi. Statik demoda form kapalı; online talep kodu gerçek yapılandırma/hukuki metin bekliyor.

## 2. Test edilen akışlar ve sonuçları

35 Node testi geçti. Syntax, lint, demo build ve demo release kontrolü geçti.

Arama/sıralama/birleşik filtre, boş sonuç, sıfırlama, karşılaştırma sınırı/çıkarma, eksik tutarlar, iletişim hedefi ve ilan bağlamı; doğrudan ilan adresinin 200, olmayan ilanın 404 dönmesi test edildi. Ayrı sayfanın demo etiketi, galeri, fiyat/alan ve kaynak bilgisi test edildi.

Yerel adminin oturumsuz erişim, CSRF, origin/host, limit, revizyon çakışması, medya, yedek/restore kontrolleri geçti. Online migration/API testleri PGlite SQL üzerinde; Auth ve Storage taşıması simüle. Gerçek Supabase kurulmuş veya farklı cihazlarda gerçek kalıcılık doğrulanmış sayılmaz.

Bu oturumda tarayıcı otomasyon aracı mevcut olmadığından yeni görsel mobil/tablet/masaüstü, galeri/odak ve gerçek kullanıcı tıklama testleri yeniden yapılmadı. Önceki ekran görüntüleri tarihsel kanıttır, yeni kabul testi yerine geçmez. 360, tam WCAG, yük ve yavaş ağ kabulü iddia edilmiyor.

## 3. Müşteriden beklenen içerikler

Gerçek firma unvanı, iletişim sahiplik onayı, adres, kurumsal açıklama; onaylı ilanlar, aktif fiyatlar, tapu/imar/kaynak tarihleri; kullanım izinli gerçek fotoğraflar ve doğrulanmış konumlar. Referans, yorum, kuruluş tarihi ve yetki belgesi üretilmedi. Bunlar sağlanmazsa gerçek sitede ilgili bloklar kaldırılmalı; yer tutucular yayımlanmamalı.

## 4. Gerçek yayın öncesi son işlemler

- Gerçek Supabase projesi, yönetici hesabı, migration ve private storage kurulumu; canlı veri akışının uçtan uca kabulü.
- Yerel panel yalnız yerel içerik iş akışıdır; Vercel'e otomatik eşitlemez. Müşteri gerçek online paneli kabul etmeden canlı CMS teslim edildi denmemeli. ADMIN_GUIDE.md ve DEPLOYMENT.md kurulumu açıklar.
- Alan adı ve hosting müşteri hesabında olmalı; sağlayıcı, hesap sahibi, fatura/yenileme sorumlusu ve bitiş tarihleri müşteriyle yazılı doldurulmalı. Bu bilgiler henüz teyit edilmedi.
- Form için veri sorumlusu, aydınlatma ve saklama koşulları onaylanmalı; aksi halde form kapalı kalmalı.
- İletişim ve ilan teyidi; gerçek cihaz/klavye/tablet testi; dış yedek ve geri dönüş denemesi; hata izleme.
- Kesin domain ile canonical, paylaşım görselleri, sitemap ve yönlendirmeleri kontrol et. Demo noindex ayarını yalnız gerçek yayın kabulünden sonra değiştir.
- Demo görünüm onayı, online admin işletim kabulü ve kamuya yayın onayı ayrı kaydedilmeli. Bu çalışma production alias'ını değiştirmez.

Kaynak paketinde .env.local, .private, test müşteri verileri, node_modules, hesap oturumları ve gizli anahtarlar bulunmamalı. .env.example yalnız değişken isimlerini/boş örnekleri içerir.

## Önizleme ve paket

Önizleme: https://toprak-ehli-demo-2su5ft05l-ehli.vercel.app — Vercel hesap koruması etkin; herkese açık müşteri yayını değildir. Dağıtım READY. Yetkili HTTP kontrolü: ilan 200, bilinmeyen ilan 404, detay CSS 200. Bu kontroller görsel tarayıcı kabulü değildir.

Paket: releases/TOPRAK_EHLI_DEMO_TESLIM_2026-10-31.zip. 01_DEMO_SITE web dosyaları; 02_KAYNAK kaynak ve testler; 03_BELGELER kılavuzlar. Gizli ortam dosyaları ve özel kayıtlar hariç tutuldu.
