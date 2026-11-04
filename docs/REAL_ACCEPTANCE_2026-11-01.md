# Gerçek ortam kabul kontrolü — 1 Kasım 2026

Ücretsiz Supabase projesi: amlhvnzojwckvummqviz. Yeni ücretli kaynak yok. Gerçek müşteri verisi üzerinde yıkıcı test yapılmadı; açıkça TEST etiketli tek kayıt kullanıldı ve sonunda arşivlendi.

## Geçen akışlar

1. Kullanıcı kendi parolasıyla Supabase Auth yöneticisi oluşturdu; UUID allowlist uygulandı.
2. Kullanıcı Vercel Preview paneline e-posta/parolayla girdi; dashboard gerçek verilerle açıldı.
3. Panelde taslak kaydedildi, PostgreSQL revizyonu ve snapshot oluştu.
4. WebP yükleme gerçek private Storage'da üç optimize varyant oluşturdu.
5. Yayınlama sonrası farklı site sekmesinde kayıt göründü.
6. Fotoğraf proxy yönlendirmesinde Vercel 404 sorunu bulundu; tek segment `photo?key=` uç noktasına geçilerek düzeltildi. Gerçek HTTP 200 ve tarayıcıda `naturalWidth=640` doğrulandı.
7. Başlık güncellendi; site yeniden yüklendiğinde güncel başlık görüldü.
8. Panelin gerçek snapshot geri yüklemesi eski başlığı geri getirdi.
9. Test kaydı arşivlendi; halka açık listeden kalktı. Dosyalar geçmiş yedek referansları için korundu.
10. Anonim veritabanı erişimi ve oturumsuz yönetim API'si 401; bucket private.
11. Şifreli uygulama yedeği gerçek veriden alındı: 1 kayıt, 2 snapshot, 3 fotoğraf nesnesinin hash ve çözme kontrolü geçti. Daha sonraki sürümlerde snapshot sayısı artmıştır.

## Otomatik sonuç

49 test, JavaScript syntax ve lint geçti. Şifreli yedekte bozulma/yanlış anahtar reddi ve bağımsız PGlite veritabanına portföy+talep geri yükleme testi eklendi.

## Sınırlar

- Şifreli yedek uygulama tabloları/fotoğraflar içindir. Supabase Auth parola hash'leri, PostgreSQL şeması ve yönetilen tam kurtarma yedeği değildir. Ayrı gerçek Supabase projesinde tam felaket kurtarma testi yapılmadı.
- Form, onaylı aydınlatma metni olmadığı için kapalı. Talep/CRM gerçek servis uçları hazır ancak gerçek kişisel veri gönderilerek kabul testi yapılmadı; fixture testleri geçti.
- E-posta bildirimi bağlı değil. Gerçek ilan/fotoğraf ve domain henüz sağlanmadı. noindex korunuyor.
- Aynı ücretsiz proje, ilk devreye alma öncesi test hedefidir; üretime alındıktan sonra test kayıtları tekrar yayımlanmamalı. Gelecekte ayrı staging gerekir.

Kullanıcı production'a geçişi onayladı. dpl_7AVzQPiinKGzyzMf91bLVct55CHK READY; mevcut alias güncellendi. Production site/admin/public API 200, oturumsuz özel API 401, özel dosyalar 404. Kullanıcı kendi parolasıyla production paneline girerek gerçek oturumu doğruladı. Test kaydı arşivli, public kayıt sayısı 0; form kapalı ve noindex etkin. Preview/Production APP_SECRET farklı. Ücretli işlem yok.
