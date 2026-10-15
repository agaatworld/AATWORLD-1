(function(){
"use strict";
const $=s=>document.querySelector(s);
const RAD=Math.PI/180;
const BRAND=[["Brand red","#D21F26"],["Deep red","#C4141C"],["Dark red","#7A0A10"],["White","#FFFFFF"],["Black","#111111"],["Gold","#C9A227"]];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{if(b<=a)return x>=a?1:0;const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const fx=v=>Math.round(v*100)/100;
let uid=1;

/* ---------- document ---------- */
function ringsFrom(subs,map){
  return subs.map(s=>{const N=s.c.length,nodes=[];
    for(let i=0;i<N;i++){const a=i===0?s.s:[s.c[i-1][4],s.c[i-1][5]],o=s.c[i],inn=s.c[(i-1+N)%N];
      const P=map?map:(x,y)=>[x,y];const A=P(a[0],a[1]),O=P(o[0],o[1]),I=P(inn[2],inn[3]);
      nodes.push({x:A[0],y:A[1],ox:O[0],oy:O[1],ix:I[0],iy:I[1]});}
    return nodes;});
}
function newSwash(o){return Object.assign({name:"Swash",on:true,jx:0,jy:0,ang:180,blend:20,size:1,reach:1,lx:0,ly:0,rot:0,bend:0,thick:0,taper:0,curlOn:true,cx:0,cy:0,cr:20,curl:1,twist:0},o)}
const TAG_OFFS=[0.0,-0.08,-0.386,-0.607,-1.236,0,-1.935,-1.768,-1.862,0,-3.366,-3.829,-4.337,-4.423,-4.495,-5.149,-5.637,-6.013];
function defaultText(){return {str:"Ideas For Business",w:"560",cap:16.21,track:0,x:218.175,y:136.083,offs:TAG_OFFS.map(v=>[v,0])}}
function mkLayer(o){const L=Object.assign({id:"L"+(uid++),name:"Layer",kind:"path",rule:"evenodd",vis:true,lock:false,fill:"#D21F26",op:1,sw_:0,stroke:"#111111",tf:{x:0,y:0,sx:1,sy:1,r:0,k:0},pv:[0,0],rings:[],sw:[]},o);
  if(!o.pv){const b=bboxRings(baseRings(L));L.pv=[(b[0]+b[2])/2,(b[1]+b[3])/2];}
  return L;}
function defaultDoc(){
  return {layers:[
    mkLayer({name:"A  left",rings:ringsFrom(LOGO.A1),sw:[newSwash({name:"Left A swash",jx:131,jy:86,ang:156,blend:24,cx:30,cy:84,cr:34})]}),
    mkLayer({name:"A  right",rings:ringsFrom(LOGO.A2),sw:[newSwash({name:"Right A swash",jx:238,jy:88,ang:158,blend:24,cx:143,cy:110,cr:20})]}),
    mkLayer({name:"T",rings:ringsFrom(LOGO.T)}),
    mkLayer({name:"Ideas For Business",kind:"text",rule:"nonzero",text:defaultText()})
  ]};
}

/* ---------- geometry ---------- */
const textCache=new Map();
function buildText(t){
  const key=JSON.stringify(t);if(textCache.has(key))return textCache.get(key);
  const G=FONT[t.w]||FONT["560"],s=t.cap/FMETA.cap,rings=[];let pen=0;
  [...t.str].forEach((ch,i)=>{const g=G[ch]||G["?"];if(!g)return;const off=t.offs[i]||[0,0];const ox=t.x+pen*s+off[0],oy=t.y+off[1];
    rings.push(...ringsFrom(g[1],(x,y)=>[ox+x*s,oy+y*s]));pen+=g[0]+t.track*FMETA.upm/1000;});
  if(textCache.size>60)textCache.clear();textCache.set(key,rings);return rings;
}
function baseRings(L){return L.kind==="text"?buildText(L.text):L.rings}
function bboxRings(R){let b=[1e9,1e9,-1e9,-1e9];R.forEach(r=>r.forEach(n=>{b[0]=Math.min(b[0],n.x);b[1]=Math.min(b[1],n.y);b[2]=Math.max(b[2],n.x);b[3]=Math.max(b[3],n.y)}));return b}
function curveBBox(R){let b=[1e9,1e9,-1e9,-1e9];const add=(x,y)=>{b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)};
  R.forEach(r=>r.forEach((n,i)=>{const m=r[(i+1)%r.length];for(let k=0;k<=12;k++){const t=k/12,u=1-t;
    add(u*u*u*n.x+3*u*u*t*n.ox+3*u*t*t*m.ix+t*t*t*m.x,u*u*u*n.y+3*u*u*t*n.oy+3*u*t*t*m.iy+t*t*t*m.y)}}));return b}
function area(r){let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=p.x*q.y-q.x*p.y}return a/2}
function inPoly(x,y,r){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c}return c}
function normals(R){
  return R.map((r,ri)=>{let holes=0;const p=r[0];R.forEach((o,oi)=>{if(oi!==ri&&inPoly(p.x,p.y,o))holes++});
    const sg=(area(r)>0?1:-1)*(holes%2?-1:1);
    return r.map((n,i)=>{let tx=n.ox-n.ix,ty=n.oy-n.iy;if(Math.hypot(tx,ty)<1e-6){const a=r[(i-1+r.length)%r.length],b=r[(i+1)%r.length];tx=b.x-a.x;ty=b.y-a.y}
      const l=Math.hypot(tx,ty)||1;return [sg*ty/l,-sg*tx/l];});});
}
function swCtx(L,R){
  return L.sw.filter(s=>s.on).map(s=>{const u=[Math.cos(s.ang*RAD),Math.sin(s.ang*RAD)];let Lm=1;
    R.forEach(r=>r.forEach(n=>{const t=(n.x-s.jx)*u[0]+(n.y-s.jy)*u[1];if(t>Lm)Lm=t}));return {s,u,L:Lm}});
}
// map the three points of one node through all swash deformations
function mapNode(n,nr,ctx,shift){
  const pts=[[n.x,n.y],[n.ix,n.iy],[n.ox,n.oy]];
  if(shift){const [dx,dy,which]=shift;if(which==="node"){pts.forEach(p=>{p[0]+=dx;p[1]+=dy})}else{const p=pts[which==="in"?1:2];p[0]+=dx;p[1]+=dy}}
  const bx=pts[0][0],by=pts[0][1];
  for(const c of ctx){const s=c.s,u=c.u;const t=(bx-s.jx)*u[0]+(by-s.jy)*u[1];const w=smooth(0,s.blend,t);if(w<=0)continue;const tn=clamp(t/c.L,0,1);
    const th=w*(s.thick+s.taper*tn);if(th)pts.forEach(p=>{p[0]+=nr[0]*th;p[1]+=nr[1]*th});
    if(s.curlOn&&(s.curl!==1||s.twist)){const d=Math.hypot(bx-s.cx,by-s.cy);const wc=w*(1-smooth(s.cr*0.5,s.cr,d));
      if(wc>0){const sc=1+(s.curl-1)*wc,a=s.twist*wc*RAD,co=Math.cos(a)*sc,si=Math.sin(a)*sc;
        pts.forEach(p=>{const vx=p[0]-s.cx,vy=p[1]-s.cy;p[0]=s.cx+vx*co-vy*si;p[1]=s.cy+vx*si+vy*co})}}
    const g=1+(s.size-1)*w,a=(s.rot*w+s.bend*w*tn)*RAD,co=Math.cos(a),si=Math.sin(a);
    pts.forEach(p=>{let vx=p[0]-s.jx,vy=p[1]-s.jy;let al=vx*u[0]+vy*u[1],pe=-vx*u[1]+vy*u[0];al+=(s.reach-1)*c.L*0.7*smooth(0,0.7,tn)*w;
      vx=(al*u[0]-pe*u[1])*g;vy=(al*u[1]+pe*u[0])*g;p[0]=s.jx+vx*co-vy*si+s.lx*w;p[1]=s.jy+vx*si+vy*co+s.ly*w;});
  }
  return pts;
}
function tfMat(L){const t=L.tf,[px,py]=L.pv,c=Math.cos(t.r*RAD),s=Math.sin(t.r*RAD),k=Math.tan(t.k*RAD);
  // M = T(x+px,y+py) R K S T(-p)
  const a=c*t.sx,b=s*t.sx,cc=(c*k-s)*t.sy,d=(s*k+c)*t.sy;
  return [a,b,cc,d,t.x+px-(a*px+cc*py),t.y+py-(b*px+d*py)];}
