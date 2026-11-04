# Harita ve animasyon yayını — 2 Kasım 2026

Kullanıcı kartları haritaya bağlamayı, animasyonları artırmayı ve ardından canlı yayını açıkça onayladı.

- Canlı: https://toprak-ehli-demo.vercel.app/
- Deployment: dpl_BhL5C7hBzGfcRHtoXE161fTE4w69
- Kaynak commit: efea33c (yerel; GitHub push yok).
- Önceki canlı sürüm: dpl_Dg3vPrEmkENB32nYVYStfxyayGQC. Yerel geri dönüş etiketi: before-map-motion-2026-11-02.

Kart detayı fotoğraf ile bölge haritasını birlikte gösterir ve ana haritanın seçimini günceller. Ana haritada 18 katalog kaydı ile yönetilen ilanlar arasından seçim yapılabilir; haritadan detay açılır. Uydu ve resmî parsel sorgusu bağlantıları bulunur. Serbest koordinat keşfi ilan koordinatını değiştirmez.

Mevcut katalogda kesin parsel koordinatı yoktur. OpenStreetMap/Nominatim üzerinden bir defa alınan dört mahalle/bölge sınır kutusu kullanılır, parsel pini gösterilmez. Kaynak OSM bağlantıları src/data/map-regions.js içinde korunur. Bilinmeyen bölgede sahte bir harita konumu gösterilmez. Admin paneline opsiyonel latitude/longitude alanları eklendi; sunucu iki alanı birlikte, sayı ve aralık yönünden doğrular. Yönetici konumu da resmî kadastro doğrulaması olarak sunulmaz. Veritabanı şeması veya canlı kayıtlar değiştirilmedi.

Başlık/metin girişleri, görsel açılışı, kart hareketleri, buton parlaması, bölüm geçişleri ve detay açılışı geliştirildi. Hareket azaltma tercihi korunur. Koyu tema detay penceresindeki renk önceliği düzeltildi. Merkezi API yenilemesinde 18 kaynak kaydının korunması sağlandı.

Doğrulama: 56 test, lint ve JavaScript syntax geçti. Yerelde farklı bölgeler, ana harita seçimi ve 390px mobil detay taşması kontrol edildi. Canlıda 18 kart, Misinli detay haritası ve hatasız konsol doğrulandı. Ekran görüntüsü docs/screenshots/portfolio-map-live.png. Ücretli servis veya GitHub yüklemesi yok.

18 kaynak kayıt hâlâ sunum kataloğudur; admin paneline aktarılmamıştır. Gerçek koordinatlar girilene kadar bu kayıtlar yalnız bölge görünümü açar.
