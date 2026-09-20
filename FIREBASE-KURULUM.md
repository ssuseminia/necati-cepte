# Necati Cepte v3 — Firebase kurulumu

Bu adımlar bir kez yapılır. Sonrasında Nisa ve Necati farklı telefonlarda aynı veriyi görür.

## 1) Firebase projesi oluştur
1. https://console.firebase.google.com adresinde yeni proje oluştur: `necati-cepte`.
2. Project settings > Your apps > Web > `</>` ile bir Web App ekle.
3. Verilen `firebaseConfig` değerlerini bu paketteki `firebase-config.js` dosyasına yapıştır.
4. `coupleId` değerini değiştirme (`nisa-necati`) veya iki telefonda da aynı bırak.

## 2) İki hesabı oluştur
Firebase Console > Authentication > Sign-in method > Email/Password özelliğini aç.
Authentication > Users bölümünden **yalnızca iki hesap** oluştur: bir Necati hesabı, bir Nisa hesabı.
Uygulamada kayıt olma yoktur; bu özellikle daha güvenli bırakıldı.

## 3) Firestore
Firestore Database > Create database.
Rules bölümüne `firestore.rules` içeriğini yapıştır ve Publish de.

## 4) Fotoğraf yükleme
Storage > Get started.
Rules bölümüne `storage.rules` içeriğini yapıştır ve Publish de.

## 5) Web push anahtarı
Project settings > Cloud Messaging > Web Push certificates > Generate key pair.
Çıkan public VAPID key'i `firebase-config.js` içindeki `vapidKey` alanına yaz.
GitHub'a dosyaları tekrar yükle. Nisa ve Necati uygulamada 👤 > Giriş yap > 🔔 Bildirimleri aç butonuna birer kez bassın.

## 6) Uygulama KAPALIYKEN gerçek push (opsiyonel ama önerilir)
Bu bölüm Cloud Functions kullanır. Firebase projesinde Functions kullanmak için Google'ın ilgili plan/ödeme koşulları geçerli olabilir.
Bilgisayarda Node.js ve Firebase CLI kurulu olmalı:

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

`firebase init functions` sırasında mevcut proje `necati-cepte`yi seç. JavaScript seç.
Bu paketteki `functions/index.js` ve `functions/package.json` dosyalarını Firebase'in oluşturduğu `functions` klasörüne koy.
Sonra:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Bunu yapmazsan uygulama yine çalışır: iki telefon uygulama açıkken Firestore üzerinden anlık uyarı gelir. Cloud Function kurulunca uygulama arka planda/kapalıyken FCM push da gelir.

## 7) GitHub Pages
`index.html`, `style.css`, `app.js`, `cloud.js`, `firebase-config.js`, `sw.js`, `manifest.json`, `icons/` klasörünü GitHub repo ana dizinine yükle.
Sonra siteyi bir kez Ctrl+F5 ile yenile. Telefonda eski PWA kuruluysa kapat-aç; gerekirse tarayıcı site verisini temizle.

## Güvenlik notu
`firebaseConfig` içindeki API key bir parola değildir. Asıl erişim Authentication + Firestore/Storage Rules ile korunur. Bu örnekte Authentication'a yalnızca Nisa ve Necati hesaplarını elle eklemek amaçlanmıştır.
