import json
M=json.load(open('mark/marks.json'))
logo=open('aat-logo-red.svg').read(); logow=open('aat-logo-white.svg').read()
def sym(k,col,size,extra=''): return '<svg viewBox="0 0 200 200" width="%d" height="%d" fill="%s" style="display:block;%s">%s</svg>'%(size,size,col,extra,M[k][3])
def lg(svg,w): return svg.replace('<svg ','<svg width="%d" height="%d" style="display:block" '%(w,w*138/413),1)
css=''.join('<link rel="stylesheet" href="../node_modules/@fontsource/alexandria/%d.css">'%w for w in (400,500,700,800))
BASE='<!doctype html><meta charset="utf-8">'+css+'<style>body{margin:0;font-family:Alexandria,sans-serif;color:#1b1a18}.t{border-radius:22px;overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative}.l{font-size:22px;font-weight:700;color:#6b655c;margin-top:10px}</style>'
for i,(k,(ar,en,desc,p)) in enumerate(M.items(),1):
    pat='<svg width="100%%" height="100%%" style="position:absolute;inset:0"><defs><pattern id="p" width="90" height="90" patternUnits="userSpaceOnUse"><g transform="translate(15 15) scale(.3)" fill="#D21F26" opacity=".9">%s</g><g transform="translate(60 60) scale(.15)" fill="#D21F26" opacity=".35">%s</g></pattern></defs><rect width="100%%" height="100%%" fill="#FFF1EF"/><rect width="100%%" height="100%%" fill="url(#p)"/></svg>'%(p,p)
    h=BASE+'<div style="width:1800px;height:1100px;box-sizing:border-box;padding:50px;background:#F3EFEA;display:grid;grid-template-columns:700px 1fr;gap:40px">'
    h+='<div style="display:flex;flex-direction:column;gap:24px"><div class="t" style="background:#fff;height:700px;box-shadow:0 20px 40px -26px rgba(0,0,0,.4)">'+sym(k,'#D21F26',520)+'</div>'
    h+='<div style="font-size:30px;font-weight:800;color:#D21F26;letter-spacing:2px">%d · %s</div><div dir="rtl" style="font-size:52px;font-weight:800;line-height:1.1;text-align:right">%s</div><div dir="rtl" style="font-size:27px;font-weight:500;line-height:1.6;text-align:right">%s</div></div>'%(i,en.upper(),ar,desc)
    h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:300px 300px 300px;gap:30px">'
    cell=lambda inner,bg,lab,span='': '<div style="%s"><div class="t" style="background:%s;height:%s">%s</div><div class="l">%s</div></div>'%(span,bg,'100%' if not span else '100%',inner,lab)
    h+='<div><div class="t" style="background:linear-gradient(135deg,#7A0A10,#D21F26 55%,#FF5A4E);height:255px">'+sym(k,'#fff',200)+'</div><div class="l">On red · على الأحمر</div></div>'
    h+='<div><div class="t" style="background:#fff;height:255px"><div style="width:180px;height:180px;border-radius:40px;background:linear-gradient(135deg,#FF5A4E,#D21F26 55%,#7A0A10);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px -14px rgba(122,10,16,.8)">'+sym(k,'#fff',140)+'</div></div><div class="l">App icon · أيقونة التطبيق</div></div>'
    h+='<div><div class="t" style="background:#fff;height:255px;gap:26px">'+sym(k,'#1b1a18',120)+sym(k,'#1b1a18',64)+sym(k,'#1b1a18',32)+'</div><div class="l">Black · small sizes</div></div>'
    h+='<div style="grid-column:span 2"><div class="t" style="background:#fff;height:255px;gap:34px">'+sym(k,'#D21F26',160)+'<div style="width:3px;height:130px;background:#E6D9D6"></div>'+lg(logo,330)+'</div><div class="l">Lockup with the logo · الرمز مع الشعار</div></div>'
    h+='<div><div class="t" style="background:#1b1a18;height:255px">'+sym(k,'#fff',190)+'</div><div class="l">On dark · على الداكن</div></div>'
    h+='<div style="grid-column:span 3"><div class="t" style="height:255px">'+pat+'</div><div class="l">Pattern for paper, bags, backgrounds · نقشة للأوراق والأكياس والخلفيات</div></div>'
    h+='</div></div>'
    open('mark/s_%d_%s.html'%(i,k),'w').write(h)
# overview
h=BASE+'<div style="width:1800px;height:1100px;box-sizing:border-box;padding:50px;background:#F3EFEA"><div style="font-size:44px;font-weight:800;margin-bottom:30px">AAT symbol · six options <span dir="rtl" style="color:#D21F26">· رمز AAT ستة خيارات</span></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:30px">'
for i,(k,(ar,en,desc,p)) in enumerate(M.items(),1):
    h+='<div style="background:#fff;border-radius:22px;height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;box-shadow:0 20px 40px -26px rgba(0,0,0,.4)">'+sym(k,'#D21F26',280)+'<div style="font-size:30px;font-weight:800"><span style="color:#D21F26">%d</span> · %s · <span dir="rtl">%s</span></div></div>'%(i,en,ar)
open('mark/s_0_all.html','w').write(h+'</div></div>')
