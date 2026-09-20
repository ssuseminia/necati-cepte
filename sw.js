self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));await self.registration.unregister();const cs=await clients.matchAll({type:'window',includeUncontrolled:true});cs.forEach(c=>c.navigate('./reset.html'));})()));
self.addEventListener('fetch',()=>{});
