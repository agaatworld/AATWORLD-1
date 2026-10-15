const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());const p=await b.newPage({viewport:{width:4130,height:1380}});
for(const c of ['red','white','black']){const svg=fs.readFileSync('logo/AAT-logo-'+c+'.svg','utf8').replace('<svg ','<svg width="4130" height="1380" ');
await p.setContent('<style>html,body{margin:0;background:transparent}</style>'+svg);await p.screenshot({path:'logo/AAT-logo-'+c+'.png',omitBackground:true});
await p.setContent('<style>@page{size:551px 184px;margin:0}html,body{margin:0}</style>'+svg.replace('width="4130" height="1380"','width="551px" height="184px"'));await p.pdf({path:'logo/AAT-logo-'+c+'.pdf',width:'551px',height:'184px',printBackground:false,pageRanges:'1'});}
await b.close()})()
