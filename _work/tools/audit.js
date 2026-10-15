const {chromium}=require('./cards/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1366,height:900}});
await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);
const lang=await p.evaluate(()=>document.documentElement.lang);console.log('lang',lang);
// switch to Arabic if needed
await p.evaluate(()=>{try{localStorage.setItem('aat.lang','ar')}catch(e){}});
const txt=await p.evaluate(()=>document.body.innerText);
for(const w of ['مقاطع','تشغيل الكل','التقويم','علامات','شركاؤنا','استكشف','عن المجلة','معلنو','الأشهر','نادي الأعمال','مجموعة AAT','Explore','three months','Calendar','Brands','Reels','Play all','About the magazine'])console.log(w, txt.includes(w));
await p.screenshot({path:'audit-home.png',fullPage:true});
const h=await p.evaluate(()=>document.body.scrollHeight);console.log('h',h);
await b.close()})()
