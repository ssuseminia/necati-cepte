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
  const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({idToken})
  });
  if(!r.ok)return null;
  const d=await r.json();
  return d.users?.[0]||null;
}
function roleFromEmail(email=''){
  const e=String(email).toLowerCase();
  if(e.includes('nisa')) return 'nisa';
  if(e.includes('necati')) return 'necati';
  return null;
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

      if(!env.ONESIGNAL_APP_ID || !env.ONESIGNAL_REST_API_KEY){
        return new Response(JSON.stringify({ok:false,error:'OneSignal secrets eksik'}),{status:500,headers:cors(origin)});
      }

      const senderRole=roleFromEmail(verified.email||verified.emailAddress||'');
      if(!senderRole)return new Response(JSON.stringify({ok:false,error:'Hesap rolü belirlenemedi. E-postada nisa veya necati geçmeli.'}),{status:400,headers:cors(origin)});
      const targetRole=senderRole==='nisa'?'necati':'nisa';

      const body=await request.json();
      const payload={
        app_id: env.ONESIGNAL_APP_ID,
        target_channel:'push',
        include_aliases:{external_id:[targetRole]},
        headings:{tr:String(body.title||'🚨 Acil Necati'),en:String(body.title||'🚨 Acil Necati')},
        contents:{tr:String(body.body||'Seni çağırıyor ❤️'),en:String(body.body||'Seni çağırıyor ❤️')},
        url:String(body.url||'https://ssuseminia.github.io/necati-cepte/'),
        priority:10
      };

      const r=await fetch('https://api.onesignal.com/notifications',{
        method:'POST',
        headers:{
          'Content-Type':'application/json; charset=utf-8',
          'Authorization':`Key ${env.ONESIGNAL_REST_API_KEY}`
        },
        body:JSON.stringify(payload)
      });
      const text=await r.text();
      let result=null; try{result=JSON.parse(text)}catch{}
      if(!r.ok){
        return new Response(JSON.stringify({ok:false,error:result?.errors||text}),{status:r.status,headers:cors(origin)});
      }
      return new Response(JSON.stringify({ok:true,targetRole,oneSignal:result}),{status:200,headers:cors(origin)});
    }catch(e){
      return new Response(JSON.stringify({ok:false,error:String(e?.message||e)}),{status:500,headers:cors(origin)});
    }
  }
};