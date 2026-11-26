#!/bin/bash
cd /tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/q1
for p in 0 1 2 3; do python3 q1d.py render $p 4 > rd$p.log 2>&1 & done; wait
printf "file 'parts4/p0.mp4'\nfile 'parts4/p1.mp4'\nfile 'parts4/p2.mp4'\nfile 'parts4/p3.mp4'\n" > parts4.txt
ffmpeg -v error -y -f concat -safe 0 -i parts4.txt -c copy body4.mp4 && echo "body4 done $(date +%T)" > render4.done
