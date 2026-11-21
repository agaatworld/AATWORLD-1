#!/usr/bin/env bash
# Rebuild the folder layout the «الثبات عز» scripts expect, in a NEW session.
# usage: bash setup.sh <new-scratchpad-dir> [<dir with the private artifact files, default: <scratch>/handoff/private>]
# Before: copy _work/thabat-izz from the repo, and fetch the private artifact files (fonts/, brand-kit/, assets/, photos/, sfx/, brand-touch/)
# into <scratch>/handoff/private/ with the Artifact tool (action "read", path "<published path>").
set -e
S="${1:?scratchpad dir}"; S="${S%/}"; P="${2:-$S/handoff/private}"; HERE="$(cd "$(dirname "$0")" && pwd)"
OLD="/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad"
mkdir -p "$S/taiz/fonts/th" "$S/sfx3" "$S/demrepo" "$S/models" "$S/work" /home/user/final/kahlani/assets /home/user/final/kahlani/fonts \
         /home/user/final/fb-edits /home/user/final/fb-edits2 /home/user/final/procession-film
[ -d "$P/fonts" ] && cp "$P"/fonts/*.ttf "$S/taiz/fonts/th/" && cp "$P"/fonts/*.ttf /home/user/final/kahlani/fonts/
[ -d "$P/sfx" ] && cp "$P"/sfx/*.wav "$S/sfx3/"
[ -d "$P/brand-kit" ] && mkdir -p /home/user/final/brand-kit && cp -r "$P"/brand-kit/. /home/user/final/brand-kit/
[ -d "$P/assets/kahlani" ] && cp "$P"/assets/kahlani/* /home/user/final/kahlani/assets/
# copy the code to the scratchpad and point it at the new paths
cp -r "$HERE/code" "$S/code"; cp -r "$HERE/data" "$S/data"
grep -rl "$OLD" "$S/code" "$S/data" | xargs -r sed -i "s#$OLD#$S#g"
echo "fonts: $(ls "$S/taiz/fonts/th" | wc -l)  sfx: $(ls "$S/sfx3" | wc -l)  brand-kit: $(ls /home/user/final/brand-kit 2>/dev/null | wc -l) items"
echo "Still needed: Demucs weights in $S/demrepo (htdemucs.yaml + 955717e8-8726e21a.th + 04573f0d-f3cf25b2.th), Real-ESRGAN x4plus in $S/models,"
echo "and the source videos (re-download the Facebook links or ask the owner to re-upload). Scripts expect sources where each cfg/script says (see HANDOFF.md §4, §8)."
