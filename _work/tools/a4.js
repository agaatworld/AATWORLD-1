const {chromium}=require('./cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:900}});
for(const n of [1,6,2,96]){await p.goto('http://localhost:8765/issue560/index.html#p-'+n);await p.waitForTimeout(1800);await p.screenshot({path:'mg'+n+'.png'});}
await b.close()})()
