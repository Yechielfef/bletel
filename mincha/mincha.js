
(function(){
"use strict";
var TZ="America/Toronto",LAT=45.5165,LON=-73.6075;
var EN_DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var EN_MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
var DATA=null,TAB="shul";

/* ---------- NOAA solar calculator ---------- */
function rad(d){return d*Math.PI/180}function deg(r){return r*180/Math.PI}
function jc(jd){return (jd-2451545)/36525}
function gmls(t){var l=280.46646+t*(36000.76983+0.0003032*t);return((l%360)+360)%360}
function gmas(t){return 357.52911+t*(35999.05029-0.0001537*t)}
function ecc(t){return 0.016708634-t*(0.000042037+0.0000001267*t)}
function eqc(t){var m=rad(gmas(t));return Math.sin(m)*(1.914602-t*(0.004817+0.000014*t))+Math.sin(2*m)*(0.019993-0.000101*t)+Math.sin(3*m)*0.000289}
function appLong(t){var o=125.04-1934.136*t;return gmls(t)+eqc(t)-0.00569-0.00478*Math.sin(rad(o))}
function obl(t){var s=21.448-t*(46.815+t*(0.00059-t*0.001813));var e0=23+(26+s/60)/60;var o=125.04-1934.136*t;return e0+0.00256*Math.cos(rad(o))}
function decl(t){return deg(Math.asin(Math.sin(rad(obl(t)))*Math.sin(rad(appLong(t)))))}
function eqTime(t){var e=obl(t),l0=gmls(t),ec=ecc(t),m=gmas(t),y=Math.tan(rad(e)/2);y*=y;
 var et=y*Math.sin(2*rad(l0))-2*ec*Math.sin(rad(m))+4*ec*y*Math.sin(rad(m))*Math.cos(2*rad(l0))-0.5*y*y*Math.sin(4*rad(l0))-1.25*ec*ec*Math.sin(2*rad(m));return deg(et)*4}
function ha(lat,d){var z=90.833;return Math.acos(Math.cos(rad(z))/(Math.cos(rad(lat))*Math.cos(rad(d)))-Math.tan(rad(lat))*Math.tan(rad(d)))}
function riseSetUTC(rise,jd,lat,lon){ // minutes after 0h UTC
 function one(j){var t=jc(j),h=ha(lat,decl(t));if(!rise)h=-h;return 720-4*(lon+deg(h))-eqTime(t)}
 var m=one(jd);m=one(jd+m/1440);return one(jd+m/1440)}
function jdOf(y,m,d){if(m<=2){y-=1;m+=12}var A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}

/* ---------- Montreal clock helpers ---------- */
var fmt=new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",hourCycle:"h23",weekday:"short"});
function mtl(date){var p={};fmt.formatToParts(date).forEach(function(x){p[x.type]=x.value});
 var h=+p.hour%24;return{y:+p.year,m:+p.month,d:+p.day,dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday),mins:h*60+(+p.minute)+(+p.second)/60}}
function zmanim(y,m,d){ // local Montreal minutes-of-day
 var jd=jdOf(y,m,d),base=Date.UTC(y,m-1,d);
 var r=new Date(base+riseSetUTC(true,jd,LAT,LON)*60000),s=new Date(base+riseSetUTC(false,jd,LAT,LON)*60000);
 var rl=mtl(r).mins,sl=mtl(s).mins;
 return{sunrise:rl,sunset:sl,shkia:Math.round(sl),gedola:Math.ceil(rl+(sl-rl)*6.5/12)}}
function hm(mins){mins=Math.round(mins);var h=Math.floor(mins/60),mm=mins%60;var h12=h%12||12;return h12+":"+(mm<10?"0":"")+mm}
function parse(t){var a=String(t).split(":");return +a[0]*60+(+a[1]||0)+(+a[2]||0)/60}

/* ---------- build a day's schedule ---------- */
function relLabel(e){if(e.rel==="gedola")return"Mincha Gedola";
 if(e.rel==="shkia"){var o=e.offset||0;return o<0?(-o)+" min before Shkia":o===0?"At Shkia":o+" min after Shkia"}return""}
function runsOn(kind,e,dow){var d=e.days||(DATA.defaultDays&&DATA.defaultDays[kind])||[0,1,2,3,4];return d.indexOf(dow)>=0}
function dayList(kind,day){ // day={y,m,d,dow}
 var z=zmanim(day.y,day.m,day.d),out=[];
 var tu=addDay(day,2-day.dow),zt=zmanim(tu.y,tu.m,tu.d); // shkia minyanim follow the week's Tuesday shkia
 DATA[kind].forEach(function(e,i){
  if(!runsOn(kind,e,day.dow))return;
  var t=e.time?parse(e.time):e.rel==="gedola"?z.gedola:e.rel==="shkia"?zt.shkia+(e.offset||0):null;
  if(t==null)return;out.push({e:e,t:t,i:i,label:relLabel(e)})});
 out.sort(function(a,b){return a.t-b.t||a.i-b.i});return{z:z,items:out}}
function addDay(day,n){var dt=new Date(Date.UTC(day.y,day.m-1,day.d+n,12));return{y:dt.getUTCFullYear(),m:dt.getUTCMonth()+1,d:dt.getUTCDate(),dow:dt.getUTCDay()}}
function isListDay(dow){return dow>=0&&dow<=4} // Sunday–Thursday
function motzei(n){if(n.dow!==6)return false;var z=zmanim(n.y,n.m,n.d);return n.mins>=z.shkia+((DATA&&DATA.motzeiOffset)||72)}

/* ---------- now (with ?t=HH:MM[:SS] / ?d=YYYY-MM-DD preview override; the clock keeps ticking from it) ---------- */
var LOAD=Date.now(),Q=new URLSearchParams(location.search);
function now(){var n=mtl(new Date());
 if(Q.get("d")){var p=Q.get("d").split("-");var dd=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],12));n.y=+p[0];n.m=+p[1];n.d=+p[2];n.dow=dd.getUTCDay()}
 if(Q.get("t")){n.mins=parse(Q.get("t"))+(Date.now()-LOAD)/60000}return n}

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function cd(diff){diff=Math.ceil(diff);if(diff<=0)return"Now";
 if(diff<60)return"in "+diff+" min";var h=Math.floor(diff/60),m=diff%60;return"in "+h+" hr"+(m?" "+m+" min":"")}