const ap=(M,x,y)=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]];
function inv(M){const det=M[0]*M[3]-M[1]*M[2]||1e-9;return [M[3]/det,-M[1]/det,-M[2]/det,M[0]/det,(M[2]*M[5]-M[3]*M[4])/det,(M[1]*M[4]-M[0]*M[5])/det]}
function geom(L){
  const R=baseRings(L),N=normals(R),ctx=swCtx(L,R),M=tfMat(L);
  const out=R.map((r,ri)=>r.map((n,i)=>{const p=mapNode(n,N[ri][i],ctx);const A=ap(M,p[0][0],p[0][1]),I=ap(M,p[1][0],p[1][1]),O=ap(M,p[2][0],p[2][1]);
    return {x:A[0],y:A[1],ix:I[0],iy:I[1],ox:O[0],oy:O[1]}}));
  return {R,N,ctx,M,out};
}
function dOf(R,dp){const f=v=>v.toFixed(dp);let d="";R.forEach(r=>{if(r.length<2)return;d+="M"+f(r[0].x)+" "+f(r[0].y);
  for(let i=0;i<r.length;i++){const n=r[i],m=r[(i+1)%r.length];d+="C"+f(n.ox)+" "+f(n.oy)+" "+f(m.ix)+" "+f(m.iy)+" "+f(m.x)+" "+f(m.y)}d+="Z"});return d}
// inverse: world delta -> base delta for a node point (numeric jacobian)
function solveBase(L,G,ri,i,which,dW){
  const n=G.R[ri][i],nr=G.N[ri][i],idx=which==="node"?0:which==="in"?1:2,e=0.01;
  const f=(dx,dy)=>{const p=mapNode(n,nr,G.ctx,[dx,dy,which])[idx];return ap(G.M,p[0],p[1])};
  const p0=f(0,0),px=f(e,0),py=f(0,e);const a=(px[0]-p0[0])/e,b=(px[1]-p0[1])/e,c=(py[0]-p0[0])/e,d=(py[1]-p0[1])/e;
  const det=a*d-b*c;if(Math.abs(det)<1e-9)return [0,0];
  return [(d*dW[0]-c*dW[1])/det,(-b*dW[0]+a*dW[1])/det];
}
function moveBase(n,which,dx,dy){if(which==="node"){n.x+=dx;n.y+=dy;n.ix+=dx;n.iy+=dy;n.ox+=dx;n.oy+=dy}else if(which==="in"){n.ix+=dx;n.iy+=dy}else{n.ox+=dx;n.oy+=dy}}

/* ---------- state ---------- */
let doc,selId=null,tool="move",tab="shape",selNodes=new Set(),activeSw=0,activeLetter=0;
let cam={x:40,y:40,z:3};
const opts={bg:"checker",ghost:false,grid:false,gridSize:5,snap:false,region:true,link:true};
const brush={mode:"push",r:60,str:0.7,all:false};
const exp={w:4000,pad:4};
let hist=[],fut=[];
function snap(){return JSON.stringify({layers:doc.layers})}
function commit(){hist.push(lastSaved);if(hist.length>150)hist.shift();fut=[];lastSaved=snap();save();syncUndo()}
let lastSaved="";
function restore(s){const d=JSON.parse(s);doc={layers:d.layers};doc.layers.forEach(L=>{const n=+String(L.id).slice(1);if(n>=uid)uid=n+1});
  if(!layerById(selId))selId=doc.layers[0]?doc.layers[0].id:null;selNodes.clear();lastSaved=s;}
function undo(){if(!hist.length)return;fut.push(lastSaved);restore(hist.pop());save();syncUndo();rebuild();toast("Undone")}
function redo(){if(!fut.length)return;hist.push(lastSaved);restore(fut.pop());save();syncUndo();rebuild();toast("Redone")}
function syncUndo(){$("#undo").disabled=!hist.length;$("#redo").disabled=!fut.length}
function save(){try{localStorage.setItem("aat-logo-studio",lastSaved)}catch(e){}}
const layerById=id=>doc&&doc.layers.find(L=>L.id===id);
const curL=()=>layerById(selId);

/* ---------- drawing ---------- */
const svg=$("#svg"),world=$("#world"),layersG=$("#layersG"),ov=$("#ov"),ghostG=$("#ghostG"),gridG=$("#gridG"),board=$("#board");
const NS="http://www.w3.org/2000/svg";
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};
let GC={},raf=0,ghostD="";
function req(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw()})}
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
function draw(){
  world.setAttribute("transform",`translate(${cam.x} ${cam.y}) scale(${cam.z})`);
  $("#zoomTag").textContent=Math.round(cam.z/3*100)+"%";
  const bg=$("#bgRect");bg.setAttribute("fill",opts.bg==="checker"?"none":opts.bg);
  board.classList.toggle("chk",opts.bg==="checker");
  layersG.textContent="";GC={};
  doc.layers.forEach(L=>{if(!L.vis)return;const G=geom(L);GC[L.id]=G;
    const p=el("path",{d:dOf(G.out,3),fill:L.fill,"fill-rule":L.rule,opacity:L.op,"data-id":L.id},layersG);
    if(L.sw_>0){p.setAttribute("stroke",L.stroke);p.setAttribute("stroke-width",L.sw_);p.setAttribute("stroke-linejoin","round")}});
  ghostG.textContent="";
  if(opts.ghost){el("path",{d:ghostD,fill:"none",stroke:css("--gizmo"),"stroke-width":1.4/cam.z,"stroke-dasharray":`${4/cam.z} ${3/cam.z}`,"pointer-events":"none"},ghostG)}
  gridG.textContent="";
  if(opts.grid){const g=opts.gridSize,c=css("--muted");let d="";for(let x=-200;x<=640;x+=g)d+=`M${x} -200V400`;for(let y=-200;y<=400;y+=g)d+=`M-200 ${y}H640`;
    el("path",{d,stroke:c,"stroke-opacity":.28,"stroke-width":1/cam.z,fill:"none","pointer-events":"none"},gridG)}
  drawOverlay();
}
const S=(x,y)=>[x*cam.z+cam.x,y*cam.z+cam.y];
const W=(sx,sy)=>[(sx-cam.x)/cam.z,(sy-cam.y)/cam.z];
let hoverPt=null;
function drawOverlay(){
  ov.textContent="";const L=curL();const giz=css("--gizmo"),giz2=css("--gizmo2"),acc=css("--accent");
  if(L&&L.vis&&GC[L.id]&&(tool==="move"||tool==="brush")){const b=curveBBox(GC[L.id].out),a=S(b[0],b[1]),c=S(b[2],b[3]);
    el("rect",{x:a[0]-4,y:a[1]-4,width:c[0]-a[0]+8,height:c[1]-a[1]+8,fill:"none",stroke:giz,"stroke-width":1.5,"stroke-dasharray":"6 4"},ov)}
  if(tool==="nodes"&&L&&GC[L.id]){
    if(L.kind==="text"){return}
    const G=GC[L.id];
    G.out.forEach((r,ri)=>r.forEach((n,i)=>{const k=ri+":"+i,on=selNodes.has(k),p=S(n.x,n.y);
      if(on){[["in",n.ix,n.iy],["out",n.ox,n.oy]].forEach(([w,hx,hy])=>{const h=S(hx,hy);el("line",{x1:p[0],y1:p[1],x2:h[0],y2:h[1],stroke:giz,"stroke-width":1.5},ov);
        el("circle",{cx:h[0],cy:h[1],r:6,fill:css("--panel"),stroke:giz,"stroke-width":2},ov)})}
      el("rect",{x:p[0]-4,y:p[1]-4,width:8,height:8,fill:on?giz:css("--panel"),stroke:giz,"stroke-width":1.6},ov)}));
  }
  if(tool==="swash"&&L&&GC[L.id]){
    const G=GC[L.id];
    if(opts.region&&G.ctx.length){G.R.forEach((r,ri)=>r.forEach((n,i)=>{let w=0;G.ctx.forEach(c=>{const t=(n.x-c.s.jx)*c.u[0]+(n.y-c.s.jy)*c.u[1];w=Math.max(w,smooth(0,c.s.blend,t))});
      if(w>0.01){const o=G.out[ri][i],p=S(o.x,o.y);el("circle",{cx:p[0],cy:p[1],r:3.5,fill:giz2,"fill-opacity":0.25+0.75*w},ov)}}))}
    L.sw.forEach((s,k)=>{const act=k===activeSw,M=G.M,u=[Math.cos(s.ang*RAD),Math.sin(s.ang*RAD)];
      const J=S(...ap(M,s.jx,s.jy)),D=S(...ap(M,s.jx+u[0]*s.blend,s.jy+u[1]*s.blend)),C=S(...ap(M,s.cx,s.cy)),CR=S(...ap(M,s.cx+s.cr,s.cy));
      const col=act?giz:css("--muted"),op=act?1:.6;
      el("line",{x1:J[0],y1:J[1],x2:D[0],y2:D[1],stroke:col,"stroke-width":2.5,opacity:op},ov);
      const nx=-(D[1]-J[1]),ny=D[0]-J[0],nl=Math.hypot(nx,ny)||1;
      el("line",{x1:J[0]-nx/nl*40,y1:J[1]-ny/nl*40,x2:J[0]+nx/nl*40,y2:J[1]+ny/nl*40,stroke:col,"stroke-width":2,"stroke-dasharray":"5 4",opacity:op},ov);
      el("circle",{cx:J[0],cy:J[1],r:act?10:7,fill:col,stroke:css("--panel"),"stroke-width":2,opacity:op},ov);
      el("path",{d:`M${D[0]} ${D[1]}m-8 0l8-8l8 8l-8 8z`,fill:css("--panel"),stroke:col,"stroke-width":2.5,opacity:op},ov);
      if(s.curlOn){const rr=Math.hypot(CR[0]-C[0],CR[1]-C[1]);
        el("circle",{cx:C[0],cy:C[1],r:rr,fill:"none",stroke:giz2,"stroke-width":2,"stroke-dasharray":"7 5",opacity:op},ov);
        el("circle",{cx:C[0],cy:C[1],r:act?8:6,fill:giz2,stroke:css("--panel"),"stroke-width":2,opacity:op},ov);
        el("circle",{cx:CR[0],cy:CR[1],r:7,fill:css("--panel"),stroke:giz2,"stroke-width":2.5,opacity:op},ov);}
    });
  }
  if(tool==="brush"&&hoverPt){el("circle",{cx:hoverPt[0],cy:hoverPt[1],r:brush.r,fill:acc,"fill-opacity":.08,stroke:acc,"stroke-width":2},ov);
    el("circle",{cx:hoverPt[0],cy:hoverPt[1],r:2.5,fill:acc},ov)}
  if(marquee){const [a,b]=marquee;el("rect",{x:Math.min(a[0],b[0]),y:Math.min(a[1],b[1]),width:Math.abs(a[0]-b[0]),height:Math.abs(a[1]-b[1]),fill:giz,"fill-opacity":.08,stroke:giz,"stroke-width":1.5},ov)}
  updateStatus();
}

