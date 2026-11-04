# Toprak Ehli — Başlangıç teknik denetimi

Tarih: 31 Ekim 2026 · Kapsam: Aşama 0, yalnızca keşif ve rapor.

## Yönetici özeti

İlk incelemede çalışma klasörü boş bulundu. Kaynak kod, `toprak_ehli_demo.html`, `AGENTS.md`, `CODEX_PROJECT_RULES.md`, PDF kuralları ve Git deposu mevcut değil. Bu nedenle uygulama denetimi **kısmi**, uygulamaya ilişkin doğrulamalar **bloklanmış** durumdadır. Bu belge bir kaynak kod güvenlik denetimi veya ürün kabulü değildir.

Kullanıcının mesajındaki v2.0 proje talimatları esas alındı. Mesajda anlatılan demo davranışları dosyadan veya tarayıcıdan doğrulanmadı. Hiçbir uygulama dosyası oluşturulmadı; bağımlılık kurulmadı, migration, commit veya yayın yapılmadı. Tek teslimat bu rapordur.

## İncelenen ortam ve erişilemeyen alanlar

- Çalışma dizini: `C:\Users\mtari\OneDrive\Masaüstü\TOPRAK EHLİ`.
- PowerShell üzerinden gizli dosyalar dahil kök ve özyinelemeli dosya envanteri alındı; rapor oluşturulmadan önce sonuç boştu.
- `.git` mevcut değil. Branch, son commit ve kullanıcı değişiklikleri Git üzerinden belirlenemedi.
- `git` komutu PATH içinde bulunamadı; `C:\Program Files\Git\cmd\git.exe` de bulunamadı. Diğer konumlarda kurulum bulunmadığı iddia edilmiyor.
- `rg`, `node` ve `npm` komutları bulundu. Sürümleri ve uygulamayla uyumlulukları incelenmedi; uygulama manifesti yok.
- Yerel uygulama, staging, üretim, CI, veritabanı, secret yönetimi ve deployment kayıtları incelenemedi. Yayın URL'si veya bağlantı bilgisi sağlanmadı; üretim erişimi denenmedi.

## Mevcut mimari ve dosya haritası

İnceleme başlangıcında dosya yoktu. Rapor sonrası eklenen tek dosya `docs/BASELINE_AUDIT.md` olacaktır.

Frontend, backend, framework ve sürümleri, paket yöneticisi, API, veri erişimi, kimlik doğrulama, depolama ve üçüncü taraf servisler **belirlenemedi**. README, environment örneği, paket manifesti, kilit dosyası, test ve CI yapılandırması bulunamadı. Dizin boşluğu, başka bir konumda uygulama bulunmadığı anlamına gelmez.

## Mevcut özellikler / demo ile gerçek özellik ayrımı

| Kullanıcı mesajında anlatılan davranış | Yerel kanıt | Sonuç |
|---|---|---|
| Ana sayfa bölümleri, portföy listesi ve filtreler | Demo/kaynak yok | Doğrulanamadı |
| İlan, iletişim ve rehber modalları | Demo/kaynak yok | Doğrulanamadı |
| Kurallı portföy eşleştirme önizlemesi | Demo/kaynak yok | Doğrulanamadı; AI olduğu iddia edilmez |
| Mobil menü ve Escape ile kapatma | Demo/kaynak yok | Doğrulanamadı |
| Temsili kayıtlar ve görseller | Demo/kaynak yok | Doğrulanamadı |
| Gerçek talep, karşılaştırma, notlar, doğrulama ve yönetim | Kaynak/backend yok | Varlığı veya yokluğu doğrulanamadı |

Akışların dosya/modül haritası çıkarılamadı. Kullanıcı mesajındaki özellik anlatımı çalışan ürün kanıtı kabul edilmedi.

## Kaynak kod–yayın uyumu

**Doğrulanamadı.** Kaynak, commit kimliği, deployment kaydı, build çıktısı ve yayın adresi yok. Ortam değişkenleri ve canlı davranış karşılaştırılmadı. Sonraki incelemede gizli değerler raporlanmadan yapılandırma isimleri, commit/build kimlikleri ve yetkilendirilmiş ortam karşılaştırılmalıdır. Üretim erişimi ayrıca açık onay gerektirir.

