#!/bin/bash
cd /tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/brand
for K in A B C; do
  for p in 0 1 2 3; do python3 opener.py $K render $p 4 > /dev/null 2>&1 & done; wait
  ffmpeg -v error -y -framerate 30 -i op_$K/f%04d.jpg -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -profile:v high -level 4.1 op_${K}_silent.mp4
  echo "rendered $K"
done
