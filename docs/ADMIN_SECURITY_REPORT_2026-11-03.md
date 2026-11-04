# Admin paneli, güvenlik ve yeni ilan raporu

Tarih: 3 Kasım 2026. İnceleme: kaynak kodu, otomatik testler, bağımlılık taraması, canlı HTTP ve anonim veritabanı izin kontrolleri. Bu çalışma bağımsız bir penetrasyon testi veya yüzde yüz güvenlik garantisi değildir.

## Panelin durumu

Adres: https://toprak-ehli-demo.vercel.app/admin/

Supabase Auth ile giriş, yönetici UUID izin listesi, ilan taslak/yayın/arşiv işlemleri, fotoğraf yükleme ve sıralama, vitrin ayarları, koordinat alanları, uygulama yedekleri ve işlem geçmişi mevcut. Talep yönetimi kodu bulunuyor; hukuki metin sağlanmadığı için halka açık talep formu kapalıdır.

Mevcut 18 sunum kaydı hâlâ kaynak kataloğundadır ve panelden düzenlenmez. Merkezi veritabanında bir eski arşiv test kaydı ve sekiz yeni taslak bulunur; yayımlanan merkezi kayıt sayısı sıfırdır. Ziyaretçiye görünen 18 katalog kartı korunur.

## Bulgular ve uygulanan düzeltmeler

| Bulgu | Değerlendirme | Sonuç |
|---|---|---|
| Çıkışta gizlenen editör, fotoğraf ve önizleme alanlarında veri kalması | Paylaşılan cihazda mahremiyet eksikliği; sunucu yetki atlatması değil | Formlar, fotoğraflar, kaynak alanları ve önizleme temizleniyor, açık diyaloglar kapanıyor. |
| Açık panelde süresi bitmiş/iptal edilmiş oturumun ancak sonraki işlemde fark edilmesi | Ekrandaki eski verilerin görünür kalması | Görünür panelde 60 saniyede bir ve sekmeye dönüldüğünde sunucu oturumu kontrol ediliyor; 401 ile panel temizleniyor. Sunucudaki bir saatlik üst sınır uzatılmıyor. |
| Çıkışla yarışan eski liste isteğinin veriyi yeniden doldurabilmesi | İstemci mahremiyet sıkılaştırması | Oturum nesli kontrolü eklendi; eski oturumun yanıtı işlenmiyor. |
| Tarayıcı geri/ileri önbelleğinde eski panel görüntüsü | İstemci mahremiyet sıkılaştırması | Sayfadan ayrılırken hassas alanlar temizleniyor; geri/ileri önbelleğinden dönüşte sayfa yeniden doğrulanıyor. |
| Bozuk oturum bitiş tarihinin güvenli reddedilmemesi | Savunma derinliği; dışarıdan tablo yazma yetkisi bulunmadı | Geçersiz tarih de 401 ile reddediliyor; regresyon testi eklendi. |
| Admin HTML'de genel sitenin önbellek/harita izinleri | Gereksiz tarayıcı yetkisi ve önbellek | Admin için no-store, no-referrer, frame-src none, base-uri none ve aynı kaynak bağlantı kuralı eklendi. /admin/, /admin ve alt dosyalar kapsanıyor. Canlı giriş URL'sindeki başlıklar doğrulandı. |

Bu kapsamda kritik veya yüksek önem seviyesinde bir yetkisiz erişim açığı doğrulanmadı. Bu ifade diğer açıkların bulunmadığı anlamına gelmez.

## Kontrollerin kanıtları