## Test envanteri ve gerçek test sonuçları

| Komut / kontrol | Çalıştırıldı mı? | Sonuç | Kanıt / neden |
|---|---|---|---|
| `git status --short` | Evet | BLOCKED | Git komutu bulunamadı |
| `git branch --show-current` | Evet | BLOCKED | Git komutu bulunamadı |
| `git log -1 --format="%h %s"` | Evet | BLOCKED | Git komutu bulunamadı |
| `Get-ChildItem -Force` | Evet | PASS | Başlangıç kök envanteri boş |
| `Get-ChildItem -LiteralPath . -Force -Recurse` | Evet | PASS | Başlangıç özyinelemeli envanteri boş |
| `Test-Path -LiteralPath .git` | Evet | PASS | Sonuç `False`; depo bulunmadığını doğruladı |
| `rg --files` (hedef dosya globlarıyla) | Evet | PASS | Eşleşme yok, çıkış kodu 1; test hatası değildir |
| Lint / typecheck / unit / integration / build | Hayır | NOT RUN | Kaynak, manifest ve tanımlı komut yok |
| E2E / güvenlik / erişilebilirlik / performans | Hayır | NOT RUN | Çalıştırılabilir uygulama ve test altyapısı yok |
| Mobil/tablet/desktop, console ve network | Hayır | NOT RUN | Uygulama yok; tarayıcı incelemesi yapılamadı |
| Bağımlılık güvenlik taraması | Hayır | NOT RUN | Manifest/kilit dosyası yok; paket veya güvenlik uyarısı tespit edilemedi |

PASS yalnızca ilgili envanter kontrolünü ifade eder; uygulama testlerinin geçtiği anlamına gelmez. Bilinen zafiyet bulunmadığı veya ürünün güvenli olduğu sonucu çıkarılamaz.

## Kritik/yüksek/orta/düşük bulgular

| Kimlik | Seviye | Bulgu ve kanıt | Etki / işlem |
|---|---|---|---|
| B-01 | Yüksek — denetim engeli | Çalışma dizininde kaynak ve demo yok; iki dosya envanteri boş | Mimari, veri doğruluğu ve kritik akışlar denetlenemiyor. Geliştirme öncesinde doğru proje sağlanmalı |
| B-02 | Orta — izlenebilirlik | `.git` yok; Git komutu erişilemiyor | Branch/commit ve geri dönüş noktası belirlenemiyor. Mevcut depo konumu ve Git erişimi netleştirilmeli |
| B-03 | Orta — yayın kanıtı | Deployment bilgisi sağlanmadı | Kaynak–yayın uyumu belirsiz. Yetkili ortam ve build/commit kanıtı gerekli |
| B-04 | Düşük — belge sürekliliği | Yerel kural dosyaları ve referans PDF yok | Bu oturumda mesaj uygulanıyor; sonraki oturumlar için onaylı kuralların dosyada saklanması önerilir |

Doğrulanmış kritik güvenlik açığı yoktur; bu, kritik açık bulunmadığı anlamına gelmez. Yüksek sınıf B-01 bir uygulama zafiyeti değil, denetimi engelleyen eksikliktir. Doğrulanmış ürün hatası veya başarısız uygulama testi raporlanamaz.

## Teknik borç

Kaynak tabanlı teknik borç ölçülemedi. Kullanıcı mesajındaki tek HTML, gömülü veri ve `innerHTML` kullanımı, dosya sağlanınca incelenecek hipotezlerdir; mevcut kaynak hakkında doğrulanmış bulgu değildir. Modülerleştirme veya framework seçimi bu aşamada yapılmamalıdır.

## Güvenlik değerlendirmesi

Secret sızıntısı, XSS, CSRF, IDOR, oturum güvenliği, yetkilendirme, API doğrulaması, dosya yükleme ve rate limit kontrolleri kaynak veya çalışan ortam olmadığı için değerlendirilmedi. Gerçek kişisel veri işlenmedi; harici servis çağrısı yapılmadı. KVKK metinleri ve hukuki uygunluk değerlendirilmedi.

