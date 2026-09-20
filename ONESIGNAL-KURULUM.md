# Necati Cepte v6 — OneSignal gerçek push kurulumu

Bu sürümde Firebase giriş/Firestore aynen kalır. Kapalı uygulama bildirimlerini OneSignal gönderir.

## 1) OneSignal uygulaması oluştur
1. https://onesignal.com adresinde ücretsiz hesap aç.
2. New App / New App/Website oluştur.
3. Platform olarak **Web Push** seç.
4. Integration: **Custom Code**.
5. Site Name: `Necati Cepte`
6. Site URL: `https://ssuseminia.github.io`
7. Service worker ayarları:
   - Path to service worker files: `/necati-cepte/push/onesignal/`
   - Filename: `OneSignalSDKWorker.js`
   - Registration scope: `/necati-cepte/push/onesignal/`

## 2) App ID
OneSignal > Settings > Keys & IDs içindeki **App ID** değerini al.
`onesignal-config.js` dosyasındaki `71f89928-0898-449b-81d6-e611f6b427b4` ile değiştir.
App ID gizli değildir.

## 3) Cloudflare secrets
Cloudflare Worker > Settings > Variables and Secrets bölümüne:
- `ONESIGNAL_APP_ID` = OneSignal App ID
- `ONESIGNAL_REST_API_KEY` = OneSignal App API Key / REST API Key

REST API Key'i GitHub'a veya sohbetlere koyma.

Mevcut Firebase doğrulaması için `FIREBASE_API_KEY` secret'ı da Worker'da kalmalıdır.

## 4) Worker kodu
`cloudflare-worker/worker.js` içeriğini mevcut Cloudflare Worker kodunun tamamı ile değiştir ve Deploy et.

## 5) GitHub
v6 içindeki tüm site dosyalarını repoya yükle.

## 6) iPhone testi
1. iOS/iPadOS 16.4+ olmalı.
2. Siteyi Safari/Chrome/Edge'de aç.
3. **Ana Ekrana Ekle**.
4. Ana ekrandaki Necati Cepte ikonundan aç.
5. Firebase hesabıyla giriş yap.
6. Uygulamada **🔔 Bildirimleri aç** butonuna bas.
7. iOS native bildirim iznine **İzin Ver**.
8. Nisa ve Necati telefonlarında bunu bir kez yap.

## Hesap isimleri
OneSignal kullanıcı rolünü Firebase giriş e-postasından belirler:
- e-postada `nisa` geçerse OneSignal external ID = `nisa`
- e-postada `necati` geçerse OneSignal external ID = `necati`

Örn:
- nisa@necati-cepte.app
- necati@necati-cepte.app


Bu pakette App ID hazırdır. Sadece Cloudflare secret olarak ONESIGNAL_REST_API_KEY eklenmelidir.
