(function(){
  const cfg=window.NECATI_FIREBASE;
  let auth,db,storage,messaging,user=null,unsubState=null,unsubNotifs=null,saveTimer=null,ready=false,pollTimer=null,lastNotifCheck=Date.now();
  const $=id=>document.getElementById(id);
  const configured=()=>cfg&&cfg.config&&cfg.config.apiKey&&!cfg.config.apiKey.startsWith('BURAYA_')&&cfg.config.projectId&&!cfg.config.projectId.startsWith('BURAYA_');
  const setStatus=(text,on=false)=>{const el=$('cloudStatus');if(!el)return;el.textContent=`● ${text}`;el.classList.toggle('online',on)};
  const safeToast=m=>window.necatiToast?.(m); window.NECATI_CLOUD_VERSION='6';
  const notifStoreKey=()=>`necati-seen-notifs-${user?.uid||'anon'}`;

  const osCfg=window.NECATI_ONESIGNAL||{};
  let oneSignalReady=false;

  function roleFromEmail(email=''){
    const e=String(email).toLowerCase();
    if(e.includes('nisa')) return 'nisa';
    if(e.includes('necati')) return 'necati';
    return null;
  }

  async function initOneSignal(){
    if(!osCfg.appId || osCfg.appId.startsWith('BURAYA_')) return false;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    return new Promise(resolve=>{
      window.OneSignalDeferred.push(async function(OneSignal){
        try{
          await OneSignal.init({
            appId: osCfg.appId,
            serviceWorkerPath: osCfg.serviceWorkerPath,
            serviceWorkerParam: { scope: osCfg.serviceWorkerScope }
          });
          oneSignalReady=true;
          window.NecatiOneSignal=OneSignal;
          resolve(true);
        }catch(e){
          console.warn('OneSignal init hatası',e);
          resolve(false);
        }
      });
      setTimeout(()=>resolve(oneSignalReady),8000);
    });
  }

  async function identifyOneSignal(u){
    if(!u || !oneSignalReady || !window.NecatiOneSignal) return;
    const role=roleFromEmail(u.email);
    if(!role) return;
    try{
      await window.NecatiOneSignal.login(role);
      await window.NecatiOneSignal.User.addTag('role', role);
    }catch(e){console.warn('OneSignal kullanıcı tanımlama hatası',e)}
  }

  async function unidentifyOneSignal(){
    if(!oneSignalReady || !window.NecatiOneSignal) return;
    try{ await window.NecatiOneSignal.logout(); }catch(e){}
  }
  function openAuthDialog(){
    const d=$('authDialog');
    if(!d)return safeToast('Hesap ekranı bulunamadı');
    $('authSetupWarning').hidden=configured();
    try{
      if(typeof d.showModal==='function') d.showModal();
      else { d.setAttribute('open',''); d.style.display='block'; }
    }catch(e){
      d.setAttribute('open',''); d.style.display='block';
    }
  }

  async function init(){
    $('userBtn')?.addEventListener('click',()=>openAuthDialog());
    window.openNecatiAuth=openAuthDialog;
    $('loginBtn')?.addEventListener('click',login);
    $('logoutBtn')?.addEventListener('click',async()=>{await unidentifyOneSignal();auth?.signOut()});
    $('enablePushBtn')?.addEventListener('click',enablePush);
    $('testPushBtn')?.addEventListener('click',()=>showSystemNotification({title:'🧪 Necati Cepte test',body:'Bildirim sistemi çalışıyor ❤️'},true));
    initOneSignal().catch(console.warn);
    if(!configured()){setStatus('Yerel');return;}
    try{
      if(!firebase.apps.length)firebase.initializeApp(cfg.config);
      auth=firebase.auth();
      db=firebase.firestore();
      try{storage=firebase.storage()}catch(e){console.warn('Storage pasif',e)}
      try{
        messaging=firebase.messaging();
        messaging.onMessage(payload=>{
          const n={title:payload.notification?.title||payload.data?.title||'Necati Cepte ❤️',body:payload.notification?.body||payload.data?.body||'Yeni bildirim',type:payload.data?.type||'notification'};
          showIncoming(n);
        });
      }catch(e){console.warn('Messaging unavailable',e)}
      auth.onAuthStateChanged(handleAuth);
    }catch(e){console.error(e);setStatus('Firebase hatası');}
  }

  async function login(){
    if(!configured())return safeToast('Önce Firebase kurulumunu tamamla');
    const email=$('authEmail').value.trim(), password=$('authPassword').value;
    if(!email||!password)return safeToast('E-posta ve şifre gerekli');
    try{await auth.signInWithEmailAndPassword(email,password);$('authDialog').close();safeToast('Buluta bağlandın ☁️❤️')}catch(e){safeToast('Giriş olmadı: '+(e.code||e.message))}
  }

  async function handleAuth(u){
    user=u; ready=!!u;
    $('loggedOutBox').hidden=!!u; $('loggedInBox').hidden=!u;
    if(u){
      $('accountEmail').textContent=u.email||'Giriş yapıldı';setStatus('Senkron',true);await startSync();await identifyOneSignal(u);
      if(Notification.permission==='granted') $('enablePushBtn').textContent='✅ Bildirimler açık';
    } else {setStatus(configured()?'Giriş yok':'Yerel');stopSync();}
  }

  function stopSync(){unsubState?.();unsubNotifs?.();clearInterval(pollTimer);pollTimer=null;unsubState=unsubNotifs=null;ready=false;}

  function loadSeen(){try{return new Set(JSON.parse(localStorage.getItem(notifStoreKey())||'[]'))}catch{return new Set()}}
  function saveSeen(seen){localStorage.setItem(notifStoreKey(),JSON.stringify([...seen].slice(-200)))}

  async function startSync(){
    const ref=db.collection('couples').doc(cfg.coupleId);
    const snap=await ref.get();
    if(!snap.exists){
      const local=JSON.parse(localStorage.getItem('necati-cepte-v2')||'null');
      if(local)await ref.set({data:local,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }
    unsubState=ref.onSnapshot(s=>{const d=s.data();if(d?.data)window.applyCloudState?.(d.data)});

    const seen=loadSeen();
    let booting=true;
    const processDoc=(doc,fromBoot=false)=>{
      if(seen.has(doc.id))return;
      const n=doc.data();
      const created=n.createdAt?.toMillis?.()||n.clientCreatedAt||0;
      const fresh=!created || (Date.now()-created)<300000;
      seen.add(doc.id);
      if(n.senderUid===user.uid)return;
      if(fromBoot&&!fresh)return;
      showIncoming(n);
    };
    unsubNotifs=ref.collection('notifications').orderBy('createdAt','desc').limit(30).onSnapshot(q=>{
      q.docChanges().forEach(ch=>{if(ch.type==='added')processDoc(ch.doc,booting)});
      booting=false;saveSeen(seen);
    },err=>{console.error('Bildirim dinleyicisi hatası',err);safeToast('Canlı bildirim bağlantısı yeniden deneniyor…')});
    // Bazı mobil tarayıcılar arka plana geçince canlı Firestore bağlantısını uyutabiliyor.
    // Uygulama tekrar aktif olduğunda ve her 20 sn'de bir kısa sorgu ile kaçan çağrıları yakala.
    const poll=async()=>{if(!ready||document.hidden)return;try{const q=await ref.collection('notifications').orderBy('createdAt','desc').limit(10).get();q.docs.slice().reverse().forEach(d=>processDoc(d,false));saveSeen(seen)}catch(e){console.warn('Bildirim yedek sorgusu',e)}};
    pollTimer=setInterval(poll,20000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()},{passive:true});
  }

  function scheduleSave(state){
    if(!ready||!user)return;
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>db.collection('couples').doc(cfg.coupleId).set({data:JSON.parse(JSON.stringify(state)),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(console.error),500)
  }

  async function uploadImage(file){
    if(!ready)throw new Error('not-authenticated');
    if(!storage)throw new Error('storage-disabled');
    const ext=(file.name.split('.').pop()||'jpg').replace(/[^a-z0-9]/gi,'');
    const path=`couples/${cfg.coupleId}/photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const ref=storage.ref(path);await ref.put(file);return await ref.getDownloadURL();
  }

  async function sendEmergency(type){
    if(!ready)throw new Error('not-authenticated');
    const title='🚨 Acil Necati';
    const body=`${type} ❤️`;
    await db.collection('couples').doc(cfg.coupleId).collection('notifications').add({
      title,body,type:'emergency',senderUid:user.uid,senderEmail:user.email||'',clientCreatedAt:Date.now(),createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    // Gerçek kapalı-uygulama push: Cloudflare Worker -> OneSignal.
    if(cfg.pushSenderUrl && !cfg.pushSenderUrl.startsWith('BURAYA_')){
      try{
        const idToken=await user.getIdToken();
        const r=await fetch(cfg.pushSenderUrl,{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+idToken},
          body:JSON.stringify({
            title,
            body,
            type:'emergency',
            url:location.origin+location.pathname+'?open=emergency'
          })
        });
        const txt=await r.text();
        let result=null; try{result=JSON.parse(txt)}catch{}
        if(!r.ok || result?.ok===false){
          safeToast('Push gönderilemedi: '+(result?.error||('HTTP '+r.status)));
          console.warn('OneSignal push hatası',txt);
        }else{
          safeToast('Acil Necati gönderildi 🚨❤️');
        }
      }catch(e){
        console.warn('OneSignal push gönderilemedi',e);
        safeToast('Push bağlantı hatası: '+e.message);
      }
    }
  }

  async function enablePush(){
    // iPhone/iPad'de bu buton, uygulama Ana Ekran'dan açıldıktan sonra basılmalıdır.
    if(osCfg.appId && !osCfg.appId.startsWith('BURAYA_')){
      try{
        if(!oneSignalReady) await initOneSignal();
        const OneSignal=window.NecatiOneSignal;
        if(!OneSignal) throw new Error('OneSignal yüklenemedi');
        if(user) await identifyOneSignal(user);
        await OneSignal.Notifications.requestPermission();
        if(OneSignal.Notifications.permission){
          $('enablePushBtn').textContent='✅ Bildirimler açık';
          safeToast('Gerçek push bildirimleri açıldı 🔔❤️');
        }else{
          safeToast('Bildirim izni verilmedi');
        }
        return;
      }catch(e){
        console.warn('OneSignal izin hatası',e);
        safeToast('Bildirim açılamadı: '+e.message);
        return;
      }
    }

    // OneSignal App ID henüz girilmediyse eski yerel bildirim testi.
    if(!('Notification' in window))return safeToast('Bu tarayıcı bildirim desteklemiyor');
    try{
      const perm=await Notification.requestPermission();
      if(perm!=='granted')return safeToast('Bildirim izni verilmedi');
      $('enablePushBtn').textContent='⚠️ Yerel bildirim açık';
      safeToast('OneSignal App ID eklenince kapalı uygulama push aktif olacak');
    }catch(e){safeToast('Bildirim açılamadı: '+e.message)}
  }

  async function showSystemNotification(n,force=false){
    if(Notification.permission!=='granted'){
      if(force)safeToast('Önce bildirim izni ver 🔔');
      return;
    }
    try{
      const reg=await navigator.serviceWorker.ready;
      await reg.showNotification(n.title||'Necati Cepte ❤️',{
        body:n.body||'Yeni bir bildirim var',
        icon:'./icons/icon-192.png',
        badge:'./icons/icon-192.png',
        tag:n.type==='emergency'?'necati-emergency':'necati-notification',
        renotify:true,
        requireInteraction:n.type==='emergency',
        vibrate:[250,120,250,120,500],
        data:{url:'./?open=emergency'}
      });
      if(navigator.vibrate)navigator.vibrate([250,120,250,120,500]);
    }catch(e){
      // Masaüstünde SW bildirimi başarısızsa normal Notification dene.
      try{new Notification(n.title||'Necati Cepte ❤️',{body:n.body||''})}catch{}
    }
  }

  function showIncoming(n){
    safeToast(`${n.title||'Necati Cepte'} — ${n.body||''}`);
    window.dispatchEvent(new CustomEvent('necati:incoming',{detail:n}));
    showSystemNotification(n);
  }

  window.NecatiCloud={version:'6',
    scheduleSave,uploadImage,sendEmergency,isReady:()=>ready,hasStorage:()=>!!storage,user:()=>user,enablePush,
    diagnostics:()=>({
      configured: configured(),
      ready,
      hasAuth: !!auth,
      hasDb: !!db,
      hasMessaging: !!messaging,
      notificationPermission: ('Notification' in window)?Notification.permission:'unsupported',
      firebaseApps: (window.firebase&&firebase.apps)?firebase.apps.length:0,
      pushSenderUrl: cfg?.pushSenderUrl||'',
      oneSignalConfigured: !!(osCfg.appId && !osCfg.appId.startsWith('BURAYA_')),
      oneSignalReady,
      oneSignalRole: roleFromEmail(user?.email||'')
    })
  };
  window.addEventListener('DOMContentLoaded',init);
})();
