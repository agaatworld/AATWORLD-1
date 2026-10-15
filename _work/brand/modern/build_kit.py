"""Assemble the brand kit page: python3 export.py && python3 build_kit.py"""
import base64,re,json
r=lambda f:open(f).read()
b64=lambda f:base64.b64encode(open(f,'rb').read()).decode()
old=re.findall(r'<path[^>]*d="([^"]+)"',r('../logo/AAT-logo-red.svg'))[:3]
h=r('kit.html').replace('%%JAZ_R%%',b64('../../../assets/fonts/aljazeera-regular.ttf')).replace('%%JAZ_B%%',b64('../../../assets/fonts/aljazeera-bold.ttf'))
d=json.load(open('out/aat-modern.json'))
h=h.replace('%%DATA%%',json.dumps(d,separators=(',',':'))).replace('%%QR%%',r('out/qr.json')).replace('%%OLD%%',json.dumps(old))
open('aat-brand-kit.html','w').write(h);print(len(h))
