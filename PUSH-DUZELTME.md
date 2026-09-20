# Necati Cepte v5.1 — Kapalıyken Push Düzeltmesi

## Cloudflare'a 4. değişkeni ekle
Worker > Settings > Variables and Secrets:
- FIREBASE_API_KEY = Firebase web config içindeki apiKey

Mevcut diğerleri:
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

## Worker kodunu değiştir
`cloudflare-worker/worker.js` dosyasındaki kodu Cloudflare Worker > Edit code içine tamamen yapıştır ve Deploy et.

## GitHub dosyalarını güncelle
Bu paketteki dosyaları repoya yükle. `firebase-config.js` Worker URL ile hazırdır ve `sw.js` cache sürümü v5.1'e yükseltilmiştir.

## Her iki telefonda
1. Siteyi tarayıcıda bir kez aç ve yenile.
2. Giriş yap.
3. Bildirimleri Aç'a tekrar bas.
4. Bildirim izninin sistem ayarlarında açık olduğunu doğrula.
5. Necati tarafını kapat ve Nisa'dan Acil Necati gönder.

### iPhone notu
Arka plan web push için siteyi Safari > Paylaş > Ana Ekrana Ekle ile PWA olarak kurup bildirime uygulamanın içinden izin vermek gerekir.
