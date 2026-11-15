import cfg from './firebase-config.js';
const V='10.12.2',B=`https://www.gstatic.com/firebasejs/${V}/`;
const $=i=>document.getElementById(i);
const fmsg=(t,k)=>{const m=$('fr-msg');if(m){m.textContent=t||'';m.className='team-msg'+(k?' '+k:'')}};
const wait=()=>new Promise(r=>{const t=setInterval(()=>{if(window.ui&&window.ui.partyCh!==undefined&&$('modal-team')){clearInterval(t);r(window.ui)}},200)});
const ui=await wait();
const me$=$('fr-me'),fs=$('fb-stat');
const stat=(ok,m)=>{window.__fbOn=ok?1:0;window.__fbErr=m;fs&&(fs.textContent=(ok?'🟢 Online: ':'🔴 Offline: ')+m)};
if(!cfg.apiKey){stat(0,'firebase-config.js empty');me$.textContent='Firebase config illa: firebase-config.js fill pannunga. Appo varaikum same-device mode.';}
else try{
const {initializeApp}=await import(B+'firebase-app.js');
const A=await import(B+'firebase-auth.js'),D=await import(B+'firebase-database.js');
const app=initializeApp(cfg),auth=A.getAuth(app),db=D.getDatabase(app);
await auth.authStateReady();if(!auth.currentUser)await A.signInAnonymously(auth);window.__fb={A,auth,app};const uid=auth.currentUser.uid,R=p=>D.ref(db,p);
await new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('Realtime Database connect aagala - databaseURL/region check pannunga')),9000);D.onValue(R('.info/connected'),s=>{if(s.val()){clearTimeout(t);res()}})});
// stable 6-char friend ID per device
let fid=localStorage.getItem('ooru-fid');if(!/^\d{8}$/.test(fid||''))fid=String(1e7+Math.floor(Math.random()*9e7));
for(;;){const x=(await Promise.race([D.get(R('codes/'+fid)),new Promise((_,j)=>setTimeout(()=>j(new Error('Database read timeout - Rules publish pannunga / databaseURL check')),9000))])).val();if(!x||x===uid)break;fid=String(1e7+Math.floor(Math.random()*9e7))}
await D.set(R('codes/'+fid),uid);
stat(1,'Firebase connected');window.__setUid&&window.__setUid(fid);localStorage.setItem('ooru-fid',fid);me$.textContent='Un User ID: '+fid+'  ·  Online ✔';
const pres=()=>D.set(R('users/'+uid),{fid,name:ui.playerName||'PLAYER',hero:ui.hero,code:ui.party.code,pid:ui.myId,on:true,ts:Date.now()});
pres();D.onDisconnect(R('users/'+uid+'/on')).set(false);setInterval(pres,15000);
// cross-device party transport (same protocol as BroadcastChannel)
const local=ui.partyCh,t0=Date.now(),me=ui.myId;
const ch={postMessage(o){try{local&&local.postMessage(o)}catch(e){}const r=D.push(R('pc'));D.set(r,{ts:Date.now(),from:me,d:JSON.stringify(o)});setTimeout(()=>D.remove(r),8000)}};
D.onChildAdded(R('pc'),s=>{const v=s.val();if(v&&v.from!==me)try{ui.onPartyMsg(JSON.parse(v.d))}catch(e){}});
ui.partyCh=ch;
// friends list
const ul=$('fr-list'),F={};
const inT=u=>!!u.pid&&ui.partyOthers().some(m=>m.id===u.pid);
const sig=()=>Object.entries(F).map(([k,u])=>k+u.name+u.on+inT(u)).join('|');let last='';
const isOn=u=>!!u.on&&(!u.ts||Date.now()-u.ts<45000);
const draw=()=>{const rows=Object.entries(F).sort((x,y)=>(isOn(y[1])-isOn(x[1]))||String(x[1].name).localeCompare(String(y[1].name)));
 ul.replaceChildren(...rows.map(([fu,u])=>{const on=isOn(u),li=document.createElement('li');li.className='fr-row'+(on?' on':' off');
 const nm=(u.name&&u.name!=='...'?u.name:(u.id||'Friend'));
 const av=document.createElement('div');av.className='fr-av';av.textContent=nm.charAt(0).toUpperCase();const dot=document.createElement('i');dot.className='fr-dot';av.append(dot);
 const info=document.createElement('div');info.className='fr-info';
 const n=document.createElement('div');n.className='fr-name';n.textContent=nm;
 const st=document.createElement('div');st.className='fr-st';st.textContent=(on?'ONLINE':'OFFLINE')+(u.id?'  ·  ID '+u.id:'');
 info.append(n,st);li.append(av,info);
 const inTeam=u.code&&u.code===ui.party.code;
 if(inTeam){const t=document.createElement('span');t.className='fr-tag';t.textContent='IN TEAM ✔';li.append(t)}
 else if(on){const b=document.createElement('button');b.className='team-btn fr-inv';b.textContent='INVITE';b.onclick=()=>{window.__setMode&&window.__setMode('squad');D.push(R('invites/'+fu),{name:ui.playerName,code:ui.party.code,ts:Date.now()});fmsg('Invite anuppiten: '+(u.name||u.id),'ok')};li.append(b)}
 else{const t=document.createElement('span');t.className='fr-tag off';t.textContent='OFFLINE';li.append(t)}
 return li}))};