Sonraki denetimde gerçek girdilerin HTML üretimine akışı, sunucu tarafı erişim kontrolleri, secret sınırları ve kişisel veri yaşam döngüsü kanıtlarla incelenmeli. Hassas değerler rapora veya çıktılara alınmamalı.

## Mimari riskler

Kaynak olmadan teknoloji seçmek, yeni bir depo başlatmak veya temel demoyu yeniden üretmek yanlış temel oluşturabilir. Mevcut sistem tespit edilmeden klasör şablonu, bağımlılık, veri şeması veya deployment önerisi kesinleştirilmeyecek.

## Ürün/veri kalitesi açıkları

İlan kaynağı, doğrulama tarihi, demo ayrımı, fiyat/alan hesapları ve talebin gerçekten iletildiği doğrulanamadı. Bunlar doğrulanmış eksik özellikler değil, açık denetim konularıdır. Gerçek ilan, iletişim bilgisi, doğrulama politikası veya hukuki metin uydurulmamalı.

## Önceliklendirilmiş geliştirme yol haritası

Bu tablo önce Aşama 0'ı tamamlar. Uygulama dosya yolları bilinmediğinden sonraki aşamalar için hayali dosya listeleri oluşturulmadı. Her uygulama görevi kaynak sağlandıktan sonra gerçek dosya yollarıyla mini-plana dönüştürülüp onaya sunulmalıdır.

| Sıra / görev | Değişecek dosyalar | Beklenen sonuç | Test yöntemi / kabul kriteri | Geri dönüş |
|---|---|---|---|---|
| 0.1 Doğru proje ve referansları belirle | Kod değişmez; bu raporda envanter güncellenir | Kaynak, demo ve kuralların gerçek konumu belli | Gizli dosyalar dahil envanter; giriş noktası ve referans dosya okunabilir | Yalnız rapor ekini geri al |
| 0.2 Git temelini doğrula | Kod/Git geçmişi değişmez; rapor güncellenir | Branch, HEAD ve çalışma ağacı kaydedilir | Git salt okunur komutları; mevcut değişikliklerin sahipliği korunur | Rapor ekini geri al |
| 0.3 Mimari ve akış haritası çıkar | Yalnız rapor | Her akış gerçek dosya/modülle eşleşir | Kaynak incelemesi; demo/ürün farkları kanıtlı | Rapor ekini geri al |
| 0.4 Yerel temel akışları gözle | Yalnız rapor; ekran kaydı gerekiyorsa ayrıca belgelenecek | Demo açılır; filtre, modal, menü ve boş durumlar gözlenir | Önce mevcut çalıştırma komutu incelenir; masaüstü/mobil ve klavye sonuçları kayıtlı | Yerel süreç kapatılır; kaynak değişmez |
| 0.5 Kalite ve bağımlılık envanteri | Yalnız rapor | Gerçek lint/typecheck/test/build komut ve sonuçları kaydedilir | Mevcut betikler önce okunur; güvenli yerel kontroller çalıştırılır; tarama erişimi yoksa BLOCKED | Kaynak/kilit dosyası değişmez; üretilen çıktılar ayrıca kaydedilir |
| 0.6 Güvenlik ve veri akışını incele | Yalnız rapor | Kanıtlı riskler ve uygulanabilir küçük düzeltme görevleri | Girdi–çıktı ve erişim akışları; gerçek veri kullanılmadan uygun kontroller | Rapor ekini geri al |
| 0.7 Yayın eşleştirmesini incele | Yalnız rapor | Commit/build/ortam ilişkisi belirlenir veya engel kaydı oluşturulur | İzinli staging/deployment kanıtı; üretime erişim için ayrı açık onay | Uzak ortamda değişiklik yapılmaz |
| 0.8 Nihai baseline ve görev planını onaya sun | `docs/BASELINE_AUDIT.md` | Her uygulama görevi gerçek dosya, test, kabul ve geri dönüş içerir | Bulgular kaynak kanıtlarıyla tutarlı; belirsizlikler işaretli | Rapor revizyonunu geri al |

