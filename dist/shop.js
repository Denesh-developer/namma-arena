// Free Fire style armory shop: category tabs on top, weapon list left, big detail + BUY on right.
// Original .shop-item / .btn-buy stay in the DOM (hidden) so all buy/equip logic keeps working.
(function(){
const $=i=>document.getElementById(i);
const shop=$('modal-shop');if(!shop)return;
const W={desert_eagle:[54,1,.35,7,1.5,120],m1887:[24,8,.22,2,1.8,45],mp40:[22,1,.085,30,2,75],ak47:[38,1,.13,30,2.2,150],awm:[150,1,1.3,5,2.6,300]};
const bars=w=>[['DAMAGE',Math.min(100,100*Math.sqrt(w[0]*w[1]/192)),w[0]*w[1]],['RANGE',100*w[5]/300,w[5]+'m'],['FIRE RATE',Math.min(100,100*.085/w[2]),Math.round(60/w[2])+'/min'],['MAGAZINE',Math.min(100,100*w[3]/30),w[3]],['RELOAD',Math.min(100,100*1.5/w[4]),w[4]+'s']];
const NAMES=['PISTOL','SMG / SHOTGUN','RIFLE / SNIPER','GEAR'];
const cats=[...shop.querySelectorAll('.shop-category')];
const body=shop.querySelector('.shop-body');if(!body)return;
const items=[...shop.querySelectorAll('.shop-item')].map(el=>{const ci=cats.findIndex(c=>c.contains(el));return{el,key:el.dataset.item,cat:ci,btn:el.querySelector('.btn-buy'),name:el.querySelector('.item-name').textContent,desc:el.querySelector('.item-stat').textContent}});

// gun art: drop your own transparent PNGs in guns/<item>.png (e.g. guns/ak47.png) to override these drawings
const defs=document.createElement('div');defs.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
defs.innerHTML='<svg width="0" height="0"><defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3e8ee"/><stop offset=".45" stop-color="#7b8591"/><stop offset="1" stop-color="#2a2f37"/></linearGradient><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#59616d"/><stop offset="1" stop-color="#171a20"/></linearGradient><linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d08a46"/><stop offset="1" stop-color="#6a3a14"/></linearGradient><linearGradient id="go" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a9366"/><stop offset="1" stop-color="#3b4126"/></linearGradient></defs></svg>';
document.body.append(defs);
const S='stroke="#000a" stroke-width="1.2" stroke-linejoin="round"';
const G={
desert_eagle:`<svg class="gun" viewBox="0 0 300 110"><path ${S} fill="url(#gm)" d="M26 30H236L246 37V52H26Z"/><path ${S} fill="url(#gd)" d="M236 35H286V47H236Z"/><path ${S} fill="url(#gm)" d="M30 52H170V60L140 64H56L40 58Z"/><path ${S} fill="url(#gd)" d="M130 60L178 58L160 106H116Z"/><path fill="none" stroke="#9aa3ad" stroke-width="3" d="M96 62Q98 80 120 80"/><path ${S} fill="#111" d="M44 30H60V25H44Z"/><path stroke="#0008" stroke-width="2" d="M70 30V52M82 30V52M94 30V52M106 30V52"/></svg>`,
mp40:`<svg class="gun" viewBox="0 0 300 110"><path ${S} fill="url(#gm)" d="M62 38H206V58H62Z"/><path ${S} fill="url(#gd)" d="M206 43H274V54H206Z"/><path ${S} fill="url(#gd)" d="M274 40H292V57H274Z"/><path ${S} fill="url(#gd)" d="M118 58H138V108H118Z"/><path ${S} fill="url(#gd)" d="M76 58L98 58L104 90L84 92Z"/><path fill="none" stroke="#9aa3ad" stroke-width="4" d="M62 44H18V76L62 66"/><path ${S} fill="url(#gm)" d="M214 30H224V43H214Z"/><path stroke="#0008" stroke-width="2" d="M90 38V58M104 38V58M170 38V58M184 38V58"/></svg>`,
m1887:`<svg class="gun" viewBox="0 0 300 110"><path ${S} fill="url(#gw)" d="M4 58L62 46V68L18 92L4 82Z"/><path ${S} fill="url(#gm)" d="M62 38H138V64H62Z"/><path ${S} fill="url(#gm)" d="M138 40H292V47H138Z"/><path ${S} fill="url(#gm)" d="M138 52H262V58H138Z"/><path ${S} fill="url(#gw)" d="M158 50H232V62H158Z"/><path fill="none" stroke="#9aa3ad" stroke-width="4" d="M92 64Q92 90 116 88Q130 86 130 64"/><path ${S} fill="#111" d="M286 36H292V40H286Z"/></svg>`,
ak47:`<svg class="gun" viewBox="0 0 300 110"><path ${S} fill="url(#gw)" d="M4 46L58 42L76 52V68L20 80L4 70Z"/><path ${S} fill="url(#gd)" d="M76 42H156V62H76Z"/><path ${S} fill="url(#gm)" d="M76 38H170V44H76Z"/><path ${S} fill="url(#gw)" d="M156 48H220V64H156Z"/><path ${S} fill="url(#gm)" d="M170 40H230V46H170Z"/><path ${S} fill="url(#gm)" d="M220 51H288V57H220Z"/><path ${S} fill="url(#gd)" d="M288 48H298V60H288Z"/><path ${S} fill="url(#gm)" d="M262 42H268V51H262Z"/><path ${S} fill="url(#gd)" d="M104 62L136 62L152 100L124 106Z"/><path ${S} fill="url(#gw)" d="M82 62L100 62L106 94L88 96Z"/><path fill="none" stroke="#9aa3ad" stroke-width="3" d="M108 62Q112 76 130 74"/></svg>`,
awm:`<svg class="gun" viewBox="0 0 300 110"><path ${S} fill="url(#go)" d="M4 52L62 46V70L22 94L4 86Z"/><path ${S} fill="url(#gd)" d="M62 44H146V66H62Z"/><path ${S} fill="url(#gm)" d="M146 52H288V58H146Z"/><path ${S} fill="url(#gd)" d="M286 48H298V62H286Z"/><path ${S} fill="url(#gd)" d="M82 22H178V34H82Z"/><path ${S} fill="#5aa9ff" d="M78 24H84V32H78ZM176 24H182V32H176Z"/><path ${S} fill="url(#gm)" d="M98 34H106V44H98ZM156 34H164V44H156Z"/><path ${S} fill="url(#gd)" d="M96 66H118V84H96Z"/><path stroke="#9aa3ad" stroke-width="3" d="M200 58L190 84M214 58L226 84"/><path fill="none" stroke="#9aa3ad" stroke-width="3" d="M70 66Q70 86 90 86"/></svg>`
};
const pic=(it)=>G[it.key]?'<img class="gimg" alt="" src="guns/'+it.key+'.png" onerror="this.outerHTML=window.__gunArt[\''+it.key+'\']">':it.el.querySelector('.item-pic').innerHTML;
window.__gunArt=G;
const ff=document.createElement('div');ff.className='ff-shop';
ff.innerHTML='<div class="ff-tabs">'+cats.map((c,i)=>'<button type="button" class="ff-tab'+(i?'':' on')+'" data-c="'+i+'">'+(NAMES[i]||'ITEMS')+'</button>').join('')+'</div>'
 +'<div class="ff-main"><div class="ff-list"></div><div class="ff-detail"><div class="ff-dtag"></div><div class="ff-dname"></div><div class="ff-dpic"></div><div class="ff-dstats"></div><div class="ff-ddesc"></div><button type="button" class="ff-buy"></button></div></div>';
body.before(ff);
const list=ff.querySelector('.ff-list'),det=ff.querySelector('.ff-detail'),buy=ff.querySelector('.ff-buy');
let curCat=0,sel=items.find(i=>i.cat===0)||items[0];
const render=()=>{
 list.innerHTML='';
 items.filter(i=>i.cat===curCat).forEach(i=>{const r=document.createElement('div');r.className='ff-row'+(i===sel?' on':'')+(i.btn.classList.contains('owned')?' owned':'')+(i.btn.classList.contains('disabled')?' poor':'');
  r.innerHTML='<div class="ff-ric">'+pic(i)+'</div><div class="ff-rn">'+i.name+'</div><div class="ff-rp">'+i.btn.textContent+'</div>';
  r.onclick=()=>{sel=i;render()};list.append(r)});
 if(!sel||sel.cat!==curCat)sel=items.find(i=>i.cat===curCat);
 if(!sel)return;
 det.querySelector('.ff-dtag').textContent=NAMES[sel.cat]||'';
 det.querySelector('.ff-dname').textContent=sel.name;
 det.querySelector('.ff-dpic').innerHTML=pic(sel);
 const w=W[sel.key];
 det.querySelector('.ff-dstats').innerHTML=w?bars(w).map(([k,v,t])=>'<div class="ff-st"><span>'+k+'</span><i><b style="width:'+Math.round(v)+'%"></b></i><u>'+t+'</u></div>').join(''):'';
 det.querySelector('.ff-ddesc').textContent=sel.desc;
 buy.textContent=sel.btn.textContent;
 buy.className='ff-buy'+(sel.btn.classList.contains('owned')?' owned':'')+(sel.btn.classList.contains('disabled')?' poor':'');
};
ff.querySelector('.ff-tabs').onclick=e=>{const b=e.target.closest('.ff-tab');if(!b)return;curCat=+b.dataset.c;sel=items.find(i=>i.cat===curCat);ff.querySelectorAll('.ff-tab').forEach(x=>x.classList.toggle('on',x===b));render()};
buy.onclick=()=>{if(sel){sel.btn.click();setTimeout(render,30)}};
let last='';
setInterval(()=>{const sig=items.map(i=>i.btn.textContent+i.btn.className+(i.el.querySelector('.item-pic').innerHTML.length)).join('|')+curCat+(sel&&sel.key);if(sig!==last){last=sig;render()}},200);
render();
})();