/* ---------- pointer interaction ---------- */
let drag=null,marquee=null,spaceDown=false;const ptrs=new Map();let pinch=null;
function local(e){const r=svg.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
const HIT=()=>matchMedia("(pointer:coarse)").matches?20:12;
function hitNode(sp){const L=curL();if(!L||!GC[L.id]||L.kind==="text")return null;const G=GC[L.id];let best=null,bd=HIT();
  G.out.forEach((r,ri)=>r.forEach((n,i)=>{const k=ri+":"+i;const cands=[["node",n.x,n.y]];if(selNodes.has(k))cands.push(["in",n.ix,n.iy],["out",n.ox,n.oy]);
    cands.forEach(([w,x,y])=>{const p=S(x,y),d=Math.hypot(p[0]-sp[0],p[1]-sp[1]);if(d<bd||(d<=bd&&w!=="node"&&best&&best.w==="node")){bd=d;best={ri,i,w,k}}})}));return best}
function hitGizmo(sp){const L=curL();if(!L||!GC[L.id])return null;const M=GC[L.id].M;let best=null,bd=HIT()+4;
  L.sw.forEach((s,k)=>{const u=[Math.cos(s.ang*RAD),Math.sin(s.ang*RAD)];const c=[["J",s.jx,s.jy],["D",s.jx+u[0]*s.blend,s.jy+u[1]*s.blend]];if(s.curlOn)c.push(["C",s.cx,s.cy],["R",s.cx+s.cr,s.cy]);
    c.forEach(([w,x,y])=>{const p=S(...ap(M,x,y)),d=Math.hypot(p[0]-sp[0],p[1]-sp[1]);if(d<bd||(d===bd&&k===activeSw)){bd=d;best={k,w}}})});return best}
function layerAt(e){const t=document.elementFromPoint(e.clientX,e.clientY);return t&&t.dataset&&t.dataset.id?t.dataset.id:null}
function snapW(p){if(!opts.snap)return p;const g=opts.gridSize/ (opts.gridSize>=5?5:1);return [Math.round(p[0]/g)*g,Math.round(p[1]/g)*g]}

svg.addEventListener("pointerdown",e=>{
  svg.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,local(e));
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),m:[(a[0]+b[0])/2,(a[1]+b[1])/2],z:cam.z,cx:cam.x,cy:cam.y};drag=null;marquee=null;return}
  const sp=local(e),wp=W(...sp);
  if(tool==="pan"||spaceDown||e.button===1){drag={type:"pan",sp,cam:{...cam}};return}
  if(tool==="move"){const id=layerAt(e);if(id){const L=layerById(id);if(selId!==id){selId=id;selNodes.clear();rebuild()}
      if(!L.lock)drag={type:"layer",sp,start:{x:L.tf.x,y:L.tf.y},L}}else{selId=null;rebuild()}return}
  if(tool==="nodes"){const L=curL();
    if(!L){const id=layerAt(e);if(id){selId=id;rebuild()}return}
    if(L.kind==="text"){toast("Text must be converted to outlines first (Text tab)");return}
    const h=hitNode(sp);
    if(h){if(h.w==="node"){if(e.shiftKey){selNodes.has(h.k)?selNodes.delete(h.k):selNodes.add(h.k)}else if(!selNodes.has(h.k)){selNodes.clear();selNodes.add(h.k)}}
      if(L.lock){req();return}
      const G=GC[L.id];const o=G.out[h.ri][h.i];const st=h.w==="node"?[o.x,o.y]:h.w==="in"?[o.ix,o.iy]:[o.ox,o.oy];
      const n=G.R[h.ri][h.i];const smoothNode=isSmooth(n);
      drag={type:"node",h,sp,st,L,smooth:smoothNode&&!e.altKey,lenOther:h.w==="in"?Math.hypot(n.ox-n.x,n.oy-n.y):Math.hypot(n.ix-n.x,n.iy-n.y)};rebuildPane();req();return}
    const id=layerAt(e);if(id&&id!==selId){selId=id;selNodes.clear();rebuild();return}
    if(!e.shiftKey)selNodes.clear();marquee=[sp,sp];req();return}
  if(tool==="swash"){const L=curL();
    if(L){const g=hitGizmo(sp);if(g){activeSw=g.k;drag={type:"giz",g,L,Mi:inv(GC[L.id].M)};rebuildPane();req();return}}
    const id=layerAt(e);if(id){selId=id;activeSw=0;rebuild();}return}
  if(tool==="brush"){const L=curL();
    const targets=(brush.all?doc.layers:L?[L]:[]).filter(l=>l.vis&&!l.lock&&l.kind==="path");
    if(!targets.length){toast(L&&L.kind==="text"?"Convert the text to outlines to sculpt it (Text tab)":"Pick a shape first");return}
    drag={type:"brush",last:sp,targets};return}
});
svg.addEventListener("pointermove",e=>{
  const sp=local(e);if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,sp);
  const wp=W(...sp);$("#cur").textContent=fx(wp[0]).toFixed(2)+" , "+fx(wp[1]).toFixed(2);
  if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    const z=clamp(pinch.z*d/pinch.d,0.3,80);const w0=[(pinch.m[0]-pinch.cx)/pinch.z,(pinch.m[1]-pinch.cy)/pinch.z];cam.z=z;cam.x=m[0]-w0[0]*z;cam.y=m[1]-w0[1]*z;req();return}
  if(tool==="brush"){hoverPt=sp;if(!drag)req()}
  if(!drag){if(marquee){marquee[1]=sp;req()}return}
  if(drag.type==="pan"){cam.x=drag.cam.x+sp[0]-drag.sp[0];cam.y=drag.cam.y+sp[1]-drag.sp[1];req();return}
  if(drag.type==="layer"){let dx=(sp[0]-drag.sp[0])/cam.z,dy=(sp[1]-drag.sp[1])/cam.z;if(e.shiftKey){Math.abs(dx)>Math.abs(dy)?dy=0:dx=0}
    if(opts.snap){const g=opts.gridSize;dx=Math.round(dx/g)*g;dy=Math.round(dy/g)*g}
    drag.L.tf.x=fx(drag.start.x+dx);drag.L.tf.y=fx(drag.start.y+dy);drag.moved=true;req();refreshVals();return}
  if(drag.type==="node"){const L=drag.L,h=drag.h;let target=[drag.st[0]+(sp[0]-drag.sp[0])/cam.z,drag.st[1]+(sp[1]-drag.sp[1])/cam.z];
    if(e.shiftKey){const dx=target[0]-drag.st[0],dy=target[1]-drag.st[1];Math.abs(dx)>Math.abs(dy)?target[1]=drag.st[1]:target[0]=drag.st[0]}
    target=snapW(target);const G=geom(L);const o=G.out[h.ri][h.i];const cur=h.w==="node"?[o.x,o.y]:h.w==="in"?[o.ix,o.iy]:[o.ox,o.oy];
    const dW=[target[0]-cur[0],target[1]-cur[1]];
    if(h.w==="node"){selNodes.forEach(k=>{const [ri,i]=k.split(":").map(Number);if(!G.R[ri]||!G.R[ri][i])return;const db=solveBase(L,G,ri,i,"node",dW);moveBase(L.rings[ri][i],"node",db[0],db[1])})}
    else{const db=solveBase(L,G,h.ri,h.i,h.w,dW);const n=L.rings[h.ri][h.i];moveBase(n,h.w,db[0],db[1]);
      if(drag.smooth){const hx=h.w==="in"?n.ix:n.ox,hy=h.w==="in"?n.iy:n.oy;const vx=n.x-hx,vy=n.y-hy,l=Math.hypot(vx,vy)||1;
        if(h.w==="in"){n.ox=n.x+vx/l*drag.lenOther;n.oy=n.y+vy/l*drag.lenOther}else{n.ix=n.x+vx/l*drag.lenOther;n.iy=n.y+vy/l*drag.lenOther}}}
    drag.moved=true;req();refreshVals();return}
  if(drag.type==="giz"){const L=drag.L,s=L.sw[drag.g.k];const lp=ap(drag.Mi,...W(...sp));const q=snapW(lp);
    const sws=opts.link&&drag.g.w!=="J"&&drag.g.w!=="C"?[s]:[s];
    if(drag.g.w==="J"){s.jx=fx(q[0]);s.jy=fx(q[1])}
    else if(drag.g.w==="D"){const vx=lp[0]-s.jx,vy=lp[1]-s.jy;s.ang=fx(Math.atan2(vy,vx)/RAD);s.blend=fx(clamp(Math.hypot(vx,vy),2,200))}
    else if(drag.g.w==="C"){s.cx=fx(q[0]);s.cy=fx(q[1])}
    else{s.cr=fx(clamp(Math.hypot(lp[0]-s.cx,lp[1]-s.cy),2,200))}
    drag.moved=true;req();refreshVals();return}
  if(drag.type==="brush"){const dS=[sp[0]-drag.last[0],sp[1]-drag.last[1]];drag.last=sp;const R=brush.r;
    drag.targets.forEach(L=>{const G=geom(L);G.out.forEach((r,ri)=>r.forEach((o,i)=>{const p=S(o.x,o.y),d=Math.hypot(p[0]-sp[0],p[1]-sp[1]);if(d>R)return;
      const f=Math.pow(1-(d/R)*(d/R),2)*brush.str,n=L.rings[ri][i];
      if(brush.mode==="push"){const db=solveBase(L,G,ri,i,"node",[dS[0]/cam.z*f,dS[1]/cam.z*f]);moveBase(n,"node",db[0],db[1])}
      else if(brush.mode==="thick"||brush.mode==="thin"){const m=Math.hypot(dS[0],dS[1])/cam.z*0.12*f*(brush.mode==="thick"?1:-1);const nr=G.N[ri][i];moveBase(n,"node",nr[0]*m,nr[1]*m)}
      else{const a=L.rings[ri][(i-1+r.length)%r.length],b=L.rings[ri][(i+1)%r.length];const k=Math.min(1,Math.hypot(dS[0],dS[1])*0.02)*f;
        moveBase(n,"node",((a.x+b.x)/2-n.x)*k,((a.y+b.y)/2-n.y)*k)}}))});
    drag.moved=true;req();return}
});
function endPtr(e){ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;
  if(marquee){const [a,b]=marquee,L=curL();if(L&&GC[L.id]){const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]);
      GC[L.id].out.forEach((r,ri)=>r.forEach((n,i)=>{const p=S(n.x,n.y);if(p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1)selNodes.add(ri+":"+i)}))}
    marquee=null;rebuildPane();req()}
  if(drag&&drag.moved)commit();drag=null;}