### Sonraki ürün aşamaları — henüz uygulama onayı yok

Kullanıcının 1–8 sırası korunur: kalite altyapısı → ilan veri standardı → detay/karşılaştırma → gerçek talep → notlar/kayıtlar → yönetim → veri entegrasyonları → üretim hazırlığı. Kaynak incelemesi tamamlanmadan bu aşamaların süresi, teknolojisi, kesin dosyaları ve uygulanabilirliği belirlenemez.

İlk uygulama görevi, tamamlanmış baseline bulgularına göre küçük seçilmelidir. Her görev; kapsam, mevcut davranış, kesin dosyalar, veri/güvenlik etkisi, test, kabul ve geri dönüş planı içerir. Veri doğrulama süreleri, iletişim kanalları, kişisel veri politikaları, palet ve yayın kararları ürün sahibinin onayını gerektirir. Kritik/yüksek güvenlik bulgusu tespit edilirse özelliklerden önce ele alınır.

## Açık sorular ve karar bekleyen konular

1. Mevcut kaynak depo ve `toprak_ehli_demo.html` hangi konumda? Bu çalışma klasörüne henüz aktarılmadı mı?
2. Onaylı `AGENTS.md` / `CODEX_PROJECT_RULES.md` ve v1.0 PDF mevcut mu?
3. Git deposu ve erişilebilir Git kurulumu nerede?
4. İncelemeye izinli staging ve deployment/commit kanıtı var mı? Üretim erişimi bu rapor kapsamında talep edilmedi veya kullanılmadı.

## Görev raporu

- Görev: Aşama 0 teknik keşif ve baseline raporu.
- Durum: **Kısmi**; rapor hazır, uygulama denetimi kaynak yokluğu nedeniyle bloklandı.
- Değişen dosyalar: `docs/BASELINE_AUDIT.md` — kanıt, engeller ve devam planı.
- Yapılan değişiklik: Yalnız rapor oluşturuldu.
- Çalıştırılan testler: Yukarıdaki tabloda komut ve sonuçları verildi; uygulama testleri NOT RUN.
- Manuel kontroller: Yerel dosya envanteri ve komut erişimi; görsel kontrol yapılmadı.
- Güvenlik değerlendirmesi: Uygulama güvenliği doğrulanamadı.
- Bilinen sınırlamalar: Kaynak, demo, depo, test altyapısı ve yayın kanıtı yok.
- Kalan riskler: Ürün ve güvenlik davranışları bilinmiyor; güvenli/çalışır kabul edilmemeli.
- Geri dönüş yöntemi: Yalnız bu yeni raporu kaldırmak; uygulama ve Git geçmişi değiştirilmedi. Git tabanlı uygulama rollback'i doğrulanamadı.
- Sonraki önerilen görev: Kaynak ve demo konumu netleştikten sonra 0.1–0.3 ile denetimi tamamlamak.
- Kullanıcı onayı gereken kararlar: Rapor/yol haritası incelemesi ve sonraki kapsam; kaynak sağlanmadan özellik geliştirmeye başlanmayacak.

Bu teslimattan sonra geliştirmeye geçilmez; kullanıcı yönlendirmesi beklenir.

## Ek denetim — kullanıcı tarafından sağlanan demo

31 Ekim 2026 tarihinde kullanıcı `C:\Users\mtari\Downloads\toprak_ehli_demo (1).html` yolunu sağladı. Dosya salt okunur incelendi; taşınmadı, kopyalanmadı veya değiştirilmedi. Yukarıdaki başlangıç envanteri tarihsel kayıttır. **B-01 artık kısmen giderildi:** demo erişilebilir; ayrı uygulama deposu ve backend hâlâ sağlanmadı. B-02–B-04 sürüyor. Demo dosyasının kullanıcı mesajındaki referansla birebir aynı sürüm olduğu doğrulanmadı.

