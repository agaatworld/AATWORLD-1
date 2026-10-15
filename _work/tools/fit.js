const {chromium}=require('./cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h] of [[1366,768],[1920,1080],[1280,1024]]){const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/issue560/index.html#p-6');await p.waitForTimeout(1800);await p.screenshot({path:`fit${w}.png`});
console.log(w,h,await p.evaluate(()=>{const e=document.querySelector('.stf__parent,.stf__wrapper,#book');const r=e?e.getBoundingClientRect():null;return r?[Math.round(r.width),Math.round(r.height),document.getElementById('stage').scrollHeight,document.getElementById('stage').clientHeight]:'?'}));await p.close()}
await b.close()})()
