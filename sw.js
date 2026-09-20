const CACHE='necati-cepte-v5.1';
const CORE=['./','./index.html','./style.css','./app.js','./cloud.js','./firebase-config.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{if(new URL(e.request.url).origin===location.origin){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match('./index.html'))))});

// Firebase Cloud Messaging: uygulama kapalı/arka plandayken push gösterir.
try{
  importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');
  importScripts('./firebase-config.js');
  const c=self.NECATI_FIREBASE?.config;
  if(c?.apiKey&&!c.apiKey.startsWith('BURAYA_')){
    firebase.initializeApp(c);
    const messaging=firebase.messaging();
    messaging.onBackgroundMessage(payload=>{
      const data=payload.data||{};
      return self.registration.showNotification(data.title||'Necati Cepte ❤️',{body:data.body||'Yeni bir bildirim var',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:data.type==='emergency'?'necati-emergency':'necati-notification',renotify:true,requireInteraction:data.type==='emergency',vibrate:[250,120,250,120,500],data:{url:data.url||'./?open=emergency'}});
    });
  }
}catch(e){console.warn('FCM service worker pasif:',e)}
self.addEventListener('notificationclick',e=>{e.notification.close();const url=e.notification.data?.url||'./';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('focus'in w)return w.focus()}return clients.openWindow(url)}))});
