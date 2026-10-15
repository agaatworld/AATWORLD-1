const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());const p=await b.newPage({viewport:{width:1920,height:1300}});
fs.mkdirSync('png',{recursive:true});
for(const f of fs.readdirSync('.').filter(x=>/^r_.*\.html$/.test(x)).sort()){await p.goto('file://'+process.cwd()+'/'+f);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
const bad=await p.evaluate(()=>{const o=[];document.querySelectorAll('div[style*="justify-content: center; text-align"]').forEach((c,i)=>{const r=c.getBoundingClientRect();let top=1e9,bot=-1e9,l=1e9,rt=-1e9;[...c.children].forEach(e=>{const q=e.getBoundingClientRect();top=Math.min(top,q.top);bot=Math.max(bot,q.bottom);l=Math.min(l,q.left);rt=Math.max(rt,q.right)});o.push([i,Math.round(top-r.top),Math.round(r.bottom-bot),Math.round(l-r.left),Math.round(r.right-rt)])});return o});
console.log(f,JSON.stringify(bad));await p.screenshot({path:'png/'+f.replace('r_','AAT-card-').replace('.html','.png')});}
await b.close()})()
