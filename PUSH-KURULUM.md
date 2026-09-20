# Necati Cepte v5 — gerçek push kurulumu

VAPID public key uygulamaya eklenmiştir.

## 1) GitHub'a v5'i yükle
Tüm v5 dosyalarını mevcut `necati-cepte` reposunun köküne yükle ve commit et.

## 2) İki telefonda push token üret
Her iki telefonda da uygulamaya giriş yapıp `Bildirimleri aç` butonuna bas. Tarayıcı bildirim iznini `İzin ver` yap.
- Android Chrome: normal HTTPS sayfasında çalışır.
- iPhone/iPad: siteyi önce Safari > Paylaş > Ana Ekrana Ekle ile PWA olarak kur; sonra kurulu uygulamada bildirim izni ver.

Bu işlem Firestore'da `couples/nisa-necati/devices/<uid>` içine FCM token kaydeder.

## 3) Ücretsiz gönderici: Cloudflare Worker
Firebase FCM'e güvenli mesaj göndermek için sunucu gerekir. Cloudflare Workers Free planı bu küçük kullanım için uygundur.

Cloudflare Dashboard > Workers & Pages > Create > Worker oluştur.
`cloudflare-worker/worker.js` içeriğini Worker koduna yapıştır.

### Worker Settings > Variables and Secrets
Şunları ekle:
- `FIREBASE_PROJECT_ID` = `necati-cepte`
- `FIREBASE_API_KEY` = Firebase web config içindeki apiKey
- `FIREBASE_CLIENT_EMAIL` = Firebase service account JSON içindeki `client_email`
- `FIREBASE_PRIVATE_KEY` = service account JSON içindeki `private_key` (**Secret** olarak)

Service account JSON almak için:
Firebase Console > Project settings > Service accounts > Generate new private key.
Bu JSON dosyasını GitHub'a yükleme, kimseyle paylaşma.

Deploy et. Sana örneğin şu tarz URL verir:
`https://necati-cepte-push.<hesap>.workers.dev`

## 4) Worker URL'ini uygulamaya yaz
`firebase-config.js` içindeki:
`pushSenderUrl: 'BURAYA_CLOUDFLARE_WORKER_URL'`
alanını Worker URL'inle değiştir.

Örnek:
`pushSenderUrl: 'https://necati-cepte-push.ornek.workers.dev'`

Commit et.

## 5) Test
1. Necati telefonunda giriş yap ve `Bildirimleri aç` de.
2. Nisa telefonunda giriş yap ve `Bildirimleri aç` de.
3. Her ikisinde de uygulamayı tamamen kapat.
4. Nisa uygulamayı açıp Acil Necati > `Beni ara` bassın.
5. Necati telefonuna push düşmeli.

Not: Bildirim izni reddedildiyse tarayıcı/site ayarlarından yeniden izin verilmesi gerekir.
