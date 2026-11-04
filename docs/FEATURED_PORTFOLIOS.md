# Öne çıkan portföyler — 1 Kasım 2026

İpli polaroid vitrin gerçek yayınlanmış portföylere bağlanır. Gerçek kart tıklaması mevcut portföy detay penceresini açar; temsili manzara kartları #portfoy alanına bağlantıdır.

Online panel ilan formuna Anasayfada öne çıkar ve Vitrin sırası (1–99) eklendi. Yalnız fotoğraflı/yayındaki ve satılmamış kayıtlar seçilir. İşaretli kayıtlar küçük sıra numarası önce olacak şekilde en fazla sekiz gösterilir. Açıkça işaretleri kaldırmak vitrine istemeden tüm ilanları geri koymaz. Eski featured alanı olmayan kayıtlar için otomatik eski davranış korunur.

Boolean ve tam sayı alanları sunucuda doğrulanır; mevcut JSONB revizyonlu kayıt/snapshot yapısına dahil olduğundan yeni SQL migration gerekmez. Public API metadata'yı sunar ve mevcut senkronizasyon galeriyi yeniler. Yeni yetki veya dosya erişimi açılmadı.

51 test geçti. Yeni testler seçim/sıra/limit, taslak-satıldı-fotoğrafsız dışlama, false seçiminin korunması, eski kayıt uyumu ve sunucu doğrulamasını kapsıyor. SQL/API fixture testinde alanların kayıt ve public dönüşünde kaldığı doğrulandı. Gerçek veritabanı içeriği bu aşamada değiştirilmedi.

Geri dönüş etiketi: before-featured-2026-11-01. Ücretli işlem ve GitHub push yok.

Kullanıcı onayıyla production: dpl_Dg3vPrEmkENB32nYVYStfxyayGQC, READY. Canlı temsili kart tıklaması #portfoy geçişiyle doğrulandı; admin HTML yeni featured/order alanlarını içeriyor. Oturumsuz API 401. Gerçek ilan olmadığından gerçek seçili kart görünümü SQL/domain testleriyle doğrulandı; veritabanına hayali ilan eklenmedi.
