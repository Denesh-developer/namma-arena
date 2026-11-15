// Player profile screen (opens when you tap the name/level box, top-left of lobby)
(function(){
const $=i=>document.getElementById(i);
const LS=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}};
const RANKS=[['BRONZE','#cd7f32'],['SILVER','#cbd5e1'],['GOLD','#facc15'],['PLATINUM','#67e8f9'],['DIAMOND','#60a5fa'],['HEROIC','#f87171']];
// call window.__recordMatch(true|false, kills) from game-over to fill stats/history
window.__recordMatch=(win,kills,quit)=>{const s=LS('ooru-stats',{m:0,w:0,k:0,d:0}),h=LS('ooru-history',[]);
s.m++;win&&s.w++;s.k+=kills|0;localStorage.setItem('ooru-stats',JSON.stringify(s));
h.unshift({win:!!win,k:kills|0,q:!!quit,t:Date.now()});!quit&&window.__wallet&&window.__wallet.add('c',(win?100:30)+(kills|0)*10);localStorage.setItem('ooru-history',JSON.stringify(h.slice(0,20)))};

const AV=['🥊','🔥','⚡','🦁','🐯','🦅','🐺','🐉','💀','👑','🚒','🎯','🛡️','🏍️','🐘','🦂'];
const BN=[['GOLD RUSH','linear-gradient(135deg,#b45309,#facc15)'],['CHEYYAR RED','linear-gradient(135deg,#7f1d1d,#ef4444)'],['OCEAN','linear-gradient(135deg,#0c4a6e,#06b6d4)'],['FOREST','linear-gradient(135deg,#14532d,#4ade80)'],['ROYAL','linear-gradient(135deg,#3b0764,#a855f7)'],['SUNSET','linear-gradient(135deg,#9a3412,#f472b6)'],['STEEL','linear-gradient(135deg,#0f172a,#64748b)'],['NEON','linear-gradient(135deg,#065f46,#22d3ee,#6366f1)']];
const avSel=()=>localStorage.getItem('ooru-avatar')||'';
const bnHas=()=>localStorage.getItem('ooru-banner')!==null&&!!BN[+localStorage.getItem('ooru-banner')];
const bnBg=()=>'linear-gradient(90deg,rgba(8,13,26,.12),rgba(8,13,26,.5)),'+BN[+localStorage.getItem('ooru-banner')][1];
function applyLook(){
const a=avSel();
if(a)['lobby-avatar-icon','squad-slot-0-avatar'].forEach(id=>{const el=$(id);if(el&&el.textContent!==a)el.textContent=a});
const pill=document.querySelector('.player-pill');
if(pill&&bnHas())pill.style.setProperty('background',bnBg(),'important');
const ph=document.querySelector('.pf-head');
if(ph&&bnHas())ph.style.background=bnBg();
}
setInterval(applyLook,500);
const css=document.createElement('style');css.textContent=`
.pf-pick{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.pf-pick button{background:#0b1220;color:#fff;border:2px solid #334155;padding:8px 2px;font-size:28px;cursor:pointer}
.pf-pick button.on{border-color:#facc15;box-shadow:0 0 10px rgba(250,204,21,.5)}
.pf-pick.bn{grid-template-columns:repeat(2,1fr)}.pf-pick.bn button{height:46px;font:800 15px Chakra Petch,Rajdhani,sans-serif;letter-spacing:1px;text-shadow:0 1px 4px #000}
.pf-pick-def{margin-top:8px;width:100%;background:#1e293b;color:#cbd5e1;border:1px solid #475569;padding:6px;font:700 14px Rajdhani;cursor:pointer}
#pf{position:fixed;inset:0;z-index:9500;display:none;font-family:Rajdhani,sans-serif;color:#fff;
background:linear-gradient(90deg,rgba(6,10,22,.97) 0,rgba(6,10,22,.82) 20%,rgba(6,10,22,.25) 38%,rgba(6,10,22,.25) 58%,rgba(6,10,22,.88) 72%,rgba(6,10,22,.97) 100%)}
#pf.on{display:block}body.pf-open .lm-mate{display:none!important}body.pf-open [id^=lobby-mate-]{display:none!important}
.pf-top{position:absolute;top:0;left:0;right:0;height:56px;display:flex;align-items:center;gap:14px;padding:0 16px;background:linear-gradient(180deg,rgba(0,0,0,.6),transparent)}
.pf-back{background:#1e293b;color:#fff;border:1px solid #64748b;padding:6px 16px;font:700 16px Rajdhani;cursor:pointer;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)}
.pf-cur{margin-left:auto;display:flex;gap:10px;font:800 18px Chakra Petch,Rajdhani,sans-serif}.pf-cur span{background:rgba(15,23,42,.8);padding:4px 12px;border:1px solid #334155}
.pf-title{font:700 30px Teko,sans-serif;letter-spacing:3px}
.pf-tabs{position:absolute;left:0;top:76px;width:230px;display:flex;flex-direction:column;gap:6px}
.pf-tab{background:rgba(15,23,42,.9);color:#cbd5e1;border:0;border-left:4px solid transparent;text-align:left;padding:14px 18px;font:700 20px Rajdhani;letter-spacing:1px;cursor:pointer}
.pf-tab.on{background:linear-gradient(90deg,#facc15,#f59e0b);color:#111;border-left-color:#fff}
.pf-card{position:absolute;right:14px;top:70px;bottom:14px;width:min(400px,46%);display:flex;flex-direction:column;gap:10px;overflow:auto}
.pf-head{display:flex;gap:12px;align-items:center;padding:12px;background:linear-gradient(135deg,#f59e0b 0,#facc15 12%,#0f172a 12.5%,#1e293b 100%);border:1px solid #475569}
.pf-av{width:76px;height:76px;display:flex;align-items:center;justify-content:center;font-size:44px;background:#0b1220;border:2px solid #facc15;flex:none}
.pf-nm{font:700 34px Teko,sans-serif;line-height:1;letter-spacing:1px;word-break:break-word}
.pf-id{font:700 15px Chakra Petch,sans-serif;color:#94a3b8;cursor:pointer}.pf-id:hover{color:#facc15}
.pf-lv{display:inline-block;background:#facc15;color:#111;font:800 14px Chakra Petch,sans-serif;padding:1px 8px;margin-right:6px}
.pf-xp{height:8px;background:#0b1220;border:1px solid #475569;margin-top:6px}.pf-xp i{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#facc15)}
.pf-box{background:rgba(15,23,42,.92);border:1px solid #334155;padding:12px}
.pf-h{font:700 14px Chakra Petch,sans-serif;color:#facc15;letter-spacing:2px;margin-bottom:8px}
.pf-rank{display:flex;align-items:center;gap:14px}.pf-rank b{font:700 34px Teko,sans-serif;letter-spacing:2px}
.pf-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.pf-grid div{background:#0b1220;border:1px solid #334155;padding:8px 4px;text-align:center}
.pf-grid b{display:block;font:700 28px Teko,sans-serif;line-height:1}.pf-grid span{font:700 12px Chakra Petch,sans-serif;color:#94a3b8;letter-spacing:1px}
.pf-bio{width:100%;box-sizing:border-box;min-height:64px;background:#0b1220;color:#fff;border:1px solid #475569;padding:8px;font:600 17px Rajdhani;resize:none;outline:none}
.pf-bio:focus{border-color:#facc15}.pf-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #1e293b;font-size:17px}
.pf-w{color:#22c55e}.pf-l{color:#f87171}
@media(max-width:700px){.pf-tabs{width:130px}.pf-tab{padding:10px;font-size:16px}.pf-card{width:58%}}`;
document.head.append(css);