svg.addEventListener("pointerup",endPtr);svg.addEventListener("pointercancel",endPtr);
svg.addEventListener("pointerleave",()=>{hoverPt=null;if(tool==="brush")req()});
svg.addEventListener("dblclick",e=>{if(tool!=="nodes")return;const L=curL();if(!L||L.kind!=="path"||L.lock)return;
  const sp=local(e);const G=GC[L.id];let best=null,bd=HIT()+6;
  G.out.forEach((r,ri)=>r.forEach((n,i)=>{const m=r[(i+1)%r.length];for(let k=1;k<40;k++){const t=k/40,u=1-t;
    const x=u*u*u*n.x+3*u*u*t*n.ox+3*u*t*t*m.ix+t*t*t*m.x,y=u*u*u*n.y+3*u*u*t*n.oy+3*u*t*t*m.iy+t*t*t*m.y;const p=S(x,y),d=Math.hypot(p[0]-sp[0],p[1]-sp[1]);if(d<bd){bd=d;best={ri,i,t}}}}));
  if(!best){toast("Double-click right on the outline to add a point");return}
  const r=L.rings[best.ri],a=r[best.i],b=r[(best.i+1)%r.length],t=best.t,lp=(p,q)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
  const P0=[a.x,a.y],P1=[a.ox,a.oy],P2=[b.ix,b.iy],P3=[b.x,b.y];const Q0=lp(P0,P1),Q1=lp(P1,P2),Q2=lp(P2,P3),R0=lp(Q0,Q1),R1=lp(Q1,Q2),X=lp(R0,R1);
  a.ox=Q0[0];a.oy=Q0[1];b.ix=Q2[0];b.iy=Q2[1];r.splice(best.i+1,0,{x:X[0],y:X[1],ix:R0[0],iy:R0[1],ox:R1[0],oy:R1[1]});
  selNodes.clear();selNodes.add(best.ri+":"+(best.i+1));commit();rebuildPane();req();toast("Point added");});
svg.addEventListener("wheel",e=>{e.preventDefault();const sp=local(e);if(e.ctrlKey||e.metaKey||!e.shiftKey&&Math.abs(e.deltaX)<1){zoomAt(sp,Math.exp(-e.deltaY*(e.ctrlKey?0.01:0.0018)))}else{cam.x-=e.deltaX;cam.y-=e.deltaY;req()}},{passive:false});
function zoomAt(sp,f){const w=W(...sp);cam.z=clamp(cam.z*f,0.3,80);cam.x=sp[0]-w[0]*cam.z;cam.y=sp[1]-w[1]*cam.z;req()}
function fit(){const r=svg.getBoundingClientRect();let b=[1e9,1e9,-1e9,-1e9];doc.layers.forEach(L=>{if(!L.vis)return;const G=GC[L.id]||geom(L);const c=curveBBox(G.out);b=[Math.min(b[0],c[0]),Math.min(b[1],c[1]),Math.max(b[2],c[2]),Math.max(b[3],c[3])]});
  if(b[0]>b[2])b=[0,0,413,138];const pad=r.width<600?14:40;const z=Math.min((r.width-2*pad)/(b[2]-b[0]),(r.height-2*pad)/(b[3]-b[1]));cam.z=clamp(z,0.3,80);
  cam.x=(r.width-(b[2]-b[0])*cam.z)/2-b[0]*cam.z;cam.y=(r.height-(b[3]-b[1])*cam.z)/2-b[1]*cam.z;req()}
function isSmooth(n){const a=Math.atan2(n.oy-n.y,n.ox-n.x),b=Math.atan2(n.y-n.iy,n.x-n.ix);if(Math.hypot(n.ox-n.x,n.oy-n.y)<1e-3||Math.hypot(n.ix-n.x,n.iy-n.y)<1e-3)return false;let d=Math.abs(a-b);if(d>Math.PI)d=2*Math.PI-d;return d<10*RAD}

/* ---------- keyboard ---------- */
window.addEventListener("keydown",e=>{
  const tg=e.target;const typing=tg&&(tg.tagName==="INPUT"&&tg.type!=="range"&&tg.type!=="checkbox"||tg.tagName==="TEXTAREA"||tg.tagName==="SELECT");
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){if(typing)return;e.preventDefault();e.shiftKey?redo():undo();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="y"){if(typing)return;e.preventDefault();redo();return}
  if(typing)return;
  if(e.key===" "){spaceDown=true;e.preventDefault();return}
  const k=e.key.toLowerCase();
  if(!e.ctrlKey&&!e.metaKey){if(k==="v")setTool("move");else if(k==="a")setTool("nodes");else if(k==="s")setTool("swash");else if(k==="b")setTool("brush");else if(k==="h")setTool("pan");
    else if(k==="0")fit();else if(k==="+"||k==="=")zoomAt(center(),1.25);else if(k==="-")zoomAt(center(),0.8);
    else if(tool==="brush"&&k==="]"){brush.r=clamp(brush.r+8,10,300);req();refreshVals()}else if(tool==="brush"&&k==="["){brush.r=clamp(brush.r-8,10,300);req();refreshVals()}}
  if(e.key.startsWith("Arrow")){const st=e.shiftKey?1:0.1;const d=[e.key==="ArrowLeft"?-st:e.key==="ArrowRight"?st:0,e.key==="ArrowUp"?-st:e.key==="ArrowDown"?st:0];nudge(d);e.preventDefault()}
  if((e.key==="Delete"||e.key==="Backspace")&&tool==="nodes"){deleteNodes();e.preventDefault()}
});
window.addEventListener("keyup",e=>{if(e.key===" ")spaceDown=false});
function center(){const r=svg.getBoundingClientRect();return [r.width/2,r.height/2]}
function nudge(d){const L=curL();if(!L||L.lock)return;
  if(tool==="nodes"&&selNodes.size&&L.kind==="path"){const G=geom(L);selNodes.forEach(k=>{const [ri,i]=k.split(":").map(Number);const db=solveBase(L,G,ri,i,"node",d);moveBase(L.rings[ri][i],"node",db[0],db[1])})}
  else if(tool==="swash"&&L.sw[activeSw]){const s=L.sw[activeSw];const Mi=inv(tfMat(L));s.jx=fx(s.jx+Mi[0]*d[0]+Mi[2]*d[1]);s.jy=fx(s.jy+Mi[1]*d[0]+Mi[3]*d[1])}
  else{L.tf.x=fx(L.tf.x+d[0]);L.tf.y=fx(L.tf.y+d[1])}
  clearTimeout(nudge.t);nudge.t=setTimeout(commit,350);req();refreshVals()}
