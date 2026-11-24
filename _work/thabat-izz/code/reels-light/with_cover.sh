#!/bin/bash
# with_cover.sh <video.mp4> <cover.jpg> <out.mp4> — the cover is the first 0.2 s, so every platform picks it as the thumbnail
set -e
V="$1"; CV="$2"; OUT="$3"
ffmpeg -v error -y -loop 1 -framerate 30 -t 0.2 -i "$CV" -f lavfi -t 0.2 -i anullsrc=r=48000:cl=stereo -i "$V" \
  -filter_complex "[0:v]scale=1080:1920,format=yuv420p,setsar=1,fps=30[c];[2:v]format=yuv420p,setsar=1,fps=30[m];[c][1:a][m][2:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -profile:v high -level 4.1 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
echo "ok $OUT"
