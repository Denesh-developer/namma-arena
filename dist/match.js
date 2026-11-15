// Match-time UI: matchmaking text, shop icons + buy timer, in-match menu (leave match)
(function(){
const $=i=>document.getElementById(i);
const vis=el=>{if(!el)return false;const c=getComputedStyle(el);return c.display!=='none'&&c.visibility!=='hidden'&&parseFloat(c.opacity)>0.05};

// 1) matchmaking -> Free Fire style MATCHING screen
const mm=$('screen-matchmaking');
if(mm){
 const BL=['YOU','KAI','SOFIA','VIKTOR'],RD=['RYKER','DANTE','JAX','BRUNO'];
 const TIPS=['TIP: Buy phase la Gloo Wall vaangi vechukko','TIP: Headshot = extra damage','TIP: Armor vaangita 50% damage kammi','TIP: Team-oda cover eduthu push pannu'];
 const slot=(t,i)=>'<div class="ffm-slot '+t+'" data-s="'+t+i+'"><div class="ffm-av"><span>?</span></div><div class="ffm-nm">SEARCHING</div></div>';
 const ff=document.createElement('div');ff.className='ffm';
 ff.innerHTML='<div class="ffm-bg"></div>'
 +'<div class="ffm-top"><span class="ffm-mode">CLASH SQUAD</span><span class="ffm-sep">|</span><span>4 VS 4</span></div>'
 +'<div class="ffm-ring"><i></i><b>⚔</b></div>'
 +'<div class="ffm-title">MATCHING<em>...</em></div>'
 +'<div class="ffm-sub">NAMMA OORU ARENA</div>'
 +'<div class="ffm-teams"><div class="ffm-team blue">'+BL.map((_,i)=>slot('blue',i)).join('')+'</div><div class="ffm-vs">VS</div><div class="ffm-team red">'+RD.map((_,i)=>slot('red',i)).join('')+'</div></div>'
 +'<div class="ffm-barwrap"><div class="ffm-bar"><span id="ffm-fill"></span></div><div class="ffm-info"><span id="ffm-cnt">0 / 8 PLAYERS</span><span id="ffm-time">00:00</span></div></div>'
 +'<div class="ffm-tip" id="ffm-tip"></div>';
 mm.append(ff);
 let iv=null,t0=0,n=0,tipI=0;
 const reset=()=>{n=0;ff.querySelectorAll('.ffm-slot').forEach(s=>{s.classList.remove('on');s.querySelector('span').textContent='?';s.querySelector('.ffm-nm').textContent='SEARCHING'});$('ffm-fill').style.width='0%';$('ffm-cnt').textContent='0 / 8 PLAYERS'};
 const fill=()=>{ if(n<8){const t=n%2?'red':'blue',i=n>>1,nm=t==='blue'?BL[i]:RD[i],el=ff.querySelector('[data-s="'+t+i+'"]');
   const real=(t==='blue'&&i===0&&window.ui&&window.ui.playerName)?String(window.ui.playerName).toUpperCase().slice(0,10):nm;
   el.classList.add('on');el.querySelector('span').textContent=real.charAt(0);el.querySelector('.ffm-nm').textContent=real;n++;
   $('ffm-fill').style.width=(n/8*100)+'%';$('ffm-cnt').textContent=n+' / 8 PLAYERS'}};
 const tick=()=>{const s=Math.floor((Date.now()-t0)/1000);$('ffm-time').textContent='00:'+String(s%60).padStart(2,'0')};
 const start=()=>{if(iv)return;reset();t0=Date.now();iv=setInterval(()=>{tick();if(Date.now()-t0>400*(n+1)+300)fill();if(Date.now()%2500<250){$('ffm-tip').textContent=TIPS[tipI++%TIPS.length]}},250);$('ffm-tip').textContent=TIPS[0]};
 const stop=()=>{clearInterval(iv);iv=null};
 new MutationObserver(()=>{mm.classList.contains('active')?start():stop()}).observe(mm,{attributes:true,attributeFilter:['class']});
 if(mm.classList.contains('active'))start();
}

// 2) shop: weapon icons instead of emoji
const I={
 desert_eagle:'<svg viewBox="0 0 120 48"><path d="M6 11h80v12H60l-5 22H41l4-22H20l-3 5H9z"/></svg>',
 mp40:'<svg viewBox="0 0 120 48"><path d="M4 17h70l6 4h18v7H80l-4 3H52v17h-8V31H30l-6 8H12l4-12H4z"/></svg>',
 m1887:'<svg viewBox="0 0 120 48"><path d="M4 16h86v6H4zM4 24h80v6H4zM84 22h14l16 14v6h-14l-8-8h-8z"/></svg>',
 ak47:'<svg viewBox="0 0 120 48"><path d="M2 20h18l4-4h46v5h30l6-3 8 3v6h-10l-8 12H92l4-12H60l-6 14h-8l4-14H24l-6 8H8z"/></svg>',
 awm:'<svg viewBox="0 0 120 48"><path d="M2 23h70v4H2zM70 20h30l16 8v6H98l-6 8H84l2-8H70zM40 12h26v6H40zM48 18h3v5h-3z"/></svg>',
 vest:'<svg viewBox="0 0 120 48"><path d="M44 4L30 10l3 12v22h54V22l3-12L76 4 60 12z"/></svg>',
 gloo:'<svg viewBox="0 0 120 48"><path d="M60 3l22 7v14c0 12-9 19-22 22C47 43 38 36 38 24V10z"/></svg>',
 medkit:'<svg viewBox="0 0 120 48"><path fill-rule="evenodd" d="M34 10h52a4 4 0 0 1 4 4v28H30V14a4 4 0 0 1 4-4zM52 4h16v6H52zM57 20h6v6h6v6h-6v6h-6v-6h-6v-6h6z"/></svg>'};
document.querySelectorAll('#modal-shop .shop-item').forEach(it=>{const p=it.querySelector('.item-pic'),k=it.dataset.item;if(p&&I[k])p.innerHTML=I[k]});

// 3) shop: buy-phase countdown instead of READY button
const foot=document.querySelector('#modal-shop .shop-footer');
const tm=document.createElement('div');tm.className='shop-timer';tm.innerHTML='<b>BARRIERS LOWER IN <i id="st-n">0</i>s</b><div class="bar"><span id="st-b"></span></div>';foot&&foot.prepend(tm);
let mx=1;
setInterval(()=>{const shop=$('modal-shop'),bn=$('buy-phase-banner'),n=parseInt(($('buy-phase-timer')||{}).textContent,10);
 const on=vis(shop)&&vis(bn)&&n>0;tm.classList.toggle('on',on);if(!on){mx=1;return}
 if(n>mx)mx=n;$('st-n').textContent=n;$('st-b').style.width=Math.round(n/mx*100)+'%'},250);

// 4) in-match menu with LEAVE MATCH
const g=$('screen-game');
if(g){
 const b=document.createElement('button');b.id='mm-btn';b.type='button';b.title='Menu (Esc)';b.textContent='☰';g.append(b);
 const m=document.createElement('div');m.id='match-menu';
 m.innerHTML='<div class="mm-box"><h3>MATCH MENU</h3><button type="button" class="go">RESUME</button><button type="button" class="out">LEAVE MATCH</button></div>';document.body.append(m);
 const out=m.querySelector('.out');
 const open=()=>{document.exitPointerLock&&document.exitPointerLock();out.textContent='LEAVE MATCH';out.classList.remove('sure');m.classList.add('on')};
 const close=()=>m.classList.remove('on');
 b.onclick=open;m.querySelector('.go').onclick=close;m.onclick=e=>{e.target===m&&close()};
 out.onclick=()=>{if(!out.classList.contains('sure')){out.classList.add('sure');out.textContent='SURE? TAP AGAIN';return}
  close();
  if(window.ui&&window.ui.leaveMatch)window.ui.leaveMatch();else location.reload()};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&g.classList.contains('active')&&!vis($('modal-shop'))){m.classList.contains('on')?close():open()}});
}

// 5) "click to aim" hint when mouse is not locked during combat
const hint=document.createElement('div');hint.id='aim-hint';hint.textContent='CLICK TO AIM';
hint.style.cssText='position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:50;padding:8px 22px;background:rgba(8,13,26,.85);border:1px solid #facc15;color:#facc15;font:400 18px var(--hud-title);letter-spacing:.15em;display:none;pointer-events:none';
document.body.append(hint);
setInterval(()=>{const gm=window.game,gs=$('screen-game'),mn=$('match-menu');
 const on=gs&&gs.classList.contains('active')&&gm&&gm.roundState==='combat'&&!document.pointerLockElement&&!(mn&&mn.classList.contains('on'));
 hint.style.display=on?'block':'none'},300);
})();
