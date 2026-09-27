# Necati Cepte

**İki kişilik bir dünyayı tek uygulamada buluşturan mobil odaklı PWA.**

Necati Cepte; ortak planları, günlük iletişimi, anıları ve küçük sürprizleri aynı deneyimde bir araya getiren kişisel bir web uygulamasıdır. Nisa ve Necati için geliştirilen proje, gündelik bir ihtiyacı çalışan bir ürüne dönüştürme fikrinden doğdu: birlikte geçirilen zamanı daha kolay planlamak ve uzaktayken de birbirinin gününe eşlik etmek.

HTML, CSS ve vanilla JavaScript ile geliştirilen arayüz; Firebase üzerinden hesap yönetimi ve veri senkronizasyonu, OneSignal ve Cloudflare Worker üzerinden push bildirimleri ile desteklenir.

**Güncel sürüm:** `v10.9.7` · **Platform:** Web / PWA · **Arayüz dili:** Türkçe

## Uygulamada neler var?

| Alan | Özellikler |
| --- | --- |
| Günlük özet | Ruh hali, yaklaşan planlar, açık görevler ve harcama özeti |
| Ortak planlama | Takvim, görevler, öncelikler, son tarihler ve hatırlatma seçenekleri |
| Birlikte karar verme | 16 fikir içeren Date Çarkı ve sonucu ortak göreve dönüştürme |
| Günlük iletişim | Hazır veya özel Hızlı Durum mesajları, dürtme ve fotoğraflı paylaşımlar |
| Bugün Biz | Buluşma yanıtları, duygu paylaşımı ve kabul edilerek açılan sürpriz mesajları |
| Ortak bütçe | Harcama kayıtları, kategoriler ve aylık toplamlar |
| Kişisel alan | Ruh hali, döngü takibi, özel günler ve kişiselleştirilebilir ayarlar |
| Necati Bot | Plan, görev ve harcama verilerini yorumlayan yerel, şablon tabanlı yardımcı |

## Tasarım yaklaşımı

Proje, telefonda günlük kullanıma uygun bir deneyim üzerine kurulu. Alt navigasyon, hızlı erişim kartları ve tam ekran diyaloglar sık kullanılan işlemleri kolay erişilebilir tutar. Tema seçenekleri, SVG ikonlar, iPhone safe-area düzenlemeleri ve azaltılmış hareket tercihi desteği arayüzün temel parçalarıdır.

PWA yapısı, destekleyen cihazlarda uygulamanın ana ekrana eklenmesini ve bağımsız bir pencere içinde açılmasını sağlar. Bulut senkronizasyonu ve bildirimler bağlantı, hesap ve servis yapılandırmasına bağlıdır.

## Teknik yapı

| Katman | Teknoloji ve sorumluluk |
| --- | --- |
| Arayüz | HTML5, CSS3, vanilla JavaScript |
| Uygulama durumu | Yerel depolama, cihaz içi yedekler ve Firestore senkronizasyonu |
| Kimlik doğrulama | Firebase Authentication |
| Veri katmanı | Cloud Firestore |
| Bildirimler | OneSignal Web Push ve Cloudflare Worker |
| Harita | Leaflet |
| PWA | Web App Manifest ve service worker |

Ön yüz için bir derleme adımı gerekmez. Uygulama mantığı `app-v7.js`, görsel düzen `style-v7.css`, bulut entegrasyonu ise `cloud-v7.js` içinde bulunur. Dosya adlarındaki `v7`, güncel ürün sürümünden bağımsız olarak korunan adlandırmadır.

## Proje yapısı

```text
necati-cepte/
├── index.html                # Uygulama kabuğu ve ekranlar
├── app-v7.js                 # Modüller, etkileşimler ve uygulama durumu
├── style-v7.css              # Mobil arayüz, temalar ve bileşen stilleri
├── cloud-v7.js               # Hesap ve bulut senkronizasyonu
├── firebase-config-v7.js     # Firebase istemci yapılandırması
├── onesignal-config.js       # OneSignal istemci yapılandırması
├── manifest.json             # PWA tanımı
├── sw.js / sw-v7.js           # Service worker dosyaları
├── assets/                   # Uygulama görselleri
├── icons/                    # Uygulama ve modül ikonları
├── push/                     # Push service worker dosyaları
├── cloudflare-worker/        # Bildirim ve zamanlanmış işlem kodu
├── functions/                # Firebase Functions kaynakları
└── V10.9.7-UX-SAFE.md         # Güncel sürüm notları
```

## Yerel geliştirme

Repoyu klonlayın ve proje dizininde bir statik HTTP sunucusu başlatın. Örneğin Python kuruluysa:

```bash
git clone https://github.com/ssuseminia/necati-cepte.git
cd necati-cepte
python -m http.server 8080
```

Arayüzü `http://localhost:8080` adresinde açabilirsiniz. Bu komut yalnızca ön yüzü sunar; Cloudflare Worker veya Firebase Functions süreçlerini başlatmaz. Hesap, senkronizasyon ve push özellikleri için ilgili servislerin ayrıca yapılandırılmış olması gerekir.

JavaScript sözdizimini kontrol etmek için:

```bash
node --check app-v7.js
```

## Yapılandırma ve bakım

Firebase istemci ayarları `firebase-config-v7.js` içinde, veri erişim kuralları `firestore.rules` ve `storage.rules` dosyalarında yönetilir. Sunucu tarafındaki gizli anahtarlar servislerin secret yapılandırmasında tutulmalıdır.

Bildirim altyapısındaki service worker yolları ve push scope değerleri mevcut dağıtımla birlikte değerlendirilmelidir. Arayüz güncellemeleri bu altyapıdan bağımsız tutulur.

Kurulum ve geçmiş kararlar için depo içindeki belgeler kullanılabilir:

- [Firebase kurulumu](FIREBASE-KURULUM.md)
- [OneSignal kurulumu](ONESIGNAL-KURULUM.md)
- [Push kurulumu](PUSH-KURULUM.md)
- [Akıllı bildirimler](AKILLI-BILDIRIMLER.md)

Bu belgelerin bir kısmı önceki sürümlere aittir; dosya adları ve yapılandırma adımları uygulanmadan önce güncel kaynaklarla karşılaştırılmalıdır.

## v10.9.7 yenilikleri

- Nisa hesabının ana sayfasına regl başlangıcını kaydeden hızlı işlem eklendi.
- Date Çarkı Yapılacaklar ekranına taşındı; seçilen fikir artık ortak görev olarak kaydediliyor.
- Date fikirleri 16 seçenekli yeni bir listeyle güncellendi.
- Modül ikonları ortak bir gradient ve beyaz çizgi stilinde birleştirildi.
- Necati Bot, sabit sohbet düğmesinden erişilebilir hale getirildi.
- Hızlı Durum, sekiz hazır seçenek ve özel mesaj alanıyla genişletildi.

Ayrıntılar: [v10.9.7 sürüm notu](V10.9.7-UX-SAFE.md). Önceki sürümlerin notları depo kökündeki `V*.md` dosyalarında yer alır.

---

Geliştiren: [ssuseminia](https://github.com/ssuseminia)