setInterval(draw,5000);
let lc=ui.party.code;setInterval(()=>{if(ui.party.code!==lc){lc=ui.party.code;pres();draw()}},700);
const sub={};
const watch=fu=>{if(sub[fu])return;sub[fu]=1;D.onValue(R('users/'+fu),x=>{const v=x.val();F[fu]={...(F[fu]||{}),name:v&&v.name?v.name:(F[fu]&&F[fu].name)||'...',on:!!(v&&v.on),ts:v&&v.ts,id:(v&&v.fid)||(F[fu]&&F[fu].id),code:v&&v.code};draw()})};
D.onValue(R('friends/'+uid),s=>{const ids=Object.keys(s.val()||{});Object.keys(F).forEach(k=>{if(!ids.includes(k))delete F[k]});ids.forEach(fu=>{if(!F[fu])F[fu]={name:'...',on:false};watch(fu)});draw()});
$('fr-add-btn').onclick=async()=>{const c=$('fr-add').value.trim();
if(!/^\d{8}$/.test(c)){fmsg('8-digit User ID type pannunga.','err');return}
if(!window.__fbOn){fmsg('Firebase offline: '+(window.__fbErr||''),'err');return}
fmsg('Theduren...');
try{const fu=(await D.get(R('codes/'+c))).val();
if(!fu){fmsg('Andha User ID illa. Friend game open panni 🟢 Online irukkanum.','err');return}
if(fu===uid){fmsg('Idhu un ID dhaan. Vera device/browser-la irukkura ID podunga.','err');return}
await D.set(R('friends/'+uid+'/'+fu),true);
try{await D.set(R('friends/'+fu+'/'+uid),true)}catch(e){}
const u=(await D.get(R('users/'+fu))).val();
F[fu]={name:u&&u.name?u.name:'...',on:!!(u&&u.on),id:c,code:u&&u.code};watch(fu);draw();$('fr-add').value='';fmsg('Friend add aayiduchu: '+(u?u.name:c),'ok')}catch(e){fmsg('Add fail: '+(e.code||e.message),'err')}};
$('fr-add').oninput=e=>e.target.value=e.target.value.toUpperCase().replace(/[^0-9]/g,'');
// incoming invites
const box=document.createElement('div');box.style.cssText='position:fixed;top:14px;right:14px;z-index:99999;display:flex;flex-direction:column;gap:8px';document.body.append(box);
D.onChildAdded(R('invites/'+uid),s=>{const v=s.val();D.remove(s.ref);if(!v||Date.now()-v.ts>120000||v.code===ui.party.code)return;
const d=document.createElement('div');d.style.cssText='background:#1e293b;color:#fff;padding:10px 14px;border:1px solid #94a3b8;border-radius:8px;font:700 14px Rajdhani,sans-serif';
d.textContent=v.name+' unna team-ku invite panraan  ';const y=document.createElement('button');y.className='team-btn';y.textContent='JOIN';y.onclick=()=>{ui.joinParty(v.code);d.remove()};d.append(y);box.append(d);setTimeout(()=>d.remove(),30000)});
}catch(e){stat(0,e.code||e.message);me$.textContent='Firebase error: '+e.message}