import json
w,h=map(float,open('mark/swash_path.txt').readline().split()); SW=open('mark/swash_path.txt').read().split('\n',1)[1]
def u(tr): return '<path d="%s" transform="%s"/>'%(SW,tr)
cx,cy=w/2,h/2
def place(x,y,s,rot=0,flip=False):
    # put swash centre at x,y, scaled s, rotated rot deg
    return u('translate(%g %g) rotate(%g) scale(%g %g) translate(%g %g)'%(x,y,rot,-s if flip else s,s,-cx,-cy))
def rot_about(px,py,s,rot,ox,oy):  # swash with anchor point (ox,oy in swash coords) placed at px,py
    return u('translate(%g %g) rotate(%g) scale(%g) translate(%g %g)'%(px,py,rot,s,-ox,-oy))
M={}
M['swash']=('المطّة','The Swash','المطّة الطويلة لحرف A مأخوذة من الشعار نفسه: حركة واحدة تبدأ بالدائرة وتصعد للأعلى، تعني الانطلاق والنمو.',place(104,100,1.0))
M['twin']=('الموجتان','Twin Waves','مطّتان متتاليتان كما يتكرّر حرف A في الشعار: العالم العربي وآسيا، يسيران معاً بنفس الإيقاع.',place(66,120,0.68)+place(146,84,0.52))
M['seal']=('الختم','The Seal','المطّة داخل حلقة: ختم ثقة مثل الأختام القديمة في التجارة، يصلح كأيقونة دائرية.','<circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width="8"/>'+place(100,104,0.72))
M['meet']=('اللقاء','The Meeting','مطّتان متقابلتان تلتقيان في القمّة: الشرق الأوسط وآسيا يلتقيان في نقطة واحدة.',place(51.1,88+30,0.56)+place(148.9,88+30,0.56,flip=True))
# triad/four: anchor at the ball centre roughly (approx 20,108 in swash coords?) use tip region; rotate about card centre
M['triad']=('الثلاثية','The Triad','ثلاث مطّات تدور حول مركز واحد، واحدة لكل كلمة: عربي، آسيوي، تجارة، في حركة مستمرة.',''.join(rot_about(100,104,0.52,a,175.5,0) for a in (180,300,60)))
M['compass']=('البوصلة','The Compass','أربع مطّات في الاتجاهات الأربعة: تجارة تصل إلى كل جهات العالم.',''.join(rot_about(100,100,0.46,a,175.5,0) for a in (180,270,0,90)))
json.dump(M,open('mark/marks.json','w'),ensure_ascii=False)
for k,v in M.items():
    for c,col in (('red','#D21F26'),('white','#FFFFFF'),('black','#000000')):
        open('mark/AAT-symbol-%s-%s.svg'%(k,c),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="%s" color="%s">%s</svg>'%(col,col,v[3]))