const root=document.createElement('div');root.id='pf';
root.innerHTML=`<div class="pf-top"><button class="pf-back">← BACK</button><span class="pf-title">PROFILE</span><div class="pf-cur"><span id="pf-c">🪙 0</span><span id="pf-d">💎 0</span></div></div>
<div class="pf-tabs">${['overview:OVERVIEW','stats:STATS','history:HISTORY','custom:CUSTOMIZE','honor:HONOR SCORE'].map((t,i)=>`<button class="pf-tab${i?'':' on'}" data-t="${t.split(':')[0]}">${t.split(':')[1]}</button>`).join('')}</div>
<div class="pf-card"><div class="pf-head"><div class="pf-av" id="pf-av"></div><div style="flex:1;min-width:0"><div class="pf-nm" id="pf-nm"></div><div class="pf-id" id="pf-id" title="Tap to copy"></div><div><span class="pf-lv">LV 1</span><span id="pf-rk" style="font:800 14px Chakra Petch,sans-serif"></span></div><div class="pf-xp"><i style="width:8%"></i></div></div></div><div id="pf-body"></div></div>`;
document.body.append(root);

let tab='overview';
const stats=()=>LS('ooru-stats',{m:0,w:0,k:0,d:0});
function body(){
$('pf-body').onclick=null;
const s=stats(),ui=window.ui||{},H=ui.heroes&&ui.heroes[ui.hero],B=$('pf-body'),kd=s.m?(s.k/Math.max(1,s.m-s.w)).toFixed(2):'0.00',wr=s.m?Math.round(s.w/s.m*100):0;
if(tab==='overview')B.innerHTML=`<div class="pf-box"><div class="pf-h">RANKED · SEASON 1</div><div class="pf-rank"><div style="font-size:46px;color:#cd7f32">◆</div><div><b style="color:#cd7f32">BRONZE</b><div style="color:#94a3b8;font-size:15px">CLASH SQUAD · 4v4</div></div></div></div>
<div class="pf-box"><div class="pf-h">CAREER</div><div class="pf-grid"><div><b>${s.m}</b><span>MATCHES</span></div><div><b>${s.w}</b><span>WINS</span></div><div><b>${s.k}</b><span>KILLS</span></div><div><b>${wr}%</b><span>WIN RATE</span></div></div></div>
<div class="pf-box"><div class="pf-h">CHARACTER</div><div style="font-size:19px;font-weight:700">${H?H.e+' '+H.n.toUpperCase():'-'} <span style="color:#facc15;font-size:14px">${H?H.p:''}</span></div></div>
<div class="pf-box"><div class="pf-h">BIO</div><textarea class="pf-bio" id="pf-bio" maxlength="60" placeholder="Unna pathi ezhudhu..."></textarea></div>`,$('pf-bio').value=localStorage.getItem('ooru-bio')||'',$('pf-bio').oninput=e=>localStorage.setItem('ooru-bio',e.target.value);
else if(tab==='stats')B.innerHTML=`<div class="pf-box"><div class="pf-h">LIFETIME STATS</div><div class="pf-grid"><div><b>${s.m}</b><span>MATCHES</span></div><div><b>${s.w}</b><span>WINS</span></div><div><b>${s.m-s.w}</b><span>LOSSES</span></div><div><b>${s.k}</b><span>KILLS</span></div><div><b>${kd}</b><span>K/D</span></div><div><b>${wr}%</b><span>WIN %</span></div><div><b>${s.m?(s.k/s.m).toFixed(1):'0.0'}</b><span>KILLS/MATCH</span></div><div><b>1</b><span>LEVEL</span></div></div></div>`;
else if(tab==='history'){const h=LS('ooru-history',[]);B.innerHTML=`<div class="pf-box"><div class="pf-h">RECENT MATCHES</div>${h.length?h.map(x=>`<div class="pf-row"><span class="${x.win?'pf-w':'pf-l'}">${x.win?'VICTORY':x.q?'LEFT':'DEFEAT'}</span><span>${x.k} kills</span><span style="color:#94a3b8">${new Date(x.t).toLocaleDateString()}</span></div>`).join(''):'<div style="color:#94a3b8;padding:10px 0">Innum match aadala. Modhal match aadunga!</div>'}</div>`}
else if(tab==='custom'){const ca=avSel(),cb=bnHas()?+localStorage.getItem('ooru-banner'):-1;
B.innerHTML=`<div class="pf-box"><div class="pf-h">AVATAR</div><div class="pf-pick">${AV.map(a=>`<button type="button" data-a="${a}" class="${a===ca?'on':''}">${a}</button>`).join('')}</div><button type="button" class="pf-pick-def" data-a="">USE CHARACTER ICON (DEFAULT)</button></div><div class="pf-box"><div class="pf-h">BANNER</div><div class="pf-pick bn">${BN.map((b,i)=>`<button type="button" data-b="${i}" class="${i===cb?'on':''}" style="background:${b[1]}">${b[0]}</button>`).join('')}</div></div>`;
B.onclick=e=>{const a=e.target.closest('[data-a]'),b=e.target.closest('[data-b]');if(a){a.dataset.a?localStorage.setItem('ooru-avatar',a.dataset.a):localStorage.removeItem('ooru-avatar')}if(b)localStorage.setItem('ooru-banner',b.dataset.b);if(a||b)fill()}}
else B.innerHTML=`<div class="pf-box"><div class="pf-h">HONOR SCORE</div><div class="pf-rank"><b style="color:#22c55e">100</b><div style="color:#94a3b8">Fair play = high score. Cheat / quit panna kuraiyum.</div></div><div class="pf-xp" style="height:12px"><i style="width:100%"></i></div></div>`}
function fill(){
const ui=window.ui||{},H=ui.heroes&&ui.heroes[ui.hero],id=localStorage.getItem('ooru-fid')||'';
$('pf-av').textContent=avSel()||(H?H.e:'🥊');$('pf-nm').textContent=ui.playerName||($('lobby-player-name')||{}).textContent||'PLAYER';
$('pf-id').textContent='ID: '+id+'  ⧉';$('pf-rk').innerHTML='<span style="color:#cd7f32">◆ BRONZE</span>';
$('pf-c').textContent='🪙 '+(($('lobby-coins')||{}).textContent||0);$('pf-d').textContent='💎 '+(($('lobby-diamonds')||{}).textContent||0);body();applyLook()}
const open=()=>{fill();root.classList.add('on');document.body.classList.add('pf-open')};
const close=()=>{root.classList.remove('on');document.body.classList.remove('pf-open')};
root.querySelector('.pf-back').onclick=close;
document.addEventListener('keydown',e=>{e.key==='Escape'&&close()});
root.querySelector('.pf-tabs').onclick=e=>{const b=e.target.closest('.pf-tab');if(!b)return;tab=b.dataset.t;root.querySelectorAll('.pf-tab').forEach(x=>x.classList.toggle('on',x===b));body()};
$('pf-id').onclick=()=>{const id=localStorage.getItem('ooru-fid')||'';navigator.clipboard&&navigator.clipboard.writeText(id);const t=$('pf-id');t.textContent='COPIED ✔';setTimeout(fill,900)};
const pill=document.querySelector('.player-pill');
if(pill){pill.setAttribute('role','button');pill.title='View profile';pill.style.cursor='pointer'}
// Document-level capture listener: works even if the topbar has pointer-events:none
// or an invisible layer sits on top of the pill.
window.__openProfile=()=>open();
const lobbyOn=()=>{const l=$('screen-lobby'),u=window.ui;return !!l&&(l.classList.contains('active')||(u&&u.currentScreen==='screen-lobby'))};
const inPill=(x,y)=>{const p=document.querySelector('.player-pill');if(!p)return false;const r=p.getBoundingClientRect();return r.width>0&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom};
// only treat a modal as "covering" if it is really visible
const realPopup=el=>{const m=el&&el.closest('#pf,#ffp.on,#fr-drawer.open,[id^="modal-"],.modal,.lobby-modal,.profile-modal,.modal-backdrop');if(!m)return false;if(m.id==='pf'||m.id==='ffp'||m.id==='fr-drawer')return true;const c=getComputedStyle(m);return c.display!=='none'&&c.visibility!=='hidden'&&parseFloat(c.opacity)>0.05&&c.pointerEvents!=='none'&&(m.classList.contains('active')||m.classList.contains('open')||m.classList.contains('show')||m.classList.contains('visible'))};
const hit=e=>{
if(root.classList.contains('on')||!inPill(e.clientX,e.clientY))return;
const top=document.elementFromPoint(e.clientX,e.clientY);
console.log('[profile] pill click | lobbyOn:',lobbyOn(),'| top element:',top&&(top.tagName+'#'+top.id+'.'+top.className));
if(!lobbyOn()||realPopup(top))return;
open()};
document.addEventListener('click',hit,true);
document.addEventListener('pointerup',hit,true);
})();
