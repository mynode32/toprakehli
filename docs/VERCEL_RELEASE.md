# Vercel müşteri sunumu — 31 Ekim 2026

Adres: https://toprak-ehli-demo.vercel.app

Hesap/proje: ehli/toprak-ehli-demo. Son deployment: dpl_5kTSHeXtjgWm4Yp1dMhMQieawBsc, READY, production.

Vercel build `.deploy/site` altında yalnız statik site üretir. `.vercelignore` izin listesi yönetim, test, doküman, yerel hesap ve ortam dosyalarını yükleme dışında tutar. Güvenlik başlıkları `vercel.json` içinde uygulanır. Kalıcı veritabanı veya Vercel üzerinde yönetim servisi bu yayında yoktur.

Müşteri sunumunda geliştirme bandı ve yerel geliştirme footer'ı kaldırıldı; ana çağrı Portföyleri incele oldu. Dört kayıt hâlâ temsili; gerçek ilan veya doğrulanmış fiyat gibi işaretlenmedi. Gerçek fotoğraf ve kayıtlar gelene kadar açıklamalar korunur. Arama motoru görünürlüğü kapalıdır; noindex erişim koruması değildir.

Kontroller: 18 otomatik test PASS; sözdizimi ve yerel Vercel build PASS. Anonim HTTP kontrolünde ana sayfa 200, ana JS 200, hero PNG 200, admin ve .env.local 404. HTML'de geliştirme bandı yok, temsili kayıt açıklaması mevcut; CSP başlığı var. Yeni canlı sürümün etkileşimli tarayıcı kontrolü bu turda yapılmadı (Work yerel tarayıcı ayarında önceki engel); HTTP doğrulaması tamamlandı.

Tekrar yayın: proje klasöründe `vercel deploy --prod --yes --scope ehli`. Varsayılan sunum temsili kayıtları korur; `TOPRAK_DEPLOY_MODE=live` yalnız işletmece onaylı gerçek içerik hazırlandıktan sonra kullanılmalıdır. Proje adı URL'de demo kelimesini içerir; bu mevcut paylaşım bağlantısının teknik adıdır.

Önceki deployment: dpl_3UqSCFyf9h5EXHgm4PDTcpwakU8x. Sorunda Vercel deployment geçmişinden önceki kabul edilmiş sürüme dönülebilir. CLI oturumu kullanıcı tarafından onaylandı; token kaynak koda veya Git'e eklenmedi.
