# Dashboard yenileme — 31 Ekim 2026

Yerel yönetim paneli yeniden düzenlendi: yeşil yan menü, genel bakış/portföy/yedek bağlantıları, toplam kayıt/fotoğraf/eksik fiyat-alan/yedek sayaçları, Türkçe konum ve kayıt numarası araması, fiyat/alan bilgili liste, boş sonuç açıklamaları, responsive form ve yedek listesi. Sayaçlar mevcut kayıt verisinden hesaplanır; analitik veya canlı ziyaretçi sayısı değildir.

Dosyalar: `admin/index.html`, `admin/style.css`, `admin/app.js`. Mevcut fotoğraf yükleme ve korumalı önizleme akışı korunur. Panel Vercel statik yayınına dahil değildir.

Kontroller: `npm test` 18/18 PASS; `npm run check` PASS; HTML section/div/form/aside/main kapanışları, gerekli hedefler ve tekrarlı ID kontrolü PASS. Bunlar dashboardun tarayıcı kabulü yerine geçmez.

Tarayıcı kontrolü BLOCKED: araç “Local browser use is disabled in Work settings” döndürdü. Masaüstü/mobil görünüm, arama/özet güncellemesi ve form regresyonu bu sürümde tarayıcıda doğrulanmadı. Görsel olarak tamamlandı iddiası yok. İzole test sunucusu kapatıldı; gerçek içerik ve hesap verisi değiştirilmedi.

Kullanım: `npm run admin:setup` (ilk sefer kendi parolanız), `npm run admin`, ardından `http://127.0.0.1:4180`. Yerel tarayıcı erişimi tekrar açıldığında görsel kabul tamamlanmalıdır. Geri dönüş: bu görev öncesi Git sürümünden admin dosyaları; özel içerik yedekleri ayrıca korunur.
