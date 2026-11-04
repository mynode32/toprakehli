# Referans tasarım entegrasyonu — 2 Kasım 2026

Mevcut HTML/ES module sitesi korunarak gönderilen index.html tasarımı uygulandı. Supabase, Auth, fotoğraf API'si, online admin, CRM, yedekler ve ilan yayınlama kodu değiştirilmedi.

- Askılık ana sayfadan kaldırıldı; eski modül geri dönüş için kaynakta duruyor.
- Kaynak dosyadaki 18 kayıt ve sekiz temsili görsel ayrı sunum kataloğuna aktarıldı. Aynı ada/parseldeki farklı kesimler ayrı tutuldu. Fiyat ve tapu bilgileri doğrulanmış olarak işaretlenmedi.
- Katalog `src/data/reference-listings.js` içindedir. Bu 18 kayıt Supabase'e yazılmadı ve admin panelinde düzenlenemez. Panelden yayınlanan gerçek ilanlar aynı vitrine eklenir. Katalog yönetiminin panele taşınması ayrı veri aktarımı gerektirir; tasarım onayı sırasında canlı veri değiştirilmedi.
- Kartın tamamı mevcut detay penceresini açar. Karşılaştırma kutusu bağımsız çalışır. Kaynak kayıtların paylaşım bağlantıları `?property=source-N` kullanır.
- Açık/koyu tema düğmesi tercihi tarayıcıda saklar. Mobil menü yatay kaydırılır. Logo koyu zeminde CSS ile beyaz kutusu görünmeden işlenir; orijinal dosya korunur.
- Koordinat doğrulaması, OpenStreetMap gömüsü, uydu ve TKGM bağlantıları eklendi. Harita başlangıç konumu temsili, parsel sorgusu entegrasyonu değildir.
- Bölge özeti, dijital platform, şematik Trakya haritası, rehber ve iletişim bölümleri korundu. Mevcut reveal animasyonları yeni bölümlere yayıldı; kart yakınlaşması ve detay geçişi eklendi. Hareket azaltma tercihi desteklenir.

Doğrulama: mevcut 51 test ve iki yeni katalog testi geçti; lint ve JS syntax kontrolleri geçti; demo paket üretildi. Tarayıcıda 18 kart, bölge filtresi (Hayrabolu: 3), sıfırlama (18), kart detayı, açık/koyu mod, hatalı koordinat ve harita yüklenmesi kontrol edildi. 390px mobilde yatay sayfa taşması görülmedi. Vercel önizlemesinde gerçek merkezi API yanıtıyla 18 katalog kartı ve hatasız konsol doğrulandı.

Geri dönüş etiketi: `before-reference-redesign-2026-11-02`. Canlı site değiştirilmedi; ücretli servis açılmadı; GitHub'a push yapılmadı.
