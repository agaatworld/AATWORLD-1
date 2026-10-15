/* Page turning by StPageFlip (MIT, © Nodlik): realistic paper curl, drag from any corner, touch swipe.
   The magazine is Arabic, so the book opens right to left: the pages are loaded in reverse and read backwards. */
function rtl(){return lang==="ar"}
var wraps=sheets.map(function(s,i){var w=document.createElement("div");w.className="pgw";w.setAttribute("data-density",(i===0||i===N-1)?"hard":"soft");w.appendChild(s);return w});
$("#src").remove();
var PF=null,cur=1,timer=0;
function dims(){var mb=window.innerWidth<=700,w=stage.clientWidth-(mb?20:112),h=stage.clientHeight-(mb?12:28);single=w<h*1.15;k=Math.min(w/(PWB*(single?1:2)),h/PHB);if(zoom)k*=single?1.9:1.6;return[Math.max(120,Math.floor(PWB*k)),Math.max(170,Math.floor(PHB*k))]}
function near(){for(var p=Math.max(1,cur-4);p<=Math.min(N,cur+5);p++){var w=wraps[p-1];if(!w._ld){w._ld=1;[].forEach.call(w.querySelectorAll("img[loading]"),function(m){m.removeAttribute("loading")})}}}
function sync(){var i=PF.getCurrentPageIndex();cur=single?N-i:(i>=N-1?1:i<=0?N:N-i-1);near();ui()}
function build(){var d=dims();if(PF){try{PF.destroy()}catch(e){}PF=null}
 clip.innerHTML="";var el=document.createElement("div");el.id="bk";clip.appendChild(el);clip.style.width=(single?d[0]:2*d[0])+"px";clip.style.height=d[1]+"px";stage.classList.toggle("single",single);stage.classList.toggle("zoom",zoom);
 var sc=d[0]/PWB;sheets.forEach(function(s){s.style.transform="scale("+sc+")"});near();
 var order=wraps.slice().reverse();order.forEach(function(w){w.removeAttribute("style");w.className="pgw";el.appendChild(w)});
 PF=new St.PageFlip(el,{width:d[0],height:d[1],size:"fixed",usePortrait:single,showCover:true,startPage:Math.max(0,Math.min(N-1,N-cur)),drawShadow:true,maxShadowOpacity:.45,flippingTime:900,mobileScrollSupport:true,swipeDistance:24,clickEventForward:true,disableFlipByClick:true,showPageCorners:true,useMouseEvents:true,autoSize:false,startZIndex:2});
 PF.loadFromHTML(order);PF.on("flip",sync);sync()}
