(function(){
var el=document.querySelector('.hero .lede.tw');if(!el)return;
var t=el.textContent.replace(/\s+/g,' ').trim();el.textContent='';
var chars=[];
// keep "Montreal / Tosh" together; each word unbreakable
var parts=['The\u00a0Weekly\u00a0Advertising','Publication\u00a0Serving','Montreal\u00a0/\u00a0Tosh']; if(t.replace(/\s/g,'')!=='TheWeeklyAdvertisingPublicationServingMontreal/Tosh'){parts=t.split(' ');}
parts.forEach(function(w,wi){
  var g=document.createElement('span');g.className='tww';
  for(var i=0;i<w.length;i++){var s=document.createElement('span');s.className='twc';s.setAttribute('aria-hidden','true');s.textContent=w[i];g.appendChild(s);chars.push(s);}
  el.appendChild(g);
  if(wi<parts.length-1){var sp=document.createElement('span');sp.className='twc tws';sp.textContent=' ';el.appendChild(sp);chars.push(sp);}
});
var c=document.createElement('span');c.className='tw-caret';c.setAttribute('aria-hidden','true');
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){chars.forEach(function(s){s.classList.add('on')});return;}
chars[0].parentNode.insertBefore(c,chars[0]);
var k=0,STEP=40,t0=null;
function frame(ts){if(t0===null)t0=ts;var n=Math.min(chars.length,Math.floor((ts-t0)/STEP));
while(k<n){chars[k].classList.add('on');k++;}
if(k>0){var last=chars[k-1];last.parentNode.insertBefore(c,last.nextSibling);}
if(k<chars.length){requestAnimationFrame(frame);}else{c.classList.add('done');setTimeout(function(){c.classList.add('gone')},2800);}}
setTimeout(function(){requestAnimationFrame(frame)},450);
})();
