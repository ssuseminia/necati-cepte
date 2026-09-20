const $=id=>document.getElementById(id);
const STORAGE_KEY='necati-cepte-v2';
const defaultState={
 settings:{nisaBirthday:'',necatiBirthday:'',periodStartDate:'',periodLength:5,periodCycle:28,partnerName:'Nisa',ownerName:'Necati',relationshipDate:'2025-04-12T00:00',birthDate:'',lastPeriod:'',cycleLength:28,periodLength:5},
 mood:{today:'mutlu',history:[]},surprises:[{id:1,date:new Date().toISOString().slice(0,10),title:'Bugünün küçük sürprizi',message:'Bir adet uzun sarılma kazandın ❤️',type:'Mesaj'}],
 jar:['gülüşün en sıradan günümü bile güzelleştiriyor','yanında kendim olabiliyorum','birlikte saçmalamak dünyanın en güzel şeyi','zor günlerimde bile yanımda olduğunu hissediyorum','seninle gelecek düşünmek beni mutlu ediyor','sesini duyunca günüm değişiyor'],
 memories:[],stories:[{id:1,season:1,episode:1,date:'2025-04-12',title:'Biz olduk ❤️',text:'Nisa ve Necati hikâyesinin başladığı gün.',image:''},{id:2,season:2,episode:1,date:'2026-06-28',title:'Nişanımız 💍',text:'Hikâyemizin en özel bölümlerinden biri.',image:''}],
 specialDates:[{id:1,title:'Yıldönümümüz',date:'2027-04-12',repeat:'yearly'},{id:2,title:'Nişan yıldönümümüz',date:'2027-06-28',repeat:'yearly'}],
 nights:[],sky:{date:'',lat:37.0662,lon:37.3833,label:'Gaziantep',lastDaily:''},emergencyLog:[]
};
let state=loadState(),leafletMap=null,pickerMap=null,pickerMarker=null,deferredPrompt,currentModule=null;
const moodMap={mutlu:{label:'Mutlu',emoji:'🥰'},iyi:{label:'İyi',emoji:'🙂'},yorgun:{label:'Yorgun',emoji:'😴'},uzgun:{label:'Üzgün',emoji:'😔'},gergin:{label:'Gergin',emoji:'😡'}};
const moodTips={mutlu:'Enerji yüksek ❤️ Küçük bir sürpriz veya uzun bir sarılma çok yakışır.',iyi:'Sakin ve tatlı bir gün. “Bir şeye ihtiyacın var mı?” sorusu puan kazandırır.',yorgun:'Planı hafiflet, dinlenmesine alan aç ve çay/kahve teklif et ☕',uzgun:'Çözüm sunmadan önce dinle. “Yanındayım” demek bugün daha değerli olabilir.',gergin:'Savunmaya geçmeden dinle 😅 Tartışmayı kazanmak yerine birbirinizi anlamaya çalışın.'};
const moodAssets={
 nisa:{mutlu:'assets/moods/nisa-mutlu.png',iyi:'assets/moods/nisa-iyi.png',yorgun:'assets/moods/nisa-yorgun.png',uzgun:'assets/moods/nisa-uzgun.png',gergin:'assets/moods/nisa-gergin.png'},
 necati:{mutlu:'assets/moods/necati-mutlu.png',iyi:'assets/moods/necati-iyi.png',yorgun:'assets/moods/necati-yorgun.png',uzgun:'assets/moods/necati-uzgun.png',gergin:'assets/moods/necati-gergin.png'}
};
const moduleNames={mood:'🌸 Nisa Modu',surprise:'🎁 Sürpriz Takvimi',jar:'🫙 Aşk Kavanozu',map:'📍 Anı Haritası',sky:'✨ Bizim Gökyüzümüz',story:'🎬 Hikâyemiz',dates:'💍 Özel Günler',night:'🌙 İyi Geceler',emergency:'🚨 Acil Necati',birthday:'🎂 Doğduğun Gün'};
function clone(x){return JSON.parse(JSON.stringify(x))}function merge(base,saved){if(!saved||typeof saved!=='object')return clone(base);const out=clone(base);for(const k of Object.keys(saved)){if(saved[k]&&typeof saved[k]==='object'&&!Array.isArray(saved[k])&&out[k]&&typeof out[k]==='object'&&!Array.isArray(out[k]))out[k]={...out[k],...saved[k]};else out[k]=saved[k]}return out}
function loadState(){try{const s=merge(defaultState,JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'));const legacy={'🥰':'mutlu','🙂':'iyi','😴':'yorgun','😔':'uzgun','😡':'gergin'};s.mood.today=legacy[s.mood.today]||s.mood.today||'mutlu';s.mood.history=(s.mood.history||[]).map(x=>({...x,mood:legacy[x.mood]||x.mood}));return s}catch{return clone(defaultState)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));window.NecatiCloud?.scheduleSave(state)}
function uid(){return Date.now()+Math.floor(Math.random()*999)}function today(){return new Date().toISOString().slice(0,10)}function fmtDate(v){if(!v)return'—';return new Date(v+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'})}function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}function toast(m){const e=$('toast');e.textContent=m;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2500)}window.necatiToast=toast;
function actor(){return window.NecatiCloud?.role?.()==='nisa'?'Nisa':window.NecatiCloud?.role?.()==='necati'?'Necati':'Biri'}
async function notify(title,body,type='activity',open='home'){if(!window.NecatiCloud?.isReady?.())return;try{await window.NecatiCloud.sendActivity(title,body,type,open)}catch(e){console.warn('Push',e)}}
function updateIdentity(){
  const badge=$('coupleBadge');
  if(badge) badge.textContent=`${state.settings.partnerName} ❤️ ${state.settings.ownerName}`;
  const d=new Date(state.settings.relationshipDate);
  const since=$('counterSince');
  if(since) since.textContent=`${d.toLocaleDateString('tr-TR')} tarihinden beri`;
  document.title='Necati Cepte';
}
function updateCounter(){
  let diff=Math.max(0,Date.now()-new Date(state.settings.relationshipDate));
  const d=Math.floor(diff/86400000);diff%=86400000;
  const h=Math.floor(diff/3600000);diff%=3600000;
  const m=Math.floor(diff/60000),s=Math.floor(diff%60000/1000);
  if($('days')) $('days').textContent=d.toLocaleString('tr-TR');
  if($('hours')) $('hours').textContent=h;
  if($('minutes')) $('minutes').textContent=m;
  if($('seconds')) $('seconds').textContent=s;
}
window.applyCloudState=remote=>{
  state=merge(defaultState,remote);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  updateIdentity();updateCounter();
  if(currentModule)renderModule(currentModule);
  try{v10RefreshDashboard?.()}catch{}
  try{v9RenderCalendar?.();v9RenderTodos?.();v9RenderExpenses?.()}catch{}
};
updateIdentity();updateCounter();setInterval(updateCounter,1000);
const messages=[['Nisa’ya küçük bir hatırlatma','Bugün de seni seçiyorum. Yarın da öyle.'],['Necati’den mesaj var 💌','Günün nasıl geçerse geçsin tarafın hep bende.'],['Bugünün görevi','Bir adet sarılma borcun var. Faizi öpücük.']];let messageIndex=0;
if($('newMessageBtn')) $('newMessageBtn').onclick=()=>{
  messageIndex=(messageIndex+1)%messages.length;$('dailyTitle').textContent=messages[messageIndex][0];$('dailyMessage').textContent=messages[messageIndex][1]
};

document.querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.module) openModule(b.dataset.module);
}));
if($('backBtn')) $('backBtn').onclick=showHome;
if($('homeBtn')) $('homeBtn').onclick=showHome;
function showHome(){
  currentModule=null;
  if(leafletMap){leafletMap.remove();leafletMap=null}
  if(pickerMap){pickerMap.remove();pickerMap=null}
  if($('homeView')) $('homeView').hidden=false;
  if($('moduleView')) $('moduleView').hidden=true;
  if($('homeBtn')) $('homeBtn').classList.add('active');
  scrollTo({top:0,behavior:'smooth'});
}
function openModule(name){
  currentModule=name;
  if($('homeView')) $('homeView').hidden=true;
  if($('moduleView')) $('moduleView').hidden=false;
  if($('homeBtn')) $('homeBtn').classList.remove('active');
  if($('moduleTitle')) $('moduleTitle').textContent=moduleNames[name]||'Necati Cepte';
  renderModule(name);
  scrollTo({top:0,behavior:'smooth'});
}

function hydratePersonalSettings(){
  const s=state.settings||{};
  if($('birthDate')) $('birthDate').value=s.birthDate||'';
  if($('lastPeriodDate')) $('lastPeriodDate').value=s.lastPeriodDate||'';
  if($('cycleLength')) $('cycleLength').value=String(s.cycleLength||28);
}



function nextBirthday(dateStr){
  if(!dateStr)return null;
  const d=new Date(dateStr+'T12:00:00'), now=new Date();
  let n=new Date(now.getFullYear(),d.getMonth(),d.getDate(),12);
  if(n<now)n=new Date(now.getFullYear()+1,d.getMonth(),d.getDate(),12);
  return Math.ceil((n-now)/86400000);
}
function periodInfo(){
  const s=state.settings||{};
  if(!s.periodStartDate)return null;
  const start=new Date(s.periodStartDate+'T12:00:00');
  const cycle=Number(s.periodCycle)||28, len=Number(s.periodLength)||5;
  const now=new Date(); now.setHours(12,0,0,0);
  const elapsed=Math.floor((now-start)/86400000);
  const mod=((elapsed%cycle)+cycle)%cycle;
  const inPeriod=mod<len;
  const nextStart=new Date(start); nextStart.setDate(start.getDate() + (Math.floor(elapsed/cycle)+1)*cycle);
  return {inPeriod,day:mod+1,nextStart:nextStart.toISOString().slice(0,10)};
}

let calendarCursor=new Date();

function fmtDateTR(v){
  if(!v) return '';
  try{return new Date(v+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'})}catch{return v}
}
function fmtDateTimeTR(date,time){
  return [fmtDateTR(date),time||''].filter(Boolean).join(' • ');
}
function oppositeName(){ return actor?.()==='Nisa' ? 'Necati' : 'Nisa'; }

function hydrateV8Settings(){
  const s=state.settings||{};
  for(const [id,val] of Object.entries({
    nisaBirthday:s.nisaBirthday||'',
    necatiBirthday:s.necatiBirthday||'',
    periodStartDate:s.periodStartDate||s.lastPeriodDate||'',
    periodLength:s.periodLength||5,
    periodCycle:s.periodCycle||s.cycleLength||28
  })){
    const el=$(id); if(el) el.value=val;
  }
}


function openAppDialog(id){
  const d=$(id);
  if(!d){ toast('Bu bölüm bulunamadı'); return; }
  try{
    if(typeof d.showModal==='function'){
      if(!d.open) d.showModal();
    }else{
      d.setAttribute('open','');
      d.style.display='block';
    }
  }catch(e){
    d.setAttribute('open','');
    d.style.display='block';
  }
}

function renderPlanner(){
  const title=$('calendarTitle'), grid=$('calendarGrid'), list=$('planList');
  if(!grid||!list) return;
  const y=calendarCursor.getFullYear(), m=calendarCursor.getMonth();
  if(title) title.textContent=new Date(y,m,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
  grid.innerHTML='';
  ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].forEach(d=>{const h=document.createElement('div');h.className='cal-h';h.textContent=d;grid.appendChild(h)});
  let first=(new Date(y,m,1).getDay()+6)%7;
  for(let i=0;i<first;i++){const e=document.createElement('div');e.className='cal-empty';grid.appendChild(e)}
  const days=new Date(y,m+1,0).getDate();
  for(let d=1;d<=days;d++){
    const iso=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cell=document.createElement('button');cell.type='button';cell.className='cal-day';
    const count=(state.plans||[]).filter(p=>p.date===iso).length;
    cell.innerHTML=`<span>${d}</span>${count?`<b>${count}</b>`:''}`;
    cell.onclick=()=>{$('planDate').value=iso;renderPlanner()};
    grid.appendChild(cell);
  }
  list.innerHTML='';
  const items=[...(state.plans||[])].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  if(!items.length){list.innerHTML='<p class="muted">Henüz plan yok.</p>';return}
  items.forEach(p=>{
    const row=document.createElement('div');row.className='list-card';
    row.innerHTML=`<div><strong>${escapeHtml(p.title)}</strong><small>${fmtDateTimeTR(p.date,p.time)}</small>${p.note?`<p>${escapeHtml(p.note)}</p>`:''}</div>
    <button type="button" class="danger-btn" data-id="${p.id}">Sil</button>`;
    row.querySelector('button').onclick=async()=>{state.plans=state.plans.filter(x=>x.id!==p.id);save();renderPlanner();notify?.('📅 Plan silindi',`${actor()} ortak takvimden bir plan sildi`,'plan','planner').catch(()=>{})};
    list.appendChild(row);
  });
}

function renderTodos(){
  const list=$('todoList'); if(!list)return;
  list.innerHTML='';
  const prio={normal:'',high:'⭐ ',urgent:'🚨 '};
  const items=[...(state.todos||[])].sort((a,b)=>Number(a.done)-Number(b.done));
  if(!items.length){list.innerHTML='<p class="muted">Henüz görev yok.</p>';return}
  items.forEach(t=>{
    const row=document.createElement('div');row.className='list-card todo-card'+(t.done?' done':'');
    row.innerHTML=`<label class="todo-line"><input type="checkbox" ${t.done?'checked':''}><span>${prio[t.priority]||''}${escapeHtml(t.text)}</span></label>
    <small>${t.owner==='ortak'?'Ortak':t.owner==='necati'?'Necati':'Nisa'}${t.date?' • '+fmtDateTR(t.date):''}</small>
    <button type="button" class="danger-btn">Sil</button>`;
    row.querySelector('input').onchange=async e=>{
      t.done=e.target.checked;save();renderTodos();
      notify?.('✅ Görev güncellendi',`${actor()} “${t.text}” görevini ${t.done?'tamamladı':'yeniden açtı'}`,'todo','todo').catch(()=>{});
    };
    row.querySelector('button').onclick=async()=>{state.todos=state.todos.filter(x=>x.id!==t.id);save();renderTodos();notify?.('🗑️ Görev silindi',`${actor()} bir görevi sildi`,'todo','todo').catch(()=>{})};
    list.appendChild(row);
  });
}

function botReply(text){
  const t=text.toLocaleLowerCase('tr-TR');
  if(/üzgün|moral|kötü|canım sıkkın/.test(t)) return 'gel buraya anlat bakalım ne oldu ben burdayım ❤️';
  if(/özledim|özlüyorum/.test(t)) return 'ben de seni özledim gelince sarılma borcum var 😄❤️';
  if(/açım|yemek|tatlı/.test(t)) return 'hemen bir şeyler yiyelim sen aç kalma sonra bana kızıyorsun 😄';
  if(/kızdım|sinir|gergin/.test(t)) return 'tamam tamam ben sakinim 😄 sen anlat ben dinliyorum';
  if(/iyi geceler|uyuyorum|uyku/.test(t)) return 'iyi geceler güzelim güzel uyu ben hep yanındayım ❤️';
  if(/seviyor musun|seviyorum/.test(t)) return 'bunu hâlâ soruyor musun seni çok seviyorum ❤️';
  if(/ne yapıyorsun|napıyorsun/.test(t)) return 'şu an burda seninle konuşuyorum daha önemli ne işim olabilir 😄';
  return ['anlat bakalım seni dinliyorum ❤️','hmm tamam devam et merak ettim 😄','ben olsam önce seni bi sarardım sonra konuşurduk ❤️','tamamdır bunu not ettim 😄'][Math.floor(Math.random()*4)];
}
function renderBot(){
  const c=$('botChat');if(!c)return;c.innerHTML='';
  const hist=state.botHistory||[];
  if(!hist.length) hist.push({from:'bot',text:'Alooo 😄 Necati Bot hatta ne oldu güzelim ❤️'});
  hist.slice(-40).forEach(m=>{
    const b=document.createElement('div');b.className='bubble '+(m.from==='user'?'me':'bot');b.textContent=m.text;c.appendChild(b);
  });
  c.scrollTop=c.scrollHeight;
}

function renderModule(n){({mood:renderMood,surprise:renderSurprise,jar:renderJar,map:renderMap,sky:renderSky,story:renderStory,dates:renderDates,night:renderNight,emergency:renderEmergency,birthday:renderBirthday}[n]||(()=>{}))()}
function viewerMoodOwner(){const r=window.NecatiCloud?.role?.();return r==='nisa'?'necati':'nisa'}
function phaseInfo(){const s=state.settings;if(!s.lastPeriod)return null;const start=new Date(s.lastPeriod+'T12:00:00'),now=new Date(),elapsed=Math.floor((now-start)/86400000),day=((elapsed%s.cycleLength)+s.cycleLength)%s.cycleLength+1;let phase='Foliküler dönem';if(day<=s.periodLength)phase='Regl dönemi';else if(day>=s.cycleLength-13&&day<=s.cycleLength-11)phase='Tahmini yumurtlama dönemi';else if(day>s.cycleLength-11)phase='Luteal dönem';const next=new Date(start);next.setDate(next.getDate()+Math.ceil(Math.max(0,elapsed+1)/s.cycleLength)*s.cycleLength);if(next<=now)next.setDate(next.getDate()+s.cycleLength);return{day,phase,next}}
function renderMood(){const p=phaseInfo(),set=moodAssets[viewerMoodOwner()];$('moduleContent').innerHTML=`<div class="panel"><h3>Bugün ruh hali nasıl? 🌸</h3><p class="muted">${viewerMoodOwner()==='nisa'?'Necati hesabında Nisa':'Nisa hesabında Necati'} emojileri gösteriliyor.</p><div class="mood-grid mood-image-grid">${Object.entries(moodMap).map(([k,v])=>`<button class="mood-btn mood-image-btn ${state.mood.today===k?'active':''}" data-mood="${k}"><img src="${set[k]}" alt="${v.label}"><span>${v.label}</span></button>`).join('')}</div><div class="hero-tip">${moodTips[state.mood.today]||''}</div></div><div class="panel"><h3>Döngü tahmini</h3>${p?`<div class="stats-grid"><div class="stat-card"><strong>${p.day}. gün</strong><span>Döngü günü</span></div><div class="stat-card"><strong>${p.phase}</strong><span>Tahmini dönem</span></div><div class="stat-card"><strong>${p.next.toLocaleDateString('tr-TR')}</strong><span>Sonraki başlangıç</span></div></div>`:'<div class="empty">Ayarlar bölümünden son regl başlangıcını gir.</div>'}</div><div class="panel"><h3>Son ruh halleri</h3>${state.mood.history.length?state.mood.history.slice(-7).reverse().map(x=>`<div class="surprise-card">${moodMap[x.mood]?.emoji||''} ${moodMap[x.mood]?.label||x.mood} · ${fmtDate(x.date)}</div>`).join(''):'<div class="empty">Henüz kayıt yok.</div>'}</div>`;document.querySelectorAll('[data-mood]').forEach(b=>b.onclick=async()=>{const next=b.dataset.mood,prev=state.mood.today;if(prev===next)return toast('Ruh hali zaten buydu 🌸');state.mood.today=next;state.mood.history.push({date:today(),mood:next});save();renderMood();toast('Ruh hali kaydedildi 🌸');await notify('🌸 Ruh hali değişti',`${actor()} ruh halini ${moodMap[next].label} yaptı ${moodMap[next].emoji}`,'mood','mood')})}

function renderSurprise(){$('moduleContent').innerHTML=`<div class="panel"><h3>Yeni sürpriz ekle</h3><div class="form-grid"><label>Tarih<input id="spDate" type="date" value="${today()}"></label><label>Tür<select id="spType"><option>Mesaj</option><option>Görev</option><option>Sürpriz</option><option>Buluşma</option></select></label></div><label>Başlık<input id="spTitle"></label><label>İçerik<textarea id="spMessage"></textarea></label><div class="actions"><button class="primary-btn" id="addSurprise">Takvime ekle 🎁</button></div></div><div class="cards-list">${state.surprises.map(x=>`<div class="surprise-card ${x.date>today()?'locked':''}"><div class="row-between"><div><span class="chip">${fmtDate(x.date)} · ${escapeHtml(x.type)}</span><h3>${escapeHtml(x.title)}</h3></div><button class="delete-btn" data-delsp="${x.id}">Sil</button></div><p>${x.date>today()?'🔒 Zamanı gelince açılacak':escapeHtml(x.message)}</p></div>`).join('')}</div>`;$('addSurprise').onclick=async()=>{const date=$('spDate').value,title=$('spTitle').value.trim(),message=$('spMessage').value.trim();if(!date||!title||!message)return toast('Tarih, başlık ve içerik gerekli');state.surprises.push({id:uid(),date,title,message,type:$('spType').value});save();renderSurprise();toast('Sürpriz eklendi 🎁');await notify('🎁 Yeni sürpriz',`${actor()} “${title}” sürprizini ekledi`,'surprise','surprise')};document.querySelectorAll('[data-delsp]').forEach(b=>b.onclick=async()=>{const x=state.surprises.find(x=>x.id==b.dataset.delsp);state.surprises=state.surprises.filter(x=>x.id!=b.dataset.delsp);save();renderSurprise();await notify('🗑️ Sürpriz silindi',`${actor()} “${x?.title||'bir sürpriz'}” kaydını sildi`,'surprise','surprise')})}
function dailyJar(){if(!state.jar.length)return'Kavanoz boş 💗';const d=new Date(),key=Number(`${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`);return state.jar[key%state.jar.length]}
function renderJar(){$('moduleContent').innerHTML=`<div class="jar-main"><span class="pill">Bugünün kartı 🫙</span><p class="big-quote">“Seni seviyorum çünkü ${escapeHtml(dailyJar())}.”</p></div><div class="panel"><label>Seni seviyorum çünkü...<textarea id="jarText"></textarea></label><button id="addJar" class="primary-btn">Kavanoza at ❤️</button></div><div class="cards-list">${state.jar.map((x,i)=>`<div class="jar-card row-between"><span>${escapeHtml(x)}</span><button class="delete-btn" data-deljar="${i}">Sil</button></div>`).join('')}</div>`;$('addJar').onclick=async()=>{const v=$('jarText').value.trim();if(!v)return toast('Bir sevgi nedeni yaz ❤️');state.jar.push(v.replace(/^seni seviyorum çünkü\s*/i,''));save();renderJar();await notify('🫙 Aşk Kavanozu',`${actor()} kavanoza yeni bir sevgi kartı ekledi ❤️`,'jar','jar')};document.querySelectorAll('[data-deljar]').forEach(b=>b.onclick=async()=>{state.jar.splice(+b.dataset.deljar,1);save();renderJar();await notify('🫙 Kavanoz güncellendi',`${actor()} bir kartı sildi`,'jar','jar')})}

async function localCompress(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const s=Math.min(1,1100/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.68))};im.src=r.result};r.readAsDataURL(file)})}
async function storeImage(file){if(!file)return'';if(window.NecatiCloud?.isReady?.())return await window.NecatiCloud.uploadImage(file);return await localCompress(file)}
function imgHtml(ref,cls=''){if(!ref)return'';if(String(ref).startsWith('firestore-photo:'))return `<img class="${cls}" data-cloud-src="${escapeHtml(ref)}" alt="Fotoğraf">`;return `<img class="${cls}" src="${escapeHtml(ref)}" alt="Fotoğraf">`}
async function hydrateImages(){for(const img of document.querySelectorAll('img[data-cloud-src]')){try{const u=await window.NecatiCloud?.resolveImage?.(img.dataset.cloudSrc);if(u)img.src=u}catch(e){console.warn(e)}}}
function previewInput(inputId,previewId){const i=$(inputId),p=$(previewId);if(!i||!p)return;i.onchange=()=>{const f=i.files[0];if(!f){p.hidden=true;return}p.src=URL.createObjectURL(f);p.hidden=false}}

