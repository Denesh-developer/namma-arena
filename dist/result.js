// Match result screen: வெற்றி / தோல்வி theme + animated stat count-up + sparks
(function(){
const $=i=>document.getElementById(i);
const scr=$('screen-gameover'),tt=$('gameover-title');if(!scr||!tt)return;
let timer=null;
function apply(){
  const t=tt.textContent||'';
  const lose=/defeat|lose|lost|fail|தோல்வி/i.test(t);
  scr.classList.toggle('is-lose',lose);
  const want=lose?'தோல்வி!':'வெற்றி!';if(tt.textContent!==want)tt.textContent=want;
  const sub=$('gameover-sub'),ws=lose?'தெற்குத் தெரு அணி ஊரைக் கைப்பற்றியது':'வடக்குத் தெரு அணி ஊரையே வென்றது!';
  if(sub&&sub.textContent!==ws)sub.textContent=ws;
  const lbl={KILLS:'கொலைகள்',HEADSHOTS:'ஹெட்ஷாட்',DAMAGE:'சேதம்',RATING:'மதிப்பீடு'};
  scr.querySelectorAll('.stat-lbl').forEach(l=>{const k=l.textContent.trim();if(lbl[k])l.textContent=lbl[k]});
  ['stat-kills','stat-headshots','stat-damage'].forEach((id,i)=>{
    const el=$(id);if(!el)return;const n=parseInt(el.textContent.replace(/[^\d]/g,''),10);if(isNaN(n)||n===0)return;
    const t0=performance.now()+900+i*150;el.textContent='0';
    (function tick(){const k=Math.min(1,Math.max(0,(performance.now()-t0)/1100));el.textContent=Math.round(n*k).toLocaleString('en-US');if(k<1)requestAnimationFrame(tick)})();
  });
  scr.querySelectorAll('.r-spark').forEach(x=>x.remove());
  for(let i=0;i<60;i++){const p=document.createElement('div');p.className='r-spark';
    p.style.left=Math.random()*100+'%';p.style.animationDuration=(2+Math.random()*3)+'s';p.style.animationDelay=Math.random()*2+'s';
    scr.append(p);setTimeout(()=>p.remove(),7000)}
}
new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,40)}).observe(tt,{childList:true,characterData:true,subtree:true});
})();
