import json,re
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
from shapely import affinity as A
from shapely import wkt
lines=open('mark/swash_path.txt').read().split('\n',1)[1]
rings=[[tuple(map(float,p.split())) for p in r.strip('MZ').split(' L')] for r in re.findall(r'M[^Z]+Z',lines)]
import smooth
SW=smooth.swash()
W,H=SW.bounds[2],SW.bounds[3]
def cp(s=1,rot=0,x=0,y=0,flip=False,origin=(0,0)):
    g=A.scale(SW,-1 if flip else 1,1,origin=(W/2,H/2)) if flip else SW
    g=A.rotate(g,rot,origin=origin) ; g=A.scale(g,s,s,origin=(0,0)); return A.translate(g,x,y)
TIP=(175,1)
def fit(g,margin=12,ring=None):
    minx,miny,maxx,maxy=g.bounds; s=(200-2*margin)/max(maxx-minx,maxy-miny)
    g=A.scale(g,s,s,origin=(0,0)); minx,miny,maxx,maxy=g.bounds
    return A.translate(g,100-(minx+maxx)/2,100-(miny+maxy)/2)
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g]; o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors): o+='M'+' L'.join('%.2f %.2f'%c for c in r.coords)+'Z'
    return '<path fill-rule="evenodd" d="%s"/>'%o
M={}
M['swash']=('المطّة','The Swash','المطّة الطويلة لحرف A مأخوذة من الشعار نفسه: حركة واحدة تبدأ بالدائرة وتصعد للأعلى، تعني الانطلاق والنمو.',fit(SW,22))
M['twin']=('الموجتان','Twin Waves','مطّتان متتاليتان كما يتكرّر حرف A في الشعار: العالم العربي وآسيا، يسيران معاً بنفس الإيقاع.',fit(unary_union([cp(1),cp(0.8,x=178,y=-30)]),16))
inner=fit(SW,52); M['seal']=('الختم','The Seal','المطّة داخل حلقة: ختم ثقة مثل الأختام القديمة في التجارة، يصلح أيقونةً دائرية.',unary_union([inner,Point(100,100).buffer(88).difference(Point(100,100).buffer(80))]))
M['rise']=('الصعود','Three Rising','ثلاث مطّات يكبر حجمها من اليسار لليمين، واحدة لكل كلمة: عربي، آسيوي، تجارة، وتعني النمو.',fit(unary_union([cp(0.55,x=0,y=H*0.45),cp(0.75,x=104,y=H*0.25),cp(1,x=240,y=0)]),12))
M['triad']=('الثلاثية','The Triad','ثلاث مطّات تلتقي أطرافها في المركز وتدور معاً: الكلمات الثلاث في حركة مستمرة.',fit(unary_union([cp(rot=a,origin=TIP) for a in (0,120,240)]),12))
M['embrace']=('العناق','The Embrace','مطّتان متعاكستان تحتضن كل منهما الأخرى: شراكة متبادلة بين الشرق الأوسط وآسيا.',fit(unary_union([cp(1),cp(1,rot=180,origin=(W/2,H/2),x=86,y=-18)]),14))
json.dump({k:[a,b,c,path(g)] for k,(a,b,c,g) in M.items()},open('mark/marks.json','w'),ensure_ascii=False)
for k,(a,b,c,g) in M.items():
    for cn,col in (('red','#D21F26'),('white','#FFFFFF'),('black','#000000')):
        open('mark/AAT-symbol-%s-%s.svg'%(k,cn),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="%s">%s</svg>'%(col,path(g)))
