import json,smooth
from shapely import affinity as A
from shapely.ops import unary_union
exec(open('mark3.py').read().split("M={}")[0])
WV=A.rotate(SW,180,origin=(W/2,H/2)); W2=A.translate(WV,86,-18)
M={}
M['wave1']=('موجة العناق','Embrace Wave','العناق نفسه يكمل حركته في موجة ثانية متصلة به: مطّات مترابطة ومتلاحقة مثل موج البحر.',fit(unary_union([SW,W2,A.translate(W2,111.5,20)]),12))
M['wave2']=('الموجتان المتصلتان','Two Waves','موجتان تخرج الثانية من قلب الأولى بلا انقطاع: حركة تجارة لا تتوقف.',fit(unary_union([WV,A.translate(WV,111.5,20)]),12))
M['wave3']=('الموج الثلاثي','Three Waves','ثلاث موجات متصلة، واحدة لكل كلمة: عربي، آسيوي، تجارة، تتقدم معاً كموج البحر.',fit(unary_union([WV,A.translate(WV,111.5,20),A.translate(WV,223,40)]),10))
M['embrace']=('العناق','The Embrace','الرمز الأصلي بعد التنعيم، للمقارنة.',fit(unary_union([SW,W2]),14))
json.dump({k:[a,b,c,path(g)] for k,(a,b,c,g) in M.items()},open('mark/waves_marks.json','w'),ensure_ascii=False)
for k,(a,b,c,g) in M.items():
    for cn,col in (('red','#D21F26'),('white','#FFFFFF'),('black','#000000')):
        open('mark/AAT-symbol-%s-%s.svg'%(k,cn),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="%s">%s</svg>'%(col,path(g)))
