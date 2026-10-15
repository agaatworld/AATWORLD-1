const {chromium}=require('./cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:900}});
await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);
const H=await p.evaluate(()=>document.body.scrollHeight);let i=0;
for(let y=0;y<H;y+=850){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(700);await p.screenshot({path:'sc'+(i++)+'.png'});}
console.log(i);await b.close()})()