### Temel sürüm ve mimari kanıtı

- Boyut: 424.941 bayt; 70 satır. Uzun satırlarda gömülü görseller bulunuyor.
- SHA-256: `1e4a331a8e8b20bb44ba9d488a67f49a6139e60a5b173ae15a412eb88f742691`.
- Tek HTML içinde CSS, tek inline JavaScript bloğu, inline olay işleyicileri ve base64 WebP görseller var. Harici script etiketi veya HTTP(S) URL'si tespit edilmedi.
- Framework, paket yöneticisi veya build gerektiren bir yapı bu dosyada görülmedi. Backend, API, veritabanı, kimlik doğrulama ve yönetim paneli uygulaması bulunmuyor. Bu sonuç yalnız incelenen HTML içindir.
- `properties`: dört sabit temsili kayıt. Alanları `id`, `region`, `local`, `size`, `price`, `type`, `tag`, `img`. Alan/fiyat çiftleri sırasıyla 2.500 m² / 4.750.000 TL; 1.200 m² / 3.600.000 TL; 5.750 m² / 6.900.000 TL; 3.000 m² / 5.250.000 TL. Dördünün tapu türü Müstakil; Hisseli filtre seçeneği için kayıt yok.
- `renderProperties`: kart ve boş sonuç HTML'si; `filterProperties`: bölge, fiyat üst sınırı, tapu türü, alan alt sınırı; `resetFilters`: dört seçimi sıfırlama.
- `openProperty`: ilan detay modalı; `openModal`: iletişim, asistan ve rehber içeriği; `closeModal`: modalı kapatma; `toggleMenu`: mobil menü; `matchAdvisor`: yalnız bölge ve bütçe eşleştirmesi. Başlangıçta `renderProperties(properties)` çağrılıyor.

### Kaynaktan doğrulanan davranış ve sınırlar

Demo uyarısı sayfanın üstünde ve ilan alanında açıkça mevcut. İletişim içeriği bilgi toplamadığını ve mesaj göndermediğini söylüyor; gerçek form veya gönderim akışı yok. Asistan açıklaması gerçek AI/analiz/yatırım tavsiyesi olmadığını belirtiyor. Vade ve risk seçimleri hesaplamaya katılmıyor; sonuç metninde bu sınırlama açıklanıyor. Rehber kartları aynı kontrol listesi modalını açıyor. Escape ve backdrop tıklaması için modal kapatma kodu var.

Karşılaştırma, not/favori kaydı, dışa aktarma, m² fiyatı hesabı, doğrulama kaynağı/tarihi, audit log ve gerçek talep bu dosyada uygulanmamış. JavaScript içinde `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage` veya `sessionStorage` çağrısı saptanmadı. Bunlar başka bir uygulamanın varlığı/yokluğu hakkında kanıt değildir. Harita şematik olarak, hero görseli temsili olarak erişilebilirlik açıklamalarında belirtiliyor; gören kullanıcıya açıklamanın yeterliliği görsel kontrolde ayrıca incelenmeli.

### Ek bulgular

| Kimlik | Seviye | Kaynak kanıtı / etki | Önerilen işlem |
|---|---|---|---|
| D-01 | Orta | `openModal`, `openProperty`, `closeModal` odağı modal içine taşımıyor, hapsetmiyor veya tetikleyiciye geri vermiyor; `aria-modal` tek başına bunu sağlamaz | Ayrı erişilebilirlik görevi ve gerçek klavye testi |
| D-02 | Orta | Menü bağlantısı olayında `.open` kaldırılıyor fakat menü düğmesinin `aria-expanded` değeri güncellenmiyor | Kapanış durumunu tek noktadan yönet; menü aç/bağlantıya tıkla senaryosunu test et |
| D-03 | Orta | Asistan `label` öğelerinde `for` veya kapsanan select yok | Etiketleri select kimlikleriyle ilişkilendir; erişilebilir adları kontrol et |
| D-04 | Orta | `innerHTML` ile kayıt alanları, görsel URL'leri ve modal içerikleri üretiliyor | Şimdiki sabit veri için dış girdiyle istismar gösterilmedi; gerçek veri kabulünden önce güvenli DOM üretimi/URL doğrulama zorunlu |
| D-05 | Orta | Kritik ilan alanları, kaynak ve doğrulama tarihleri veri modelinde yok | Gerçek ilan kabulünden önce Aşama 2; demo olduğu için doğrulanmış ilan iddiası olarak sınıflandırılmadı |
| D-06 | Düşük | CSS'te smooth scroll/geçişler, JS'te smooth scroll var; `prefers-reduced-motion` desteği yok | Kullanıcı tercihine uygun hareket davranışı |
| D-07 | Orta — teknik borç | Sunum, sabit veri, filtre iş kuralları ve modal yönetimi aynı dosyada | Referansı koruyarak ayrı onaylı görevde modülerleştir |

