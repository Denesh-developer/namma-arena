// Per-round map variation: weather/time-of-day theme + a different cover layout each round
(function(){
let base=null,extras=[],cols=[];
const THEMES=[{n:'DAY STREET'}];
const find=(scene,fn)=>{let r=null;scene.traverse(o=>{if(!r&&fn(o))r=o});return r};
function theme(a,round){
 const sc=a.scene,hemi=find(sc,o=>o.isHemisphereLight),sun=window.__sun;
 const dome=find(sc,o=>o.geometry&&o.geometry.parameters&&o.geometry.parameters.radiusTop===320);
 const ground=find(sc,o=>o.geometry&&o.geometry.parameters&&o.geometry.parameters.width===760&&o.geometry.parameters.height===760);
 if(!base)base={bg:sc.background&&sc.background.getHex(),fog:sc.fog&&sc.fog.color.getHex(),fd:sc.fog&&sc.fog.density,
  hemi:hemi&&hemi.color.getHex(),hi:hemi&&hemi.intensity,sun:sun&&sun.color.getHex(),si:sun&&sun.intensity,
  ground:ground&&ground.material.color.getHex(),dome:0xffffff};
 const t=THEMES[(round-1)%THEMES.length],g=(k,d)=>t[k]!==undefined?t[k]:d;
 if(sc.background&&sc.background.set)sc.background.set(g('bg',base.bg));
 if(sc.fog){sc.fog.color.set(g('fog',base.fog));sc.fog.density=g('fd',base.fd)}
 if(hemi){hemi.color.set(g('hemi',base.hemi));hemi.intensity=g('hi',base.hi)}
 if(sun){sun.color.set(g('sun',base.sun));sun.intensity=g('si',base.si)}
 if(ground)ground.material.color.set(g('ground',base.ground));
 if(dome&&dome.material&&dome.material.color)dome.material.color.set(g('dome',base.dome));
 return t.n;
}
function clearExtras(a){extras.forEach(m=>{a.scene.remove(m);m.geometry&&m.geometry.dispose&&m.geometry.dispose()});
 cols.forEach(c=>{const i=a.colliders.indexOf(c);i>-1&&a.colliders.splice(i,1)});extras=[];cols=[]}
function layout(a,round){
 clearExtras(a);if(round<=1)return;
 const T=window.__T;if(!T)return;
 let sd=round*7919+13;const R=()=>(sd=sd*16807%2147483647)/2147483647;
 const box=(w,h,d,c,x,z,y0=0)=>{const m=new T.Mesh(new T.Box(w,h,d),new T.Mat({color:c,roughness:.8}));m.position.set(x,y0+h/2,z);m.castShadow=true;m.receiveShadow=true;a.scene.add(m);extras.push(m);cols.push(a.addCollider(m,x,y0+h/2,z,w,h,d))};
 const PAL=[0xb91c1c,0x1d4ed8,0x15803d,0xca8a04,0x7c3aed,0xea580c];
 const kind=['','yard','sandbag','crates','yard','sandbag','crates'][round-1]||'crates';
 if(kind==='yard'){
  for(let z=-140;z<=140;z+=20){if(Math.abs(z)<36)continue;
   [-1,1].forEach(sd2=>{const x=sd2*(18+R()*24),long=R()<.5,w=long?6:2.6,d=long?2.6:6,c=PAL[Math.floor(R()*PAL.length)];
    box(w,2.6,d,c,x,z+R()*8-4);if(R()<.35)box(w,2.6,d,PAL[Math.floor(R()*PAL.length)],x,z+R()*8-4,2.6)})}
 }else if(kind==='sandbag'){
  for(let z=-136;z<=136;z+=26){if(Math.abs(z)<36)continue;
   const o=R()*6-3;box(8,1.3,.9,0xc2a878,-8+o,z);box(8,1.3,.9,0xc2a878,8+o,z);
   if(R()<.7)box(7,1.3,.9,0xc2a878,(R()<.5?-1:1)*(22+R()*10),z+R()*6)}
 }else{
  for(let i=0;i<34;i++){const x=(R()-.5)*72,z=(R()-.5)*280;if(Math.abs(z)<36||Math.abs(x)<7)continue;
   const w=1.8+R()*1.2,h=1.6+R()*.8,c=[0x9c6b3a,0x8a5a2b,0xa87c4a][Math.floor(R()*3)];box(w,h,w,c,x,z);
   if(R()<.4)box(w*.8,h*.8,w*.8,c,x+.2,z,h)}
 }
}
let ban=null,tm=0;
function banner(r,name){if(!ban){ban=document.createElement('div');ban.style.cssText='position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:60;padding:10px 34px;background:rgba(8,13,26,.72);border-top:2px solid #ffb133;border-bottom:2px solid #ffb133;color:#fff;font:700 30px var(--hud-title,Teko,sans-serif);letter-spacing:.2em;text-align:center;pointer-events:none;transition:opacity .6s;opacity:0';document.body.append(ban)}
 ban.innerHTML='<div style="font-size:13px;color:#ffb133;letter-spacing:.35em">ROUND '+r+'</div>'+name;ban.style.opacity='1';clearTimeout(tm);tm=setTimeout(()=>ban.style.opacity='0',3200)}
window.__roundMap=function(a,round){const n=theme(a,round);layout(a,round);banner(round,n)};
})();
