function cors(origin='*'){
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };
}
function b64url(input){
  const bytes=input instanceof Uint8Array?input:new TextEncoder().encode(input);
  let s=''; for(const b of bytes)s+=String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function pemToBuf(pem){
  const b64=pem.replace(/-----BEGIN PRIVATE KEY-----/g,'').replace(/-----END PRIVATE KEY-----/g,'').replace(/\s+/g,'');
  const bin=atob(b64); const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out.buffer;
}
async function googleAccessToken(env){
  const now=Math.floor(Date.now()/1000);
  const head=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const payload=b64url(JSON.stringify({
    iss:env.FIREBASE_CLIENT_EMAIL,
    scope:'https://www.googleapis.com/auth/firebase.messaging',
    aud:'https://oauth2.googleapis.com/token',
    iat:now,exp:now+3600
  }));
  const unsigned=`${head}.${payload}`;
  const key=await crypto.subtle.importKey(
    'pkcs8',
    pemToBuf(env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n')),
    {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},
    false,['sign']
  );
  const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(unsigned));
  const assertion=`${unsigned}.${b64url(new Uint8Array(sig))}`;
  const r=await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})
  });
  if(!r.ok)throw new Error('Google OAuth: '+await r.text());
  return (await r.json()).access_token;
}
async function verifyFirebaseIdToken(idToken,env){
  if(!idToken || !env.FIREBASE_API_KEY)return null;
  const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({idToken})
  });
  if(!r.ok)return null;
  const d=await r.json();
  return d.users?.[0]||null;
}
export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin')||'*';
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
    if(request.method!=='POST')return new Response(JSON.stringify({ok:false,error:'POST only'}),{status:405,headers:cors(origin)});
    try{
      const auth=request.headers.get('Authorization')||'';
      const idToken=auth.startsWith('Bearer ')?auth.slice(7):'';
      const verified=await verifyFirebaseIdToken(idToken,env);
      if(!verified)return new Response(JSON.stringify({ok:false,error:'unauthorized'}),{status:401,headers:cors(origin)});

      const body=await request.json();
      // Necati Cepte `tokens` dizisi gönderir. Tek token da test için desteklenir.
      const incoming=Array.isArray(body.tokens)?body.tokens:(body.token?[body.token]:[]);
      const tokens=[...new Set(incoming.filter(Boolean))].slice(0,10);
      if(!tokens.length)return new Response(JSON.stringify({ok:true,sent:0}),{headers:cors(origin)});

      const access=await googleAccessToken(env);
      const endpoint=`https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`;
      let sent=0; const errors=[];
      for(const token of tokens){
        // Data-only kullanıyoruz; bildirimi sw.js gösterir. Böylece çift bildirim oluşmaz.
        const msg={message:{
          token,
          data:{
            title:String(body.title||'🚨 Acil Necati'),
            body:String(body.body||'Nisa seni çağırıyor ❤️'),
            type:String(body.type||'emergency'),
            url:String(body.url||'https://ssuseminia.github.io/necati-cepte/')
          },
          webpush:{headers:{Urgency:'high',TTL:'300'}}
        }};
        const r=await fetch(endpoint,{
          method:'POST',
          headers:{Authorization:`Bearer ${access}`,'Content-Type':'application/json'},
          body:JSON.stringify(msg)
        });
        if(r.ok)sent++; else errors.push(await r.text());
      }
      return new Response(JSON.stringify({ok:errors.length===0,sent,errors}),{status:errors.length?207:200,headers:cors(origin)});
    }catch(e){
      return new Response(JSON.stringify({ok:false,error:String(e?.message||e)}),{status:500,headers:cors(origin)});
    }
  }
};
