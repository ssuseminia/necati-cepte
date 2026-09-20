const CACHE='necati-cepte-v6';
const CORE=['./','./index.html','./style-v6.css','./app-v6.js','./cloud-v6.js','./firebase-config-v6.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const same=url.origin===self.location.origin;
  if(same && (event.request.mode==='navigate' || /(?:app-v54|cloud-v54|firebase-config-v6|style-v54|index\.html)/.test(url.pathname))){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(r=>{ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return r; })
        .catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});

try{
  importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');
  importScripts('./firebase-config-v6.js');
  const c=self.NECATI_FIREBASE?.config;
  if(c?.apiKey && !c.apiKey.startsWith('BURAYA_')){
    if(!firebase.apps.length) firebase.initializeApp(c);
    const messaging=firebase.messaging();
    messaging.onBackgroundMessage(payload=>{
      const d=payload.data||{}, n=payload.notification||{};
      return self.registration.showNotification(n.title||d.title||'🚨 Acil Necati',{
        body:n.body||d.body||'Yeni çağrı ❤️',
        icon:'./icons/icon-192.png',
        badge:'./icons/icon-192.png',
        tag:d.type==='emergency'?'necati-emergency':'necati-notification',
        renotify:true,
        requireInteraction:d.type==='emergency',
        vibrate:[300,120,300,120,600],
        data:{url:d.url||'./?open=emergency'}
      });
    });
  }
}catch(e){ console.warn('FCM SW v5.4 pasif',e); }

self.addEventListener('notificationclick', event=>{
  event.notification.close();
  const target=event.notification.data?.url||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
    for(const w of ws){
      if('focus' in w){ w.navigate(target).catch(()=>{}); return w.focus(); }
    }
    return clients.openWindow(target);
  }));
});