# Yerel portföy yönetimi

Bu panel tek yöneticiyle, yalnız kendi bilgisayarınızda kullanılır. Çok kullanıcılı veya internete açılabilir bir yönetim sistemi değildir.

1. Proje klasöründe bir kez `npm run admin:setup` çalıştırın. En az 12 karakterli kendi parolanızı iki kez girin; yazarken görünmez. Parola paylaşmayın. Yalnız tuzlanmış scrypt özeti `.private/admin-auth.json` dosyasına kaydedilir. Mevcut hesap üzerine yazılmaz.
2. `npm run admin` komutuyla başlatın; `http://127.0.0.1:4180` adresini açıp giriş yapın. Terminal açık kalmalıdır. Site önizlemesi ayrı olarak `npm start` ile 4175 portunda çalışır.
3. Yeni portföy ekleyin; bilinmeyen fiyat/alanı boş bırakın. Bilginin kaynağı ve tarihi yoksa doğrulanmış seçmeyin. İşletmenin yayın izni kutusu işaretlenmeden kaydedilmez. Kayıt numarası oluşturulduktan sonra değiştirilemez.
4. Kullanım izni olan fotoğrafı önce `src/assets` içine koyun; dosya yolunu ve görsel açıklamasını girin. Panelden dosya yükleme henüz yoktur. Kaynak bilgileri ziyaretçilere açıktır; özel belge veya kişisel not yazmayın.
5. Kaydetmek `content/listings.json` dosyasını günceller. Gerçek kayıtlar demo önizlemesine eklenmez. Bunlarla site hazırlamak için `npm run build`, ardından `npm run release:check` çalıştırın. Üretilen dosyalar canlıya otomatik gönderilmez.
6. Düzenle/kaldır işlemlerinden önce önceki sürüm otomatik yedeklenir. Yedek listesinden tarih seçip panel içindeki onayı vererek geri yükleyebilirsiniz; mevcut sürüm de korunur. Eş zamanlı eski sürümden kaydetme reddedilir; sayfayı yenileyin.
7. JSON dışa aktar ile içerik kopyası alın. İş bitince Çıkış yap düğmesini kullanın; oturum en fazla 1 saat sürer. Beş hatalı giriş sonrası 10 dakika beklenir.

`.private/backups` içerik yedeklerini, `.private/history.jsonl` değişiklik hazırlığı kayıtlarını tutar. Hazırlık kaydı, tek başına yazmanın tamamlandığının kanıtı değildir; güncel içerikle karşılaştırılmalıdır. Yedekler aynı disktedir: disk kaybına karşı ayrıca sizin seçtiğiniz güvenli bir yerde kopya saklanmalıdır. `.private` klasörünü, kaynak ZIP'ini veya paneli web köküne yüklemeyin. Windows dosya erişim izinleri kullanıcı hesabınıza bağlıdır; paylaşılan bilgisayarda ayrı işletim sistemi hesabı kullanın.

Parolayı unuttuğunuzda otomatik sıfırlama yoktur. Giriş yapılandırmasını değiştirmeden önce `.private` ve içerik dosyalarını güvenli şekilde yedekleyin; mevcut parolayı/özeti sohbetten paylaşmayın.

Bu aşamada müşteri talebi, telefon kaydı veya e-posta verisi saklanmaz. Gerçek talep servisi, hosting ve veri saklama/hukuki kararlar tamamlandıktan sonra ayrı kurulacaktır.
