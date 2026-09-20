// Firebase Console > Project settings > Your apps > Web app içindeki config değerlerini buraya yapıştır.
// Bu dosyadaki Firebase config değerleri gizli parola değildir; güvenlik Firestore/Storage rules ile sağlanır.
(function(g){
  g.NECATI_FIREBASE = {
    coupleId: 'nisa-necati',
    vapidKey: 'BURAYA_WEB_PUSH_VAPID_KEY',
    config: {
      apiKey: 'BURAYA_API_KEY',
      authDomain: 'BURAYA_PROJECT_ID.firebaseapp.com',
      projectId: 'BURAYA_PROJECT_ID',
      storageBucket: 'BURAYA_STORAGE_BUCKET',
      messagingSenderId: 'BURAYA_MESSAGING_SENDER_ID',
      appId: 'BURAYA_APP_ID'
    }
  };
})(typeof self !== 'undefined' ? self : window);