function deleteNodes(){const L=curL();if(!L||L.kind!=="path"||!selNodes.size||L.lock)return;const by={};selNodes.forEach(k=>{const [ri,i]=k.split(":").map(Number);(by[ri]=by[ri]||[]).push(i)});
  let blocked=false;Object.keys(by).forEach(ri=>{const r=L.rings[ri];if(r.length-by[ri].length<3){blocked=true;return}by[ri].sort((a,b)=>b-a).forEach(i=>r.splice(i,1))});
  selNodes.clear();commit();rebuildPane();req();toast(blocked?"Kept at least 3 points in each outline":"Points deleted")}

/* ---------- inspector ---------- */
const pane=$("#pane");let rows=[];
function h(tag,attrs,...kids){const e=document.createElement(tag);for(const k in attrs||{}){if(k==="on")for(const ev in attrs.on)e.addEventListener(ev,attrs.on[ev]);else if(k==="cls")e.className=attrs[k];else if(k==="text")e.textContent=attrs[k];else e.setAttribute(k,attrs[k])}kids.flat().forEach(c=>c!=null&&e.appendChild(typeof c==="string"?document.createTextNode(c):c));return e}
function sec(title,...kids){return h("section",{cls:"sec"},h("h3",{},title),...kids)}
function row(label,o){// o:{get,set,min,max,step,unit,def,id}
  const id="r_"+o.id;const rg=h("input",{type:"range",min:o.min,max:o.max,step:o.step,id:id+"_r","aria-label":label});
  const nb=h("input",{type:"number",step:o.step,id:id+"_n","aria-label":label+" value"});
  const apply=(v,c)=>{v=parseFloat(v);if(isNaN(v))return;o.set(v);rg.value=v;if(document.activeElement!==nb)nb.value=+v.toFixed(3);req();if(c)commit()};
  rg.addEventListener("input",()=>apply(rg.value));rg.addEventListener("change",()=>apply(rg.value,true));
  nb.addEventListener("change",()=>apply(nb.value,true));
  const lab=h("label",{for:id+"_r",title:"Double-click to reset"},label);lab.addEventListener("dblclick",()=>{apply(o.def,true);toast(label+" reset")});
  const r={upd:()=>{const v=o.get();rg.value=v;if(document.activeElement!==nb)nb.value=+(+v).toFixed(3)}};rows.push(r);r.upd();
  return h("div",{cls:"row"},lab,rg,h("div",{cls:"nb"},nb,o.unit?h("span",{},o.unit):null));}
