(function(){
  const cfg=window.NECATI_FIREBASE;
  let auth,db,storage,messaging,user=null,unsubState=null,unsubNotifs=null,saveTimer=null,ready=false;
  const $=id=>document.getElementById(id);
  const configured=()=>cfg&&cfg.config&&cfg.config.apiKey&&!cfg.config.apiKey.startsWith('BURAYA_')&&cfg.config.projectId&&!cfg.config.projectId.startsWith('BURAYA_');
  const setStatus=(text,on=false)=>{const el=$('cloudStatus');if(!el)return;el.textContent=`● ${text}`;el.classList.toggle('online',on)};
  const safeToast=m=>window.necatiToast?.(m);
  async function init(){
    $('userBtn')?.addEventListener('click',()=>{ $('authSetupWarning').hidden=configured(); $('authDialog').showModal(); });
    $('loginBtn')?.addEventListener('click',login);
    $('logoutBtn')?.addEventListener('click',()=>auth?.signOut());
    $('enablePushBtn')?.addEventListener('click',enablePush);
    if(!configured()){setStatus('Yerel');return;}
    try{
      if(!firebase.apps.length)firebase.initializeApp(cfg.config);
      auth=firebase.auth(); db=firebase.firestore(); storage=firebase.storage();
      try{messaging=firebase.messaging()}catch(e){console.warn('Messaging unavailable',e)}
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
    if(u){$('accountEmail').textContent=u.email||'Giriş yapıldı';setStatus('Senkron',true);await startSync();}
    else{setStatus(configured()?'Giriş yok':'Yerel');stopSync();}
  }
  function stopSync(){unsubState?.();unsubNotifs?.();unsubState=unsubNotifs=null;ready=false;}
  async function startSync(){
    const ref=db.collection('couples').doc(cfg.coupleId);
    const snap=await ref.get();
    if(!snap.exists){
      const local=JSON.parse(localStorage.getItem('necati-cepte-v2')||'null');
      if(local)await ref.set({data:local,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }
    unsubState=ref.onSnapshot(s=>{const d=s.data();if(d?.data)window.applyCloudState?.(d.data)});
    const seen=new Set(JSON.parse(sessionStorage.getItem('necati-seen-notifs')||'[]'));
    unsubNotifs=ref.collection('notifications').orderBy('createdAt','desc').limit(20).onSnapshot(q=>{
      q.docChanges().forEach(ch=>{if(ch.type!=='added'||seen.has(ch.doc.id))return;const n=ch.doc.data();seen.add(ch.doc.id);if(n.senderUid===user.uid)return;showIncoming(n);});
      sessionStorage.setItem('necati-seen-notifs',JSON.stringify([...seen].slice(-100)));
    });
  }
  function scheduleSave(state){if(!ready||!user)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>db.collection('couples').doc(cfg.coupleId).set({data:JSON.parse(JSON.stringify(state)),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(console.error),500)}
  async function uploadImage(file){
    if(!ready)throw new Error('not-authenticated');
    const ext=(file.name.split('.').pop()||'jpg').replace(/[^a-z0-9]/gi,'');
    const path=`couples/${cfg.coupleId}/photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const ref=storage.ref(path);await ref.put(file);return await ref.getDownloadURL();
  }
  async function sendEmergency(type){
    if(!ready)throw new Error('not-authenticated');
    const title='🚨 Acil Necati'; const body=`${type} ❤️`;
    await db.collection('couples').doc(cfg.coupleId).collection('notifications').add({title,body,type:'emergency',senderUid:user.uid,senderEmail:user.email||'',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  }
  async function enablePush(){
    if(!ready||!messaging)return safeToast('Bu cihazda push desteklenmiyor');
    if(!cfg.vapidKey||cfg.vapidKey.startsWith('BURAYA_'))return safeToast('firebase-config.js içine VAPID anahtarını ekle');
    try{
      const perm=await Notification.requestPermission();if(perm!=='granted')return safeToast('Bildirim izni verilmedi');
      const reg=await navigator.serviceWorker.ready;
      const token=await messaging.getToken({vapidKey:cfg.vapidKey,serviceWorkerRegistration:reg});
      if(!token)throw new Error('Token alınamadı');
      await db.collection('couples').doc(cfg.coupleId).collection('devices').doc(user.uid).set({uid:user.uid,email:user.email||'',token,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      safeToast('Push bildirimleri açıldı 🔔❤️');
      $('enablePushBtn').textContent='✅ Bildirimler açık';
    }catch(e){console.error(e);safeToast('Bildirim açılamadı: '+e.message)}
  }
  function showIncoming(n){
    safeToast(`${n.title||'Necati Cepte'} — ${n.body||''}`);
    if(document.hidden&&Notification.permission==='granted')navigator.serviceWorker.ready.then(r=>r.showNotification(n.title||'Necati Cepte',{body:n.body||'',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',data:{url:'./'}}));
  }
  window.NecatiCloud={scheduleSave,uploadImage,sendEmergency,isReady:()=>ready,user:()=>user};
  window.addEventListener('DOMContentLoaded',init);
})();