let pickerBusy=false,geoTimer=null;
async function reverseGeocode(lat,lon){clearTimeout(geoTimer);return new Promise(resolve=>{geoTimer=setTimeout(async()=>{try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&accept-language=tr`);const j=await r.json();resolve(j.display_name||'')}catch{resolve('')}},350)})}
async function setPicker(lat,lon,lookup=true){$('memLat').value=Number(lat).toFixed(6);$('memLon').value=Number(lon).toFixed(6);if(pickerMarker)pickerMarker.setLatLng([lat,lon]);if(lookup){$('memPlace').value='Konum aranıyor…';$('memPlace').value=await reverseGeocode(lat,lon)||'Seçilen konum'}}
function initMemoryMaps(){if(!window.L)return;const lat=Number($('memLat').value)||37.0662,lon=Number($('memLon').value)||37.3833;if(pickerMap)pickerMap.remove();pickerMap=L.map('memoryPicker').setView([lat,lon],15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(pickerMap);pickerMarker=L.marker([lat,lon],{draggable:true}).addTo(pickerMap);pickerMarker.on('dragend',e=>{const p=e.target.getLatLng();setPicker(p.lat,p.lng)});pickerMap.on('click',e=>setPicker(e.latlng.lat,e.latlng.lng));pickerMap.on('movestart',()=>pickerBusy=true);pickerMap.on('moveend',()=>{if(!pickerBusy)return;pickerBusy=false;const c=pickerMap.getCenter();setPicker(c.lat,c.lng)});setTimeout(()=>pickerMap.invalidateSize(),100);
 const mapped=state.memories.filter(m=>Number.isFinite(+m.lat)&&Number.isFinite(+m.lon));if(leafletMap)leafletMap.remove();leafletMap=L.map('mapBox').setView(mapped.length?[+mapped[0].lat,+mapped[0].lon]:[lat,lon],mapped.length?12:10);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(leafletMap);mapped.forEach(m=>L.marker([+m.lat,+m.lon]).addTo(leafletMap).bindPopup(`<b>${escapeHtml(m.title)}</b><br>${escapeHtml(m.place||m.note||'')}`));setTimeout(()=>leafletMap.invalidateSize(),100)}
function renderMap(){$('moduleContent').innerHTML=`<div class="panel"><h3>Yeni anı ekle ❤️</h3><div class="form-grid"><label>Başlık<input id="memTitle"></label><label>Tarih<input id="memDate" type="date" value="${today()}"></label><label>Enlem<input id="memLat" type="number" step="any" value="37.0662"></label><label>Boylam<input id="memLon" type="number" step="any" value="37.3833"></label></div><label>Konum adı<input id="memPlace" placeholder="Haritayı sürükleyince otomatik bulunur"></label><label>Not<textarea id="memNote"></textarea></label><label>Fotoğraf<input id="memPhoto" type="file" accept="image/*"></label><img id="memPreview" class="upload-preview" hidden><p class="tiny">Haritayı sürükle, tıkla veya işaretçiyi taşı. Merkezdeki konum otomatik seçilir.</p><div id="memoryPicker" class="map-box picker-map"></div><div class="actions"><button id="useLocation" class="ghost-btn">📍 Konumumu kullan</button><button id="addMemory" class="primary-btn">Anıyı kaydet ❤️</button></div></div><div class="panel"><h3>Anılarımızın haritası</h3><div id="mapBox" class="map-box"></div></div><div class="memory-grid">${state.memories.map(x=>`<div class="memory-card">${imgHtml(x.image)}<div class="row-between"><div><div class="card-title">${escapeHtml(x.title)}</div><div class="card-meta">${fmtDate(x.date)} · ${escapeHtml(x.place||'')}</div></div><button class="delete-btn" data-delmem="${x.id}">Sil</button></div><p>${escapeHtml(x.note||'')}</p></div>`).join('')||'<div class="empty">İlk anınızı ekleyin ❤️</div>'}</div>`;setTimeout(initMemoryMaps,0);previewInput('memPhoto','memPreview');hydrateImages();$('useLocation').onclick=()=>navigator.geolocation?.getCurrentPosition(async p=>{pickerMap?.setView([p.coords.latitude,p.coords.longitude],17);await setPicker(p.coords.latitude,p.coords.longitude);toast('Konum bulundu 📍')},()=>toast('Konum izni alınamadı'));$('addMemory').onclick=async()=>{const title=$('memTitle').value.trim();if(!title)return toast('Anıya başlık yaz ❤️');const btn=$('addMemory');btn.disabled=true;btn.textContent='Kaydediliyor…';try{const image=await storeImage($('memPhoto').files[0]);state.memories.push({id:uid(),title,date:$('memDate').value||today(),lat:+$('memLat').value,lon:+$('memLon').value,place:$('memPlace').value.trim(),note:$('memNote').value.trim(),image});save();renderMap();toast('Anı kaydedildi ❤️');await notify('📍 Yeni anı eklendi',`${actor()} “${title}” anısını haritaya ekledi`,'memory','map')}catch(e){toast('Anı kaydedilemedi: '+e.message);btn.disabled=false;btn.textContent='Anıyı kaydet ❤️'}};document.querySelectorAll('[data-delmem]').forEach(b=>b.onclick=async()=>{const x=state.memories.find(x=>x.id==b.dataset.delmem);state.memories=state.memories.filter(x=>x.id!=b.dataset.delmem);save();renderMap();await notify('📍 Anı silindi',`${actor()} “${x?.title||'bir anı'}” kaydını sildi`,'memory','map')})}

const stars=[['Sirius',6.7525,-16.7161,-1.46],['Canopus',6.3992,-52.6957,-.74],['Arcturus',14.261,19.1825,-.05],['Vega',18.6156,38.7837,.03],['Capella',5.2782,45.998,.08],['Rigel',5.2423,-8.2016,.13],['Procyon',7.655,5.225,.34],['Betelgeuse',5.9195,7.407,.42],['Altair',19.8464,8.8683,.77],['Aldebaran',4.5987,16.5093,.86],['Antares',16.4901,-26.432,.96],['Spica',13.4199,-11.1614,.97],['Pollux',7.7553,28.0262,1.14],['Fomalhaut',22.9608,-29.6222,1.16],['Deneb',20.6905,45.2803,1.25],['Regulus',10.1395,11.9672,1.35],['Castor',7.5767,31.8883,1.58],['Bellatrix',5.4189,6.3497,1.64],['Elnath',5.4382,28.6075,1.65],['Alnilam',5.6036,-1.2019,1.69],['Alnitak',5.6793,-1.9426,1.74],['Mirfak',3.4054,49.8612,1.79],['Dubhe',11.0621,61.7508,1.79],['Polaris',2.5303,89.2641,1.98],['Mizar',13.3987,54.9254,2.06],['Algol',3.1361,40.9556,2.12]];
function toLocalInput(d){const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,16)}function jd(d){return d/86400000+2440587.5}function norm(x){return((x%360)+360)%360}function starAltAz(ra,dec,date,lat,lon){const J=jd(date),T=(J-2451545)/36525,gmst=norm(280.46061837+360.98564736629*(J-2451545)+.000387933*T*T-T*T*T/38710000),lst=norm(gmst+lon),H=norm(lst-ra*15)*Math.PI/180,de=dec*Math.PI/180,ph=lat*Math.PI/180,alt=Math.asin(Math.sin(ph)*Math.sin(de)+Math.cos(ph)*Math.cos(de)*Math.cos(H)),az=Math.atan2(-Math.sin(H)*Math.cos(de),Math.sin(de)*Math.cos(ph)-Math.cos(de)*Math.sin(ph)*Math.cos(H));return{alt:alt*180/Math.PI,az:norm(az*180/Math.PI)}}
function ensureDailySky(){if(state.sky.lastDaily!==today()){const d=new Date();d.setHours(21,0,0,0);state.sky.date=toLocalInput(d);state.sky.lastDaily=today();save()}}
function stellariumUrl(){const d=new Date(state.sky.date||new Date());return `https://stellarium-web.org/?date=${encodeURIComponent(d.toISOString())}&lng=${encodeURIComponent(state.sky.lon)}&lat=${encodeURIComponent(state.sky.lat)}`}
function renderSky(){ensureDailySky();$('moduleContent').innerHTML=`<div class="panel"><h3>Bugünün gerçek gökyüzü ✨</h3><p class="muted">Her yeni günde saat 21:00 için otomatik güncellenir. İstersen tarihi değiştirebilirsin.</p><div class="form-grid"><label>Tarih ve saat<input id="skyDate" type="datetime-local" value="${state.sky.date}"></label><label>Yer adı<input id="skyLabel" value="${escapeHtml(state.sky.label)}"></label><label>Enlem<input id="skyLat" type="number" step="any" value="${state.sky.lat}"></label><label>Boylam<input id="skyLon" type="number" step="any" value="${state.sky.lon}"></label></div><div class="actions"><button id="skyHere" class="ghost-btn">📍 Konumumu kullan</button><button id="drawSky" class="primary-btn">Gökyüzünü yenile ✨</button></div></div><div class="panel"><iframe id="stellariumFrame" class="stellarium-frame" src="${stellariumUrl()}" loading="lazy" allow="geolocation; fullscreen"></iframe><div class="actions"><a class="ghost-btn link-btn" target="_blank" rel="noopener" href="${stellariumUrl()}">🔭 Stellarium'da tam ekran aç</a></div><p class="tiny">Canlı görünüm Stellarium Web'i kullanır. Aşağıdaki harita internet kesilirse yerel astronomik yedektir.</p></div><div class="sky-wrap"><canvas id="skyCanvas" class="sky-canvas" width="900" height="900"></canvas></div>`;drawSky();$('drawSky').onclick=async()=>{state.sky={...state.sky,date:$('skyDate').value,label:$('skyLabel').value,lat:+$('skyLat').value,lon:+$('skyLon').value,lastDaily:today()};save();renderSky();await notify('✨ Gökyüzü güncellendi',`${actor()} ${state.sky.label} için gökyüzünü açtı`,'sky','sky')};$('skyHere').onclick=()=>navigator.geolocation?.getCurrentPosition(p=>{$('skyLat').value=p.coords.latitude;$('skyLon').value=p.coords.longitude;toast('Konum alındı ✨')},()=>toast('Konum izni alınamadı'))}
function drawSky(){const c=$('skyCanvas');if(!c)return;const x=c.getContext('2d'),w=c.width,h=c.height,cx=w/2,cy=h/2,R=w*.44;x.fillStyle='#02040c';x.fillRect(0,0,w,h);const g=x.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,'#20386f');g.addColorStop(.55,'#101a3a');g.addColorStop(1,'#03050d');x.fillStyle=g;x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.fill();for(let i=0;i<220;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*R;x.fillStyle=`rgba(255,255,255,${.12+Math.random()*.35})`;x.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r,1+Math.random()*1.4,1+Math.random()*1.4)}const d=new Date(state.sky.date),lat=+state.sky.lat,lon=+state.sky.lon;stars.forEach(([n,ra,de,mag])=>{const p=starAltAz(ra,de,d,lat,lon);if(p.alt<=0)return;const rr=R*(1-p.alt/90),a=(p.az-90)*Math.PI/180,px=cx+rr*Math.cos(a),py=cy+rr*Math.sin(a),s=Math.max(2,8-mag*1.6);x.beginPath();x.fillStyle='#fff';x.shadowColor='#b7d4ff';x.shadowBlur=10;x.arc(px,py,s,0,Math.PI*2);x.fill();x.shadowBlur=0;if(mag<1.3){x.font='17px sans-serif';x.fillStyle='rgba(255,255,255,.78)';x.fillText(n,px+9,py-8)}});x.textAlign='center';x.fillStyle='#fff';x.font='700 24px sans-serif';x.fillText(`${state.settings.partnerName} ❤️ ${state.settings.ownerName}`,cx,48);x.font='18px sans-serif';x.fillStyle='rgba(255,255,255,.7)';x.fillText(`${state.sky.label} · ${d.toLocaleString('tr-TR')}`,cx,78);x.textAlign='start'}

function renderStory(){$('moduleContent').innerHTML=`<div class="panel"><h3>Yeni bölüm ekle 🎬</h3><div class="form-grid"><label>Sezon<input id="stSeason" type="number" min="1" value="1"></label><label>Bölüm<input id="stEpisode" type="number" min="1" value="1"></label><label>Tarih<input id="stDate" type="date" value="${today()}"></label><label>Başlık<input id="stTitle"></label></div><label>Hikâye<textarea id="stText"></textarea></label><label>Fotoğraf<input id="stPhoto" type="file" accept="image/*"></label><img id="stPreview" class="upload-preview" hidden><div class="upload-status" id="stStatus"></div><button id="addStory" class="primary-btn">Bölümü yayınla 🎬</button></div><div class="story-grid">${[...state.stories].sort((a,b)=>a.season-b.season||a.episode-b.episode).map(x=>`<div class="story-card">${imgHtml(x.image)}<span class="chip">Sezon ${x.season} · Bölüm ${x.episode}</span><h3>${escapeHtml(x.title)}</h3><div class="card-meta">${fmtDate(x.date)}</div><p>${escapeHtml(x.text)}</p><button class="delete-btn" data-delstory="${x.id}">Bölümü sil</button></div>`).join('')}</div>`;previewInput('stPhoto','stPreview');hydrateImages();$('addStory').onclick=async()=>{const title=$('stTitle').value.trim(),text=$('stText').value.trim();if(!title||!text)return toast('Başlık ve hikâye gerekli');const btn=$('addStory');btn.disabled=true;btn.textContent='Fotoğraf yükleniyor…';$('stStatus').textContent='Yayın hazırlanıyor…';try{const image=await storeImage($('stPhoto').files[0]);state.stories.push({id:uid(),season:+$('stSeason').value,episode:+$('stEpisode').value,date:$('stDate').value||today(),title,text,image});save();renderStory();toast('Bölüm yayınlandı 🎬');await notify('🎬 Yeni bölüm yayınlandı',`${actor()} “${title}” bölümünü yayınladı`,'story','story')}catch(e){btn.disabled=false;btn.textContent='Bölümü yayınla 🎬';$('stStatus').textContent='';toast('Yayınlanamadı: '+e.message)}};document.querySelectorAll('[data-delstory]').forEach(b=>b.onclick=async()=>{const x=state.stories.find(x=>x.id==b.dataset.delstory);state.stories=state.stories.filter(x=>x.id!=b.dataset.delstory);save();renderStory();await notify('🎬 Bölüm silindi',`${actor()} “${x?.title||'bir bölüm'}” kaydını sildi`,'story','story')})}
function daysUntil(dateStr,repeat){const now=new Date();now.setHours(0,0,0,0);let d=new Date(dateStr+'T00:00:00');if(repeat==='yearly'){d.setFullYear(now.getFullYear());if(d<now)d.setFullYear(now.getFullYear()+1)}return Math.ceil((d-now)/86400000)}
function renderDates(){$('moduleContent').innerHTML=`<div class="panel"><h3>Özel gün ekle</h3><div class="form-grid"><label>Adı<input id="dateTitle"></label><label>Tarih<input id="dateValue" type="date"></label><label>Tekrar<select id="dateRepeat"><option value="yearly">Her yıl</option><option value="none">Tek sefer</option></select></label></div><button id="addDate" class="primary-btn">Ekle 💍</button></div><div class="date-grid">${state.specialDates.map(x=>{const d=daysUntil(x.date,x.repeat);return`<div class="date-card"><div class="row-between"><span class="chip">${fmtDate(x.date)}</span><button class="delete-btn" data-deldate="${x.id}">Sil</button></div><h3>${escapeHtml(x.title)}</h3><strong>${d===0?'Bugün! ❤️':d>0?d+' gün kaldı':Math.abs(d)+' gün önce'}</strong></div>`}).join('')}</div>`;$('addDate').onclick=async()=>{const title=$('dateTitle').value.trim(),date=$('dateValue').value;if(!title||!date)return toast('Başlık ve tarih gerekli');state.specialDates.push({id:uid(),title,date,repeat:$('dateRepeat').value});save();renderDates();await notify('💍 Özel gün eklendi',`${actor()} “${title}” tarihini ekledi`,'date','dates')};document.querySelectorAll('[data-deldate]').forEach(b=>b.onclick=async()=>{state.specialDates=state.specialDates.filter(x=>x.id!=b.dataset.deldate);save();renderDates();await notify('💍 Özel günler güncellendi',`${actor()} bir özel günü sildi`,'date','dates')})}
function renderNight(){$('moduleContent').innerHTML=`<div class="panel"><h3>İyi geceler mesajı 🌙</h3><label>Tarih<input id="nightDate" type="date" value="${today()}"></label><label>Mesaj<textarea id="nightText" placeholder="iyi geceler aşkım..."></textarea></label><label>Fotoğraf <b>zorunlu</b><input id="nightPhoto" type="file" accept="image/*" required></label><img id="nightPreview" class="upload-preview" hidden><p class="tiny">Fotoğraf seçilmeden mesaj gönderilemez.</p><button id="addNight" class="primary-btn">Fotoğraflı mesajı gönder 🌙</button></div><div class="cards-list">${[...state.nights].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="surprise-card">${imgHtml(x.image,'night-photo')}<div class="row-between"><span class="chip">${fmtDate(x.date)}</span><button class="delete-btn" data-delnight="${x.id}">Sil</button></div><p>${escapeHtml(x.text)}</p></div>`).join('')||'<div class="empty">İlk fotoğraflı iyi geceler mesajını ekle 🌙</div>'}</div>`;previewInput('nightPhoto','nightPreview');hydrateImages();$('addNight').onclick=async()=>{const text=$('nightText').value.trim(),file=$('nightPhoto').files[0];if(!text)return toast('Mesajını yaz ❤️');if(!file)return toast('Önce bir fotoğraf eklemelisin ❤️');const b=$('addNight');b.disabled=true;b.textContent='Fotoğraf yükleniyor…';try{const image=await storeImage(file);b.textContent='Mesaj gönderiliyor…';state.nights.push({id:uid(),date:$('nightDate').value||today(),text,image});save();renderNight();toast('İyi geceler mesajı gönderildi 🌙');notify('🌙 Fotoğraflı iyi geceler',`${actor()} sana yeni bir iyi geceler mesajı bıraktı ❤️`,'night','night').catch(e=>console.warn('İyi geceler push hatası',e))}catch(e){b.disabled=false;b.textContent='Fotoğraflı mesajı gönder 🌙';toast('Mesaj gönderilemedi: '+(e?.message||e))}};document.querySelectorAll('[data-delnight]').forEach(b=>b.onclick=async()=>{state.nights=state.nights.filter(x=>x.id!=b.dataset.delnight);save();renderNight();await notify('🌙 İyi geceler arşivi',`${actor()} bir mesajı sildi`,'night','night')})}
function renderEmergency(){$('moduleContent').innerHTML=`<div class="panel"><h3>Acil Necati hattı 🚨</h3><div class="emergency-grid">${[['🤗','Sarılma lazım'],['🍫','Tatlı lazım'],['📞','Beni ara'],['❤️','İlgi lazım'],['☕','Kahve/çay'],['🚗','Gel beni al']].map(([e,t])=>`<button class="emergency-btn" data-emergency="${t}"><span>${e}</span>${t}</button>`).join('')}</div></div>`;document.querySelectorAll('[data-emergency]').forEach(b=>b.onclick=async()=>{const type=b.dataset.emergency;state.emergencyLog.push({at:new Date().toISOString(),type});save();if(!window.NecatiCloud?.isReady?.())return toast('Önce hesaba giriş yap ❤️');try{await window.NecatiCloud.sendEmergency(type);toast('Çağrı gönderildi 🚨❤️')}catch(e){toast('Gönderilemedi: '+e.message)}})}
function renderBirthday(){const b=state.settings.birthDate;if(!b){$('moduleContent').innerHTML='<div class="panel"><div class="empty">Doğum tarihini Ayarlar bölümünden gir 🎂</div></div>';return}const birth=new Date(b+'T12:00:00'),now=new Date(),days=Math.floor((now-birth)/86400000),weeks=Math.floor(days/7),months=(now.getFullYear()-birth.getFullYear())*12+now.getMonth()-birth.getMonth(),years=now.getFullYear()-birth.getFullYear()-(new Date(now.getFullYear(),birth.getMonth(),birth.getDate())>now?1:0),weekday=birth.toLocaleDateString('tr-TR',{weekday:'long'});let next=new Date(now.getFullYear(),birth.getMonth(),birth.getDate());if(next<now)next.setFullYear(now.getFullYear()+1);$('moduleContent').innerHTML=`<div class="panel"><h3>${state.settings.partnerName}'nın dünyaya geldiği gün 🎂</h3><div class="stats-grid"><div class="stat-card"><strong>${weekday}</strong><span>Doğduğu gün</span></div><div class="stat-card"><strong>${years}</strong><span>Yaş</span></div><div class="stat-card"><strong>${days.toLocaleString('tr-TR')}</strong><span>Yaşadığı gün</span></div><div class="stat-card"><strong>${weeks.toLocaleString('tr-TR')}</strong><span>Hafta</span></div><div class="stat-card"><strong>${months.toLocaleString('tr-TR')}</strong><span>Ay</span></div><div class="stat-card"><strong>${Math.ceil((next-now)/86400000)}</strong><span>Doğum gününe kalan</span></div></div></div>`}

window.addEventListener('necati:incoming',e=>{const n=e.detail||{};let d=$('emergencyAlertDialog');if(!d){d=document.createElement('dialog');d.id='emergencyAlertDialog';d.innerHTML='<div class="dialog-card emergency-alert-card"><div class="dialog-icon">🔔</div><h2 id="emergencyAlertTitle"></h2><p id="emergencyAlertBody" class="big-quote"></p><button id="emergencyAlertClose" class="primary-btn">Tamam ❤️</button></div>';document.body.appendChild(d);$('emergencyAlertClose').onclick=()=>d.close()}$('emergencyAlertTitle').textContent=n.title||'Necati Cepte';$('emergencyAlertBody').textContent=n.body||'Yeni bildirim';try{d.showModal()}catch{}if(navigator.vibrate)navigator.vibrate([250,100,250])});
$('settingsBtn').onclick=()=>{const s=state.settings;for(const [id,k] of [['partnerName','partnerName'],['ownerName','ownerName'],['relationshipDate','relationshipDate'],['birthDate','birthDate'],['lastPeriod','lastPeriod'],['cycleLength','cycleLength'],['periodLength','periodLength']])$(id).value=s[k]||'';$('settingsDialog').showModal()};$('settingsDialog').addEventListener('close',async()=>{if($('settingsDialog').returnValue!=='save')return;state.settings={partnerName:$('partnerName').value.trim()||'Nisa',ownerName:$('ownerName').value.trim()||'Necati',relationshipDate:$('relationshipDate').value,birthDate:$('birthDate').value,lastPeriod:$('lastPeriod').value,cycleLength:+$('cycleLength').value||28,periodLength:+$('periodLength').value||5};save();updateIdentity();updateCounter();toast('Ayarlar kaydedildi ❤️');await notify('⚙️ Ayarlar güncellendi',`${actor()} ortak ayarlarda değişiklik yaptı`,'settings','home')});
$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='necati-cepte-v7-yedek.json';a.click();URL.revokeObjectURL(a.href)};$('importInput').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=merge(defaultState,JSON.parse(r.result));save();updateIdentity();$('settingsDialog').close();toast('Yedek yüklendi ✅')}catch{toast('Geçersiz yedek')}};r.readAsText(f)};$('randomLoveBtn').onclick=()=>{$('loveDialogText').textContent=`Seni seviyorum çünkü ${dailyJar()}.`;$('loveDialog').showModal()};
window.addEventListener('necati:authchange',()=>{if(currentModule==='mood')renderMood()});window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});$('installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true};
window.NECATI_APP_VERSION='7.0';if('serviceWorker'in navigator)window.addEventListener('load',async()=>{try{const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs){const u=String(r.active?.scriptURL||r.installing?.scriptURL||r.waiting?.scriptURL||'');if(u&&!u.includes('OneSignalSDK')&&!u.includes('sw-v7.js'))await r.unregister()}const reg=await navigator.serviceWorker.register('./sw-v7.js',{scope:'./',updateViaCache:'none'});await reg.update()}catch(e){console.warn('SW v7',e)}});

