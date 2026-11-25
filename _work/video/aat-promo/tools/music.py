import numpy as np, wave
sr=44100; T=25.5; n=int(sr*T); t=np.arange(n)/sr; out=np.zeros(n)
bpm=120; beat=60/bpm
def note(f): return 440*2**((f-69)/12)
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
bass=[45,41,48,43]
def env(L,a=0.02,r=0.3):
    e=np.ones(L); A=int(a*sr); R=int(r*sr)
    e[:A]=np.linspace(0,1,A); e[-R:]*=np.linspace(1,0,R); return e
# pad
for i in range(int(T/2)+1):
    s=int(i*2*sr); L=min(int(2.05*sr),n-s)
    if L<=0: break
    tt=np.arange(L)/sr; c=chords[i%4]; sig=np.zeros(L)
    for m in c+[c[0]+12]:
        f=note(m)
        for d in (-0.15,0.15):
            sig+=sum(np.sin(2*np.pi*f*(1+d/100)*k*tt)/k**1.6 for k in range(1,6))
    sig*=env(L,0.25,0.4)*0.05
    out[s:s+L]+=sig
    # bass 8th pulses from 3s
    if i*2>=2.9:
        for j in range(8):
            bs=s+int(j*beat/2*sr); BL=int(0.22*sr)
            if bs+BL>n: break
            bt=np.arange(BL)/sr; f=note(bass[i%4])
            out[bs:bs+BL]+=(np.sin(2*np.pi*f*bt)+0.3*np.sin(2*np.pi*2*f*bt))*np.exp(-bt*9)*0.16
# kick on beats from 3s to 24.5
for k in np.arange(3,24.4,beat):
    s=int(k*sr); L=int(0.35*sr); kt=np.arange(L)/sr
    f=50+90*np.exp(-kt*30); ph=2*np.pi*np.cumsum(f)/sr
    out[s:s+L]+=np.sin(ph)*np.exp(-kt*9)*0.5
    # sidechain duck
    d=np.ones(L); d[:int(0.18*sr)]=np.linspace(0.55,1,int(0.18*sr))
# hats from 7s
rng=np.random.default_rng(1)
for k in np.arange(7+beat/2,24.4,beat):
    s=int(k*sr); L=int(0.06*sr); noise=rng.standard_normal(L); noise=np.diff(np.concatenate([[0],noise]))
    out[s:s+L]+=noise*np.exp(-np.arange(L)/sr*70)*0.07
# riser before CTA (20.0-21.0) and impact at 21.0
s=int(21.2*sr); L=int(1.0*sr); rt=np.arange(L)/sr
out[s:s+L]+=rng.standard_normal(L)*np.linspace(0,1,L)**2*0.12
s=int(22.2*sr); L=int(1.6*sr); it=np.arange(L)/sr
out[s:s+L]+=(np.sin(2*np.pi*55*it)*0.6+rng.standard_normal(L)*0.15*np.exp(-it*12))*np.exp(-it*2.5)
# fade in/out
out[:int(0.4*sr)]*=np.linspace(0,1,int(0.4*sr)); out[-int(1.0*sr):]*=np.linspace(1,0,int(1.0*sr))
out/=np.max(np.abs(out))*1.1
st=np.stack([out,out],1)
with wave.open('music_raw.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st*32767).astype(np.int16).tobytes())
