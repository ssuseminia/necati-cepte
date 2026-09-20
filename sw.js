const CACHE='necati-cepte-v5.3';
const CORE=['./','./index.html','./style.css?v=5.3','./app.js?v=5.3','./cloud.js?v=5.3','./firebase-config.js?v=5.3','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isAppAsset = sameOrigin && (
    event.request.mode === 'navigate' ||
    /\.(?:js|css|html)$/.test(url.pathname) ||
    url.pathname.endsWith('/firebase-config.js')
  );

  if (isAppAsset) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Firebase Cloud Messaging background push
try {
  importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');
  importScripts('./firebase-config.js?v=5.3');

  const c = self.NECATI_FIREBASE && self.NECATI_FIREBASE.config;
  if (c && c.apiKey && !c.apiKey.startsWith('BURAYA_')) {
    if (!firebase.apps.length) firebase.initializeApp(c);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(payload => {
      const data = payload.data || {};
      const notification = payload.notification || {};
      return self.registration.showNotification(
        notification.title || data.title || 'Necati Cepte ❤️',
        {
          body: notification.body || data.body || 'Yeni bir bildirim var',
          icon: './icons/icon-192.png',
          badge: './icons/icon-192.png',
          tag: data.type === 'emergency' ? 'necati-emergency' : 'necati-notification',
          renotify: true,
          requireInteraction: data.type === 'emergency',
          vibrate: [250,120,250,120,500],
          data: { url: data.url || './?open=emergency' }
        }
      );
    });
  }
} catch (e) {
  console.warn('FCM service worker pasif:', e);
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
      for (const w of windows) {
        if ('focus' in w) {
          w.navigate(url).catch(()=>{});
          return w.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});