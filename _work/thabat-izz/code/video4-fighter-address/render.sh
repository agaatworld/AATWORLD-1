#!/bin/bash
cd /tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/q4
rm -f render.done
for p in 0 1 2 3; do python3 q4.py render $p 4 > r$p.log 2>&1 & done; wait
printf "file 'parts/p0.mp4'\nfile 'parts/p1.mp4'\nfile 'parts/p2.mp4'\nfile 'parts/p3.mp4'\n" > parts.txt
ffmpeg -v error -y -f concat -safe 0 -i parts.txt -c copy body.mp4 && echo "v4 body done $(date +%T)" > render.done
