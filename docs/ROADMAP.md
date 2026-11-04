# Toprak Ehli — 6 fazlı teslim planı

Her faz küçük görevlerle ilerler. Bir fazın başarısız kontrolü çözülmeden sonraki özelliklere geçilmez. Yayın ayrı onay kapısıdır.

31 Ekim teslim durumu: Faz 1 temel kabulü ve Faz 2 demo kapsamı tamamlandı. Faz 3 iletişim bağlantıları çalışır; sunucu kayıt sistemi yok. Faz 4 yerel tek yönetici paneli, içerik yedeği/geri yükleme tamamlandı; üretim rolleri, yükleme ve tam audit henüz yok (ADMIN_REPORT.md). Faz 5 gerçek fotoğraf ve ilanlar kullanıcı kararıyla sonraya bırakıldı. Faz 6 yerel test ve paketleme yapıldı; hosting/domain, gerçek ortam kabulü ve yayın sonraya bırakıldı. Son kapsam ve kanıtlar: `DELIVERY_REPORT.md`.

| Faz | Teslim | Kabul / test | Dosya alanları | Geri dönüş |
|---|---|---|---|---|
| 1 — Temel site | Modüler, mobil uyumlu ana sayfa; demo portföy, filtre, ilan detayı; güvenli DOM üretimi | Filtre sınırları ve hesap testleri; sözdizimi kontrolü; tarayıcı/klavye kontrolü | `index.html`, `src/`, `tests/`, `scripts/`, `package.json` | Yeni dosyaları kaldır; referans korunur |
| 2 — İlan güveni ve karşılaştırma | Alan bazlı kaynak/tarih/durum modeli; eksik bilgi görünümü; karşılaştırma | Eksik/sıfır/geçersiz fiyat-alan; doğrulama rozetleri; mobil karşılaştırma | `src/data/`, `src/domain/`, `src/ui/`, `tests/` | İlgili faz diff'ini geri al |
| 3 — Gerçek talep | Onaylı iletişim bilgileri; ilanla bağlı sunucu kaydı; spam ve tekrar gönderim kontrolü | Hatalı istek reddi; başarısız kayıt başarı sayılmaz; test talebi ekibe ulaşır | Backend seçildikten sonra kesin yollar mini-planda belirlenir | Uç noktayı kapat; veri silmeden önceki sürüme dön |
| 4 — Yönetim ve kayıtlar | Rol/yetki, ilan yönetimi, doğrulama geçmişi; kararlaştırılırsa favori/not | Kullanıcılar arası erişim reddi; audit log; güvenli dosya yükleme | Kimlik/veri altyapısı kararından sonra belirlenir | Geriye uyumlu şema ve önceki uygulama sürümü |
| 5 — Gerçek portföy ve içerik | İşletmenin izinli kayıtları/fotoğrafları; kaynak ve güncellik; gerekli izinli entegrasyonlar | Eksik veri gizlenmez; demo ayrımı; kaynak ve kullanım izinleri | Veri adaptörleri, içerik ve doğrulama testleri | Önceki veri sürümü; geri alınabilir yayın durumları |
| 6 — Üretim kabulü | Staging, E2E, güvenlik, erişilebilirlik, performans, izleme, yedek/geri yükleme ve yayın | Kritik akışlar geçer; geri yükleme denenir; hukuk/işletme onayı ve açık yayın izni | CI/hosting/operasyon belgeleri; teknolojiye göre netleştirilir | Test edilmiş önceki sürüm ve yedek |

## Karar kapıları

- Faz 1: Mevcut örneğin toprak/yeşil yönü kullanılır; yeni marka paleti dayatılmaz. Veriler açıkça temsili tutulur.
- Faz 2: Gerçek zorunlu alanlar ve doğrulama eskime süresi işletmeyle belirlenir; kendiliğinden süre atanmaz.
- Faz 3: Telefon/WhatsApp/e-posta, veri saklama ve hukuki metinler işletme tarafından sağlanır/onaylanır. Backend/hosting seçimi önce maliyet ve yetkiyle netleştirilir.
- Faz 4: Hesap, roller ve notların kapsamı onaylanır.
- Faz 5: Resmi veri erişimi varsayılmaz; gerekmeyen entegrasyon yapılmaz.
- Faz 6: Üretim erişimi ve yayın açık onay gerektirir.

## Faz 1 mini-plan

Amaç: Yeni yerel uygulamada demo keşif akışını kurmak. Referans yeniden yazılmaz. Bağımlılık, backend, gerçek veri, migration veya yayın yok. Güvenlik: veriler `textContent` ile gösterilir; script HTML birleştirmez. Yerel testler Node yerleşik test aracıyla çalışır. Tarayıcı bağlantısı yoksa görsel/klavye sonuçları BLOCKED kaydedilir ve faz tam kabul edilmez.
