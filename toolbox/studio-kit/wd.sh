#!/bin/bash
# usage: wd.sh <project> <duration_seconds>
cd /home/claude/work/aitrends-2d-studio
P=projects/$1; D=$2; S=$P/build/segs; mkdir -p $S $P/out; rm -f $P/out/done.flag $S/*.tmp.mp4
i=0; a=0
while [ $(echo "$a < $D" | bc -l) -eq 1 ]; do
  b=$(echo "$a + 5" | bc -l); if [ $(echo "$b > $D" | bc -l) -eq 1 ]; then b=$D; fi
  OUT=$S/seg_$(printf %03d $i).mp4; i=$((i+1))
  if [ ! -s $OUT ]; then
    for t in $(seq 1 12); do
      rm -f $OUT.tmp.mp4; LOG=$S/log_$a.txt
      node render.mjs --project $P --from $a --to $b --format jpeg --workers 2 --preset veryfast --scale 0.75 --out $OUT.tmp.mp4 > $LOG 2>&1 &
      RP=$!
      while kill -0 $RP 2>/dev/null; do sleep 20
        if [ $(( $(date +%s) - $(stat -c %Y $LOG) )) -gt 420 ]; then echo "stall $a $(date +%T)"; kill -9 $RP; pkill -9 -f "[c]hrome"; break; fi
      done
      wait $RP 2>/dev/null
      if [ -s $OUT.tmp.mp4 ] && ! grep -q "RENDER FAILED" $LOG; then mv $OUT.tmp.mp4 $OUT; echo "seg $a ok $(date +%T)"; break; fi
      sleep 3
    done
  fi
  a=$b
done
ls $S/seg_*.mp4 | sed "s#^#file $PWD/#" > $S/list.txt
ffmpeg -y -v error -f concat -safe 0 -i $S/list.txt -vf scale=1080:1920:flags=lanczos -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -movflags +faststart $P/build/video_silent.mp4 && python3 audio/mix.py --project $P 2>&1 | tail -2 && touch $P/out/done.flag && echo "ALL DONE $(date +%T)"