Doğrulanmış kritik veya yüksek güvenlik açığı tespit edilmedi; kapsamlı güvenlik testi yapılmadığından güvenlik güvencesi verilmez. `innerHTML` bulgusu şu an doğrulanmış dış girdi XSS'i değildir. Inline script/style/olay kullanımı ileride sıkı CSP uygulanmasını zorlaştırabilir; hosting header'ları incelenmedi.

### Ek test sonuçları ve test düzeneği düzeltmesi

`node` üzerinden, dosya UTF-8 okunarak script çıkarıldı; `new vm.Script(script)` sözdizimi kontrolü **PASS**. Script, ağ erişimi içermeyen basitleştirilmiş bir `document` nesnesiyle `vm` içinde çalıştırıldı. Kaynak dosyası değiştirilmedi; yeni test bağımlılığı eklenmedi.

İlk geçici kontrol çalıştırması **FAIL** verdi: yanlışlıkla üç kayıt beklenmişti (dosyada dört var); PowerShell stdin üzerinden Türkçe assertion metinleri de eşleşmedi. Kök neden test düzeneğiydi. Beklenen kayıt sayısı kaynak envanterine göre düzeltildi ve metin kodlamasına bağımlı assertion'lar yerine kart sayısı, boş durum sınıfı ve sayısal sınırlar kontrol edildi. Uygulama testi hatası gizlenmedi; ilk çalıştırma ürün hatası olarak yorumlanmadı.

İkinci `@' … '@ | node` çalıştırmasında şu kontrollerin tamamı **PASS**:

1. İlk render dört kart üretir.
2. Bütçe 1 olduğunda boş sonuç öğesi oluşur.
3. Reset dört filtreyi `all` yapar.
4. İletişim modalında demo içeriği üretilir.
5. İlk kaydın detayında `Demo 1` üretilir.
6. Tüm bölgeler / 7.500.000 bütçe dört eşleşme üretir.
7. 3.600.000 bütçe sınırı tek kart üretir; eşit fiyat dahil edilir.

Bunlar gerçek DOM, tarayıcı render'ı, E2E veya erişilebilirlik testi değildir. Escape, backdrop, odak, mobil görünüm, console/network ve görseller tarayıcıda **NOT RUN**. Lint, typecheck, build ve bağımlılık taraması için proje komutları hâlâ yok. Kaynak–yayın uyumu **doğrulanamadı**.

### Güncellenmiş küçük görevler ve onay kapısı

