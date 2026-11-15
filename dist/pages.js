const $=i=>document.getElementById(i);
const O=[["Street Black","#181818","#212121"],["Navy Classic","#1a3a8a","#111827"],["Cheyyar Red","#c62828","#212121"],["Forest Green","#2e7d32","#37474f"],["Gold Rush","#f59e0b","#1a237e"],["Cyan Tech","#00838f","#263238"],["Snow White","#f5f5f5","#37474f"],["Desert Brown","#6d4c41","#4e342e"],["Steel Blue","#1565c0","#f5f5f5"],["Night Ops","#263238","#111827"]];
// ---- outfit shop: price = [currency,'c' coins|'d' diamonds, amount]; index 0 is free ----
const PR=[null,['c',500],['c',800],['c',800],['d',100],['c',1200],['c',1000],['c',600],['c',1500],['d',200]];
const OW=()=>{try{const a=JSON.parse(localStorage.getItem('ooru-owned'));return Array.isArray(a)?a:[0]}catch(e){return[0]}};
const owned=i=>!PR[i]||OW().includes(i);
const grant=i=>{const a=OW();a.includes(i)||a.push(i);localStorage.setItem('ooru-owned',JSON.stringify(a))};
const ptxt=i=>PR[i]?(PR[i][0]==='c'?'🪙 ':'💎 ')+PR[i][1].toLocaleString():'';
const st=document.createElement('style');st.textContent=`#ffp{position:fixed;inset:0;z-index:9000;display:none;pointer-events:none;font-family:Rajdhani,sans-serif;color:#fff}
#ffp.on{display:block}.ffp-l,.ffp-r{position:absolute;top:0;bottom:0;pointer-events:auto;background:linear-gradient(180deg,rgba(10,16,30,.96),rgba(18,26,44,.96));padding:16px;overflow:auto}
.ffp-l{left:0;width:290px;border-right:1px solid #475569}.ffp-r{right:0;width:340px;border-left:1px solid #475569;display:flex;flex-direction:column;gap:10px}
.ffp-h{font:700 30px Teko,sans-serif;letter-spacing:2px;margin:6px 0 12px}.ffp-back{background:#1e293b;color:#fff;border:1px solid #64748b;border-radius:6px;padding:6px 14px;font:700 15px Rajdhani;cursor:pointer}
.ffp-i{display:flex;align-items:center;gap:10px;width:100%;margin:0 0 8px;padding:10px;background:#1e293b;color:#fff;border:2px solid transparent;border-radius:8px;font:700 17px Rajdhani;cursor:pointer;text-align:left}
.ffp-i.on{border-color:#facc15;background:#334155}.ffp-i b{font-size:26px}.ffp-dot{display:inline-block;width:18px;height:18px;border-radius:50%;border:1px solid #fff;margin-left:4px}
.ffp-n{font:700 38px Teko;letter-spacing:1px}.ffp-p{color:#facc15;font:800 16px Chakra Petch,sans-serif}.ffp-d{color:#cbd5e1;font-size:17px}
.ffp-eq{margin-top:auto;background:#facc15;color:#111;border:0;border-radius:6px;padding:14px;font:800 24px Teko;letter-spacing:2px;cursor:pointer}.ffp-eq:disabled{background:#64748b;color:#cbd5e1}
#fr-drawer{position:absolute;left:112px;top:100px;width:360px;max-height:72vh;overflow:auto;background:#101622f2;border:2px solid #475569;padding:14px;z-index:40;transform:translateX(-140%);transition:transform .25s;pointer-events:auto}#fr-drawer.open{transform:none}#screen-lobby .squad-panel{top:116px!important}.controls-guide{display:none!important}#fr-drawer .profile-input-box{height:38px;padding:0 10px}#fr-drawer .profile-input-box input{font-size:18px;width:100%}#fr-drawer .team-join-row{gap:8px;align-items:center}#fr-drawer .team-btn{padding:6px 12px;font-size:14px}#fr-list li{display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:6px}#fr-list .tl-n{flex:1;min-width:0;overflow:visible;text-overflow:clip;white-space:normal;word-break:break-word;font-size:17px;line-height:1.15}#fr-list .team-btn{flex:none;padding:4px 10px;font-size:13px}#screen-lobby .squad-panel{padding:8px!important}#screen-lobby .squad-panel .squad-slot{padding:5px 10px}#screen-lobby .squad-panel .squad-slots{gap:5px;margin-bottom:6px}
@media(max-width:700px){.ffp-l{width:40%}.ffp-r{top:auto;left:40%;width:auto;border-left:0;border-top:1px solid #475569}}`;document.head.append(st);
const st2=document.createElement('style');st2.textContent='.ffp-tabs{display:flex;gap:6px;margin:10px 0 0}.ffp-tabs button{flex:1;padding:8px 4px;background:#1e293b;color:#cbd5e1;border:0;border-bottom:3px solid transparent;font:700 15px Rajdhani;cursor:pointer}.ffp-tabs button.on{background:#334155;color:#fff;border-bottom-color:#facc15}.ffp-gbar{height:34px;width:100%;border:2px solid #fff3;margin:8px 0}';document.head.append(st2);
const root=document.createElement('div');root.id='ffp';root.innerHTML='<div class="ffp-l"><button class="ffp-back">← BACK</button><div class="ffp-tabs"></div><div class="ffp-h"></div><div class="ffp-list"></div></div><div class="ffp-r"></div>';document.body.append(root);

