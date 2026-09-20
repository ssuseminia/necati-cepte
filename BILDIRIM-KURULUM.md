# Acil Necati + Bildirim Kurulumu

Bu sürüm para vermeden çalışan canlı bildirim sistemini içerir.

## Nisa'nın telefonunda
1. Necati Cepte'yi aç ve Nisa hesabıyla giriş yap.
2. Sağ üstteki bulut/hesap düğmesine gir.
3. `🔔 Bildirimleri aç` düğmesine bas ve tarayıcı iznini `İzin ver` yap.
4. `🧪 Test bildirimi` ile kontrol et.
5. Uygulamayı ana ekrana eklemek önerilir.

## Necati'nin telefonunda
Aynı işlemleri Necati hesabıyla yap.

## Test
- Nisa hesabından `Acil Necati` > `Beni ara` düğmesine bas.
- Necati'nin cihazında birkaç saniye içinde sistem bildirimi görünmelidir.
- İki cihazın da internete bağlı ve Firebase'e giriş yapmış olması gerekir.

## Ücretsiz sürümün sınırı
Bu sürüm Firestore canlı bağlantısı üzerinden çalışır. PWA/tarayıcı tamamen işletim sistemi tarafından kapatılırsa yeni olayı dinleyemez. Uygulama açıkken veya arka planda çalışırken bildirim gelir.

Tamamen kapalı uygulamaya da push göndermek için FCM gönderimini yapan güvenli bir sunucu/Cloud Function gerekir. Firebase Cloud Functions kullanmak istemezsen daha sonra ücretsiz bir harici bildirim servisi de bağlanabilir.