document.addEventListener('DOMContentLoaded',()=>setTimeout(hydratePersonalSettings,50));

$('saveSettings')?.addEventListener('click',()=>{
  state.settings=state.settings||{};
  state.settings.nisaBirthday=$('nisaBirthday')?.value||'';
  state.settings.necatiBirthday=$('necatiBirthday')?.value||'';
  state.settings.periodStartDate=$('periodStartDate')?.value||'';
  state.settings.periodLength=Math.max(2,Math.min(10,Number($('periodLength')?.value)||5));
  state.settings.periodCycle=Math.max(20,Math.min(45,Number($('periodCycle')?.value)||28));

  state.settings=state.settings||{};
  state.settings.birthDate=$('birthDate')?.value||'';
  state.settings.lastPeriodDate=$('lastPeriodDate')?.value||'';
  state.settings.cycleLength=Math.max(20,Math.min(45,Number($('cycleLength')?.value)||28));
  save();
  toast('Ayarlar kaydedildi ❤️');
});

// v8.0.2: Modül açılışında push YOK. Sadece gerçek veri değişikliğinde bildirim gönderilir.
document.addEventListener('click',e=>{
  const opener=e.target.closest?.('[data-open]');
  if(!opener)return;
  e.preventDefault();
  const id=opener.dataset.open;

  if(id==='plannerDialog'){
    renderPlanner();
    openAppDialog(id);
    return;
  }

  if(id==='todoDialog'){
    renderTodos();
    openAppDialog(id);
    return;
  }

  if(id==='necatiBotDialog'){
    renderBot();
    openAppDialog(id);
    return;
  }

  openAppDialog(id);
});

