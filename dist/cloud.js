// Cloud save for Google accounts: Firebase Realtime Database  saves/<uid>
// Saves name, character, looks, wallet, stats, history, outfits, gun skins, bio, avatar, banner, settings.
(function(){
const $=i=>document.getElementById(i);
const B='https://www.gstatic.com/firebasejs/10.12.2/';
const KEYS=['ooru-char','ooru-avatar','ooru-banner','ooru-bio','ooru-stats','ooru-history','ooru-outfit','ooru-owned','ooru-gunowned','ooru-gunskin','ooru-wallet','ooru-gfx','ooru-settings'];
const DEF={skin:'#8a5a3a',hair:'#100a06',cloth:'#263238',pants:'#212121'};
const toast=t=>window.__toast?window.__toast(t):console.warn(t);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let D=null,db=null,uid=null,ready=false,last='',loading=null,loadedUid=null,warned=false;
const user=()=>{const F=window.__fb,u=F&&F.auth&&F.auth.currentUser;return u&&!u.isAnonymous?u:null};
const warn=(m,e)=>{console.warn('[cloud]',m,e);if(!warned){warned=true;toast(m+': '+((e&&(e.code||e.message))||''))}};
async function init(){if(db)return true;const F=window.__fb;if(!F)return false;D=await import(B+'firebase-database.js');db=D.getDatabase(F.app);return true}
const ref=()=>D.ref(db,'saves/'+uid);
const inGame=()=>{const u=window.ui;return !!u&&['screen-lobby','screen-matchmaking','screen-game','screen-gameover'].includes(u.currentScreen)};
const snap=()=>{const d={};KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)d[k]=v});return d};

// character = name + hero + custom colours (only after the player has really entered the lobby)
function readChar(){const u=window.ui;if(!u||!inGame()||!u.playerName)return;
 const c={name:u.playerName,hero:u.hero};
 [['skin','skinTone'],['hair','hairColor'],['cloth','outfitColor'],['pants','pantColor']].forEach(([k,f])=>{if(u[f]&&u[f]!==DEF[k])c[k]=u[f]});
 localStorage.setItem('ooru-char',JSON.stringify(c))}

async function save(force){const u=user();if(!u||!ready||!(await init()))return false;uid=u.uid;readChar();
 const d=snap(),s=JSON.stringify(d);if(!force&&s===last)return true;
 try{await D.set(ref(),{t:Date.now(),d});last=s;return true}catch(e){warn('Cloud save fail (Firebase Rules check pannunga)',e);return false}}

// pull cloud data into localStorage (cloud wins). Writes nothing back until this succeeded.
function load(){const u=user();if(!u)return Promise.resolve(null);
 if(loading&&loadedUid===u.uid)return loading;loadedUid=u.uid;
 return loading=(async()=>{
  if(!(await init()))return null;uid=u.uid;let v=null;
  try{v=(await Promise.race([D.get(ref()),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),8000))])).val()}
  catch(e){warn('Cloud load fail',e);loading=null;return null}
  let changed=false;
  if(v&&v.d)KEYS.forEach(k=>{const c=v.d[k];if(typeof c==='string'&&localStorage.getItem(k)!==c){localStorage.setItem(k,c);changed=true}});
  last=v?JSON.stringify(snap()):'';ready=true;
  return{changed,exists:!!v}})()}

// returning player -> apply saved character and go straight to the lobby (no name dialog)
async function enter(){
 if(!user())return false;await load();
 let c=null;try{c=JSON.parse(localStorage.getItem('ooru-char'))}catch(e){}
 const ui=window.ui;
 if(!c||!c.name||!c.hero||!ui||!ui.heroes||!ui.heroes[c.hero])return false;
 ui.playerName=String(c.name).slice(0,14);ui.pickedGender=c.hero==='priya'?'female':'male';
 ui.selectHero(c.hero,true);
 const ci=$('input-char-name'),pn=$('input-profile-name');ci&&(ci.value=ui.playerName);pn&&(pn.value=ui.playerName);
 ui.updateLobbyProfile&&ui.updateLobbyProfile();ui.renderRoster&&ui.renderRoster();
 const m=$('modal-profile');m&&m.classList.remove('active');
 ui.showScreen('screen-lobby');
 const looks=()=>['skin','hair','cloth','pants'].forEach(k=>c[k]&&ui.applyLook&&ui.applyLook(k,c[k]));
 setTimeout(looks,500);setTimeout(looks,1800);
 toast('Welcome back, '+ui.playerName);
 return true}

// logout: push final save, then wipe this device's copy so a guest does not inherit the account data
async function flushAndClear(){if(await save(true)){KEYS.forEach(k=>localStorage.removeItem(k));localStorage.removeItem('ooru-gname')}}

window.__cloud={load,enter,save,flushAndClear};

(async function boot(){
 for(;;){
  if(user()){
   const r=await load();
   if(r){
    const scr=(window.ui&&window.ui.currentScreen)||'screen-splash';
    if(r.changed&&(scr==='screen-splash'||scr==='screen-login')&&sessionStorage.getItem('ooru-cloud-rl')!==uid){
     sessionStorage.setItem('ooru-cloud-rl',uid);location.reload();return}   // one reload so every module reads the restored data
    break}
   await sleep(3000)}
  else await sleep(1000)}
 setInterval(()=>{save()},3000);
 document.addEventListener('visibilitychange',()=>{document.hidden&&save()});
 window.addEventListener('pagehide',()=>{save(true)});
})();
})();
