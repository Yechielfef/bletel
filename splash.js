
(function(){
 if(sessionStorage.getItem('blSplash'))return; sessionStorage.setItem('blSplash','1');
 var t0=Date.now(),st=document.createElement('style'); var pre=document.createElement('style');pre.textContent='html.bls,html.bls body{background:#fff!important}html.bls body>*:not(#blsplash){visibility:hidden!important}'; document.documentElement.classList.add('bls');(document.head||document.documentElement).appendChild(pre);
 st.textContent='#blsplash{position:fixed;inset:0;z-index:99999;background:#fff;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease}#blsplash b{position:relative;display:block;width:min(240px,55vw);aspect-ratio:3223/1085}#blsplash i{position:absolute;inset:0;-webkit-mask:url(/img/logo-light.svg) center/contain no-repeat;mask:url(/img/logo-light.svg) center/contain no-repeat;}#blsplash.out{opacity:0;pointer-events:none}#blsplash.out{transition:opacity .9s cubic-bezier(.4,0,.2,1) .3s}#blsplash.out b{transform:scale(5);opacity:0;transition:transform 1.2s cubic-bezier(.45,0,.2,1),opacity .9s ease .3s}#blsplash b{will-change:transform,opacity}#blsplash i:first-child{background:linear-gradient(110deg,#021f42 0%,#0d3f78 55%,#1f64ad 100%)}#blsplash i:last-child{background:linear-gradient(100deg,transparent 30%,rgba(120,185,240,.85) 50%,transparent 70%) no-repeat;background-size:250% 100%;animation:blS 1.3s ease-in-out infinite}@keyframes blS{0%{background-position:120% 0}100%{background-position:-20% 0}}';
 function add(){(document.head||document.documentElement).appendChild(st);var d=document.createElement('div');d.id='blsplash';d.innerHTML='<b><i></i><i></i></b>';(document.body||document.documentElement).appendChild(d);
  var gone=0;function out(){if(gone)return;gone=1;document.documentElement.classList.remove('bls');d.classList.add('out');window.__blOut=1;try{window.dispatchEvent(new Event('blsplashout'))}catch(e){}setTimeout(function(){d.remove()},1300)}
  function done(){setTimeout(out,Math.max(0,1500-(Date.now()-t0)))}
  if(document.readyState==='complete')done();else window.addEventListener('load',done);
  setTimeout(out,4000);}
 setTimeout(function(){document.documentElement.classList.remove('bls')},4500);
 add();
})();
