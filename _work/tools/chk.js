const {chromium}=require('./cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/#exhibitions');await p.waitForTimeout(1500);
const chips=await p.$$eval('.chip',c=>c.map(x=>x.innerText.replace(/\s+/g,' ')).join(' | '));console.log(chips);
await p.click('[data-exc="id"]').catch(()=>{});await p.waitForTimeout(500);await p.screenshot({path:'k-ex.png'});
await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);await p.evaluate(()=>window.scrollTo(0,1100));await p.waitForTimeout(900);await p.screenshot({path:'k-home.png'});
const t=await p.evaluate(()=>document.body.innerText);for(const w of ['غرفة الأخبار','من مجلة هذا الشهر','يوماً حتى'])console.log(w,t.includes(w));
await p.goto('http://localhost:8765/issue560/index.html#p-1');await p.waitForTimeout(1800);await p.dispatchEvent('#mBtn','mouseenter');await p.waitForTimeout(500);await p.screenshot({path:'k-mag.png'});
console.log('errs',errs);await b.close()})()
