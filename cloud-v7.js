(function(){
  const cfg=window.NECATI_FIREBASE;
  const osCfg=window.NECATI_ONESIGNAL||{};
  let auth,db,storage,messaging,user=null,unsubState=null,unsubNotifs=null,saveTimer=null,ready=false,pollTimer=null;
  let oneSignalReady=false;
  let oneSignalInitPromise=null;
  let presenceTimer=null,lastPresenceWrite=0;
  const imageCache=new Map();
  const $=id=>document.getElementById(id);
  const configured=()=>cfg&&cfg.config&&cfg.config.apiKey&&!cfg.config.apiKey.startsWith('BURAYA_')&&cfg.config.projectId;
  const safeToast=m=>window.necatiToast?.(m);
  const setStatus=(text,on=false)=>{const el=$('cloudStatus');if(el){el.textContent=`● ${text}`;el.classList.toggle('online',on)}};
  window.NECATI_CLOUD_VERSION='10.0';

  function roleFromEmail(email=''){
    const e=String(email).toLowerCase();
    if(e.includes('nisa'))return 'nisa';
    if(e.includes('necati'))return 'necati';
    return null;
  }
  function displayName(){return roleFromEmail(user?.email)==='nisa'?'Nisa':'Necati'}
  function notifStoreKey(){return `necati-seen-notifs-${user?.uid||'anon'}`}
  function loadSeen(){try{return new Set(JSON.parse(localStorage.getItem(notifStoreKey())||'[]'))}catch{return new Set()}}
  function saveSeen(s){localStorage.setItem(notifStoreKey(),JSON.stringify([...s].slice(-300)))}

  async function initOneSignal(){
    if(oneSignalInitPromise)return oneSignalInitPromise;
    if(!osCfg.appId||osCfg.appId.startsWith('BURAYA_'))return false;
    window.OneSignalDeferred=window.OneSignalDeferred||[];
    oneSignalInitPromise=new Promise(resolve=>{
      let settled=false;
      const finish=v=>{if(settled)return;settled=true;resolve(v)};
      window.OneSignalDeferred.push(async OneSignal=>{
        try{
          await OneSignal.init({appId:osCfg.appId,serviceWorkerPath:osCfg.serviceWorkerPath,serviceWorkerParam:{scope:osCfg.serviceWorkerScope}});
          oneSignalReady=true;
          window.NecatiOneSignal=OneSignal;
          finish(true);
          // Firebase auth can restore faster than OneSignal loads, especially on iPhone/PWA.
          // If a user is already known, bind that subscription immediately after init.
          if(user) setTimeout(()=>identifyOneSignal(user).catch(console.warn),0);
        }catch(e){
          console.warn('OneSignal init',e);
          safeToast('OneSignal başlatılamadı: '+(e?.message||e));
          oneSignalInitPromise=null;
          finish(false);
        }
      });
      setTimeout(()=>finish(oneSignalReady),10000);
    });
    return oneSignalInitPromise;
  }
  async function identifyOneSignal(u){
    if(!u)return false;
    if(!oneSignalReady||!window.NecatiOneSignal){
      const ok=await initOneSignal();
      if(!ok||!window.NecatiOneSignal)return false;
    }
    const role=roleFromEmail(u.email);if(!role)return false;
    try{
      await window.NecatiOneSignal.login(role);
      await window.NecatiOneSignal.User.addTag('role',role);
      console.info('[Necati Push] OneSignal identity:',role,'subscription:',window.NecatiOneSignal.User.PushSubscription?.id||null);
      return true;
    }catch(e){
      console.warn('[Necati Push] identify failed',e);
      return false;
    }
  }
  async function unidentifyOneSignal(){try{if(oneSignalReady)await window.NecatiOneSignal?.logout()}catch{}}
  function openAuthDialog(){const d=$('authDialog');if(!d)return; $('authSetupWarning').hidden=configured(); try{d.showModal()}catch{d.setAttribute('open','')}}

  async function init(){
    $('userBtn')?.addEventListener('click',openAuthDialog);window.openNecatiAuth=openAuthDialog;
    $('loginBtn')?.addEventListener('click',login);$('logoutBtn')?.addEventListener('click',async()=>{await unidentifyOneSignal();auth?.signOut()});
    $('enablePushBtn')?.addEventListener('click',enablePush);$('testPushBtn')?.addEventListener('click',()=>showSystemNotification({title:'🧪 Necati Cepte test',body:'Bildirim sistemi çalışıyor ❤️'},true));
    initOneSignal().catch(console.warn);
    if(!configured()){setStatus('Yerel');return}
    try{
      if(!firebase.apps.length)firebase.initializeApp(cfg.config);
      auth=firebase.auth();db=firebase.firestore();try{storage=firebase.storage()}catch{}
      try{messaging=firebase.messaging()}catch{}
      auth.onAuthStateChanged(handleAuth);
    }catch(e){console.error(e);setStatus('Firebase hatası')}
  }
  async function login(){
    if(!configured())return safeToast('Önce Firebase kurulumunu tamamla');
    const email=$('authEmail').value.trim(),password=$('authPassword').value;if(!email||!password)return safeToast('E-posta ve şifre gerekli');
    try{await auth.signInWithEmailAndPassword(email,password);$('authDialog').close();safeToast('Buluta bağlandın ☁️❤️')}catch(e){safeToast('Giriş olmadı: '+(e.code||e.message))}
  }
  async function handleAuth(u){
    user=u;ready=!!u;$('loggedOutBox').hidden=!!u;$('loggedInBox').hidden=!u;
    if(u){$('accountEmail').textContent=u.email||'Giriş yapıldı';setStatus('Senkron',true);await startSync();await identifyOneSignal(u);await updatePresence(true);startPresenceHeartbeat();window.dispatchEvent(new CustomEvent('necati:authchange',{detail:{role:roleFromEmail(u.email)}}))}
    else{setStatus(configured()?'Giriş yok':'Yerel');stopSync();window.dispatchEvent(new CustomEvent('necati:authchange',{detail:{role:null}}))}
  }
  function stopSync(){unsubState?.();unsubNotifs?.();clearInterval(pollTimer);clearInterval(presenceTimer);unsubState=unsubNotifs=null;pollTimer=null;presenceTimer=null;ready=false}
  async function startSync(){
    const ref=db.collection('couples').doc(cfg.coupleId),snap=await ref.get();
    if(!snap.exists){const local=JSON.parse(localStorage.getItem('necati-cepte-v2')||'null');if(local)await ref.set({data:local,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
    unsubState=ref.onSnapshot(s=>{const d=s.data();if(d?.data)window.applyCloudState?.(d.data)});
    const seen=loadSeen();let boot=true;
    const process=doc=>{if(seen.has(doc.id))return;const n=doc.data();seen.add(doc.id);if(n.senderUid===user.uid)return;const created=n.createdAt?.toMillis?.()||n.clientCreatedAt||0;if(boot&&created&&Date.now()-created>300000)return;showIncoming(n)};
    unsubNotifs=ref.collection('notifications').orderBy('createdAt','desc').limit(40).onSnapshot(q=>{q.docChanges().forEach(ch=>{if(ch.type==='added')process(ch.doc)});boot=false;saveSeen(seen)});
    pollTimer=setInterval(async()=>{if(document.hidden||!ready)return;try{const q=await ref.collection('notifications').orderBy('createdAt','desc').limit(12).get();q.docs.slice().reverse().forEach(process);saveSeen(seen)}catch{}},20000);
  }
  async function updatePresence(force=false){
    if(!ready||!user||!db)return;
    if(document.hidden&&!force)return;
    const now=Date.now();if(!force&&now-lastPresenceWrite<45000)return;
    const role=roleFromEmail(user.email||'');if(!role)return;
    lastPresenceWrite=now;
    try{
      await db.collection('couples').doc(cfg.coupleId).collection('presence').doc(role).set({
        role,email:user.email||'',lastSeenAt:firebase.firestore.FieldValue.serverTimestamp(),lastSeenClient:now
      },{merge:true});
    }catch(e){console.warn('presence',e)}
  }
  function startPresenceHeartbeat(){clearInterval(presenceTimer);presenceTimer=setInterval(()=>updatePresence(false),60000)}

  function scheduleSave(state){if(!ready||!user)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>db.collection('couples').doc(cfg.coupleId).set({data:JSON.parse(JSON.stringify(state)),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(console.error),350)}

  async function fileToDataUrl(file){
    if(!file) return '';
    return new Promise((resolve,reject)=>{
      const fr=new FileReader();
      fr.onerror=()=>reject(new Error('Fotoğraf okunamadı'));
      fr.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('Fotoğraf açılamadı'));
        img.onload=()=>{
          try{
            // Firestore document limitine güvenli biçimde sığmak için
            // hem çözünürlüğü hem kaliteyi gerektiğinde düşür.
            let maxSide=960;
            let quality=.70;
            let data='';

            for(let pass=0; pass<7; pass++){
              const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
              const c=document.createElement('canvas');
              c.width=Math.max(1,Math.round(img.width*scale));
              c.height=Math.max(1,Math.round(img.height*scale));
              const ctx=c.getContext('2d');
              ctx.drawImage(img,0,0,c.width,c.height);
              data=c.toDataURL('image/jpeg',quality);

              // ~600 KB base64 altında tut.
              if(data.length<620000) break;

              if(quality>.46) quality-=.08;
              else maxSide=Math.max(520,Math.round(maxSide*.78));
            }

            if(!data || data.length>850000){
              return reject(new Error('Fotoğraf çok büyük. Daha küçük bir fotoğraf seç'));
            }
            resolve(data);
          }catch(e){ reject(e); }
        };
        img.src=fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  async function uploadImage(file){
    if(!file)return '';
    if(!ready)throw new Error('Önce hesaba giriş yap');

    // v7.0.1: Firebase Storage ücretli/kapalı olduğu için kesinlikle denenmez.
    // Fotoğraf küçültülüp Firestore'da ayrı belge olarak tutulur.
    const dataUrl=await fileToDataUrl(file);
    const photoRef=db.collection('couples').doc(cfg.coupleId).collection('photos').doc();

    const savePromise=photoRef.set({
      dataUrl,
      ownerUid:user.uid,
      ownerEmail:user.email||'',
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });

    const timeout=new Promise((_,reject)=>
      setTimeout(()=>reject(new Error('Fotoğraf yükleme zaman aşımına uğradı')),15000)
    );

    await Promise.race([savePromise,timeout]);
    imageCache.set(photoRef.id,dataUrl);
    return `firestore-photo:${photoRef.id}`;
  }

  async function resolveImage(ref){
    if(!ref||!String(ref).startsWith('firestore-photo:'))return ref||'';const id=String(ref).split(':')[1];if(imageCache.has(id))return imageCache.get(id);if(!ready)return '';
    const snap=await db.collection('couples').doc(cfg.coupleId).collection('photos').doc(id).get();const url=snap.data()?.dataUrl||'';if(url)imageCache.set(id,url);return url;
  }

  async function sendActivity(title,body,type='activity',open='home'){
    if(!ready)throw new Error('Önce hesaba giriş yap');
    const payload={title,body,type,senderUid:user.uid,senderEmail:user.email||'',clientCreatedAt:Date.now(),createdAt:firebase.firestore.FieldValue.serverTimestamp()};
    await db.collection('couples').doc(cfg.coupleId).collection('notifications').add(payload);
    if(cfg.pushSenderUrl&&!cfg.pushSenderUrl.startsWith('BURAYA_')){
      const token=await user.getIdToken();const r=await fetch(cfg.pushSenderUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({title,body,type,url:location.origin+location.pathname+`?open=${encodeURIComponent(open)}`})});
      const text=await r.text();let j={};try{j=JSON.parse(text)}catch{}if(!r.ok||j.ok===false)throw new Error(j.error?JSON.stringify(j.error):`HTTP ${r.status}`);return j
    }
    return {ok:true,localOnly:true}
  }
  async function sendEmergency(type){return sendActivity('🚨 Acil Necati',`${type} ❤️`,'emergency','emergency')}
  async function sendMoodChange(mood,label){return sendActivity('🌸 Ruh hali değişti',`${mood} ${label} ❤️`,'mood','mood')}

  async function enablePush(){
    if(osCfg.appId&&!osCfg.appId.startsWith('BURAYA_')){
      try{if(!oneSignalReady)await initOneSignal();const O=window.NecatiOneSignal;if(!O)throw new Error('OneSignal yüklenemedi');await O.Notifications.requestPermission();if(!O.Notifications.permission)return safeToast('Bildirim izni verilmedi');await O.User.PushSubscription.optIn();let id=O.User.PushSubscription.id;for(let i=0;i<12&&!id;i++){await new Promise(r=>setTimeout(r,500));id=O.User.PushSubscription.id}if(user)await identifyOneSignal(user);if(id){$('enablePushBtn').textContent='✅ Bildirimler açık';safeToast('Gerçek push aktif 🔔❤️')}else safeToast('İzin verildi ama push token oluşmadı')}catch(e){safeToast('Bildirim açılamadı: '+(e?.message||e))}
    }
  }
  async function showSystemNotification(n,force=false){if(!('Notification'in window)||Notification.permission!=='granted'){if(force)safeToast('Önce bildirim izni ver 🔔');return}try{const reg=await navigator.serviceWorker.ready;await reg.showNotification(n.title||'Necati Cepte ❤️',{body:n.body||'',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:n.type||'necati',renotify:true,requireInteraction:n.type==='emergency',vibrate:[250,120,250]})}catch{}}
  function showIncoming(n){safeToast(`${n.title||'Necati Cepte'} — ${n.body||''}`);window.dispatchEvent(new CustomEvent('necati:incoming',{detail:n}));showSystemNotification(n)}

  window.NecatiCloud={version:'10.0',scheduleSave,uploadImage,resolveImage,sendActivity,sendEmergency,sendMoodChange,enablePush,isReady:()=>ready,user:()=>user,role:()=>roleFromEmail(user?.email||''),displayName,diagnostics:()=>({ready,role:roleFromEmail(user?.email||''),email:user?.email||null,oneSignalReady,permission:window.NecatiOneSignal?.Notifications?.permission??null,optedIn:window.NecatiOneSignal?.User?.PushSubscription?.optedIn??null,subscriptionId:window.NecatiOneSignal?.User?.PushSubscription?.id||null,oneSignalId:window.NecatiOneSignal?.User?.onesignalId||null})};
  window.addEventListener('focus',()=>updatePresence(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)updatePresence(true)});window.addEventListener('DOMContentLoaded',init);
})();
