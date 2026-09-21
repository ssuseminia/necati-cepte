function cors(origin='*'){
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };
}
async function verifyFirebaseIdToken(idToken,env){
  if(!idToken || !env.FIREBASE_API_KEY)return null;
  const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken})});
  if(!r.ok)return null;const d=await r.json();return d.users?.[0]||null;
}
function roleFromEmail(email=''){const e=String(email).toLowerCase();if(e.includes('nisa'))return'nisa';if(e.includes('necati'))return'necati';return null}
function b64url(input){const bytes=input instanceof Uint8Array?input:new TextEncoder().encode(String(input));let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function pemToBytes(pem){const s=String(pem).replace(/\\n/g,'\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');const raw=atob(s);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
async function googleAccessToken(env){
  if(!env.FIREBASE_CLIENT_EMAIL||!env.FIREBASE_PRIVATE_KEY)return null;
  const now=Math.floor(Date.now()/1000);const header=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));const claims=b64url(JSON.stringify({iss:env.FIREBASE_CLIENT_EMAIL,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3300}));const signing=`${header}.${claims}`;
  const key=await crypto.subtle.importKey('pkcs8',pemToBytes(env.FIREBASE_PRIVATE_KEY),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(signing));
  const jwt=`${signing}.${b64url(new Uint8Array(sig))}`;
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:jwt})});
  if(!r.ok)throw new Error('Google OAuth '+await r.text());return (await r.json()).access_token;
}
function fsBase(env){return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents`}
function fsVal(v){if(v==null)return{nullValue:null};if(typeof v==='string')return{stringValue:v};if(typeof v==='number')return{integerValue:String(Math.floor(v))};if(typeof v==='boolean')return{booleanValue:v};return{stringValue:String(v)}}
function fsDecode(fields={}){const out={};for(const [k,v] of Object.entries(fields)){if('stringValue'in v)out[k]=v.stringValue;else if('integerValue'in v)out[k]=Number(v.integerValue);else if('timestampValue'in v)out[k]=Date.parse(v.timestampValue);else if('booleanValue'in v)out[k]=v.booleanValue}return out}
async function fsGet(env,token,path){const r=await fetch(`${fsBase(env)}/${path}`,{headers:{Authorization:`Bearer ${token}`}});if(r.status===404)return null;if(!r.ok)throw new Error('Firestore GET '+await r.text());return fsDecode((await r.json()).fields)}
async function fsPatch(env,token,path,data){const fields={};for(const [k,v] of Object.entries(data))fields[k]=fsVal(v);const mask=Object.keys(fields).map(k=>'updateMask.fieldPaths='+encodeURIComponent(k)).join('&');const r=await fetch(`${fsBase(env)}/${path}?${mask}`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({fields})});if(!r.ok)throw new Error('Firestore PATCH '+await r.text())}
async function sendPush(env,targetRole,title,body,url){
  if(!env.ONESIGNAL_APP_ID||!env.ONESIGNAL_REST_API_KEY)throw new Error('OneSignal secrets eksik');
  const payload={app_id:env.ONESIGNAL_APP_ID,target_channel:'push',include_aliases:{external_id:[targetRole]},headings:{tr:title,en:title},contents:{tr:body,en:body},url:url||'https://ssuseminia.github.io/necati-cepte/',priority:10};
  const r=await fetch('https://api.onesignal.com/notifications',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8','Authorization':`Key ${env.ONESIGNAL_REST_API_KEY}`},body:JSON.stringify(payload)});const text=await r.text();let result=null;try{result=JSON.parse(text)}catch{}if(!r.ok)throw new Error(JSON.stringify(result?.errors||text));return result;
}
async function checkInactivity(env){
  const token=await googleAccessToken(env);if(!token)return;
  const coupleId=env.FIREBASE_COUPLE_ID||'nisa-necati';const now=Date.now();const threshold=20*60*1000;
  for(const role of ['nisa','necati']){
    const presence=await fsGet(env,token,`couples/${coupleId}/presence/${role}`);if(!presence)continue;
    const seen=Number(presence.lastSeenClient||presence.lastSeenAt||0);if(!seen||now-seen<threshold)continue;
    const markerPath=`couples/${coupleId}/system/inactivity-${role}`;const marker=await fsGet(env,token,markerPath);const lastSeenAlerted=Number(marker?.lastSeenAlerted||0);
    if(lastSeenAlerted===seen)continue;
    const other=role==='nisa'?'Necati':'Nisa';
    await sendPush(env,role,'🥺 Özledim seni',`${other} seni özledi ❤️ Uygulamaya bi uğrasana`,'https://ssuseminia.github.io/necati-cepte/');
    await fsPatch(env,token,markerPath,{lastSeenAlerted:seen,alertedAt:now});
  }
}
export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin')||'*';if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});if(request.method!=='POST')return new Response(JSON.stringify({ok:false,error:'POST only'}),{status:405,headers:cors(origin)});
    try{
      const auth=request.headers.get('Authorization')||'';const idToken=auth.startsWith('Bearer ')?auth.slice(7):'';const verified=await verifyFirebaseIdToken(idToken,env);if(!verified)return new Response(JSON.stringify({ok:false,error:'unauthorized'}),{status:401,headers:cors(origin)});
      const senderRole=roleFromEmail(verified.email||verified.emailAddress||'');if(!senderRole)return new Response(JSON.stringify({ok:false,error:'Hesap rolü belirlenemedi'}),{status:400,headers:cors(origin)});const targetRole=senderRole==='nisa'?'necati':'nisa';
      const body=await request.json();const result=await sendPush(env,targetRole,String(body.title||'Necati Cepte ❤️'),String(body.body||'Seni çağırıyor ❤️'),String(body.url||'https://ssuseminia.github.io/necati-cepte/'));
      return new Response(JSON.stringify({ok:true,targetRole,oneSignal:result}),{status:200,headers:cors(origin)});
    }catch(e){return new Response(JSON.stringify({ok:false,error:String(e?.message||e)}),{status:500,headers:cors(origin)})}
  },
  async scheduled(event,env,ctx){ctx.waitUntil(checkInactivity(env).catch(e=>console.error('inactivity',e)))}
};
