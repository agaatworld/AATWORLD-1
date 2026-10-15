const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());const p=await b.newPage({viewport:{width:1800,height:1100}});
for(const f of fs.readdirSync('mark').filter(x=>/^s_.*html$/.test(x)).sort()){await p.goto('file://'+process.cwd()+'/mark/'+f);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);await p.screenshot({path:'mark/'+f.replace('s_','AAT-symbol-sheet-').replace('.html','.png')});}
await b.close()})()
