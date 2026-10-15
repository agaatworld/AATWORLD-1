const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
const p=await b.newPage({viewport:{width:1050,height:600},deviceScaleFactor:3});
for(const f of ['front','back']){await p.goto('file://'+process.cwd()+'/bc/'+f+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);await p.screenshot({path:'bc/AAT-business-card-'+f+'.png'});}
const q=await b.newPage({viewport:{width:1150,height:1400},deviceScaleFactor:1});await q.goto('file://'+process.cwd()+'/bc/both.html');await q.evaluate(()=>document.fonts.ready);await q.waitForTimeout(300);await q.screenshot({path:'bc/preview.png',fullPage:true});await b.close()})()
;(async()=>{const {chromium}=require('playwright');const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());const p=await b.newPage();
for(const f of ['front','back']){await p.goto('file://'+process.cwd()+'/bc/'+f+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.pdf({path:'bc/AAT-business-card-'+f+'.pdf',width:'3.5in',height:'2in',scale:0.32,printBackground:true,pageRanges:'1'});}await b.close()})()
