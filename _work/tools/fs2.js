const {chromium}=require('/tmp/claude-0/-home-claude/3d82459c-1cb2-560a-871e-3578e4d8b00b/scratchpad/cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:800}});
await p.goto('http://localhost:8765/#flip');await p.waitForTimeout(2500);
console.log('before',await p.evaluate(()=>!!document.fullscreenElement));
const f=p.frameLocator('iframe');await f.locator('body').click({position:{x:600,y:400}});await p.waitForTimeout(800);
console.log('after tap inside',await p.evaluate(()=>!!document.fullscreenElement));
await p.goto('http://localhost:8765/');await p.waitForTimeout(1200);
await p.click('a.hero-cover');await p.waitForTimeout(800);console.log('cover click',await p.evaluate(()=>!!document.fullscreenElement));
await b.close()})()