function refreshVals(){rows.forEach(r=>r.upd())}
function btn(label,fn,cls){return h("button",{cls:"btn line"+(cls?" "+cls:""),on:{click:fn}},label)}
function chip(label,on,fn){return h("button",{cls:"chip"+(on?" on":""),on:{click:fn},"aria-pressed":on?"true":"false"},label)}
function toggle(label,val,fn,id){const i=h("input",{type:"checkbox",id});i.checked=val;i.addEventListener("change",()=>fn(i.checked));return h("label",{cls:"toggle"},i,label)}
function colorField(get,set,idp){const c=h("input",{type:"color",id:idp+"_c","aria-label":"Pick colour"}),t=h("input",{type:"text",id:idp+"_t","aria-label":"Colour code"});
  const upd=()=>{const v=get();c.value=/^#[0-9a-f]{6}$/i.test(v)?v:"#000000";t.value=v.toUpperCase()};upd();rows.push({upd});
  c.addEventListener("input",()=>{set(c.value);t.value=c.value.toUpperCase();req()});c.addEventListener("change",commit);
  t.addEventListener("change",()=>{let v=t.value.trim();if(!v.startsWith("#"))v="#"+v;if(/^#[0-9a-f]{6}$/i.test(v)){set(v);upd();req();commit()}else toast("Use a colour code like #D21F26")});
  return h("div",{cls:"color"},c,t,...BRAND.map(([n,v])=>h("button",{cls:"swatch",style:"background:"+v,title:n,"aria-label":n,on:{click:()=>{set(v);upd();req();commit()}}})));}

const ICON={eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'};
function layersSec(){
  const list=h("div",{cls:"layers"});
  [...doc.layers].reverse().forEach(L=>{
    const eye=h("button",{cls:"icon"+(L.vis?"":" off"),title:L.vis?"Hide":"Show","aria-label":(L.vis?"Hide ":"Show ")+L.name,on:{click:()=>{L.vis=!L.vis;commit();rebuild()}}});eye.innerHTML=ICON.eye;
    const lk=h("button",{cls:"icon"+(L.lock?"":" off"),title:L.lock?"Unlock":"Lock","aria-label":(L.lock?"Unlock ":"Lock ")+L.name,on:{click:()=>{L.lock=!L.lock;commit();rebuild()}}});lk.innerHTML=ICON.lock;
    list.appendChild(h("div",{cls:"lay"+(L.id===selId?" on":"")},eye,h("span",{cls:"sw",style:"background:"+L.fill}),h("span",{cls:"nm",role:"button",tabindex:"0",on:{click:()=>{selId=L.id;selNodes.clear();activeSw=0;rebuild()},keydown:e=>{if(e.key==="Enter"){selId=L.id;rebuild()}}}},L.name),lk));
  });
  const L=curL();
  return sec("Layers",list,h("div",{cls:"chips"},
    chip("+ Text",false,()=>{const t=defaultText();t.str="Your text";t.offs=[];t.y=20;const nl=mkLayer({name:"Text",kind:"text",rule:"nonzero",text:t});doc.layers.push(nl);selId=nl.id;commit();rebuild();setTab("text")}),
    chip("Duplicate",false,()=>{if(!L)return;const c=JSON.parse(JSON.stringify(L));c.id="L"+(uid++);c.name=L.name+" copy";c.tf.x+=6;c.tf.y+=6;doc.layers.push(c);selId=c.id;commit();rebuild()}),
    chip("Up",false,()=>{const i=doc.layers.indexOf(L);if(i<0||i===doc.layers.length-1)return;doc.layers.splice(i,1);doc.layers.splice(i+1,0,L);commit();rebuild()}),
    chip("Down",false,()=>{const i=doc.layers.indexOf(L);if(i<=0)return;doc.layers.splice(i,1);doc.layers.splice(i-1,0,L);commit();rebuild()}),
    chip("Delete",false,()=>{if(!L)return;askConfirm("Delete “"+L.name+"”?","Delete",()=>{doc.layers=doc.layers.filter(x=>x!==L);selId=null;commit();rebuild()})})));
}
let confirmBox=null;
function askConfirm(msg,yes,fn){confirmBox={msg,yes,fn};rebuildPane();pane.scrollTop=0}
function confirmSec(){if(!confirmBox)return null;const c=confirmBox;return h("div",{cls:"confirm"},h("strong",{},c.msg),h("div",{cls:"chips"},
  h("button",{cls:"btn solid",on:{click:()=>{confirmBox=null;c.fn();rebuildPane()}}},c.yes),btn("Cancel",()=>{confirmBox=null;rebuildPane()})))}

function shapePane(){
  const L=curL();const out=[confirmSec(),layersSec()];
  if(tool==="nodes")out.push(nodesSec());
  if(tool==="brush")out.push(brushSec());
  if(!L){out.push(h("p",{cls:"hint"},"Click a letter on the board to select it."));out.push(canvasSec());return out}
  out.push(sec("Position and size",
    row("Left / right",{id:"tx",get:()=>L.tf.x,set:v=>L.tf.x=v,min:-200,max:200,step:0.1,def:0}),
    row("Up / down",{id:"ty",get:()=>L.tf.y,set:v=>L.tf.y=v,min:-100,max:100,step:0.1,def:0}),
    row("Width",{id:"sx",get:()=>Math.abs(L.tf.sx)*100,set:v=>L.tf.sx=Math.sign(L.tf.sx||1)*v/100,min:20,max:250,step:0.5,unit:"%",def:100}),
    row("Height",{id:"sy",get:()=>Math.abs(L.tf.sy)*100,set:v=>L.tf.sy=Math.sign(L.tf.sy||1)*v/100,min:20,max:250,step:0.5,unit:"%",def:100}),
    row("Rotate",{id:"rot",get:()=>L.tf.r,set:v=>L.tf.r=v,min:-180,max:180,step:0.1,unit:"°",def:0}),
    row("Slant",{id:"sk",get:()=>L.tf.k,set:v=>L.tf.k=v,min:-45,max:45,step:0.1,unit:"°",def:0}),
    h("div",{cls:"chips"},chip("Flip ↔",false,()=>{L.tf.sx*=-1;commit();req()}),chip("Flip ↕",false,()=>{L.tf.sy*=-1;commit();req()}),
      chip("Same width & height",false,()=>{L.tf.sy=Math.sign(L.tf.sy)*Math.abs(L.tf.sx);commit();refreshVals();req()}),
      chip("Reset position",false,()=>{L.tf={x:0,y:0,sx:1,sy:1,r:0,k:0};commit();refreshVals();req()}))));
  out.push(sec("Colour",colorField(()=>L.fill,v=>L.fill=v,"fill"),
    row("Opacity",{id:"op",get:()=>L.op*100,set:v=>L.op=v/100,min:0,max:100,step:1,unit:"%",def:100}),
    h("div",{cls:"chips"},chip("Use this colour on all layers",false,()=>{doc.layers.forEach(x=>x.fill=L.fill);commit();rebuild()}))));
  out.push(sec("Outline",row("Thickness",{id:"sw",get:()=>L.sw_,set:v=>L.sw_=v,min:0,max:6,step:0.05,def:0}),colorField(()=>L.stroke,v=>L.stroke=v,"stroke"),
    h("p",{cls:"hint"},"Adds a line around the shape. 0 = no outline.")));
  out.push(canvasSec());
  return out;
}
function canvasSec(){
  const bgs=[["Transparent","checker"],["White","#FFFFFF"],["Red","#D21F26"],["Black","#111111"],["Grey","#8A8485"]];
  return sec("Board",h("div",{cls:"chips"},...bgs.map(([n,v])=>chip(n,opts.bg===v,()=>{opts.bg=v;rebuildPane();req()}))),
    row("Grid step",{id:"gs",get:()=>opts.gridSize,set:v=>opts.gridSize=Math.max(0.5,v),min:0.5,max:20,step:0.5,def:5}),
    h("p",{cls:"hint"},"Logo units: the whole logo is 413 × 138. Arrow keys move by 0.1, Shift + arrow by 1."));
}
function nodesSec(){
  const L=curL();if(!L)return sec("Points",h("p",{cls:"hint"},"Click a letter to see its points."));
  if(L.kind==="text")return sec("Points",h("p",{cls:"hint"},"This is live text. Convert it to outlines in the Text tab to edit single points."));
  const k=[...selNodes][0];const parts=[h("p",{cls:"hint"},"Drag a square to move a point. Drag the round handles to bend the curve (Alt = bend one side only). Shift-click or drag a box to pick several. Double-click the outline to add a point. Delete removes points.")];
  if(k){const [ri,i]=k.split(":").map(Number);const getW=()=>{const G=geom(L);const o=G.out[ri]&&G.out[ri][i];return o?[o.x,o.y]:[0,0]};
    const setW=(ax,v)=>{const G=geom(L);const o=G.out[ri][i];const d=ax===0?[v-o.x,0]:[0,v-o.y];selNodes.forEach(kk=>{const [r2,i2]=kk.split(":").map(Number);const db=solveBase(L,G,r2,i2,"node",d);moveBase(L.rings[r2][i2],"node",db[0],db[1])})};
    parts.push(h("strong",{},selNodes.size+" point"+(selNodes.size>1?"s":"")+" selected"),
      row("Point X",{id:"nx",get:()=>getW()[0],set:v=>setW(0,v),min:-50,max:460,step:0.05,def:getW()[0]}),
      row("Point Y",{id:"ny",get:()=>getW()[1],set:v=>setW(1,v),min:-50,max:190,step:0.05,def:getW()[1]}),
      h("div",{cls:"chips"},
        chip("Smooth",false,()=>eachSel(n=>{const vx=n.ox-n.ix,vy=n.oy-n.iy,l=Math.hypot(vx,vy)||1,a=Math.hypot(n.ix-n.x,n.iy-n.y),b=Math.hypot(n.ox-n.x,n.oy-n.y);n.ix=n.x-vx/l*a;n.iy=n.y-vy/l*a;n.ox=n.x+vx/l*b;n.oy=n.y+vy/l*b})),
        chip("Sharp corner",false,()=>eachSel(n=>{n.ix=n.x;n.iy=n.y;n.ox=n.x;n.oy=n.y})),
        chip("Even handles",false,()=>eachSel(n=>{const a=Math.hypot(n.ix-n.x,n.iy-n.y),b=Math.hypot(n.ox-n.x,n.oy-n.y),m=(a+b)/2;if(a)[n.ix,n.iy]=[n.x+(n.ix-n.x)/a*m,n.y+(n.iy-n.y)/a*m];if(b)[n.ox,n.oy]=[n.x+(n.ox-n.x)/b*m,n.y+(n.oy-n.y)/b*m]})),
        chip("Line up across",false,()=>alignSel(1)),chip("Line up down",false,()=>alignSel(0)),
        chip("Delete",false,deleteNodes)));}
  else parts.push(h("p",{cls:"hint"},"No point selected."));
  parts.push(h("div",{cls:"chips"},chip("Select all points",false,()=>{L.rings.forEach((r,ri)=>r.forEach((n,i)=>selNodes.add(ri+":"+i)));rebuildPane();req()}),chip("Clear selection",false,()=>{selNodes.clear();rebuildPane();req()})));
  return sec("Points",...parts);
}
function eachSel(fn){const L=curL();if(!L||L.kind!=="path")return;selNodes.forEach(k=>{const [ri,i]=k.split(":").map(Number);const n=L.rings[ri]&&L.rings[ri][i];if(n)fn(n)});commit();req()}
function alignSel(axis){const L=curL();const G=geom(L);const ks=[...selNodes];if(ks.length<2){toast("Pick two or more points first");return}
  let s=0;ks.forEach(k=>{const [ri,i]=k.split(":").map(Number);s+=axis?G.out[ri][i].y:G.out[ri][i].x});const m=s/ks.length;
  ks.forEach(k=>{const [ri,i]=k.split(":").map(Number);const o=G.out[ri][i];const d=axis?[0,m-o.y]:[m-o.x,0];const db=solveBase(L,G,ri,i,"node",d);moveBase(L.rings[ri][i],"node",db[0],db[1])});commit();req();refreshVals()}
function brushSec(){
  const modes=[["Push","push"],["Thicker","thick"],["Thinner","thin"],["Smooth","smooth"]];
  return sec("Sculpt brush",h("p",{cls:"hint"},"Drag over any line to reshape it gently. Great for the long swash lines. [ and ] change the brush size."),
    h("div",{cls:"chips"},...modes.map(([n,v])=>chip(n,brush.mode===v,()=>{brush.mode=v;rebuildPane()}))),
    row("Brush size",{id:"br",get:()=>brush.r,set:v=>brush.r=v,min:10,max:300,step:1,unit:"px",def:60}),
    row("Strength",{id:"bs",get:()=>brush.str*100,set:v=>brush.str=v/100,min:5,max:100,step:1,unit:"%",def:70}),
    toggle("Work on all letters at once",brush.all,v=>{brush.all=v},"ball"));
}
const SW_ROWS=[
  ["Size","size",0.5,1.6,0.005,"×",1],["Length","reach",0.5,1.8,0.005,"×",1],["Bend","bend",-40,40,0.1,"°",0],["Rotate","rot",-30,30,0.1,"°",0],
  ["Move sideways","lx",-40,40,0.05,"",0],["Move up/down","ly",-40,40,0.05,"",0],["Thickness","thick",-4,6,0.01,"",0],["Tip weight","taper",-4,6,0.01,"",0]];
const CURL_ROWS=[["Curl size","curl",0.5,1.8,0.005,"×",1],["Curl turn","twist",-90,90,0.1,"°",0]];
const PRESETS=[["Original",{}],["Long sweep",{reach:1.25,size:1.03,bend:-5}],["Grand curl",{curl:1.3,size:1.04}],["Tight curl",{curl:0.82,twist:18}],["Bold",{thick:1.1,taper:0.6}],["Fine line",{thick:-0.7,taper:-0.5}],["Lifted",{ly:-5,rot:-3}],["Flat",{bend:8,ly:3,curl:0.9}]];
const NEUTRAL={size:1,reach:1,lx:0,ly:0,rot:0,bend:0,thick:0,taper:0,curl:1,twist:0};
function allSwashes(){const a=[];doc.layers.forEach(L=>L.sw.forEach(s=>a.push(s)));return a}
function swashPane(){
  const L=curL();const out=[confirmSec()];
  out.push(sec("The swash lines",h("p",{cls:"hint"},"The long lines coming out of the two A letters. Blue dot = where the swash starts, diamond = direction and softness of the start, yellow ring = the curl. Drag them on the board, or use the sliders."),
    h("div",{cls:"chips"},...doc.layers.filter(l=>l.sw.length).flatMap(l=>l.sw.map((s,k)=>chip(s.name,l.id===selId&&k===activeSw,()=>{selId=l.id;activeSw=k;if(tool!=="swash")setTool("swash");rebuild()})))),
    toggle("Change both swashes together",opts.link,v=>{opts.link=v;rebuildPane()},"link"),
    toggle("Show the swash area (yellow dots)",opts.region,v=>{opts.region=v;req()},"reg")));
  out.push(sec("Quick styles",h("div",{cls:"chips"},...PRESETS.map(([n,p])=>chip(n,false,()=>{const t=opts.link?allSwashes():(L&&L.sw[activeSw]?[L.sw[activeSw]]:[]);t.forEach(s=>Object.assign(s,NEUTRAL,p));commit();refreshVals();req();toast(n+" applied")})),
    chip("Surprise me",false,()=>{const t=opts.link?allSwashes():(L&&L.sw[activeSw]?[L.sw[activeSw]]:[]);const r=(a,b)=>fx(a+Math.random()*(b-a));const p={size:r(.95,1.08),reach:r(.9,1.25),bend:r(-8,8),rot:r(-3,3),thick:r(-.6,1),taper:r(-.4,.8),curl:r(.85,1.25),twist:r(-15,15)};t.forEach(s=>Object.assign(s,NEUTRAL,p));commit();refreshVals();req();toast("New idea applied. Undo to go back.")}))));
  const s=L&&L.sw[activeSw];
  if(!s){out.push(h("p",{cls:"hint"},L?"This layer has no swash. Pick one of the swashes above, or add one here:":"Pick a swash above."));
    if(L)out.push(h("div",{cls:"chips"},chip("+ Add a swash to “"+L.name+"”",false,()=>{const b=bboxRings(baseRings(L));L.sw.push(newSwash({name:L.name+" swash",jx:fx((b[0]+b[2])/2),jy:fx((b[1]+b[3])/2),cx:fx(b[0]+10),cy:fx(b[3]-10)}));activeSw=L.sw.length-1;commit();rebuild()})));
    return out}
  const tgt=()=>opts.link?allSwashes():[s];
  const mk=([lab,key,mn,mx,st,u,d])=>row(lab,{id:"sw_"+key,get:()=>s[key],set:v=>{const dv=v-s[key];tgt().forEach(t=>t===s?t[key]=v:t[key]=fx(t[key]+dv))},min:mn,max:mx,step:st,unit:u,def:d});
  out.push(sec("Shape of “"+s.name+"”",...SW_ROWS.map(mk),h("p",{cls:"hint"},"Double-click a label to reset it.")));
  out.push(sec("Curl at the end",toggle("Curl control on",s.curlOn,v=>{s.curlOn=v;commit();rebuild()},"curlon"),...CURL_ROWS.map(mk),
    row("Curl area",{id:"cr",get:()=>s.cr,set:v=>s.cr=v,min:2,max:120,step:0.1,def:20})));
  out.push(sec("Where the swash starts",
    row("Start X",{id:"jx",get:()=>s.jx,set:v=>s.jx=v,min:-50,max:460,step:0.05,def:s.jx}),
    row("Start Y",{id:"jy",get:()=>s.jy,set:v=>s.jy=v,min:-50,max:190,step:0.05,def:s.jy}),
    row("Direction",{id:"ang",get:()=>s.ang,set:v=>s.ang=v,min:-180,max:180,step:0.1,unit:"°",def:s.ang}),
    row("Soft start",{id:"bl",get:()=>s.blend,set:v=>s.blend=v,min:2,max:120,step:0.1,def:20}),
    h("div",{cls:"chips"},chip("Reset this swash",false,()=>{Object.assign(s,NEUTRAL);commit();refreshVals();req()}),
      chip(s.on?"Turn swash effect off":"Turn swash effect on",false,()=>{s.on=!s.on;commit();rebuild()}),
      chip("Make the changes permanent",false,()=>{if(L.kind!=="path"){toast("Only for letters, not live text");return}askConfirm("Bake the swash changes into the letter outline? The sliders go back to zero but the shape stays.","Make permanent",()=>{bake(L,activeSw)})}))));
  return out;
}
function bake(L,k){const G=geom(L);const s=L.sw[k];const ctx=G.ctx.filter(c=>c.s===s);
  L.rings=G.R.map((r,ri)=>r.map((n,i)=>{const p=mapNode(n,G.N[ri][i],ctx);return {x:p[0][0],y:p[0][1],ix:p[1][0],iy:p[1][1],ox:p[2][0],oy:p[2][1]}}));
  Object.assign(s,NEUTRAL);commit();rebuild();toast("Swash baked into the outline")}
function textPane(){
  const L=curL();const out=[confirmSec()];
  if(!L||L.kind!=="text"){out.push(sec("Text",h("p",{cls:"hint"},"Select the “Ideas For Business” layer (or add a new text in the Shape tab) to edit text."),
    h("div",{cls:"chips"},...doc.layers.filter(l=>l.kind==="text").map(l=>chip(l.name,false,()=>{selId=l.id;rebuild()})))));return out}
  const t=L.text;
  const inp=h("input",{type:"text",id:"txt",value:t.str});
  inp.addEventListener("input",()=>{const old=t.str;t.str=inp.value;while(t.offs.length<t.str.length)t.offs.push([0,0]);t.offs.length=t.str.length;if(L.name===old||L.name==="Text")L.name=t.str||"Text";req()});
  inp.addEventListener("change",()=>{commit();rebuild()});
  const wsel=h("select",{id:"wsel"},...Object.keys(FONT).map(w=>{const o=h("option",{value:w},({"300":"Light","400":"Regular","500":"Medium","560":"Logo weight","600":"Semi-bold","700":"Bold","800":"Extra-bold"})[w]+" ("+w+")");if(w===t.w)o.selected=true;return o}));
  wsel.addEventListener("change",()=>{t.w=wsel.value;commit();req()});
  out.push(sec("Text",h("div",{cls:"field"},h("label",{for:"txt"},"Words"),inp),h("div",{cls:"field"},h("label",{for:"wsel"},"Weight"),wsel),
    row("Letter height",{id:"cap",get:()=>t.cap,set:v=>t.cap=v,min:2,max:80,step:0.01,def:16.21}),
    row("Letter spacing",{id:"trk",get:()=>t.track,set:v=>t.track=v,min:-150,max:400,step:1,def:0}),
    row("X",{id:"tx2",get:()=>t.x,set:v=>t.x=v,min:-100,max:460,step:0.05,def:218.175}),
    row("Baseline Y",{id:"ty2",get:()=>t.y,set:v=>t.y=v,min:-50,max:220,step:0.05,def:136.083}),
    h("div",{cls:"chips"},chip("Line up right edge with T",false,()=>alignText("right")),chip("Line up left edge with T",false,()=>alignText("left")),chip("Centre under the logo",false,()=>alignText("center")),
      chip("Back to the fixed tagline",false,()=>{L.text=defaultText();commit();rebuild()}))));
  const chars=[...t.str];if(activeLetter>=chars.length)activeLetter=0;
  out.push(sec("One letter at a time",h("p",{cls:"hint"},"Pick a letter, then nudge it. Useful for fine spacing."),
    h("div",{cls:"letters"},...chars.map((c,i)=>c===" "?null:h("button",{cls:i===activeLetter?"on":"",on:{click:()=>{activeLetter=i;rebuildPane()}}},c))),
    chars.length?row("Letter left/right",{id:"lx_"+activeLetter,get:()=>(t.offs[activeLetter]||[0,0])[0],set:v=>{t.offs[activeLetter]=t.offs[activeLetter]||[0,0];t.offs[activeLetter][0]=v},min:-10,max:10,step:0.01,def:0}):null,
    chars.length?row("Letter up/down",{id:"ly_"+activeLetter,get:()=>(t.offs[activeLetter]||[0,0])[1],set:v=>{t.offs[activeLetter]=t.offs[activeLetter]||[0,0];t.offs[activeLetter][1]=v},min:-10,max:10,step:0.01,def:0}):null));
  out.push(sec("Edit the letter shapes",h("p",{cls:"hint"},"Turns the text into shapes so you can move single points and sculpt it. The words can no longer be retyped afterwards."),
    h("div",{cls:"chips"},chip("Convert to outlines",false,()=>askConfirm("Convert “"+t.str+"” to outlines?","Convert",()=>{L.rings=JSON.parse(JSON.stringify(buildText(t)));L.kind="path";delete L.text;commit();rebuild();toast("Converted. Use the Points tool to edit.")})))));
  return out;
}
function alignText(mode){const L=curL(),T=doc.layers.find(l=>l.name==="T")||doc.layers[2];if(!T)return;
  const tb=curveBBox(geom(T).out),xb=curveBBox(geom(L).out);let dx=0;
  if(mode==="right")dx=tb[2]-xb[2];else if(mode==="left")dx=tb[0]-xb[0];else{let b=[1e9,0,-1e9,0];doc.layers.forEach(l=>{if(l===L||!l.vis)return;const c=curveBBox(geom(l).out);b[0]=Math.min(b[0],c[0]);b[2]=Math.max(b[2],c[2])});dx=(b[0]+b[2])/2-(xb[0]+xb[2])/2}
  L.text.x=fx(L.text.x+dx/(L.tf.sx||1));commit();refreshVals();req()}
let lastPNG=null,lastSVG="";
function exportPane(){
  const out=[confirmSec()];
  out.push(sec("Export",h("p",{cls:"hint"},"Files have a transparent background and contain only the visible layers."),
    row("PNG width",{id:"ew",get:()=>exp.w,set:v=>exp.w=Math.round(v),min:500,max:10000,step:100,unit:"px",def:4000}),
    row("Margin",{id:"ep",get:()=>exp.pad,set:v=>exp.pad=v,min:0,max:60,step:0.5,def:4}),
    h("div",{cls:"chips"},h("button",{cls:"btn solid",on:{click:()=>doExport("png")}},"Save PNG"),h("button",{cls:"btn solid",on:{click:()=>doExport("svg")}},"Save SVG"),btn("Copy SVG code",copySVG)),
    h("div",{id:"expOut",cls:"sec"})));
  out.push(sec("Your work",h("p",{cls:"hint"},"Your edits are kept in this browser automatically. Save a project file to keep a copy or move to another computer."),
    h("div",{cls:"chips"},btn("Save project file",()=>{saveFile("aat-logo-project.json",new Blob([snap()],{type:"application/json"}))}),btn("Open project file",()=>$("#fileIn").click()),
      btn("Start over",()=>askConfirm("Throw away all changes and go back to the fixed logo?","Start over",()=>{doc=defaultDoc();selId=doc.layers[0].id;commit();rebuild();fit()})))));
  out.push(sec("Shortcuts",h("p",{cls:"hint"},"V move · A points · S swash · B sculpt · H hand (or hold Space) · Ctrl+Z undo · Ctrl+Y redo · 0 fit · + / − zoom · arrows nudge 0.1 (Shift = 1) · Shift while dragging keeps a straight line.")));
  return out;
}
function buildSVG(){const vis=doc.layers.filter(L=>L.vis);if(!vis.length)return null;let b=[1e9,1e9,-1e9,-1e9];const parts=[];
  vis.forEach(L=>{const G=geom(L);const c=curveBBox(G.out);const sw=L.sw_>0?L.sw_/2:0;b=[Math.min(b[0],c[0]-sw),Math.min(b[1],c[1]-sw),Math.max(b[2],c[2]+sw),Math.max(b[3],c[3]+sw)];
    parts.push(`<path fill="${L.fill}" fill-rule="${L.rule}"${L.op<1?` opacity="${L.op}"`:""}${L.sw_>0?` stroke="${L.stroke}" stroke-width="${L.sw_}" stroke-linejoin="round"`:""} d="${dOf(G.out,3)}"/>`)});
  const p=exp.pad;const x=fx(b[0]-p),y=fx(b[1]-p),w=fx(b[2]-b[0]+2*p),hh=fx(b[3]-b[1]+2*p);
  return {w,h:hh,str:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${hh}" width="${w}" height="${hh}">\n${parts.join("\n")}\n</svg>\n`}}
let dl=null;
async function saveFile(name,blob){
  try{if(!dl&&window.claude&&window.claude.use)dl=await window.claude.use("downloads")}catch(e){}
  if(dl){try{await dl.save({filename:name,data:blob});toast("Saved "+name);return true}catch(e){if(e&&e.code==="declined"){toast("Save cancelled");return false}}}
  toast("Saving files isn't available here. Use the preview below: right-click it (or long-press) and choose Save.");return false}
async function doExport(kind){const s=buildSVG();if(!s){toast("Nothing visible to export");return}lastSVG=s.str;const box=$("#expOut");box.textContent="";
  if(kind==="svg"){const ok=await saveFile("AAT-logo.svg",new Blob([s.str],{type:"image/svg+xml"}));showPreview(URL.createObjectURL(new Blob([s.str],{type:"image/svg+xml"})),"SVG");return}
  const img=new Image();img.onload=()=>{const W2=exp.w,H2=Math.round(W2*s.h/s.w);const c=document.createElement("canvas");c.width=W2;c.height=H2;c.getContext("2d").drawImage(img,0,0,W2,H2);
    c.toBlob(async b=>{showPreview(URL.createObjectURL(b),"PNG "+W2+" × "+H2+" px");await saveFile("AAT-logo-"+W2+".png",b)},"image/png")};
  img.onerror=()=>toast("Could not draw the PNG");img.src=URL.createObjectURL(new Blob([s.str],{type:"image/svg+xml"}))}
function showPreview(url,label){const box=$("#expOut");box.textContent="";box.appendChild(h("strong",{},"Preview · "+label));box.appendChild(h("img",{src:url,cls:"preview",alt:"Exported logo preview"}))}
function copySVG(){const s=buildSVG();if(!s)return;const box=$("#expOut");box.textContent="";const ta=h("textarea",{cls:"code",readonly:"",id:"svgcode"});ta.value=s.str;box.appendChild(ta);
  try{navigator.clipboard.writeText(s.str).then(()=>toast("SVG code copied"),()=>{ta.select();toast("Press Ctrl+C to copy the selected code")})}catch(e){ta.select();toast("Press Ctrl+C to copy the selected code")}}
$("#fileIn").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.layers||!Array.isArray(d.layers))throw 0;restore(r.result);commit();rebuild();fit();toast("Project opened")}catch(err){toast("That file is not an AAT Logo Studio project")}};r.readAsText(f);e.target.value=""});

function rebuildPane(){rows=[];pane.textContent="";const parts=tab==="shape"?shapePane():tab==="swash"?swashPane():tab==="text"?textPane():exportPane();parts.forEach(p=>p&&pane.appendChild(p))}
function rebuild(){rebuildPane();req();document.querySelectorAll(".tabs button").forEach(b=>{b.classList.toggle("on",b.dataset.tab===tab)})}
function setTab(t){tab=t;rebuild()}
function setTool(t){tool=t;document.querySelectorAll(".tool").forEach(b=>b.classList.toggle("on",b.dataset.tool===t));
  if(t==="swash"){tab="swash";const L=curL();if(!L||!L.sw.length){const f=doc.layers.find(l=>l.sw.length);if(f){selId=f.id;activeSw=0}}}
  else if(t==="nodes"||t==="brush"){tab="shape";const L=curL();if(!L){const f=doc.layers.find(l=>l.kind==="path");if(f)selId=f.id}}
  svg.style.cursor=t==="pan"?"grab":t==="brush"?"none":"default";hoverPt=null;rebuild()}
const HINTS={move:"Click a letter to select it, drag to move it.",nodes:"Drag points and handles. Double-click the outline to add a point.",swash:"Drag the blue dot, diamond and yellow ring to reshape a swash.",brush:"Drag across a line to sculpt it.",pan:"Drag to move around the board."};
function updateStatus(){const L=curL();$("#selInfo").innerHTML=L?"Selected <b>"+L.name.replace(/[<>&]/g,"")+"</b>":"Nothing selected";$("#hint").textContent=HINTS[tool]}
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,2600)}

