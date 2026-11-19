#!/bin/bash
cd /tmp/zdf/proj; export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers CHROME=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome GL=swiftshader
mkdir -p /tmp/zdf/chunks; : > /tmp/zdf/chunks/list.txt
i=0
for r in "0 8" "8 16" "16 24" "24 31.6"; do
  set -- $r; f=/tmp/zdf/chunks/c$i.mp4
  if [ ! -s $f ]; then
    for try in 1 2 3 4 5; do
      node render.mjs video $f.tmp.mp4 24 $1 $2 > /tmp/zdf/chunks/c$i.log 2>&1 && mv $f.tmp.mp4 $f && break
      echo "chunk $i retry $try" >> /tmp/zdf/chunks/status.log
    done
  fi
  echo "file '$f'" >> /tmp/zdf/chunks/list.txt; echo "chunk $i done $(date +%T)" >> /tmp/zdf/chunks/status.log
  i=$((i+1))
done
ffmpeg -y -v error -f concat -safe 0 -i /tmp/zdf/chunks/list.txt -c copy /tmp/zdf/silent2.mp4 && echo ALLDONE >> /tmp/zdf/chunks/status.log
