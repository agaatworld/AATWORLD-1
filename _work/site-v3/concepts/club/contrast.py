# WCAG contrast for the "Business Club" tokens (run: python3 -I contrast.py)
def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
T={'ink':'#141821','ink-2':'#242B38','red':'#D21F26','red-deep':'#A4161C','brass':'#7E6128','brass-light':'#D4B46A',
   'paper':'#FFFFFF','panel':'#EDEFF2','line':'#C9CDD6','muted':'#4A5160','link':'#0B4F9C'}
pairs=[('ink','paper'),('ink','panel'),('muted','paper'),('muted','panel'),('brass','paper'),('brass','panel'),
       ('paper','red'),('paper','red-deep'),('paper','ink'),('paper','ink-2'),('brass-light','ink'),('brass-light','ink-2'),
       ('link','paper'),('link','panel'),('red','paper'),('red','panel'),('ink','brass-light'),('red','ink'),('line','paper')]
for a,b in pairs:
    v=cr(T[a],T[b]); print(f"{a:12s} on {b:12s} {v:5.2f}:1  {'AA' if v>=4.5 else ('AA-large' if v>=3 else 'FAIL')}")