$('calPrev')?.addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderPlanner()});
$('calNext')?.addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderPlanner()});

$('legacyAddPlanBtn')?.addEventListener('click',async()=>{
  const title=$('planTitle')?.value.trim(), date=$('planDate')?.value, time=$('planTime')?.value, note=$('planNote')?.value.trim();
  if(!title||!date)return toast('Plan başlığı ve tarih gerekli 📅');
  state.plans=state.plans||[];
  state.plans.push({id:uid(),title,date,time,note,createdBy:actor(),createdAt:Date.now()});
  save();renderPlanner();
  $('planTitle').value='';$('planNote').value='';
  toast('Plan eklendi 📅');
  notify?.('📅 Yeni ortak plan',`${actor()} “${title}” planını ekledi • ${fmtDateTimeTR(date,time)}`,'plan','planner').catch(()=>{});
});

$('legacyAddTodoBtn')?.addEventListener('click',async()=>{
  const text=$('todoText')?.value.trim();
  if(!text)return toast('Görev yazmalısın ✅');
  state.todos=state.todos||[];
  state.todos.push({id:uid(),text,owner:$('todoOwner')?.value||'ortak',date:$('todoDate')?.value||'',priority:$('todoPriority')?.value||'normal',done:false,createdBy:actor(),createdAt:Date.now()});
  save();renderTodos();$('todoText').value='';
  toast('Görev eklendi ✅');
  notify?.('✅ Yeni görev',`${actor()} “${text}” görevini ekledi`,'todo','todo').catch(()=>{});
});

