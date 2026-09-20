// Necati Cepte Firebase ayarları
(function(g){
  g.NECATI_FIREBASE = {
    coupleId: 'nisa-necati',
    // Tam kapalı uygulamaya FCM push istersen daha sonra Cloud Messaging VAPID public key ekle.
    vapidKey: 'BMNEf2hiA_GJtj2ImKNwy1EwCF8BQIPCn6RwFoyi35ZFkU5U3m5zy3Y2ffGeY3a-JJ-uK4dSE9VzVzqltjdTL38',
    pushSenderUrl: 'BURAYA_CLOUDFLARE_WORKER_URL',
    config: {
      apiKey: 'AIzaSyAtCHvfVp9gpU96hUJsOI9W-Z41B8cf9tc',
      authDomain: 'necati-cepte.firebaseapp.com',
      projectId: 'necati-cepte',
      storageBucket: 'necati-cepte.firebasestorage.app',
      messagingSenderId: '64647895957',
      appId: '1:64647895957:web:8e60b777a443b8d32df49c'
    }
  };
})(typeof self !== 'undefined' ? self : window);
