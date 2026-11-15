// Google sign-in on top of the Firebase anonymous account (online.js exposes window.__fb)
(function(){
const $=i=>document.getElementById(i);
const btn=$('btn-login-google');if(!btn)return;
const lbl=btn.querySelector('span'),orig=lbl?lbl.textContent:'';
const toast=t=>{const d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;border:1px solid #94a3b8;border-radius:8px;padding:10px 18px;font:700 16px var(--hud-font,Rajdhani);z-index:99999;max-width:90vw;text-align:center';document.body.append(d);setTimeout(()=>d.remove(),3500)};
const policyOk=()=>{const a=$('chk-age-policy'),b=$('chk-terms-policy');return !!(a&&b&&a.checked&&b.checked)};
const nameOf=u=>((u.displayName||'').trim()||(u.email||'').split('@')[0]||'PLAYER').slice(0,14);
let busy=false;

async function proceed(u){
 const C=window.__cloud;
 if(C&&await C.enter())return;          // returning player: saved name/character -> straight to lobby
 const n=nameOf(u);localStorage.setItem('ooru-gname',n);
 const p=$('input-profile-name'),c=$('input-char-name');p&&(p.value=n);c&&(c.value=n);
 window.ui&&window.ui.openProfileDialog&&window.ui.openProfileDialog();
}
btn.addEventListener('click',async e=>{
 if(!policyOk())return;                 // let the game show its own policy warning
 e.stopImmediatePropagation();e.preventDefault();
 if(busy)return;
 const F=window.__fb;
 if(!F){toast('Firebase online illa. firebase-config.js fill pannunga.');return}
 const {A,auth}=F;let u=auth.currentUser;
 if(u&&!u.isAnonymous){await proceed(u);return}      // already signed in with Google
 busy=true;lbl&&(lbl.textContent='Signing in...');
 try{
  const prov=new A.GoogleAuthProvider();prov.setCustomParameters({prompt:'select_account'});
  try{u=(u?await A.linkWithPopup(u,prov):await A.signInWithPopup(auth,prov)).user}
  catch(err){
   if(err.code==='auth/credential-already-in-use'||err.code==='auth/email-already-in-use'){
    const cred=A.GoogleAuthProvider.credentialFromError(err);
    if(cred){await A.signInWithCredential(auth,cred);try{window.__cloud&&await window.__cloud.load()}catch(e){}location.reload();return}   // existing account: reload so online.js uses its uid
   }
   throw err}
 await proceed(u);
 }catch(err){
  if(err.code!=='auth/popup-closed-by-user'&&err.code!=='auth/cancelled-popup-request')
   toast('Google login fail: '+(err.code==='auth/unauthorized-domain'?'domain Firebase-la authorize pannala':err.code==='auth/operation-not-allowed'?'Google provider enable pannala':(err.code||err.message)));
 }finally{busy=false;lbl&&(lbl.textContent=orig);paint()}
},true);

// returning Google user -> "Continue as NAME"
function paint(){const F=window.__fb,u=F&&F.auth.currentUser;
 if(lbl&&u&&!u.isAnonymous)lbl.textContent='Continue as '+nameOf(u)}
const t=setInterval(()=>{if(window.__fb){clearInterval(t);paint()}},300);

// logout also signs out of Google
const lo=$('btn-logout');
lo&&lo.addEventListener('click',()=>{const F=window.__fb,u=F&&F.auth.currentUser;
 if(u&&!u.isAnonymous)(window.__cloud?window.__cloud.flushAndClear():Promise.resolve()).catch(()=>{}).then(()=>F.A.signOut(F.auth)).finally(()=>setTimeout(()=>location.reload(),250))},true);
})();
