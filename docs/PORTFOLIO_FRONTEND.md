# Portföy alanı — 1 Kasım 2026

Önizleme: https://toprak-ehli-demo-ojpfsohnk-ehli.vercel.app/#portfoy
Deployment: dpl_6NcJciJe7VzGX57F9Wsm7RY4EFXz (READY, Preview).

Portföyler boş olsa da alan görünür. Üç açıkça örnek işaretli kart, fotoğraf, konum/alan/tapu/fiyat yerleri ve native dialog düzeni gösterilir. Hayali fiyat, alan veya satış kaydı yaratılmaz. Örnekler API, veritabanı, asistan, filtre ve karşılaştırma verisine dahil değildir. Veri isteği başarısızsa örnek kartla hata gizlenmez; mevcut hata/yeniden deneme görünümü korunur.

Gerçek yayınlanmış kayıt geldiğinde mevcut gerçek ilan renderer'ı kullanılır, örnekler kalkar, filtre ve karşılaştırma etkinleşir. Güncelleme mevcut 30 saniyelik senkronizasyonla çalışır. Arsa sahibi için iletişim çağrısı eklendi; bu bir form gönderimi veya otomatik ilan kaydı değildir.

İlan girişi canlı /admin/ içindeki Yeni portföy ekranından yapılır. Bu gerçek Supabase Auth/PostgreSQL/private Storage sistemidir; yeni backend yazılmadı veya müşteri verisi değiştirilmedi.

49 otomatik test, syntax ve lint geçti. Gerçek Vercel önizlemesinde boş veriyle üç kart görüldü, örnek detay açıldı/kapandı; 390 px mobilde yatay taşma ve console error yok. Eski üretim ve geri dönüş etiketi korunuyor. Bu turda GitHub push yapılmadı.

## Canlıya geçiş

Kullanıcı onayıyla dpl_DPdRt7ePJbYQM3uSbsUQUWXMUfev READY olarak https://toprak-ehli-demo.vercel.app adresine alındı. Yukarıdaki önizleme notları önceki kontrol aşamasını anlatır. Önceki üretim deployment ve kaynak etiketi geri dönüş için korunuyor. 49 test geçti. Ücretli işlem ve GitHub push yok.
