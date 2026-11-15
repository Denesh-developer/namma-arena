// Mobile HUD: nicer touch controls (sprint on joystick, drag-to-aim on fire button, weapon swap, icons, badges)
(function(){
const force=/[?&]mobile=1/.test(location.search);
const realTouch='ontouchstart' in window||navigator.maxTouchPoints>0;
const coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const ua=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const touch=force||realTouch||coarse||ua||window.innerWidth<=900;
if(!touch)return;
document.documentElement.classList.add('is-touch');
document.body.classList.add('is-touch');
const $=i=>document.getElementById(i);
const ico={
 fire:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="9" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 4v10M24 34v10M4 24h10M34 24h10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="2.5" fill="currentColor"/></svg>',
 jump:'<svg viewBox="0 0 48 48"><path d="M12 28l12-12 12 12M12 38l12-12 12 12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 crouch:'<svg viewBox="0 0 48 48"><circle cx="20" cy="10" r="5" fill="currentColor"/><path d="M20 16v10l10 4v10M20 26l-8 6v8M24 20l10-2" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 scope:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 6v12M24 30v12M6 24h12M30 24h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
 reload:'<svg viewBox="0 0 48 48"><path d="M38 24a14 14 0 1 1-4.5-10.3" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M36 6v9h-9" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 gloo:'<svg viewBox="0 0 48 48"><path d="M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z" fill="currentColor"/></svg>',
 medkit:'<svg viewBox="0 0 48 48"><path d="M20 8h8v12h12v8H28v12h-8V28H8v-8h12z" fill="currentColor"/></svg>',
 swap:'<svg viewBox="0 0 48 48"><path d="M8 18h28l-7-7M40 30H12l7 7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const setIcon=(id,k,label)=>{const b=$(id);if(!b)return;b.innerHTML=ico[k]+(label?'<span class="tb-l">'+label+'</span>':'');b.classList.add('tb-'+k)};
const init=()=>{
 const mc=$('mobile-controls');if(!mc)return false;
 mc.style.display='block';
 const box=mc.querySelector('.touch-action-buttons');
 if(box&&!$('touch-btn-swap')){const b=document.createElement('button');b.id='touch-btn-swap';b.className='touch-btn';b.type='button';box.append(b)}
 setIcon('touch-btn-fire','fire');setIcon('touch-btn-jump','jump','JUMP');setIcon('touch-btn-crouch','crouch','SIT');
 setIcon('touch-btn-scope','scope','SCOPE');setIcon('touch-btn-reload','reload','RELOAD');setIcon('touch-btn-gloo','gloo','GLOO');
 setIcon('touch-btn-medkit','medkit','MED');setIcon('touch-btn-swap','swap','SWAP');
 // badges
 ['gloo','medkit'].forEach(k=>{const b=$('touch-btn-'+k);if(b&&!b.querySelector('.tb-n')){const n=document.createElement('i');n.className='tb-n';b.append(n)}});
 // weapon swap
 const swap=$('touch-btn-swap');
 const doSwap=p=>{if(!p||p.isDead)return;const ks=Object.keys(p.weapons).filter(k=>p.weapons[k]);if(ks.length<2)return;
  p.currentWeaponKey=ks[(ks.indexOf(p.currentWeaponKey)+1)%ks.length];p.updateGunMesh&&p.updateGunMesh()};
 swap&&swap.addEventListener('touchstart',e=>{e.preventDefault();doSwap(window.player)},{passive:false});
 // mouse fallback (desktop / emulator without real touch events)
 if(!realTouch){const P=()=>window.player;
  const hold=(id,k)=>{const b=$(id);if(!b)return;b.addEventListener('mousedown',e=>{e.preventDefault();P()&&(P().keys[k]=true)});window.addEventListener('mouseup',()=>{P()&&(P().keys[k]=false)})};
  hold('touch-btn-fire','fire');hold('touch-btn-jump','jump');
  const tap=(id,fn)=>{const b=$(id);b&&b.addEventListener('click',e=>{e.preventDefault();P()&&fn(P())})};
  tap('touch-btn-gloo',p=>p.triggerGloo());tap('touch-btn-reload',p=>p.reload());tap('touch-btn-scope',p=>p.toggleScope());
  tap('touch-btn-crouch',p=>{p.isCrouched=!p.isCrouched});tap('touch-btn-medkit',p=>p.useMedkit());tap('touch-btn-swap',doSwap);
  const z=$('touch-joystick-zone'),th=$('touch-joystick-thumb');
  if(z){let dn=false;const mv=e=>{const P2=P();if(!dn||!P2)return;const r=z.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.min(45,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);
    th&&(th.style.transform='translate(calc(-50% + '+Math.cos(a)*d+'px), calc(-50% + '+Math.sin(a)*d+'px))');
    P2.keys.forward=dy<-15;P2.keys.backward=dy>15;P2.keys.left=dx<-15;P2.keys.right=dx>15;P2.keys.sprint=Math.hypot(dx,dy)>42&&dy<-20};
   z.addEventListener('mousedown',e=>{dn=true;mv(e)});window.addEventListener('mousemove',mv);
   window.addEventListener('mouseup',()=>{if(!dn)return;dn=false;th&&(th.style.transform='translate(-50%, -50%)');const p=P();p&&Object.assign(p.keys,{forward:false,backward:false,left:false,right:false,sprint:false})})}
 }
 // crouch + scope toggled look
 const cr=$('touch-btn-crouch'),sc=$('touch-btn-scope');
 // sprint when joystick is pushed far
 const jz=$('touch-joystick-zone');
 if(jz){let o=null;
  jz.addEventListener('touchstart',e=>{const t=e.touches[0];o={x:t.clientX,y:t.clientY}},{passive:true});
  jz.addEventListener('touchmove',e=>{if(!o||!window.player)return;const t=e.touches[0];window.player.keys.sprint=Math.hypot(t.clientX-o.x,t.clientY-o.y)>42&&(o.y-t.clientY)>20},{passive:true});
  const end=()=>{o=null;window.player&&(window.player.keys.sprint=false)};jz.addEventListener('touchend',end);jz.addEventListener('touchcancel',end)}
 // drag on fire button = aim while shooting
 const fb=$('touch-btn-fire');
 if(fb){let id=null,lx=0,ly=0;
  fb.addEventListener('touchstart',e=>{const t=e.changedTouches[0];id=t.identifier;lx=t.clientX;ly=t.clientY;
   try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{})}catch(_){}},{passive:true});
  fb.addEventListener('touchmove',e=>{const p=window.player;if(!p||p.isDead)return;const t=[...e.changedTouches].find(x=>x.identifier===id);if(!t)return;
   p.yaw-=(t.clientX-lx)*p.sensitivity*1.7;p.pitch=Math.max(-Math.PI/2.4,Math.min(Math.PI/2.4,p.pitch-(t.clientY-ly)*p.sensitivity*1.7));lx=t.clientX;ly=t.clientY;e.preventDefault()},{passive:false});
  const end=()=>{id=null;window.player&&(window.player.keys.fire=false)};fb.addEventListener('touchend',end);fb.addEventListener('touchcancel',end)}
 // sync badges / toggle states
 setInterval(()=>{const p=window.player;if(!p)return;
  const g=$('touch-btn-gloo'),m=$('touch-btn-medkit');
  g&&(g.querySelector('.tb-n').textContent=p.glooCount);m&&(m.querySelector('.tb-n').textContent=p.medCount);
  cr&&cr.classList.toggle('on',!!p.isCrouched);sc&&sc.classList.toggle('on',!!p.isScoped);
  const w=p.getCurrentWeapon&&p.getCurrentWeapon();sc&&sc.classList.toggle('hide',!(w&&w.hasScope));
  const ks=Object.keys(p.weapons).filter(k=>p.weapons[k]);swap&&swap.classList.toggle('hide',ks.length<2)},250);
 return true};
if(!init()){const t=setInterval(()=>{if(init())clearInterval(t)},300)}
// rotate hint (portrait) + fullscreen button
const de=document.documentElement;
const canFS=!!(de.requestFullscreen||de.webkitRequestFullscreen);
const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
const goFS=()=>{try{const r=(de.requestFullscreen||de.webkitRequestFullscreen).call(de);
  const lock=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}};
  r&&r.then?r.then(lock,()=>{}):lock()}catch(_){}};
const exitFS=()=>{try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(_){}};
const rh=document.createElement('div');rh.id='rotate-hint';
rh.innerHTML='<div class="rh-box"><div class="rh-i">📱</div><div class="rh-t">ROTATE YOUR PHONE</div><div class="rh-s">Phone-a landscape la thiruppunga</div>'
 +(canFS?'<button type="button" class="rh-fs">⛶ FULLSCREEN</button>':'<div class="rh-s rh-ios">Full screen-kku: Share → "Add to Home Screen"</div>')+'</div>';
document.body.append(rh);
const rb=rh.querySelector('.rh-fs');rb&&rb.addEventListener('click',goFS);
if(canFS){
 const fb=document.createElement('button');fb.id='fs-btn';fb.type='button';fb.setAttribute('aria-label','Fullscreen');
 fb.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 document.body.append(fb);
 fb.addEventListener('click',()=>isFS()?exitFS():goFS());
 const sync=()=>{fb.classList.toggle('in-fs',isFS());const g=$('screen-game');fb.classList.toggle('in-game',!!(g&&g.classList.contains('active')))};
 document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);setInterval(sync,500);sync();
}
})();
