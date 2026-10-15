const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());const p=await b.newPage({viewport:{width:1500,height:560}});
const ks=['swash','twin','seal','rise','triad','embrace'];
let h='<body style="margin:0;display:flex;flex-wrap:wrap;gap:20px;padding:20px;background:#eee">'+ks.map(k=>'<div style="width:220px;height:220px;background:#fff;display:flex;align-items:center;justify-content:center">'+fs.readFileSync('mark/AAT-symbol-'+k+'-red.svg','utf8').replace('<svg ','<svg width="200" height="200" ')+'</div>').join('')+ks.map(k=>'<div style="width:220px;height:220px;background:#D21F26;display:flex;align-items:center;justify-content:center">'+fs.readFileSync('mark/AAT-symbol-'+k+'-white.svg','utf8').replace('<svg ','<svg width="200" height="200" ')+'</div>').join('');
await p.setContent(h);await p.screenshot({path:'mark/prev.png'});await b.close()})()