| Görev | Değişecek dosyalar | Sonuç ve kabul | Test | Geri dönüş |
|---|---|---|---|---|
| Demo tarayıcı denetimini tamamla | Yalnız bu rapor; gerekirse `docs/audit/` ekran kanıtları | Masaüstü/mobil, filtre, menü, üç modal ve klavye sonuçları kaydedilir | Gerçek tarayıcı; console/network; odak ve Escape | Yalnız yeni rapor eki/kanıtları kaldır |
| Temel sürümün proje konumunu ve Git yaklaşımını belirle | Onay sonrası `reference/toprak_ehli_demo.html`, `README.md`; özgün Downloads dosyası korunur | Hash eşleşen referans ve tekrarlanabilir açma talimatı | SHA-256 karşılaştırması ve yerel açılış | Yeni kopya/belgeyi kaldır; Git başlangıcı ayrı karar |
| D-01–D-03 erişilebilirlik düzeltmelerini planla | Referans yerine çalışılacak kopyanın yolu onayla belirlenecek | Modal odak döngüsü/geri dönüşü, doğru menü durumu ve form etiketleri | Klavye ve erişilebilir ad/durum regresyonları | İlgili küçük diff geri alınır |
| D-06 hareket tercihini destekle | Çalışılacak kopyanın yolu onayla belirlenecek | Azaltılmış hareket tercihinde zorunlu smooth scroll/geçiş yok | Tarayıcı tercihi emülasyonu | İlgili diff geri alınır |
| Güvenli modüler temel planı | Hedef kaynak yolları teknoloji kararı sonrası belirlenecek | Referans korunur; veri/filtre/DOM/CSS ayrımı ve mevcut davranış eşliği | Mevcut yedi senaryo + gerçek tarayıcı regresyonları | Yeni uygulama kaldırılıp referansa dönülür |

Kesin uygulama yolları ve teknoloji seçilmediği için son üç satır henüz kodlama yetkisi veren mini-plan değildir. İlk öneri, tarayıcı incelemesini tamamlayıp temel dosyanın proje içindeki konumunu kararlaştırmaktır. Ürün aşamaları 1–8 sırası değiştirilmedi. Hiçbir geliştirme veya yayın başlatılmadı.

### Ek görev raporu

- Görev: Sağlanan HTML'yi incelemek ve baseline'ı güncellemek.
- Durum: Kısmi; kaynak incelemesi ve yedi izole kontrol tamamlandı, tarayıcı/yayın/depo incelemesi açık.
- Değişen dosyalar: Yalnız `docs/BASELINE_AUDIT.md`.
- Güvenlik/veri etkisi: Demo değiştirilmedi; gerçek kişisel veri ve dış servis kullanılmadı.
- Kalan riskler: Gerçek tarayıcı davranışı, üretim altyapısı ve veri güvenliği doğrulanmadı.
- Geri dönüş: Bu rapor ekini kaldırmak; özgün demo yukarıdaki hash ile yeniden karşılaştırılabilir.
- Sonraki görev / kullanıcı kararı: Rapor ve devam kapsamının onayı; ilk geliştirmeye geçilmedi.

## Devam çalışması — temel sürümün korunması

Kullanıcının “devam et” talimatıyla bir sonraki küçük görev uygulandı: kaynak değişikliği olmadan referans kopyası ve açılış belgesi.

- Değişen dosyalar: `reference/toprak_ehli_demo.html` (birebir referans kopyası), `README.md` (yerel açılış ve sınırlar), bu rapor.
- Veri/güvenlik etkisi: Şema, kişisel veri, ağ servisi veya üretim etkisi yok. Downloads içindeki özgün dosya korundu.
- Kabul/test: `Get-FileHash -Algorithm SHA256` özgün ve kopya için aynı `1e4a331a8e8b20bb44ba9d488a67f49a6139e60a5b173ae15a412eb88f742691` değerini verdi — **PASS**.
- Tarayıcı denemesi: Computer Use başlatma isteği `Computer Use native pipe is unavailable ... os error 2` hatası verdi. Alternatif CUA envanterinde uygulama/tarayıcı bulunamadı; `The browser access host is unavailable` döndü. Tarayıcı/klavye/mobil/console/network kontrolleri **BLOCKED**; başarılı sayılmadı.
- Durum: Referans koruma tamamlandı; tarayıcı denetimi bloklandı. Kaynak–yayın uyumu hâlâ doğrulanamadı.
- Geri dönüş: Yalnız yeni `reference/toprak_ehli_demo.html`, `README.md` ve bu rapor ekini kaldırmak. Git başlatılmadı; geçmiş değiştirilmedi.
- Sonraki görev: Tarayıcı erişimi sağlandığında gerçek görsel/klavye kontrolü. Sonrasında D-01–D-03 için referansı koruyan modüler çalışma kopyasının mini-planı.
