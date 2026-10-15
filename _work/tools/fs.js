const {chromium}=require('/tmp/claude-0/-home-claude/3d82459c-1cb2-560a-871e-3578e4d8b00b/scratchpad/cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:800}});
await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);
const links=await p.$$eval('a',as=>as.filter(a=>/flip|magazine|issue/i.test(a.getAttribute('href')||'')).map(a=>[a.getAttribute('href'),a.className,(a.textContent||'').trim().slice(0,30),a.offsetParent!==null]));
console.log(JSON.stringify(links,null,0));
for(const sel of ['header a[href^="#flip"]','a[href^="#flip"]']){const h=await p.$(sel);if(!h){console.log('none',sel);continue}
 const vis=await h.isVisible();if(!vis){console.log('hidden',sel);continue}
 await h.click();await p.waitForTimeout(800);console.log(sel,'fs=',await p.evaluate(()=>!!document.fullscreenElement),await p.evaluate(()=>location.hash));
 await p.evaluate(()=>document.exitFullscreen&&document.fullscreenElement&&document.exitFullscreen());await p.goto('http://localhost:8765/');await p.waitForTimeout(1000);}
await b.close()})()
