# Faz 3 — İletişim ve gerçek talep

Durum: Hazırlık. İletişim bilgileri ve altyapı henüz belirlenmedi; gerçek talep toplama kapalı.

## Küçük teslimler

1. İşletmenin sağladığı telefon/WhatsApp/e-posta ile gerçek iletişim bağlantıları. İlan detayından açılan mesajda kayıt adı ve kimliği bulunur; gönderimi kullanıcı yapar. Bağlantıya basmak teslim edilmiş talep sayılmaz.
2. Backend/hosting, maliyet ve yetki netleşince sunucuda kalıcı talep kaydı. Kesin dosya ve veri şeması bu karardan sonra belirlenir.
3. İlan kimliği ve giriş doğrulama; spam/tekrar gönderim kontrolü; yükleniyor, hata ve kayıt başarı durumları. Başarı ancak kalıcı kayıt doğrulanınca gösterilir.
4. İşletmeye ulaşan test talebiyle uçtan uca kabul; mobil ve klavye regresyonu. Yayın ayrı onay gerektirir.

## Gerekli bilgiler

- Kullanılacak telefon/WhatsApp ve e-posta; mevcut hosting/backend hesabı varsa sağlayıcı adı. Parola veya anahtar sohbetten istenmez.
- Formda toplanacak gerekli alanlar, talepleri görecek kişiler, saklama/silme süresi ve işletmenin onaylı aydınlatma metni.
- Gerçek portföyler hazır değilken demo kayıtlarından gelen başvuruların nasıl ele alınacağı. Demo kayıtları gerçek satış ilanı gibi sunulmaz.

## Kabul ve geri dönüş

Geçersiz ilan/veri reddedilir; başarısız kayıt başarı göstermez; tekrar gönderim çift kayıt oluşturmaz; kayıt yetkisiz kişilere açılmaz. Sonuçlar gerçek servis üzerinde doğrulanmadan tamamlandı sayılmaz.

İlk teslim yalnız iletişim bağlantıları olabilir; form/veri saklama bunun tamamlanması için zorunlu değildir. Altyapı belirlenmeden yeni bağımlılık veya ücretli servis eklenmez. Başlangıç kayıt noktası: `48c9fff`.
