# Uygulama planı

1. [x] Başlangıç denetimi, 18 testi yeniden çalıştırma.
2. [x] Kod: veri modeli, doğrulama, durumlar, revizyon ve transaction migration; PGlite üzerinde test edildi.
3. [x] Kod: Auth adaptörü, sunucu oturumu, allowlist, rate limit, CSRF/Origin/cookie. Gerçek Auth bağlantısı bekliyor.
4. [x] API: merkezi portföy, kaydet/yayınla/kaldır/arşiv, snapshot/restore/audit.
5. [x] Kod: private Storage adaptörü, gerçek Sharp decode/reencode, çoklu görsel/kapak/sıra/referans kontrolü. Gerçek bucket testi bekliyor.
6. [x] Online panel; kirli form uyarısı, arama/filtre/sort, önizleme ve JSON export.
7. [x] API senkronizasyonu, hata/yükleme/boş durum, galeri, metadata ve sitemap.
8. [x] Yapılandırmaya bağlı form ve CRM; gerçek hukuki metin yokken kapalı.
9. [ ] 33 test geçti; yalıtılmış tarayıcı yayın/medya/talep akışı geçti. Gerçek Supabase ve tam A–D cihaz/erişilebilirlik/ağ testleri bekliyor.
10. [x] Preview build READY, korumalı HTTP kontrolü ve sekiz belge hazır. Gerçek production kabulü tamamlanmadı.

## Dış bağımlılıklar

Kullanıcı Supabase hesabı olmadığını belirtti. Ücretsiz projenin kullanıcı hesabında açılması, migration'ın uygulanması, yönetici kullanıcısının oluşturulması ve gizli environment değerlerinin güvenli girilmesi gerekli. Ücretli servis açılmayacak. Gerçek ilan/fotoğraf, domain ve hukuki metin uydurulmayacak. Production yayını için yeni sürüm hazır olduğunda somut sonuç üzerinden onay istenecek.
