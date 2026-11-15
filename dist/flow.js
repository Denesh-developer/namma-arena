// Real-game style timing: splash >= 4s before login, login -> name dialog after 3s
(function(){
  var SPLASH_MS=4000, LOGIN_MS=3000, t0=performance.now();
  var $=function(i){return document.getElementById(i)};

  // small loading overlay
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99998;display:none;align-items:center;justify-content:center;flex-direction:column;gap:16px;background:rgba(8,12,22,.88);color:#fff;font:700 26px Teko,Rajdhani,sans-serif;letter-spacing:3px';
  ov.innerHTML='<div class="fl-spin" style="width:54px;height:54px;border:5px solid #475569;border-top-color:#facc15;border-radius:50%;animation:flspin .8s linear infinite"></div><div id="fl-txt">LOGGING IN...</div>';
  var st=document.createElement('style');st.textContent='@keyframes flspin{to{transform:rotate(360deg)}}';
  document.head.append(st);
  function overlay(on,txt){if(txt)ov.querySelector('#fl-txt').textContent=txt;ov.style.display=on?'flex':'none'}

  // Hold any class that gets ADDED to el for `ms`, then apply it
  function holdAdded(el,ms,opts){
    var prev=new Set(el.classList),busy=false;
    new MutationObserver(function(){
      if(busy){return}
      var added=[].filter.call(el.classList,function(c){return !prev.has(c)});
      if(!added.length){prev=new Set(el.classList);return}
      busy=true;
      added.forEach(function(c){el.classList.remove(c)});
      opts&&opts.onHold&&opts.onHold();
      setTimeout(function(){
        added.forEach(function(c){el.classList.add(c)});
        prev=new Set(el.classList);busy=false;
        opts&&opts.onDone&&opts.onDone();
      },typeof ms==='function'?ms():ms);
    }).observe(el,{attributes:true,attributeFilter:['class']});
  }

  function boot(){
    var splash=$('screen-splash'),login=$('screen-login'),prof=$('modal-profile');
    // 1) splash must stay at least SPLASH_MS before any other screen shows
    if(splash){
      var gateOpen=false,pending=null,screens=[].slice.call(document.querySelectorAll('.screen')).filter(function(s){return s!==splash});
      setTimeout(function(){
        gateOpen=true;
        if(pending){splash.classList.remove('active');pending.classList.add('active');pending=null}
      },Math.max(0,SPLASH_MS-(performance.now()-t0)));
      screens.forEach(function(s){
        new MutationObserver(function(){
          if(gateOpen||!s.classList.contains('active'))return;
          s.classList.remove('active');splash.classList.add('active');pending=s;
        }).observe(s,{attributes:true,attributeFilter:['class']});
      });
    }
    // 2) after login, name/profile dialog comes after LOGIN_MS with loader
    if(prof)holdAdded(prof,LOGIN_MS,{
      onHold:function(){overlay(true,'LOGGING IN...')},
      onDone:function(){overlay(false)}
    });
    document.body.append(ov);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
