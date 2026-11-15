// Wallet + store popup. Coins/diamonds live in localStorage ('ooru-wallet') and are mirrored to the lobby pills.
(function(){
const $=i=>document.getElementById(i);
const KEY='ooru-wallet';
const rd=()=>{try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&typeof v.c==='number'&&typeof v.d==='number')return v}catch(e){}return{c:8500,d:150}};
const sync=()=>{const w=rd(),a=$('lobby-coins'),b=$('lobby-diamonds');
 const x=w.c.toLocaleString('en-US'),y=w.d.toLocaleString('en-US');
 if(a&&a.textContent!==x)a.textContent=x;if(b&&b.textContent!==y)b.textContent=y};
const W=window.__wallet={get:rd,
 spend(k,n){const w=rd();if(w[k]<n)return false;w[k]-=n;localStorage.setItem(KEY,JSON.stringify(w));sync();return true},
 add(k,n){const w=rd();w[k]+=n;localStorage.setItem(KEY,JSON.stringify(w));sync()}};
setInterval(sync,500);sync();

const toast=window.__toast=t=>{const d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;border:1px solid #94a3b8;border-radius:8px;padding:10px 18px;font:700 16px var(--hud-font);z-index:99999';document.body.append(d);setTimeout(()=>d.remove(),2200)};

const PK={coin:{i:'🪙',p:[[1000,'₹19'],[5000,'₹79'],[12000,'₹149'],[30000,'₹349'],[70000,'₹699'],[160000,'₹1299']]},
 dia:{i:'💎',p:[[100,'₹80'],[310,'₹240'],[520,'₹400'],[1060,'₹800'],[2180,'₹1600'],[5600,'₹4000']]},
 ex:{p:[[10,1000],[50,5500],[100,12000]]}};
const root=document.createElement('div');root.id='store';
root.innerHTML='<div class="store-box"><div class="store-top"><span class="store-h">STORE</span><button class="store-x" type="button">✕</button></div><div class="store-tabs"><button class="store-tab" data-k="coin" type="button">🪙 COINS</button><button class="store-tab" data-k="dia" type="button">💎 DIAMONDS</button><button class="store-tab" data-k="ex" type="button">⇄ EXCHANGE</button></div><div class="store-grid"></div></div>';
document.body.append(root);
let k='coin';
function draw(){root.querySelectorAll('.store-tab').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
 const g=root.querySelector('.store-grid');
 if(k==='ex')g.innerHTML=PK.ex.p.map((p,i)=>`<div class="store-card"><div class="ic">💎→🪙</div><div class="store-amt">${p[0]} → ${p[1].toLocaleString()}</div><button class="store-buy" data-x="${i}" type="button">EXCHANGE</button></div>`).join('');
 else g.innerHTML=PK[k].p.map(p=>`<div class="store-card"><div class="ic">${PK[k].i}</div><div class="store-amt">${p[0].toLocaleString()}</div><button class="store-buy" type="button">${p[1]}</button></div>`).join('')}
const open=window.__openStore=x=>{k=x||'coin';draw();root.classList.add('on')},close=()=>root.classList.remove('on');
root.querySelector('.store-x').onclick=close;
root.onclick=e=>{if(e.target===root)close();const t=e.target.closest('.store-tab');if(t){k=t.dataset.k;draw();return}
 const b=e.target.closest('.store-buy');if(!b)return;
 if(b.dataset.x!==undefined){const p=PK.ex.p[+b.dataset.x];if(W.spend('d',p[0])){W.add('c',p[1]);toast('Exchange aayiduchu: +'+p[1].toLocaleString()+' coins')}else toast('Diamonds madhiri illa')}
 else toast('Real payment innum varala - Exchange use pannunga')};
document.addEventListener('keydown',e=>{e.key==='Escape'&&close()});
[['.currency-pill.gold','coin'],['.currency-pill.diamond','dia']].forEach(([s,x])=>{const p=document.querySelector(s);if(!p||p.querySelector('.cur-plus'))return;
 const b=document.createElement('button');b.type='button';b.className='cur-plus';b.textContent='+';b.title='Buy';b.onclick=e=>{e.stopPropagation();open(x)};p.append(b)});
})();