function tagHTML(e){return e.tag?'<span class="mn-tag">'+esc(e.tag)+'</span>':""}
function addrHTML(e){if(!e.address&&!e.maps)return"";var txt=esc(e.address||"Open in Maps");
 if(e.maps)txt='<a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(e.maps)+'" target="_blank" rel="noopener"><svg class="pin" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span class="u">'+txt+'</span></a>';
 return'<span class="addr">'+txt+'</span>'}
function nextAddrHTML(e){if(!e.address&&!e.maps)return"";
 var dest=(e.lat!=null&&(e.lng!=null||e.lon!=null))?e.lat+","+(e.lng!=null?e.lng:e.lon):(e.maps||e.address);
 var url="https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(dest);
 return'<span class="addr nx-addr"><a href="'+url+'" target="_blank" rel="noopener" aria-label="Directions to '+esc(e.name)+(e.address?", "+esc(e.address):"")+'"><span class="nx-l"><svg class="pin" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span class="u">'+esc(e.address||"Open in Maps")+'</span></span></a></span>'}
function dirUrl(e){var dest=(e.lat!=null&&(e.lng!=null||e.lon!=null))?e.lat+","+(e.lng!=null?e.lng:e.lon):(e.maps||e.address);return"https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(dest)}
function dirBtnHTML(e){if(!e.address&&!e.maps)return"";return'<a class="nx-go" href="'+dirUrl(e)+'" target="_blank" rel="noopener" aria-label="Directions to '+esc(e.name)+'" title="Directions"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.71 11.29l-9-9a1 1 0 0 0-1.41 0l-9 9a1 1 0 0 0 0 1.41l9 9a1 1 0 0 0 1.41 0l9-9a1 1 0 0 0 0-1.41zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/></svg></a>'}
function nameHTML(x,kind,link){var e=x.e;
 if(kind==="shul"){var sub=(x.label?'<span>'+esc(x.label)+'</span>':"")+tagHTML(e);
  return'<span class="nm he" lang="he" dir="rtl"><span class="t">'+esc(e.name).replace(/(\S+ - \S+)$/,'<span class="nw">$1</span>')+'</span>'+(sub?'<span class="sub">'+sub+'</span>':"")+'</span>'}
 return'<span class="nm en"><span class="t">'+esc(e.name)+'</span>'+tagHTML(e)+(link==="next"?nextAddrHTML(e):link?addrHTML(e):(e.address?'<span class="addr">'+esc(e.address)+'</span>':""))+'</span>'}

/* ---------- live clock ---------- */
function renderClock(){var n=now(),s=Math.floor(n.mins*60+1e-6),h=Math.floor(s/3600)%24,m=Math.floor(s/60)%60,sec=s%60;
 var d=document.getElementById("mn-date"),t=document.getElementById("mn-time");if(!d||!t)return;
 d.textContent=EN_DAYS[n.dow]+", "+EN_MON[n.m-1]+" "+n.d;
 t.innerHTML=(h%12||12)+":"+(m<10?"0":"")+m+"<span class=\"mn-sec\">:"+(sec<10?"0":"")+sec+"</span>"+"<small>"+(h<12?"AM":"PM")+"</small>";
 var z=zmanim(n.y,n.m,n.d),g=document.getElementById("mn-gedola"),k=document.getElementById("mn-shkia");
 function hz(x){x=Math.round(x);var H=Math.floor(x/60),M=x%60;return (H%12||12)+":"+(M<10?"0":"")+M+"<small>"+(H<12?"AM":"PM")+"</small>"}
 if(g)g.innerHTML=hz(z.gedola);if(k)k.innerHTML=hz(z.shkia)}

function firstOf(kind,n){ // first list day after today with minyanim
 for(var k=1;k<=7;k++){var day=addDay(n,k),dl=dayList(kind,day);if(dl.items.length)return{day:day,k:k,items:dl.items}}return null}

function renderNext(kind){
 var n=now(),el=document.getElementById("next-"+kind),today=isListDay(n.dow)?dayList(kind,n):{items:[]};
 var up=today.items.filter(function(x){return x.t>=n.mins-2});
 var soon=up.filter(function(x){return x.t<=n.mins+60}),show=soon.length?soon.slice(0,5):up.slice(0,3),more=soon.length>5?soon.length-5:0,msg="",dayName="";
 if(!soon.length&&up.length)msg="Nothing in the next hour. Coming up next:";
 if(!up.length){var nx=firstOf(kind,n);
  var mz=motzei(n);
  if(!isListDay(n.dow)&&mz)msg="A gutte voch!";
  else if(!isListDay(n.dow))msg="Good Shabbos! These minyanim are listed for "+(kind==="work"?"Monday":"Sunday")+" to Thursday.";
  else if(!today.items.length)msg='<span class="mn-red">No minyanim today</span>';
  else msg="That's all for today.";
  if(nx){dayName=nx.k===1&&(isListDay(n.dow)||mz)?"Tomorrow":EN_DAYS[nx.day.dow];show=nx.items.slice(0,3);
   msg+='<small>First minyanim '+(dayName==="Tomorrow"?"tomorrow":"on "+dayName)+':</small>'}}
 var h='<div class="mn-h"><h2>Next minyanim</h2></div>';
 if(msg)h+='<p class="mn-msg">'+msg+'</p>';
 h+='<ul class="mn-nlist">';
 show.forEach(function(x,i){var db=kind==="work"?dirBtnHTML(x.e):"";h+='<li class="mn-n'+(i===0?" first":"")+(db?" has-go":"")+'"><span class="tcol"><span class="tm">'+hm(x.t)+'</span><span class="mn-cd">'+(dayName||cd(x.t-n.mins))+'</span></span>'+nameHTML(x,kind,"next")+db+'</li>'});
 h+='</ul>';
 if(more)h+='<p class="mn-more">+ '+more+' more in the next hour, see the full list</p>';el.innerHTML=h}

function renderList(kind){
 var n=now(),el=document.getElementById("list-"+kind),off=!isListDay(n.dow),day=n,items;
 if(off){var nx=firstOf(kind,n);day=nx?nx.day:addDay(n,1);items=nx?nx.items:[]}else items=dayList(kind,n).items;
 var none=false;if(!off&&!items.length){var nx2=firstOf(kind,n);if(nx2){day=nx2.day;items=nx2.items;off=true;none=true}}
 var hd=document.getElementById("h-"+kind),kk=document.getElementById("k-"+kind);
 if(kind==="shul"&&hd)hd.textContent=off?EN_DAYS[day.dow]+"'s minyanim":"Today's minyanim";
 if(kk)kk.textContent=off?EN_MON[day.m-1]+" "+day.d:EN_DAYS[n.dow];
 var nextDone=false,h="",npast=0;
 items.forEach(function(x){var past=!off&&x.t<n.mins-2,nx=!past&&!nextDone;if(nx)nextDone=true;if(past)npast++;
  h+='<li class="mn-r'+(past?" past hid":"")+(nx?" nextup":"")+'"><span class="tm">'+hm(x.t)+'</span>'+nameHTML(x,kind,true)+'</li>'});
 var open=el.classList.contains("showpast");
 if(npast&&npast<items.length)h='<li style="display:contents"><button type="button" class="mn-earlier" aria-expanded="'+open+'">'+(open?"Hide earlier":"Show earlier ("+npast+")")+'</button></li>'+h;
 else if(npast&&npast===items.length)el.classList.add("showpast");
 if(!items.length)h='<li class="mn-r"><span></span><span class="nm en">No minyanim listed.</span></li>';
 var nb=document.getElementById("none-"+kind);if(!nb){nb=document.createElement("div");nb.id="none-"+kind;nb.className="mn-none";el.parentNode.insertBefore(nb,el)}
 nb.style.display=none?"":"none";if(none)nb.innerHTML='No minyanim today<small>Showing '+EN_DAYS[day.dow]+'\'s minyanim</small>';
 el.innerHTML=h;
 var btn=el.querySelector(".mn-earlier");if(btn)btn.onclick=function(){el.classList.toggle("showpast");renderList(kind)};
 var hidden=DATA[kind].filter(function(e){return!runsOn(kind,e,day.dow)}).length,note=document.getElementById("note-"+kind);
 if(note)note.textContent=hidden?(kind==="shul"?hidden+" Sunday-only minyan"+(hidden>1?"im":"")+" not shown today":hidden+" more on Monday–Thursday (not today)"):"";
 if(note&&off&&hidden)note.textContent="";
}
var ICO={tel:'<path d="M5 4h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
 mail:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.6 7 8.4 6 8.4-6"/>',
 pin:'<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'};
function ico(k){return'<svg class="sp-i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+ICO[k]+'</svg>'}
function renderAds(kind){var el=document.getElementById("ads-"+kind);if(!el)return;var list=(DATA.sponsors||{})[kind]||[];
 el.className="mn-sps n"+list.length;
 el.innerHTML=list.map(function(s){var L=[];
  if(s.phone)L.push('<li><a href="tel:'+s.tel+'">'+ico("tel")+'<span class="num">'+esc(s.phone)+'</span></a></li>');
  if(s.email)L.push('<li><a href="mailto:'+esc(s.email.toLowerCase())+'">'+ico("mail")+'<span>'+esc(s.email)+'</span></a></li>');
  if(s.address)L.push('<li class="ad"><a href="'+esc(s.maps)+'" target="_blank" rel="noopener">'+ico("pin")+'<span>'+s.address.split("|").map(esc).join("<br>")+'</span></a></li>');
  return'<div class="sp"><div class="sp-logo"><img src="'+s.logo+'" alt="'+esc(s.name)+'" width="'+s.w+'" height="'+s.h+'" style="--dw:'+s.dw+'" decoding="async"></div><ul class="sp-c">'+L.join("")+'</ul></div>'}).join("")}
function stick(){var hd=document.querySelector(".site-head"),tb=document.querySelector(".mn-tabbar");if(!hd||!tb)return;
 var t=getComputedStyle(hd).position==="sticky"?hd.offsetHeight:0;tb.style.top=t+"px";document.documentElement.style.setProperty("--stick",t+"px")}
addEventListener("resize",stick);stick();
function render(){["shul","work"].forEach(function(k){renderNext(k);renderList(k)})}
function setTab(k,push){TAB=k;document.querySelectorAll(".mn-tab").forEach(function(b){var on=b.dataset.tab===k;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1});
 document.querySelectorAll(".mn-panel").forEach(function(p){p.hidden=p.id!=="panel-"+k});
 if(push&&history.replaceState)history.replaceState(null,"",(k==="work"?"#work":location.pathname+location.search))}
document.querySelectorAll(".mn-tab").forEach(function(b){b.addEventListener("click",function(){setTab(b.dataset.tab,true)})});
document.querySelector(".mn-tabs").addEventListener("keydown",function(e){if(e.key==="ArrowLeft"||e.key==="ArrowRight"){var k=TAB==="shul"?"work":"shul";setTab(k,true);document.querySelector('.mn-tab[data-tab="'+k+'"]').focus()}});
fetch("/mincha/mincha.json",{cache:"no-cache"}).then(function(r){return r.json()}).then(function(d){DATA=d;
 setTab(location.hash==="#work"?"work":"shul");renderAds("shul");renderAds("work");render();
 renderClock();setInterval(renderClock,1000);setInterval(render,30000);document.addEventListener("visibilitychange",function(){if(!document.hidden)render()});
 window.__mincha={zmanim:zmanim,now:now,dayList:dayList,render:render}});
})();

/*hmonth*/(function(){try{var el=document.getElementById("mn-season");if(!el)return;
var MAP={Tishri:"Tishrei",Heshvan:"Cheshvan",Tevet:"Teves",Tamuz:"Tammuz"};
var p=new Intl.DateTimeFormat("en-u-ca-hebrew",{month:"long",year:"numeric",timeZone:"America/Toronto"}).formatToParts(new Date());
var mo="",yr="";p.forEach(function(x){if(x.type==="month")mo=x.value;if(x.type==="year"||x.type==="relatedYear")yr=yr||x.value});
if(!mo||!yr)return;mo=MAP[mo]||mo;var pre=(el.textContent.split(" · ")[0]||"Winter schedule");el.textContent=pre+" · "+mo+" "+yr}catch(e){}})();
