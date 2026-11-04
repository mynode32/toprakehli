# API'siz site asistanı

31 Ekim 2026. Yeni ücretli servis, API anahtarı veya bağımlılık eklenmedi. Genel amaçlı yapay zekâ değil, sitedeki kayıtlara göre yanıt veren kurallı yardım aracı.

Ana sayfanın sağ altındaki Site Asistanı ile açılır. WhatsApp düğmesi diğer kenara taşındı. Mobil panel ekran genişliğine uyar; Escape ile kapanır, odak geri döner. Hareket azaltma tercihi korunur.

## İşlevler

- Bütçe üst/alt sınırı ve aralığı: “5 milyon TL’ye kadar”, “en az 5 milyon TL”, “3–5 milyon TL”.
- Mevcut kayıtlardaki bölge/mahalleyle eşleştirme; metrekareyle takip sorusu.
- Sonuçları sayfada gösterme; filtreleri sıfırlayınca tüm listeye dönme.
- Sonuçtan ilan detayı, ilk iki/üç kayıt karşılaştırması, iletişime yönlendirme.
- Boş sonuç, teyitsiz tapu/nitelik, gizlilik ve araştırma listesi açıklamaları.

Yalnız uygulamanın mevcut verisini okur. Demo kayıtlar gerçek satış önerisi olarak sunulmaz. Kazanç garantisi, resmî parsel sorgusu, randevu onayı veya mesaj gönderimi yapmaz. Bilmediği sorularda kendi kapsamını açıklar; eksik firma/ilan bilgisi uydurmaz.

Mesajlar yalnız açık sayfanın belleğinde tutulur, localStorage veya API'ye gönderilmez. Yeni sohbet ve yenileme temizler. Görünen mesaj sayısı 40, giriş uzunluğu 600 karakter ile sınırlıdır. DOM metinleri textContent ile yazılır.

## Doğrulama

47 test başarılı; syntax, lint, demo build ve paket kontrolü geçti. Yeni 8 test bütçe yönü/aralığı, Türkçe tutar, takip sorusu, olumsuz nitelik, sıfırlama, boş sonuç, detay/karşılaştırma kimliği ve dürüst kapsamı doğrular. Bu oturumda tarayıcı aracı olmadığı için yeni panelin gerçek cihaz/görsel ve klavye kabulü tamamlanmış sayılmaz. API maliyeti veya gerçek AI performansı testi söz konusu değildir.
