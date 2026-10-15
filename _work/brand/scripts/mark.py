import math,json
def bz(p,t):
    (x0,y0),(x1,y1),(x2,y2),(x3,y3)=p;u=1-t
    return (u**3*x0+3*u*u*t*x1+3*u*t*t*x2+t**3*x3, u**3*y0+3*u*u*t*y1+3*u*t*t*y2+t**3*y3)
def stroke(p,w0,w1,ease=lambda t:t,n=90):
    L=[];R=[]
    for i in range(n+1):
        t=i/n;x,y=bz(p,t);x2,y2=bz(p,min(1,t+1e-3));x1,y1=bz(p,max(0,t-1e-3))
        dx,dy=x2-x1,y2-y1;l=math.hypot(dx,dy) or 1;nx,ny=-dy/l,dx/l
        w=(w0+(w1-w0)*ease(t))/2;L.append((x+nx*w,y+ny*w));R.append((x-nx*w,y-ny*w))
    pts=L+R[::-1]
    return '<path d="M'+' L'.join('%.1f %.1f'%q for q in pts)+'Z"/>'
def ball(x,y,r): return '<circle cx="%g" cy="%g" r="%g"/>'%(x,y,r)
def ring(x,y,r,w): return '<circle cx="%g" cy="%g" r="%g" fill="none" stroke="currentColor" stroke-width="%g"/>'%(x,y,r,w)
sm=lambda t:t*t*(3-2*t)
M={}
# 1 Swash: the long stroke of the A, alone
M['swash']=('المطّة','The Swash','المطّة الطويلة لحرف A وحدها: حركة واحدة تبدأ بالدائرة وتصعد للأعلى، تعني الانطلاق والنمو.',
 ball(46,96,15)+stroke([(46,96),(22,120),(40,170),(92,164)],22,30)+stroke([(92,164),(128,158),(150,96),(176,22)],30,4,sm))
# 2 Twin peaks
M['peaks']=('القمّتان','Twin Peaks','قمّتا الحرفين A بلا خط أفقي، فوق المطّة: العالم العربي وآسيا جنباً إلى جنب.',
 stroke([(40,150),(52,120),(64,80),(78,34)],6,8)+stroke([(78,34),(84,70),(90,110),(100,150)],12,26)+
 stroke([(104,150),(114,124),(124,96),(134,64)],6,8)+stroke([(134,64),(140,92),(146,122),(154,150)],12,24)+
 ball(30,162,9)+stroke([(30,162),(70,184),(130,182),(184,160)],14,4,sm))
# 3 Rising strokes
M['rise']=('الصعود','Three Rising','ثلاث ضربات صاعدة بطول متزايد، واحدة لكل كلمة: عربي، آسيوي، تجارة.',
 ball(40,164,13)+stroke([(40,164),(48,140),(56,120),(64,104)],24,6,sm)+stroke([(86,164),(96,128),(106,96),(116,72)],26,6,sm)+stroke([(132,164),(144,118),(156,78),(170,32)],28,6,sm))
# 4 Seal
M['seal']=('الختم','The Seal','الدائرة المعقوفة في طرف المطّة داخل حلقة: ختم ثقة يشبه الأختام القديمة في التجارة.',
 ring(100,100,86,7)+ball(70,92,13)+stroke([(70,92),(52,110),(62,142),(96,140)],20,26)+stroke([(96,140),(120,138),(134,100),(150,56)],26,5,sm))
# 5 Bridge
M['bridge']=('الجسر','The Bridge','قوس يصل بين دائرتين، الشرق الأوسط وآسيا، وأعلاه قمّة A: طريق الحرير الحديث.',
 ball(30,150,13)+ball(170,150,13)+stroke([(30,150),(50,82),(90,40),(100,40)],8,24)+stroke([(100,40),(110,40),(150,82),(170,150)],24,8)+stroke([(48,176),(80,160),(120,160),(152,176)],5,5))
# 6 Peak & swirl
M['spark']=('الشرارة','The Spark','قمّة A بخط رفيع وخط عريض، ورجلها تلتفّ في المطّة وتنتهي بالدائرة، دون أي حرف مقروء.',
 stroke([(70,150),(84,110),(98,66),(112,26)],6,8)+stroke([(112,26),(120,70),(128,112),(140,156)],10,28)+
 ball(34,120,13)+stroke([(34,120),(16,146),(40,178),(80,170)],20,24)+stroke([(80,170),(104,164),(116,150),(122,140)],24,10))
json.dump({k:list(v) for k,v in M.items()},open('mark/marks.json','w'),ensure_ascii=False)
for k,v in M.items():
    for c,col in (('red','#D21F26'),('white','#FFFFFF'),('black','#000000')):
        open('mark/AAT-symbol-%s-%s.svg'%(k,c),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="%s" color="%s">%s</svg>'%(col,col,v[3]))