document.querySelectorAll(".tool").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
document.querySelectorAll(".tabs button").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.tab==="text"){const L=curL();if(!L||L.kind!=="text"){const f=doc.layers.find(l=>l.kind==="text");if(f)selId=f.id}}setTab(b.dataset.tab)}));
$("#undo").addEventListener("click",undo);$("#redo").addEventListener("click",redo);
$("#zin").addEventListener("click",()=>zoomAt(center(),1.25));$("#zout").addEventListener("click",()=>zoomAt(center(),0.8));$("#zfit").addEventListener("click",fit);
const tb=(id,key)=>{const b=$(id);const upd=()=>b.classList.toggle("on",opts[key]);upd();b.addEventListener("click",()=>{opts[key]=!opts[key];upd();req()})};
tb("#ghostBtn","ghost");tb("#gridBtn","grid");tb("#snapBtn","snap");
new ResizeObserver(()=>req()).observe(board);

/* ---------- start ---------- */
(function(){const g=defaultDoc();ghostD=g.layers.map(L=>dOf(geom(L).out,2)).join("");
  let s=null;try{s=localStorage.getItem("aat-logo-studio")}catch(e){}
  if(s){try{restore(s)}catch(e){doc=g;lastSaved=snap()}}else{doc=g;lastSaved=snap()}
  selId=(doc.layers.find(l=>l.sw.length)||doc.layers[0]||{}).id||null;syncUndo();rebuild();requestAnimationFrame(fit);})();
window.__studio={get doc(){return doc},setTool,fit};
})();
