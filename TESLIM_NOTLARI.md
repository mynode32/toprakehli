# Toprak Ehli — Teslim ve kullanım

31 Ekim 2026. Bu teslim, müşteriye sunulabilen yerel demo, yüklemeye hazır statik iletişim sitesi ve tek yönetici için yerel portföy panelidir. Altı fazın tamamlandığı veya üretimde talep/yönetim sistemi bulunduğu anlamına gelmez.

## Açma

Node.js kurulu Windows bilgisayarda `ONIZLEMEYI_BASLAT.cmd` dosyasını açın, ardından tarayıcıda `http://127.0.0.1:4175` adresine gidin. Terminal açık kalmalıdır. Alternatif: proje klasöründe `npm start`. Paket indirme gerekmez. Port doluysa yeni sunucu açmak yerine çalışan önizlemeyi kullanın veya `PORT` ortam değişkeniyle başka yerel port seçin.

## Çalışan özellikler

- Türkçe konum/kayıt araması, bölge/tapu/fiyat/alan filtreleri ve fiyat/alan sıralaması.
- Üçlü karşılaştırma, eksik bilgi ve alan bazında kaynak/kontrol tarihi gösterimi.
- İlan detayında kopyalanabilir paylaşım bağlantısı; doğrudan bu bağlantıyı açınca detay görünür. Önizlemedeki localhost bağlantıları başka bilgisayarlara erişim sağlamaz; yayınlandıktan sonra gerçek domaini kullanır.
- Telefon, WhatsApp ve e-posta bağlantıları. İlanla ilişkili mesaj kullanıcı tarafından gönderilir; site mesaj teslim edildi iddiasında bulunmaz.
- Telefon/tablet/masaüstü düzeni, klavye odağı, JavaScript kapalıyken temel telefon ve e-posta erişimi.

## Demo ve gerçek içerik

Önizlemede dört demo kayıt ve özgün referanstan alınmış örnek görseller vardır. Bunlar gerçek parsel fotoğrafları değildir; etiketleri kaldırılmamalıdır. Fotoğraf ve domainin daha sonra sağlanması kullanıcı tarafından kararlaştırıldı.

Yayın kayıtları `content/listings.json` dosyasından hazırlanır; şu an liste boştur. Kayıt şablonu aşağıdadır; değerleri yalnız işletmenin sağladığı gerçek bilgilerle doldurun. Bilinmeyen fiyat/alan `null`, kaynak/tarih `null` bırakılır. `publicationApproved: true` yalnız işletme yayın izni verdiğinde eklenir. Kaynak alanları ziyaretçilere açıktır; kişisel belge veya özel not yazmayın.

```json
{
  "id": "ilan-001",
  "region": "İşletmenin verdiği bölge",
  "local": "İşletmenin verdiği mahalle",
  "type": "Müstakil",
  "price": null,
  "area": null,
  "isDemo": false,
  "publicationApproved": true,
  "evidence": {
    "type": { "status": "unverified", "source": null, "checkedAt": null }
  }
}
```

Fotoğraf eklemek için izinli dosyayı `src/assets/` içine koyup `image: "src/assets/ilan-001.webp"` ve anlamlı `imageAlt` alanını ekleyin. JPG/PNG de desteklenir. Demo görselleri gerçek ilana bağlamayın. Gerçek zorunlu alanlar ve doğrulama eskime süresi işletmeyle ayrıca belirlenecek.

## Paket hazırlama ve yayın

1. `npm test`, `npm run check`, `npm run build`, `npm run release:check` komutlarını çalıştırın.
2. Yeni paket `releases/site-.../` altında oluşur. Son paket yolu `releases/latest.json` dosyasındadır. Önceki paketler silinmez. Demo kayıtları yayın paketine alınmaz.
3. Yalnız bu paket klasörünün içeriğini statik hostingin web köküne yükleyin. Kaynak ZIP'i, `.git`, `docs`, `content`, `tests`, `scripts` veya herhangi bir gizli dosyayı web köküne yüklemeyin.
4. Domain/HTTPS ve güvenlik başlıklarını hostingde ayarlayın. `_headers` yalnız bu biçimi destekleyen hostinglerde uygulanır; diğer sağlayıcılarda aynı kurallar panelden konulmalıdır. HTTPS olmadan üretim kabulü yapılmaz.
5. Gerçek domain üzerinde mobil görünüm, telefon/e-posta/WhatsApp, görseller, paylaşım ve 404 sayfasını test edin. Mesajın işletmeye ulaştığını işletme doğrulamalıdır.
6. Arama motoru görünürlüğü bu teslimde kapalıdır (`noindex`, `robots.txt`). Domain, gerçek içerik ve son yayın onayı sonrası bu kuralları kaldırıp gerçek domainle canonical/sitemap hazırlayın.

Örnek fotoğraflı sunum paketi için `npm run build:demo`; yol `releases/latest-demo.json` dosyasına yazılır. Bu paket açık demo etiketleriyle dört temsili kayıt içerir. Kontrolü: `node scripts/verify-release.mjs --demo`. Demo ZIP'i gerçek ilanlarla hazırlanmış yayın paketiyle karıştırmayın.

## Kalan kapsam

Yerel tek yönetici paneli, içerik yedeği ve geri yükleme hazırdır; kullanım: `docs/ADMIN_GUIDE.md`. İlk kullanımda `npm run admin:setup` ile kendi parolanızı oluşturun, sonra `npm run admin` çalıştırın. Bu panel 4180 portunda yalnız yerelde çalışır; canlıya açılmamalıdır.

Sunucuda müşteri talep formu, üretim yönetimi/çok kullanıcılı roller, dosya yükleme, tam audit sistemi, uzak yedek ve izleme henüz uygulanmadı. Bunlar hosting/backend, yetkiler, gerekli form alanları, veri saklama/silme süresi ve işletmenin onaylı hukuki metinleri belirlenince yapılacak. Bu kararlar olmadan kişisel veri toplayan bir form açılmadı. Site şu an iletişim bağlantılarıyla kullanılabilir.

## Geri dönüş

Önceki Git kaydı `dee8741`. Yayında sorun olursa önceki kabul edilmiş paket klasörüne dönün. Veri silme veya taşıma bu teslimde yok. Referans HTML korunmuştur.