$('legacyBotSendBtn')?.addEventListener('click',()=>{
  const inp=$('botInput');const text=inp?.value.trim();if(!text)return;
  state.botHistory=state.botHistory||[];
  state.botHistory.push({from:'user',text,at:Date.now()});
  state.botHistory.push({from:'bot',text:botReply(text),at:Date.now()+1});
  inp.value='';save();renderBot();
});
$('botInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('legacyBotSendBtn')?.click()}});

document.addEventListener('DOMContentLoaded',()=>{
  hydrateV8Settings();
  renderPlanner();
  renderTodos();
});

$('userBtn')?.addEventListener('click',()=>{
  if(window.openNecatiAuth){ window.openNecatiAuth(); return; }
  openAppDialog('authDialog');
});


// ===== Necati Cepte v9.0 =====
let v9CalendarCursor = new Date();
let v9SelectedDate = new Date().toISOString().slice(0,10);

function v9Open(id){
  const d=$(id);
  if(!d)return;
  try{ if(!d.open && d.showModal) d.showModal(); else d.setAttribute('open',''); }
  catch{ d.setAttribute('open',''); d.style.display='block'; }
}
function v9Close(id){ const d=$(id); if(!d)return; try{d.close()}catch{d.removeAttribute('open');d.style.display='none'} }
function v9Date(v){ if(!v)return ''; try{return new Date(v+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric'})}catch{return v} }
function v9Money(n){ return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(Number(n)||0) }
function v9Role(){ const e=(window.NecatiCloud?.user?.()?.email||'').toLowerCase(); if(e.includes('nisa'))return'nisa'; if(e.includes('necati'))return'necati'; return 'ortak' }
function v9OwnerLabel(v){return v==='nisa'?'Nisa':v==='necati'?'Necati':'Ortak'}
function v9Esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function v9Notify(title,body,type,open){ if(window.notify) return window.notify(title,body,type,open); try{return notify(title,body,type,open)}catch{return Promise.resolve()} }

function v9CalendarEventsForDate(date){
  const plans=(state.plans||[]).filter(p=>p.date===date).map(p=>({...p,_type:'plan'}));
  const todos=(state.todos||[]).filter(t=>t.date===date && t.calendar!=='no').map(t=>({...t,_type:'todo',title:t.text}));
  const expenses=(state.expenses||[]).filter(x=>x.date===date && x.calendar==='yes').map(x=>({...x,_type:'expense',title:`${x.title} • ${v9Money(x.amount)}`}));
  const s=state.settings||{};
  const birthdays=[];
  const md = date.slice(5);
  if(s.nisaBirthday && s.nisaBirthday.slice(5)===md) birthdays.push({_type:'birthday',title:'🎂 Nisa doğum günü'});
  if(s.necatiBirthday && s.necatiBirthday.slice(5)===md) birthdays.push({_type:'birthday',title:'🎂 Necati doğum günü'});
  return [...plans,...todos,...expenses,...birthdays];
}

function v9RenderCalendar(){
  const grid=$('calendarGrid'), title=$('calendarTitle');
  if(!grid)return;
  const y=v9CalendarCursor.getFullYear(), m=v9CalendarCursor.getMonth();
  if(title)title.textContent=new Date(y,m,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
  grid.innerHTML='';
  ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].forEach(d=>{const x=document.createElement('div');x.className='cal-h';x.textContent=d;grid.appendChild(x)});
  const first=(new Date(y,m,1).getDay()+6)%7;
  for(let i=0;i<first;i++){const x=document.createElement('div');x.className='cal-empty';grid.appendChild(x)}
  const max=new Date(y,m+1,0).getDate();
  for(let d=1;d<=max;d++){
    const iso=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const events=v9CalendarEventsForDate(iso);
    const b=document.createElement('button');b.type='button';b.className='cal-day';
    if(iso===v9SelectedDate)b.classList.add('selected');
    if(iso===new Date().toISOString().slice(0,10))b.classList.add('today');
    b.innerHTML=`<span>${d}</span>${events.length?`<b>${events.length}</b>`:''}`;
    b.onclick=()=>{v9SelectedDate=iso;$('planDate').value=iso;v9RenderCalendar();v9RenderSelectedDay()};
    grid.appendChild(b);
  }
  v9RenderSelectedDay();
}

function v9RenderSelectedDay(){
  const box=$('selectedDayEvents'), title=$('selectedDayTitle'); if(!box)return;
  if(title)title.textContent=v9Date(v9SelectedDate);
  const events=v9CalendarEventsForDate(v9SelectedDate);
  box.innerHTML='';
  if(!events.length){box.innerHTML='<p class="muted">Bu gün için kayıt yok.</p>';return}
  events.forEach(e=>{
    const row=document.createElement('div');row.className=`list-card event-${e._type}`;
    const sub=e._type==='plan'?[e.time,v9OwnerLabel(e.owner),e.category].filter(Boolean).join(' • '):
              e._type==='todo'?[v9OwnerLabel(e.owner),e.done?'Tamamlandı':'Açık'].join(' • '):
              e._type==='expense'?[v9OwnerLabel(e.payer),e.category].join(' • '):'Özel gün';
    row.innerHTML=`<div><strong>${v9Esc(e.title)}</strong><small>${v9Esc(sub)}</small>${e.note?`<p>${v9Esc(e.note)}</p>`:''}</div>
      ${e._type==='plan'?`<div class="row-actions"><button type="button" class="ghost-btn edit-plan">Düzenle</button><button type="button" class="danger-btn del-plan">Sil</button></div>`:''}`;
    if(e._type==='plan'){
      row.querySelector('.edit-plan').onclick=()=>v9StartPlanEdit(e);
      row.querySelector('.del-plan').onclick=()=>v9DeletePlan(e.id,e.title);
    }
    box.appendChild(row);
  });
}

function v9ResetPlanForm(){
  $('planEditId').value=''; $('planTitle').value=''; $('planOwner').value='ortak'; $('planDate').value=v9SelectedDate;
  $('planTime').value=''; $('planCategory').value='genel'; $('planReminder').value='0'; $('planNote').value='';
  $('planFormTitle').textContent='Yeni Plan'; $('cancelPlanEditBtn').hidden=true;
}
function v9StartPlanEdit(p){
  $('planEditId').value=p.id;$('planTitle').value=p.title||'';$('planOwner').value=p.owner||'ortak';$('planDate').value=p.date||'';
  $('planTime').value=p.time||'';$('planCategory').value=p.category||'genel';$('planReminder').value=String(p.reminder||0);$('planNote').value=p.note||'';
  $('planFormTitle').textContent='Planı Düzenle';$('cancelPlanEditBtn').hidden=false;
}
async function v9SavePlan(){
  const title=$('planTitle').value.trim(), date=$('planDate').value;
  if(!title||!date)return toast('Başlık ve tarih gerekli 📅');
  state.plans=state.plans||[];
  const id=$('planEditId').value;
  const obj={id:id||uid(),title,date,time:$('planTime').value||'',owner:$('planOwner').value||'ortak',category:$('planCategory').value||'genel',reminder:Number($('planReminder').value)||0,note:$('planNote').value.trim(),updatedAt:Date.now()};
  if(id){const i=state.plans.findIndex(x=>x.id===id);if(i>=0)state.plans[i]={...state.plans[i],...obj}}
  else state.plans.push({...obj,createdAt:Date.now(),createdBy:actor?.()||v9Role()});
  save();v9SelectedDate=date;v9CalendarCursor=new Date(date+'T12:00:00');v9RenderCalendar();v9ResetPlanForm();
  toast(id?'Plan güncellendi 📅':'Plan eklendi 📅');
  v9Notify(id?'📅 Plan güncellendi':'📅 Yeni ortak plan',`${actor?.()||'Biri'} “${title}” planını ${id?'güncelledi':'ekledi'}`,'plan','planner').catch(()=>{});
}
async function v9DeletePlan(id,title){
  state.plans=(state.plans||[]).filter(x=>x.id!==id);save();v9RenderCalendar();
  v9Notify('🗑️ Plan silindi',`${actor?.()||'Biri'} “${title}” planını sildi`,'plan','planner').catch(()=>{});
}

function v9ResetTodoForm(){
  $('todoEditId').value='';$('todoText').value='';$('todoOwner').value='ortak';$('todoDate').value='';$('todoPriority').value='normal';$('todoCalendar').value='yes';$('todoReminder').value='0';
  $('cancelTodoEditBtn').hidden=true;$('saveTodoBtn').textContent='Görevi kaydet ✅';
}
function v9StartTodoEdit(t){
  $('todoEditId').value=t.id;$('todoText').value=t.text||'';$('todoOwner').value=t.owner||'ortak';$('todoDate').value=t.date||'';$('todoPriority').value=t.priority||'normal';$('todoCalendar').value=t.calendar||'yes';$('todoReminder').value=String(t.reminder||0);
  $('cancelTodoEditBtn').hidden=false;$('saveTodoBtn').textContent='Görevi güncelle ✅';
}
async function v9SaveTodo(){
  const text=$('todoText').value.trim();if(!text)return toast('Görev yazmalısın ✅');
  state.todos=state.todos||[];const id=$('todoEditId').value;
  const obj={id:id||uid(),text,owner:$('todoOwner').value||'ortak',date:$('todoDate').value||'',priority:$('todoPriority').value||'normal',calendar:$('todoCalendar').value||'yes',reminder:Number($('todoReminder').value)||0,updatedAt:Date.now()};
  if(id){const i=state.todos.findIndex(x=>x.id===id);if(i>=0)state.todos[i]={...state.todos[i],...obj}}
  else state.todos.push({...obj,done:false,createdAt:Date.now(),createdBy:actor?.()||v9Role()});
  save();v9RenderTodos();v9RenderCalendar();v9ResetTodoForm();
  v9Notify(id?'✅ Görev güncellendi':'✅ Yeni görev',`${actor?.()||'Biri'} “${text}” görevini ${id?'güncelledi':'ekledi'}`,'todo','todo').catch(()=>{});
}
function v9RenderTodos(){
  const list=$('todoList'), stats=$('todoStats');if(!list)return;
  const all=state.todos||[];const filter=$('todoFilter')?.value||'all', role=v9Role();
  let items=all;
  if(filter==='open')items=all.filter(x=>!x.done);
  if(filter==='done')items=all.filter(x=>x.done);
  if(filter==='mine')items=all.filter(x=>x.owner===role||x.owner==='ortak');
  if(stats)stats.innerHTML=`<span>Toplam <b>${all.length}</b></span><span>Açık <b>${all.filter(x=>!x.done).length}</b></span><span>Tamam <b>${all.filter(x=>x.done).length}</b></span>`;
  list.innerHTML='';if(!items.length){list.innerHTML='<p class="muted">Bu filtrede görev yok.</p>';return}
  const pr={normal:'',high:'⭐ ',urgent:'🚨 '};
  items.sort((a,b)=>Number(a.done)-Number(b.done)||(a.date||'9999').localeCompare(b.date||'9999')).forEach(t=>{
    const row=document.createElement('div');row.className='list-card todo-card'+(t.done?' done':'');
    row.innerHTML=`<div class="todo-main"><label class="todo-line"><input type="checkbox" ${t.done?'checked':''}><span>${pr[t.priority]||''}${v9Esc(t.text)}</span></label>
    <small>${v9OwnerLabel(t.owner)}${t.date?' • '+v9Date(t.date):''}</small></div>
    <div class="row-actions"><button type="button" class="ghost-btn edit">Düzenle</button><button type="button" class="danger-btn del">Sil</button></div>`;
    row.querySelector('input').onchange=()=>{t.done=!t.done;save();v9RenderTodos();v9RenderCalendar();v9Notify('✅ Görev durumu değişti',`${actor?.()||'Biri'} “${t.text}” görevini ${t.done?'tamamladı':'yeniden açtı'}`,'todo','todo').catch(()=>{})};
    row.querySelector('.edit').onclick=()=>v9StartTodoEdit(t);
    row.querySelector('.del').onclick=()=>{state.todos=all.filter(x=>x.id!==t.id);save();v9RenderTodos();v9RenderCalendar();v9Notify('🗑️ Görev silindi',`${actor?.()||'Biri'} “${t.text}” görevini sildi`,'todo','todo').catch(()=>{})};
    list.appendChild(row);
  });
}

function v9ExpenseMonth(){return $('expenseMonth')?.value||new Date().toISOString().slice(0,7)}
function v9RenderExpenses(){
  const list=$('expenseList'), stats=$('expenseStats');if(!list)return;
  const month=v9ExpenseMonth();
  const items=(state.expenses||[]).filter(x=>(x.date||'').startsWith(month)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const total=items.reduce((s,x)=>s+Number(x.amount||0),0), n=items.filter(x=>x.payer==='necati').reduce((s,x)=>s+Number(x.amount||0),0), ni=items.filter(x=>x.payer==='nisa').reduce((s,x)=>s+Number(x.amount||0),0);
  if(stats)stats.innerHTML=`<div><small>Bu ay</small><strong>${v9Money(total)}</strong></div><div><small>Necati</small><strong>${v9Money(n)}</strong></div><div><small>Nisa</small><strong>${v9Money(ni)}</strong></div>`;
  list.innerHTML='';if(!items.length){list.innerHTML='<p class="muted">Bu ay kayıtlı harcama yok.</p>';return}
  items.forEach(x=>{
    const row=document.createElement('div');row.className='list-card';
    row.innerHTML=`<div><strong>${v9Esc(x.title)} • ${v9Money(x.amount)}</strong><small>${v9Date(x.date)} • ${v9OwnerLabel(x.payer)} • ${v9Esc(x.category)}</small>${x.note?`<p>${v9Esc(x.note)}</p>`:''}</div><button type="button" class="danger-btn">Sil</button>`;
    row.querySelector('button').onclick=()=>{state.expenses=(state.expenses||[]).filter(e=>e.id!==x.id);save();v9RenderExpenses();v9RenderCalendar();v9Notify('💸 Harcama silindi',`${actor?.()||'Biri'} ${x.title} harcamasını sildi`,'expense','expense').catch(()=>{})};
    list.appendChild(row);
  });
}
async function v9AddExpense(){
  const title=$('expenseTitle').value.trim(), amount=Number($('expenseAmount').value), date=$('expenseDate').value;
  if(!title||!amount||!date)return toast('Açıklama, tutar ve tarih gerekli 💸');
  const x={id:uid(),title,amount,date,payer:$('expensePayer').value||'ortak',category:$('expenseCategory').value||'diger',calendar:$('expenseCalendar').value||'no',note:$('expenseNote').value.trim(),createdAt:Date.now(),createdBy:actor?.()||v9Role()};
  state.expenses=state.expenses||[];state.expenses.push(x);save();v9RenderExpenses();v9RenderCalendar();
  $('expenseTitle').value='';$('expenseAmount').value='';$('expenseNote').value='';
  v9Notify('💸 Yeni ortak harcama',`${actor?.()||'Biri'} ${title} için ${v9Money(amount)} ekledi`,'expense','expense').catch(()=>{});
}

function v9BotContextAnswer(text){
  const t=text.toLocaleLowerCase('tr-TR'), today=new Date().toISOString().slice(0,10), month=today.slice(0,7);
  if(/bugün.*plan|plan.*bugün/.test(t)){
    const p=(state.plans||[]).filter(x=>x.date===today);
    return p.length?`Bugün ${p.length} plan var: `+p.map(x=>`${x.time?x.time+' ':''}${x.title}`).join(', '):'Bugün ortak takvimde plan görünmüyor 😄';
  }
  if(/yapılacak|görev|işler/.test(t)){
    const open=(state.todos||[]).filter(x=>!x.done);
    return open.length?`Açık ${open.length} görev var: `+open.slice(0,6).map(x=>x.text).join(', '):'Şu an açık görev yok, tertemiz 😄';
  }
  if(/harca|para|gider|bu ay/.test(t)){
    const items=(state.expenses||[]).filter(x=>(x.date||'').startsWith(month));
    const total=items.reduce((s,x)=>s+Number(x.amount||0),0);
    return `Bu ay ortak harcama toplamı ${v9Money(total)} görünüyor.`;
  }
  if(/üzgün|moral|kötü|canım sıkkın/.test(t)) return 'gel buraya anlat bakalım ne oldu ben burdayım ❤️';
  if(/özledim|özlüyorum/.test(t)) return 'ben de seni özledim gelince sarılma borcum var 😄❤️';
  if(/seviyor musun|seviyorum/.test(t)) return 'bunu hâlâ soruyor musun 😄 seni çok seviyorum ❤️';
  return ['anlat bakalım seni dinliyorum ❤️','tamam devam et merak ettim 😄','ben olsam önce seni bi sarardım sonra konuşurduk ❤️'][Math.floor(Math.random()*3)];
}
function v9RenderBot(){
  const c=$('botChat');if(!c)return;c.innerHTML='';
  state.botHistory=state.botHistory||[];
  if(!state.botHistory.length)state.botHistory.push({from:'bot',text:'Alooo 😄 Necati Bot 2.0 hatta. Ne oldu güzelim ❤️'});
  state.botHistory.slice(-50).forEach(m=>{const b=document.createElement('div');b.className='bubble '+(m.from==='user'?'me':'bot');b.textContent=m.text;c.appendChild(b)});
  c.scrollTop=c.scrollHeight;
}
function v9BotSend(text){
  text=(text||$('botInput')?.value||'').trim();if(!text)return;
  state.botHistory=state.botHistory||[];state.botHistory.push({from:'user',text,at:Date.now()},{from:'bot',text:v9BotContextAnswer(text),at:Date.now()+1});save();
  if($('botInput'))$('botInput').value='';v9RenderBot();
}

// Dialog routing
document.addEventListener('click',e=>{
  const open=e.target.closest?.('[data-open]');
  if(open){
    const id=open.dataset.open;
    if(['plannerDialog','todoDialog','expenseDialog','necatiBotDialog'].includes(id)){
      e.preventDefault();e.stopImmediatePropagation();
      if(id==='plannerDialog'){v9SelectedDate=new Date().toISOString().slice(0,10);v9CalendarCursor=new Date();v9ResetPlanForm();v9RenderCalendar()}
      if(id==='todoDialog'){v9ResetTodoForm();v9RenderTodos()}
      if(id==='expenseDialog'){if($('expenseMonth'))$('expenseMonth').value=new Date().toISOString().slice(0,7);if($('expenseDate'))$('expenseDate').value=new Date().toISOString().slice(0,10);v9RenderExpenses()}
      if(id==='necatiBotDialog')v9RenderBot();
      v9Open(id);return;
    }
  }
  const close=e.target.closest?.('[data-close]');if(close){e.preventDefault();v9Close(close.dataset.close)}
},true);

// Planner controls
$('calPrev')?.addEventListener('click',()=>{v9CalendarCursor.setMonth(v9CalendarCursor.getMonth()-1);v9RenderCalendar()});
$('calNext')?.addEventListener('click',()=>{v9CalendarCursor.setMonth(v9CalendarCursor.getMonth()+1);v9RenderCalendar()});
$('todayCalendarBtn')?.addEventListener('click',()=>{v9SelectedDate=new Date().toISOString().slice(0,10);v9CalendarCursor=new Date();v9RenderCalendar()});

$('cancelPlanEditBtn')?.addEventListener('click',v9ResetPlanForm);

// Todo controls

$('cancelTodoEditBtn')?.addEventListener('click',v9ResetTodoForm);
$('todoFilter')?.addEventListener('change',v9RenderTodos);

// Expenses

$('expenseMonth')?.addEventListener('change',v9RenderExpenses);

// Bot

$('botInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();v9BotSend()}});
document.querySelectorAll('[data-bot-q]').forEach(b=>b.addEventListener('click',()=>v9BotSend(b.dataset.botQ)));

// Smart notification metadata is stored per item (reminder minutes).
// Actual background delivery can be handled by Cloudflare Scheduled Worker in a later server-side pass.


// ===== v10 Mobile UI =====
function v10Currency(n){
  try{return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Number(n)||0)}
  catch{return '₺'+Math.round(Number(n)||0)}
}
function v10RefreshDashboard(){
  const now=new Date();
  const today=now.toISOString().slice(0,10);
  const label=$('todayDateLabel');
  if(label) label.textContent=now.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});

  const mood=state?.mood?.today;
  if($('dashMood')) $('dashMood').textContent=mood ? `${mood} Bugünkü mod` : 'Henüz seçilmedi';

  const plans=[...(state?.plans||[])].filter(p=>p.date>=today).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  const next=plans[0];
  if($('dashNextPlan')) $('dashNextPlan').textContent=next ? `${next.date===today?'Bugün':'Yakında'} ${next.time||''} ${next.title}`.trim() : 'Plan yok';

  const open=(state?.todos||[]).filter(t=>!t.done);
  if($('dashTodoCount')) $('dashTodoCount').textContent=`${open.length} görev`;

  const month=today.slice(0,7);
  const total=(state?.expenses||[]).filter(x=>(x.date||'').startsWith(month)).reduce((s,x)=>s+Number(x.amount||0),0);
  if($('dashExpense')) $('dashExpense').textContent=v10Currency(total);

  const greeting=$('mobileGreeting');
  if(greeting){
    const h=now.getHours();
    greeting.textContent=h<12?'Günaydın ❤️':h<18?'Güzel bir gün ❤️':'İyi akşamlar ❤️';
  }
}

function v10ActivateTab(name){
  document.querySelectorAll('.tab-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
}
document.querySelectorAll('.tab-item').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const tab=btn.dataset.tab;
    v10ActivateTab(tab);
    if(tab==='home'){
      if(!$('moduleView').hidden) $('backBtn')?.click();
      window.scrollTo({top:0,behavior:'smooth'});
    }
    if(tab==='calendar') document.querySelector('[data-open="plannerDialog"]')?.click();
    if(tab==='love'){
      if(!$('moduleView').hidden) $('backBtn')?.click();
      document.querySelector('.modules-title')?.scrollIntoView({behavior:'smooth',block:'start'});
    }
    if(tab==='tasks') document.querySelector('[data-open="todoDialog"]')?.click();
    if(tab==='profile') $('settingsBtn')?.click();
  });
});