function vis(){if(single||cur===1||cur===N)return[cur];return[cur,cur+1]}
function ui(){var v=vis();rng.value=cur;out.textContent=v.join("–")+" / "+N;var nx=$("#nx"),pv=$("#pv");nx.disabled=cur>=N;pv.disabled=cur<=1;
 var h="",seen={};v.forEach(function(p){var a=T.ads.filter(function(x){return x.p===p})[0];if(!a||seen[a.n])return;seen[a.n]=1;h+='<div class="dk"><b>'+esc(a.n)+'</b><span class="c">'+esc(a.cat[lang]||"")+" · "+esc(a.city[lang]||"")+"</span>"+(a.web?'<a class="go" href="'+esc(a.web)+'" target="_blank" rel="noopener">'+S[lang].web+"</a>":"")+(a.tels[0]?'<button class="cp" type="button" data-cp="'+esc(a.tels[0])+'">'+esc(a.tels[0])+"</button>":"")+(a.email?'<button class="cp em" type="button" data-cp="'+esc(a.email)+'">'+esc(a.email)+"</button>":"")+"</div>"});dock.innerHTML=h;
 try{history.replaceState(null,"","#p-"+cur)}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function go(p,anim){p=Math.max(1,Math.min(N,p|0));if(!PF)return;var i=N-p;if(anim===false){cur=p;PF.turnToPage(i);sync()}else PF.flip(i)}
function next(){if(PF&&cur<N)PF.flipPrev("top")}
function prev(){if(PF&&cur>1)PF.flipNext("top")}
function labels(){var s=S[lang];document.documentElement.lang=lang;document.documentElement.dir=rtl()?"rtl":"ltr";$("#tt").firstChild.nodeValue=s.t;$("#ts").textContent=s.s;$("#bToc").textContent=s.toc;$("#bZoom").textContent=s.zoom;$("#bFull").textContent=s.full;$("#bLang").textContent=s.lang;
 /* the book always opens right to left, so the left arrow always goes forward */
 var l=$(".nv.l"),r=$(".nv.r");l.id="nx";r.id="pv";l.setAttribute("aria-label",s.next);r.setAttribute("aria-label",s.prev);rng.dir="rtl";drawToc()}
function drawToc(){var s=S[lang],h="";var rows=tab==="art"?T.articles.map(function(a){return[a.p,a.t,""]}):tab==="ads"?T.ads.filter(function(a,i,A){return A.findIndex(function(x){return x.n===a.n})===i}).map(function(a){return[a.p,a.n,(a.cat[lang]||"")+" · "+(a.city[lang]||"")]}):AATP.map(function(a){return[a[0],lang==="ar"?a[1]:a[2],""]});
 rows.forEach(function(r){h+='<a href="#p-'+r[0]+'"><b>'+r[0]+"</b><span>"+esc(r[1])+(r[2]?"<small>"+esc(r[2])+"</small>":"")+"</span></a>"});
 toc.innerHTML='<header>'+["art","ads","aat"].map(function(t){return'<button type="button" class="ub'+(t===tab?" on":"")+'" data-tab="'+t+'">'+s[t]+"</button>"}).join("")+'<span style="flex:1"></span><button type="button" class="ub" data-close="1">'+s.close+' ✕</button></header><div class="ls">'+h+"</div>"}
function toast(t){var e=$("#toast");e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},1400)}
document.addEventListener("click",function(e){var a=e.target.closest('a[href^="#p-"]');if(a){e.preventDefault();toc.hidden=true;go(+a.getAttribute("href").slice(3),false);return}
 var c=e.target.closest("[data-cp]");if(c){var v=c.getAttribute("data-cp");try{navigator.clipboard.writeText(v).then(function(){toast(S[lang].copied+": "+v)},function(){})}catch(x){}return}
 var t=e.target.closest("[data-tab]");if(t){tab=t.getAttribute("data-tab");drawToc();return}
 if(e.target.closest("[data-close]")){toc.hidden=true;return}
 var n=e.target.closest(".nv");if(n){n.id==="nx"?next():prev();return}
 var b=e.target.closest(".ub");if(!b)return;
 if(b.id==="bToc")toc.hidden=!toc.hidden;else if(b.id==="bZoom"){zoom=!zoom;b.classList.toggle("on",zoom);build()}
 else if(b.id==="bLang"){lang=rtl()?"en":"ar";try{localStorage.setItem("aat560.lang",lang)}catch(x){}labels();ui()}
 else if(b.id==="bFull"){try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(function(){})}catch(x){}}});
document.addEventListener("keydown",function(e){if(e.key==="ArrowLeft")next();else if(e.key==="ArrowRight")prev();else if(e.key==="Home")go(1,false);else if(e.key==="End")go(N,false);else if(e.key==="Escape")toc.hidden=true});
rng.addEventListener("change",function(){go(+rng.value,false)});
rng.addEventListener("input",function(){out.textContent=rng.value+" / "+N});
window.addEventListener("resize",function(){clearTimeout(timer);timer=setTimeout(build,200)});
window.addEventListener("hashchange",function(){var m=/^#p-(\d+)$/.exec(location.hash);if(m&&+m[1]!==cur&&!(vis().indexOf(+m[1])>-1))go(+m[1],false)});
var m0=/^#p-(\d+)$/.exec(location.hash);cur=m0?Math.max(1,Math.min(N,+m0[1])):1;labels();build();
})();
</script>
