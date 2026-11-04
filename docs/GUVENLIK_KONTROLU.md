# Sınırlı güvenlik kontrolü

Kontrollü yerel HTTP ve yalıtılmış SQL test ortamları kullanıldı. Gerçek müşteri verisi, parolası veya canlı hizmete yük saldırısı kullanılmadı. Bu çalışma kapsamlı sızma testi ya da saldırılmazlık garantisi değildir.

## Güçlendirmeler

- Önizleme Origin izinleri tüm .vercel.app adresleri yerine uygulamanın VERCEL_URL adresiyle sınırlandı. Bu kod sertleştirmesidir; gerçek bir hesap ele geçirme gösterilmedi.
- CSRF kontrolünde yalnızca 64 karakterli hex kabul edilir. Aynı karakter uzunluğunda farklı UTF-8 byte uzunluğuna sahip girdi artık timingSafeEqual hatası/500 yerine 403 alır. Yetki atlatma gösterilmedi.
- SITE_URL için HTTPS ve servis URL'si için gömülü kullanıcı/parola yasağı eklendi.

## Sonuç

39 test geçti. Yetkisiz okuma/yazma, CSRF, Origin/Host, oturum iptali/süresi, giriş sınırı, dosya türü/boyutu, SQL rol izinleri ve revizyon çakışması senaryoları kapsandı. Gerçek Supabase Auth/Storage taşımaları bu ortamda simüle; canlı servis kurulumunun doğrulandığı anlamına gelmez.

Canlı admin için gerçek veritabanı kurulumu, hesap yetkileri, yedek/geri dönüş, izleme ve sağlayıcı güvenlik ayarları ayrıca doğrulanmalıdır. Gerçek yayın değiştirilmedi; güncelleme ayrı Vercel önizlemesine gönderildi.