document.addEventListener('click',e=>{
  if(e.target.closest('[data-module],[data-open]')) setTimeout(v10RefreshDashboard,300);
});
document.addEventListener('DOMContentLoaded',()=>setTimeout(v10RefreshDashboard,100));
window.addEventListener('focus',()=>setTimeout(v10RefreshDashboard,150));
setInterval(v10RefreshDashboard,30000);


// ===== v10.0.1 Action Safety Layer =====
// Bu katman, mobil PWA'da eski cache/event bağlama sorunlarında da ana işlemleri çalıştırır.
document.addEventListener('click', async (e)=>{
  const btn=e.target.closest('button');
  if(!btn) return;

  if(btn.id==='savePlanBtn'){
    e.preventDefault();
    try{ await v9SavePlan(); v10RefreshDashboard?.(); }catch(err){ console.error(err); toast('Plan kaydedilemedi'); }
  }
  if(btn.id==='saveTodoBtn'){
    e.preventDefault();
    try{ await v9SaveTodo(); v10RefreshDashboard?.(); }catch(err){ console.error(err); toast('Görev kaydedilemedi'); }
  }
  if(btn.id==='addExpenseBtn'){
    e.preventDefault();
    try{ await v9AddExpense(); v10RefreshDashboard?.(); }catch(err){ console.error(err); toast('Harcama eklenemedi'); }
  }
  if(btn.id==='botSendBtn'){
    e.preventDefault();
    try{ v9BotSend(); }catch(err){ console.error(err); toast('Mesaj gönderilemedi'); }
  }
}, false);
