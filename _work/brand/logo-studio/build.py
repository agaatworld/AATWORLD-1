# Assemble AAT Logo Studio into one HTML file: python3 build.py
import os
d=os.path.dirname(os.path.abspath(__file__))
r=lambda f:open(os.path.join(d,f)).read()
open(os.path.join(d,'aat-logo-studio.html'),'w').write(r('shell.html').replace('%%DATA%%',r('data.js')).replace('%%APP%%',r('app.js')))
