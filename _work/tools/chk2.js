const {chromium}=require('./cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:900}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});
await p.goto('http://localhost:8765/#exhibitions');await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>location.hash+' '+document.querySelectorAll('.er').length));await b.close()})()
