import json
from vit import wave_line
exec(open('mark3.py').read().split("M={}")[0])
M={}
M['sea1']=('الموجة','One Wave','موجة واحدة تتصاعد وتلتف على نفسها مثل موج البحر، بنفس روح مطّة A: خط رفيع يصعد ثم يغلظ ويلتف وينتهي بالدائرة.',fit(wave_line(1),16))
M['sea2']=('موجتان متصلتان','Two Waves','خط واحد متصل لا ينقطع: يلتف في الموجة الأولى ثم يخرج منها ليصنع الثانية، مثل موج البحر الحقيقي.',fit(wave_line(2),10))
M['sea3']=('ثلاث موجات','Three Waves','ثلاث موجات في خط واحد متصل، واحدة لكل كلمة: عربي، آسيوي، تجارة.',fit(wave_line(3),8))
M['sea4']=('الموج الصاعد','Rising Waves','ثلاث موجات متصلة يكبر حجمها، تعني النمو والتقدّم المستمر.',fit(wave_line(3,scale=[0.78,0.9,1.04]),8))
json.dump({k:[a,b,c,path(g)] for k,(a,b,c,g) in M.items()},open('mark/sea_marks.json','w'),ensure_ascii=False)
for k,(a,b,c,g) in M.items():
    for cn,col in (('red','#D21F26'),('white','#FFFFFF'),('black','#000000')):
        open('mark/AAT-symbol-%s-%s.svg'%(k,cn),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="%s">%s</svg>'%(col,path(g)))