- Canlı session, records, backups, admin-leads ve audit uç noktaları oturumsuz 401 döndürüyor. Admin HTML'nin 200 dönmesi giriş ekranının açık olmasıdır; veri erişimi sağlamaz.
- Farklı Origin ile login isteği 403 döndü. Otomatik testlerde CSRF, sahte kaynak, yetki kontrolü, çıkış ve süre dolması senaryoları geçti.
- Canlı Supabase anon anahtarıyla te_state, te_sessions ve te_leads sorguları 401 döndü. Canlı authenticated rolü ayrıca denenmedi; SQL rol testleri ayrı PGlite ortamında çalıştırıldı.
- Canlı /.env ve /.private/setup-production.env 404 döndü. Gizli değerler rapora veya istemciye yazılmadı.
- Güvenli çerez: __Host öneki, Secure, HttpOnly, SameSite=Strict. Oturum belirteci sunucuda hash olarak tutuluyor; yazmalar Origin ve HMAC CSRF kontrolünden geçiyor.
- Fotoğraflar özel depolamada; kodda tür/gerçek içerik kontrolü, 3 MB sınırı, 30 MP piksel sınırı, yeniden WebP üretimi ve metadata temizliği var. İlgili otomatik testler geçti.
- npm audit --omit=dev: bilinen üretim bağımlılığı açığı 0. Bu tarama uygulama mantığındaki açıkları kapsamaz.
- Toplam 57 test geçti; lint ve JavaScript syntax kontrolleri geçti. Bu tur gerçek yönetici parolasıyla tarayıcı girişi ve yeni istemci temizliğinin tam uçtan uca testi yapılmadı; parola okunmadı.

## Sekiz yeni ilan

Kaynak: Muhammet_Yusuf_8_Yeni_Ilan_Listesi.txt. Kullanıcı bu dosyaya göre güncelleme istedi. Dosya belge doğrulamasını yayın öncesi şart koştuğu için sekiz kayıt merkezi veritabanına taslak ve publicationApproved=false olarak eklendi. Önceki kayıt silinmedi. İşlem revizyon korumalı te_change ile yapıldı; revizyon 6 oldu. Tekrar aktarım aynı kimlikleri çoğaltmaz.

- Düğüncübaşı 0/1223 — 534 m² — 500.000 TL
- Emirali 0/2482 — 330 m² — 300.000 TL
- İğneler 153/46 — 850 m² — 800.000 TL
- İğneler 132/259 — 1.370 m² — 1.200.000 TL
- Beyazköy 193/20 — 730 m² — 550.000 TL
- Beyazköy 239/19 — 130 m² — 100.000 TL
- Beyazköy 239/24 — 150 m² — 100.000 TL
- Beyazköy 239/26 — 140 m² — 105.000 TL

TARLA bilgisi açıklamaya kaynak beyanı olarak işlendi; tek/paylı mülkiyet türü yerine yazılmadı. Firma/ortak etiketi veya filtresi eklenmedi. Yeni taslaklar halka açık API'de görünmüyor. Fotoğraf veya koordinat uydurulmadı.

## Yedek, yayın ve kalan işler

Aktarım öncesi ve sonrası şifreli uygulama yedeği alındı; son yedek 9 kayıt, 6 snapshot ve 3 fotoğraf nesnesiyle çözülüp doğrulandı. Anahtar ve yedek özel yerel klasörde; bunlar tam Supabase Auth/DB kurtarma yedeğinin yerine geçmez.

Güvenlik düzeltmeleri canlıya alındı: dpl_544pQa2vMRLAnvhGEtP79TFDXNzL. Ücretli işlem yapılmadı. Bu tur GitHub'a push yapılmadı.

Kalanlar:

1. Panel girişinde MFA/iki aşamalı doğrulama yok. Supabase hesabındaki MFA'yı açmak tek başına uygulama girişini MFA korumalı yapmaz; uygulamaya ayrı akış gerekir.
2. Supabase parola sıfırlama/hesap engellemenin mevcut özel oturumları anında iptal etmesi bu incelemede doğrulanmadı. Mevcut oturumun sunucu üst sınırı bir saattir; acil yetki kaldırmada yönetici izin listesinden çıkarma veya uygulama oturumlarını iptal etme kullanılmalıdır.
3. Sekiz taslağın belge, pay ve güncel fiyat kontrolleri; gerçek fotoğrafları ve varsa kesin koordinatları tamamlanmalıdır.
4. Eski 18 kaynak kaydın panel yönetimine taşınması henüz yapılmadı. 26 ilanın tamamının ziyaretçiye görünmesi için taslaklar doğrulanıp yayınlanmalıdır.
5. Bağımsız penetrasyon testi, yük testi, sürekli güvenlik alarmı ve tam Auth/DB felaket kurtarma testi yapılmadı. Barındırma hesabının parola/MFA ayarları incelenmedi.

Oturum incelemesi için başvurulan kaynak: [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
