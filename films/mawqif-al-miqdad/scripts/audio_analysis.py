import numpy as np, soundfile as sf
from PIL import Image, ImageDraw
x, sr = sf.read("source/audio_48k.wav")
print("sr", sr, "dur", len(x)/sr, "peak", np.abs(x).max(), "rms", np.sqrt((x**2).mean()))
hop = int(sr*0.02)
n = len(x)//hop
env = np.array([np.sqrt((x[i*hop:(i+1)*hop]**2).mean()+1e-12) for i in range(n)])
db = 20*np.log10(env+1e-9)
# silence runs below -45 dB
sil = db < -45
runs=[]; i=0
while i<n:
    if sil[i]:
        j=i
        while j<n and sil[j]: j+=1
        if (j-i)*0.02>=0.15: runs.append((i*0.02,j*0.02))
        i=j
    else: i+=1
print("silences>=0.15s:", [(round(a,2),round(b,2)) for a,b in runs])
# noise floor in quietest 10%
print("db percentiles", np.percentile(db,[5,10,25,50,75,95]).round(1))
# spectrogram image
import scipy.signal as ss
f,t,S = ss.spectrogram(x, sr, nperseg=2048, noverlap=2048-480)
S = 10*np.log10(S+1e-12)
S = S[f<8000]
img = np.clip((S+110)/80,0,1)[::-1]
im = Image.fromarray((img*255).astype(np.uint8)).resize((2400,500))
d = ImageDraw.Draw(im)
for s in range(0,67,2):
    xx = int(s/66.4*2400); d.line([(xx,0),(xx,500)], fill=128); d.text((xx+2,2), str(s), fill=255)
im.save("analysis/spectrogram.png")
# envelope image
W=2400; H=200
im2 = Image.new("L",(W,H),0); d2=ImageDraw.Draw(im2)
for k in range(n):
    xx=int(k/n*W); yy=int(np.clip((db[k]+70)/70,0,1)*H)
    d2.line([(xx,H),(xx,H-yy)],fill=200)
for s in range(0,67,2):
    xx = int(s/66.4*W); d2.line([(xx,0),(xx,H)], fill=90); d2.text((xx+2,2), str(s), fill=255)
im2.save("analysis/envelope.png")
np.save("analysis/env_db.npy", db)
