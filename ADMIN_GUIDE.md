# Çevrim içi yönetim kılavuzu

Kurulumdan sonra `/admin/` adresine Supabase'de yetkilendirilmiş e-posta ve kendi parolanızla girin. Yerel panel ayrı sistemdir. İnternet sürümü Supabase kurulmadan giriş kabul etmez.

Sitede görünen 26 kaynak portföy, Supabase'de yayımlanmış kayıt değildir. Panelde **Kaynak portföyleri taslağa al** düğmesi bunları mevcut kayıtların üzerine yazmadan taslak olarak içeri alır. Gerçek fotoğraf, tapu/fiyat/alan kontrolü ve işletme yayın onayı otomatik eklenmez. Taslak hazırlarken kaynak kartları sitede görünür; kayıt yayımlandığında aynı kimlikli kaynak kartının yerini alır. Yayından kaldırılan veya arşivlenen yönetilen kayıt kaynak kartı olarak yeniden görünmez.

1. Yeni portföy → temel bilgileri yazın. Gerçekte bilinmeyen fiyat/alan boş bırakılabilir; tahmin girmeyin.
2. İsterseniz şehir/ilçe/mahalle, açıklama ve kategori ekleyin. Kalıcı kayıt numarası otomatik üretilir.
3. Fotoğrafları ekleyin; dosya başına 3 MB, en fazla 12. Açıklamaları düzeltin; Kapak yap / Önce / Sonra ile sırayı ayarlayın. Fotoğraf yüklemek ilanı yayımlamaz.
4. Kaynaklar bölümünde yalnız gerçek kaynağı ve kontrol tarihini girin. Kaynak alanları kamuya açık olduğundan özel belge veya not yazmayın.
5. Durum Taslak ise yalnız yönetici görür. Yayında/satıldı için işletmenin yayın onayını işaretleyin ve kaydetme onayını verin. Satıldı durumu halka açık kalır.
6. Yayından kaldır → Taslak. Arşivle → listede kalıcı kimliği korunarak pasif. Fiziksel ilan silme yoktur.
7. Taslağı önizle panel içi pencerede gösterir; anonim kullanıcıya taslak bağlantısı açılmaz.
8. Kaydedilmemiş ilan formuyla sayfayı kapatırken uyarı çıkar. Eşzamanlı değişiklikte 409 uyarısını atlamayın; formunuzu başka yere not alıp güncel kaydı yeniden açın. Liste yenilemek eski form revizyonunu geçerli hale getirmez.
9. JSON dışa aktarma portföy içeriği içindir; tam DB veya fotoğraf yedeği değildir. Yedeklerden önceki portföy sürümüne dönebilirsiniz; mevcut sürüm de saklanır. Sonradan oluşturulan kayıtlar arşivlenir.
10. Talepler ekranından müşteri iletişimini inceleyin, durumunu ve özel yönetici notunu güncelleyin. Form işletme onaylı aydınlatma ayarları olmadan açılmaz. E-posta bildirimi gönderilmez.
11. İşlem geçmişinde kayıt/geri alma/talep işlemlerini inceleyin. Fotoğraf bakımında yalnız hiçbir ilanda/yedekte bulunmayan dosyalar temizlenebilir. Yedekte kullanılan fotoğrafın silinememesi beklenen korumadır.
12. Çıkış yapın. Oturum en fazla bir saat; yeniden giriş gerekir. Paylaşılan bilgisayarda kişisel verilerin bulunduğu JSON veya ekran görüntülerini bırakmayın.

Sayfa yenilendiğinde güncel yayınları okur. Açık site sekmeleri en geç 30 saniyelik kontrolle ve sekmeye dönüşte güncellenir. Bu yayına almak için tekrar deploy gerektirmez.
