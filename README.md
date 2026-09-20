# Necati Cepte v4.1

Düzeltmeler:
- Anı kaydı artık yalnızca başlık ile yapılabilir; konum isteğe bağlıdır.
- Firebase Storage kapalıysa fotoğraf yüzünden kayıt engellenmez; anı fotoğrafsız kaydedilir.
- Harita yalnızca koordinatı bulunan anıları işaretler.
- Acil Necati çağrısı uygulama açıkken tam ekran uyarı + titreşim + sistem bildirimi üretir.
- Mobil tarayıcı canlı bağlantıyı uyutursa 20 saniyelik yedek bildirim kontrolü vardır.
- Service worker cache v4.1'e yükseltildi.


## v5.2 düzeltmesi
- cloud.js sözdizimi hatası düzeltildi; hesap/giriş butonu tekrar çalışır.
- Acil Necati başarısız olduğunda sistem paylaşım menüsü artık açılmaz.
- Bulut girişi yoksa kullanıcıya giriş yapması söylenir.


## v5.3
- Cache-first yerine uygulama kodlarında network-first.
- Hesap butonuna doğrudan fallback eklendi.
- Sistem testi butonu eklendi.
- Service worker güncellemesi zorlanıyor.


## v6
- OneSignal Web Push entegrasyonu eklendi.
- iOS/iPadOS ana ekran PWA kapalıyken push için ayrı OneSignal service worker eklendi.
- Acil Necati Worker artık OneSignal API üzerinden karşı role push gönderiyor.
- Firebase yalnızca Auth + Firestore senkronunda kalıyor.


## v6.1
- OneSignal App ID eklendi.
- OneSignalSDKUpdaterWorker.js eklendi.


## v6.2
- OneSignal serviceWorkerPath GitHub Pages için absolute path olarak düzeltildi.
- SDK yükleme sırası deterministik hale getirildi.
- OneSignal init hatası kullanıcıya gösteriliyor.


## v6.3
- Bildirim izni sonrası `OneSignal.User.PushSubscription.optIn()` çağrısı eklendi.
- Push Subscription ID için 5 saniyelik bekleme ve kontrol eklendi.
- Sistem testine OneSignal permission/subscription/optedIn değerleri eklendi.


## v6.4
- OneSignal worker dosyaları repo köküne taşındı.
- Service worker path `/necati-cepte/` scope'una alındı.
- GitHub Pages 404 sorunu hedeflendi.

## v6.5
- Nisa Modu ruh hali değişince Necati hesabına gerçek OneSignal push gönderilir.
- Aynı ruh haline tekrar basılırsa bildirim gönderilmez.
- Bildirim örneği: “🌸 Nisa’nın ruh hali değişti — 😴 Yorgun hissediyor ❤️”
- Bu bildirim yalnızca Nisa hesabından tetiklenir.