// ---- 8-digit User ID (always local, Firebase just registers it) ----
const nid=()=>String(1e7+Math.floor(Math.random()*9e7));
let uid8=localStorage.getItem('ooru-fid');if(!/^\d{8}$/.test(uid8||'')){uid8=nid();localStorage.setItem('ooru-fid',uid8)}
const badge=document.createElement('div');badge.className='player-level';badge.id='uid-line';badge.style.cursor='pointer';badge.title='Tap to copy';
document.querySelector('.player-info')?.append(badge);
const srow=document.createElement('div');srow.className='set-row';srow.innerHTML='<span class="set-name">User ID</span><span id="set-uid" class="set-val" style="cursor:pointer"></span>';
document.querySelector('#modal-settings .set-row')?.before(srow);
window.__setUid=id=>{uid8=id;localStorage.setItem('ooru-fid',id);badge.textContent='ID: '+id;const s=$('set-uid');s&&(s.textContent=id);const f=$('fr-me');if(f&&!window.__fbOn)f.textContent='Un User ID: '+id+' (Firebase connect aagala)'};
const cp=()=>{navigator.clipboard&&navigator.clipboard.writeText(uid8);const f=$('fr-me');f&&(f.dataset.c=1)};
badge.onclick=cp;$('set-uid').onclick=cp;window.__setUid(uid8);
let cfg=null,sel=null;
let armed=null;
const info=()=>{const lk=cfg.locked&&cfg.locked(sel);root.querySelector('.ffp-r').innerHTML=cfg.info(sel)+(lk?`<button class="ffp-eq">${armed===sel?'TAP AGAIN TO CONFIRM':'BUY · '+cfg.price(sel)}</button>`:`<button class="ffp-eq" ${cfg.eqd(sel)?'disabled':''}>${cfg.eqd(sel)?'EQUIPPED':'EQUIP'}</button>`);
root.querySelector('.ffp-eq').onclick=lk?()=>{if(armed!==sel){armed=sel;info();setTimeout(()=>{if(armed===sel){armed=null;info()}},3000);return}armed=null;cfg.buy(sel);info();draw()}:()=>{cfg.equip(sel);info();draw()}};
const draw=()=>{const L=root.querySelector('.ffp-list');L.replaceChildren(...cfg.items.map(id=>{const b=document.createElement('button');b.className='ffp-i'+(id===sel?' on':'');b.innerHTML=cfg.row(id);b.onclick=()=>{sel=id;cfg.preview(id);draw();info()};return b}))};
const close=()=>{root.classList.remove('on')};
root.querySelector('.ffp-back').onclick=()=>{cfg.cancel();close()};
function show(c){cfg=c;sel=c.cur();root.querySelector('.ffp-h').textContent=c.title;
const T=root.querySelector('.ffp-tabs');T.innerHTML=c.tab?[['outfit','OUTFITS'],['gun','GUN SKINS']].map(t=>`<button type="button" data-v="${t[0]}" class="${t[0]===c.tab?'on':''}">${t[1]}</button>`).join(''):'';
T.onclick=e=>{const b=e.target.closest('[data-v]');if(!b||b.dataset.v===cfg.tab)return;cfg.cancel();window.__vault(b.dataset.v)};root.classList.add('on');draw();info()}
const w=setInterval(()=>{if(window.ui&&window.ui.lsScr&&window.__r){clearInterval(w);init(window.ui)}},200);
function init(ui){
const reset=()=>{ui.clearTint();ui.lobbyStudio&&ui.lobbyStudio.loadCharacter(ui.hero);window.player&&window.player.applyHero(ui.hero)};
let eqO=+(localStorage.getItem('ooru-outfit')??-1);if(eqO>0)grant(eqO);const applyO=i=>{if(i<0)return;ui.applyLook('cloth',O[i][1]);ui.applyLook('pants',O[i][2])};
let eqH=ui.hero;
// ---- gun skins: [name, color-gradient, currency, price] ----
const GS=[['Default','linear-gradient(90deg,#475569,#94a3b8)',null,0],['Forest Camo','linear-gradient(90deg,#14532d,#4d7c0f,#166534)','c',600],['Desert Camo','linear-gradient(90deg,#92400e,#d6b370,#78350f)','c',700],['Cheyyar Red','linear-gradient(90deg,#7f1d1d,#ef4444)','c',900],['Black Ops','linear-gradient(90deg,#020617,#334155,#020617)','c',1000],['Neon Cyan','linear-gradient(90deg,#0e7490,#22d3ee,#6366f1)','c',1500],['Gold Plated','linear-gradient(90deg,#b45309,#fde047,#b45309)','d',120],['Dragon Fire','linear-gradient(90deg,#7f1d1d,#f97316,#facc15)','d',250]];
const GOW=()=>{try{const a=JSON.parse(localStorage.getItem('ooru-gunowned'));return Array.isArray(a)?a:[0]}catch(e){return[0]}};
const gown=i=>!GS[i][2]||GOW().includes(i);
const ggrant=i=>{const a=GOW();a.includes(i)||a.push(i);localStorage.setItem('ooru-gunowned',JSON.stringify(a))};
const gtxt=i=>GS[i][2]?(GS[i][2]==='c'?'🪙 ':'💎 ')+GS[i][3].toLocaleString():'';
let eqG=+(localStorage.getItem('ooru-gunskin')||0);if(!GS[eqG]||!gown(eqG))eqG=0;
// other code (weapon renderer) can read window.__gunSkin or listen to the 'gunskin' event
const applyG=i=>{window.__gunSkin={i,name:GS[i][0],color:GS[i][1]};document.dispatchEvent(new CustomEvent('gunskin',{detail:window.__gunSkin}))};applyG(eqG);
const gunCfg={tab:'gun',title:'VAULT · GUN SKINS',items:GS.map((_,i)=>i),cur:()=>eqG,
row:i=>`<span>${GS[i][0]}</span><span style="margin-left:auto;display:flex;align-items:center">${gown(i)?'':'<span style="color:#facc15;font-size:15px;margin-right:6px">🔒 '+gtxt(i)+'</span>'}<i class="ffp-dot" style="width:46px;border-radius:4px;background:${GS[i][1]}"></i></span>`,
preview:i=>{window.__gunSkin={i,name:GS[i][0],color:GS[i][1]}},eqd:i=>i===eqG,locked:i=>!gown(i),price:i=>gtxt(i),
info:i=>`<div style="font-size:70px">🔫</div><div class="ffp-n">${GS[i][0].toUpperCase()}</div><div class="ffp-p">GUN SKIN${gown(i)?' · OWNED':' · 🔒 '+gtxt(i)}</div><div class="ffp-gbar" style="background:${GS[i][1]}"></div><div class="ffp-d">Equip pannina match-la gun-ku idhe skin.</div>`,
equip:i=>{eqG=i;localStorage.setItem('ooru-gunskin',i);applyG(i)},
buy:i=>{const k=GS[i][2];if(window.__wallet&&window.__wallet.spend(k,GS[i][3])){ggrant(i);gunCfg.equip(i);window.__toast&&window.__toast('Vaangiyaachu! '+GS[i][0]+' equip aayiduchu')}else{window.__toast&&window.__toast((k==='c'?'Coins':'Diamonds')+' madhiri illa');window.__openStore&&window.__openStore(k==='c'?'coin':'dia')}},
cancel:()=>applyG(eqG)};
window.__vault=v=>show(v==='gun'?gunCfg:window.__oc);
$('lobby-menu').addEventListener('click',e=>{const b=e.target.closest('.lm-btn');if(!b)return;const k=b.dataset.panel;if(k!=='character'&&k!=='vault')return;e.stopImmediatePropagation();e.preventDefault();ui.togglePanel&&ui.openPanel&&ui.togglePanel(null);
if(k==='character'){eqH=ui.hero;const H=ui.heroes;show({title:'CHARACTER',items:ui.heroOrder,cur:()=>ui.hero,row:id=>`<b>${H[id].e}</b>${H[id].n.toUpperCase()}`,preview:id=>ui.selectHero(id,true),eqd:id=>id===eqH,
info:id=>`<div style="font-size:70px">${H[id].e}</div><div class="ffp-n">${H[id].n.toUpperCase()}</div><div class="ffp-p">${H[id].p}</div><div class="ffp-d">${H[id].d}</div>`,
equip:id=>{eqH=id;applyO(eqO)},cancel:()=>{if(ui.hero!==eqH){ui.selectHero(eqH,true);applyO(eqO)}}})}
else{show(window.__oc={tab:'outfit',title:'VAULT · OUTFITS',items:O.map((_,i)=>i),cur:()=>eqO,row:i=>`<span>${O[i][0]}</span><span style="margin-left:auto;display:flex;align-items:center">${owned(i)?'':'<span style="color:#facc15;font-size:15px;margin-right:6px">🔒 '+ptxt(i)+'</span>'}<i class="ffp-dot" style="background:${O[i][1]}"></i><i class="ffp-dot" style="background:${O[i][2]}"></i></span>`,preview:i=>applyO(i),eqd:i=>i===eqO,locked:i=>!owned(i),price:i=>ptxt(i),
buy:i=>{const p=PR[i],k=p[0]==='c'?'c':'d';if(window.__wallet&&window.__wallet.spend(k,p[1])){grant(i);eqO=i;localStorage.setItem('ooru-outfit',i);window.__toast&&window.__toast('Vaangiyaachu! '+O[i][0]+' equip aayiduchu')}else{window.__toast&&window.__toast((k==='c'?'Coins':'Diamonds')+' madhiri illa');window.__openStore&&window.__openStore(k==='c'?'coin':'dia')}},
info:i=>`<div class="ffp-n">${O[i][0].toUpperCase()}</div><div class="ffp-p">TOP + PANTS SET${owned(i)?' · OWNED':' · 🔒 '+ptxt(i)}</div><div style="font-size:50px"><i class="ffp-dot" style="width:46px;height:46px;background:${O[i][1]}"></i><i class="ffp-dot" style="width:46px;height:46px;background:${O[i][2]}"></i></div><div class="ffp-d">Equip pannina match-laum idhe dress.</div>`,
equip:i=>{eqO=i;localStorage.setItem('ooru-outfit',i)},cancel:()=>{reset();applyO(eqO)}})}},true);
// graphics
const G={smooth:d=>Math.min(d,1)*.75,standard:d=>Math.min(d,1.5),ultra:d=>Math.min(Math.max(d,1.5)*1.25,2.5)};
let g=localStorage.getItem('ooru-gfx');if(!G[g])g='standard';
const row=document.createElement('div');row.className='set-row set-col';row.innerHTML='<div class="set-line"><span class="set-name">Graphics</span></div><div style="display:flex;gap:8px;margin-top:6px">'+['smooth','standard','ultra'].map(k=>`<button type="button" class="team-btn" data-g="${k}" style="flex:1">${k.toUpperCase()}</button>`).join('')+'</div>';
document.querySelector('#modal-settings .profile-actions').before(row);
const ap=k=>{g=k;window.__r.setPixelRatio(G[k](window.devicePixelRatio||1));localStorage.setItem('ooru-gfx',k);row.querySelectorAll('[data-g]').forEach(b=>b.style.outline=b.dataset.g===k?'2px solid #facc15':'none')};
row.onclick=e=>{const b=e.target.closest('[data-g]');b&&ap(b.dataset.g)};ap(g);
// ---- lobby: friends drawer, team code button, solo/squad, ready/start, exit ----
const Q$=(t)=>{const d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;border:1px solid #94a3b8;border-radius:8px;padding:10px 18px;font:700 16px Rajdhani;z-index:99999';document.body.append(d);setTimeout(()=>d.remove(),2200)};
const dr=$('fr-drawer'),fb=document.querySelector('.lm-btn[data-panel="team"]');
const fd=o=>{dr.classList.toggle('open',o);fb&&fb.classList.toggle('active',o)};
$('lobby-menu').addEventListener('click',e=>{const b=e.target.closest('.lm-btn');if(!b||b.dataset.panel!=='team')return;e.stopImmediatePropagation();e.preventDefault();fd(!dr.classList.contains('open'))},true);
$('fr-close').onclick=()=>fd(false);
const lobby=ui.lsScr,panel=document.querySelector('.squad-panel'),box=document.querySelector('.lobby-action-box'),sb=$('btn-start-match');
const tb=document.createElement('button');tb.className='team-btn lobby-tc';tb.textContent='👥 TEAM CODE';tb.style.cssText='position:absolute;top:84px;right:36px;z-index:30;padding:4px 10px;font-size:12px;pointer-events:auto';
tb.onclick=()=>{mode==='solo'&&window.__setMode('squad');ui.openTeam()};lobby.append(tb);
document.querySelectorAll('.squad-slot:not(.player-slot)').forEach(s=>s.addEventListener('click',e=>{if(s.classList.contains('empty')){e.stopImmediatePropagation();e.preventDefault();fd(true)}},true));
let mode='squad';
const seg=document.createElement('div');seg.className='lobby-seg';seg.style.cssText='display:flex;gap:6px;pointer-events:auto';seg.innerHTML='<button type="button" class="team-btn" data-m="solo" style="padding:6px 18px">SOLO</button><button type="button" class="team-btn" data-m="squad" style="padding:6px 18px">SQUAD</button>';seg.style.cssText='position:absolute;top:90px;left:50%;transform:translateX(-50%);z-index:30;display:flex;gap:6px;pointer-events:auto';lobby.append(seg);
const ex=document.createElement('button');ex.type='button';ex.className='team-btn lobby-exit';ex.textContent='✖ EXIT SQUAD (GO SOLO)';ex.style.cssText='width:100%;margin-top:4px;padding:5px;display:none';panel.append(ex);
ex.onclick=()=>{ui.ready=false;window.__setMode('solo')};
window.__setMode=m=>{if(m===mode)return;mode=m;if(m==='solo'){ui.leaveParty();ui.party.code='----'}else ui.soloParty();ui.ready=false;ui.partyUI();paint()};
seg.onclick=e=>{const b=e.target.closest('[data-m]');b&&window.__setMode(b.dataset.m)};
sb.addEventListener('click',e=>{const P=ui.party,o=ui.partyOthers();if(!o.length)return;e.stopImmediatePropagation();e.preventDefault();
if(P.leader!==ui.myId){ui.ready=!ui.ready;ui.partyTouch();paint();return}
if(!o.every(m=>m.r)){Q$('Ellarum READY aaganum');return}
ui.partyPost({t:'start',code:P.code});ui.ready=false;ui.triggerMatchmaking()},true);
function paint(){const P=ui.party,o=ui.partyOthers(),L=P.leader===ui.myId,m=sb.querySelector('.btn-main-txt'),s=sb.querySelector('.btn-sub-txt');
if(!o.length){ui.ready=false;m.textContent='START MATCH';s.textContent=mode==='solo'?'SOLO':'4v4 CLASH SQUAD'}
else if(L){m.textContent='START MATCH';s.textContent=o.filter(x=>x.r).length+'/'+o.length+' READY'}
else{m.textContent=ui.ready?'READY ✔':'READY';s.textContent=ui.ready?'TAP TO CANCEL':'WAITING FOR LEADER'}
ex.style.display=mode==='squad'?'block':'none';panel.style.display=mode==='solo'?'none':'';tb.style.display=mode==='solo'?'none':'';
seg.querySelectorAll('[data-m]').forEach(b=>{b.classList.toggle('seg-on',b.dataset.m===mode)})}
const POS=[10,56,74];
const FIX=[.35,-.2,.1];let F0=null;
const base=()=>{const S=ui.lobbyStudio;if(F0===null&&S&&typeof S.rotY==='number')F0=S.rotY;return F0===null?0:F0};
base();
const mc=[0,1,2].map(i=>{const c=document.createElement('canvas');c.id='lobby-mate-'+i;c.style.cssText=`position:absolute;top:14%;height:66%;width:20%;left:${POS[i]}%;z-index:1;display:none;pointer-events:none`;const l=document.createElement('div');l.className='lm-mate';l.style.cssText=`position:absolute;top:81%;width:20%;left:${POS[i]}%;text-align:center;z-index:2;display:none;font:700 24px Teko,sans-serif;letter-spacing:1px;color:#fff;text-shadow:0 2px 6px #000;pointer-events:none`;$('lobby-char-canvas').after(c,l);return{c,l,st:null,on:false}});
function mates(){const on=ui.currentScreen==='screen-lobby'&&ui.lobbyStudio&&mode==='squad',o=ui.partyOthers();
mc.forEach((M,i)=>{const m=o[i];
if(on&&m){M.c.style.display='block';M.l.style.display='block';
if(!M.st){const S=ui.lobbyStudio.constructor,s=new S(M.c.id);if(!s.canvas)return;M.st=s;s.scene.children.forEach(c=>{c.isMesh&&(c.visible=false)});s.rotY=s.targetRotY=base()+FIX[i];setTimeout(()=>{s.loadCharacter(m.hero);s.rotY=s.targetRotY=base()+FIX[i]},700);const rs=s.resize.bind(s);s.resize=()=>{rs();s.camera.position.set(0,1.12,5.1);s.camera.lookAt(0,1.02,0)}}
M.l.textContent=m.name+(m.r?' ✔':'');
if(M.st.gender!==m.hero)M.st.loadCharacter(m.hero);
if(!M.on){M.on=true;M.st.start();setTimeout(()=>M.st.resize(),60)}}
else if(M.on||M.c.style.display!=='none'){M.on=false;M.st&&M.st.stop();M.c.style.display='none';M.l.style.display='none'}})}
// hide SOLO/SQUAD + TEAM CODE while a popup (settings / team / profile name) is really open
const popupOpen=()=>!!document.querySelector('.lobby-modal.active,.profile-modal.active,.modal-backdrop.active');
setInterval(()=>{paint();mates();document.body.classList.toggle('modal-open',popupOpen())},400);paint();
// lock rotation: no drag-rotate while in a team; teammates stay fixed
const lockRot=()=>{
mc.forEach((M,i)=>{if(M.st&&M.on){M.st.rotY=base()+FIX[i];M.st.targetRotY=base()+FIX[i];M.st.noRot=true}});
const S=ui.lobbyStudio;if(S){const t=mode==='squad'&&ui.partyOthers().length>0;if(t&&!S.noRot){S.dragVel=0;S.rotY=S.targetRotY=base()}if(!t&&S.noRot){S.dragVel=0;S.rotY=S.targetRotY=base()}S.noRot=t}
requestAnimationFrame(lockRot)};
requestAnimationFrame(lockRot);
}