import soundfile as sf,numpy as np,sys,os,json
os.environ['HF_HUB_DISABLE_XET']='1'
from faster_whisper import WhisperModel
m=WhisperModel('large-v3',device='cpu',compute_type='int8',cpu_threads=4)
P={'r1':'كلام رجل يمني عن أبطال تعز وشرفاء تعز','r2':'طفلة من تعز تتكلم وتدعو ربها على الحوثيين','r3':'تسجيل صوتي لأم من تعز توصي ابنها أن يتواصل مع خاله ليكون في مقدمة المقاتلين وتدعو الله أن يجعله من الشهداء'}
for n in sys.argv[1:]:
    x,sr=sf.read(f'src/{n}.wav'); x=x.astype(np.float32)
    r,_=m.transcribe(x,language='ar',beam_size=5,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=P[n])
    out=[]
    with open(f'asr_{n}.txt','w') as fo:
        for s in r:
            fo.write(f"{s.start:6.2f} {s.end:6.2f} {s.text.strip()}\n"+' '.join(f"{w.word.strip()}@{w.start:.2f}" for w in (s.words or []))+'\n')
            out.append({'start':s.start,'end':s.end,'text':s.text,'words':[{'w':w.word,'s':w.start,'e':w.end} for w in (s.words or [])]})
    json.dump(out,open(f'asr_{n}.json','w'),ensure_ascii=False); print('DONE',n,flush=True)
