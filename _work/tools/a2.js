const {chromium}=require('./cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:900}});
await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);
const t=await p.evaluate(()=>document.body.innerText);let i=t.indexOf('معلنو');console.log(t.slice(i-200,i+200));
console.log('---H2s', await p.$$eval('h2',h=>h.map(x=>x.innerText.trim()).join(' | ')));
await b.close()})()
