from kit import *
import sys
k, mode = ARGV[1], ARGV[2]
if mode.startswith('gold'):
    dd = dict(DIRS[k]); g = C(mode[4:]); dd['gold'] = g; dd['metal'] = [g * 0.55, g * 0.85, g, g, g]
    save(recolor(dd, 'refined'), f'cache/{k}_{mode}.png')
else: save(recolor(DIRS[k], mode), f'cache/{k}_{mode}.png')
print('ok', k, mode)
