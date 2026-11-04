# Panel genişletmesi — ilk düzeltme ve kabul sınırı

İstenen nihai kabul: ilan oluştur → çoklu fotoğraf/kapak/sıra → önizle → yayımla → ziyaretçi sitesinde gör → düzenle → yayından kaldır. Taslaklar görünmez; demo işareti ayrı kalır. Yönetici/editör yetkileri sunucuda denetlenir.

## Bu adımda yapılan

- Yerel panelin boş listesine doğrudan Portföy ekle düğmesi eklendi.
- Yeni ilan numarası otomatik oluşturulur. Tapu türü varsayılan olarak Müstakil kabul edilmez; Bilgi sağlanmadı olur.
- Yerel panelin Siteyi önizle ekranı kayıtları üç saniyede bir aynı sunucudan okur. Bu ekran yalnız giriş yapmış yöneticiye açıktır. İnternetteki Vercel sitesiyle bağlantı değildir.
- 4 admin ve 4 yerel HTTP kontrolü geçti; lint/syntax geçti.

## Henüz bitmeyen kapsam

Mevcut yerel panel JSON dosyasına yazar; gerçek veritabanı değildir. Taslak/durumlar, demo işareti, çoklu medya, rol tabanlı kullanıcılar, site içerik/iletişim düzenleme ve kalıcı çevrim içi eşitleme bu yerel düzeltmede tamamlanmadı. Mevcut online panel kodunun gerçek Supabase bağlantısı halen kurulmamıştır. Gerçek entegrasyon olmadan yayımlandı/sitede görünüyor denmemeli.

## Uygulama sırası

1. Yeni ilan sihirbazı ve boş durumdan ekleme; bilinmeyen alanların güvenli yönetimi.
2. Kalıcı veritabanı ve yetkili kullanıcılar. Mevcut tek yönetici parolasına müdahale edilmeden geçiş.
3. Taslak/aktif/rezerve/satıldı/arşiv ve ayrı demo işareti; yalnız izinli yayınların ziyaretçi API'sine çıkması.
4. Çoklu fotoğraf, kapak, sürükleme ve klavye sırası; boyut/decode ve özel depolama. Video için depolama/limit ayrıca belirlenir.
5. Aynı veri kaynağına bağlı site; yayınla/düzenle/kaldır testleri ve kalıcılık.
6. Site metinleri, iletişim, konum gizlilik seviyesi, kullanıcı/editör yetkileri; form varsa gerçek talep kaydı.
7. Gerçek DB+görsel yedeği ve geri dönüş; işlem geçmişi; hata/çakışma/erişilebilirlik kontrolleri.

Gerekli karar: önce bu bilgisayarda çalışan tam sürüm mü, mevcut Vercel/Supabase üzerinden internet sürümü mü? İkinci seçenekte kullanıcıya ait gerçek hesap bağlantısı gereklidir. Hesap kurulumu veya üretim yayını yapılmadı.
