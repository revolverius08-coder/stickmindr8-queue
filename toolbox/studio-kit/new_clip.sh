#!/usr/bin/env bash
# new_clip.sh <N> : creează proiectul clipN (+ clipN-th pentru miniatură) din șabloanele studio-kit.
# După el: scrii /home/claude/tts/clipN_lines.json, rulezi vo.py (cu aliniere reală), adaptezi build_shots.py și scenes/shots/g.js.
set -e; N=$1; [ -z "$N" ] && { echo "usage: new_clip.sh N"; exit 1; }
K=$(cd "$(dirname "$0")" && pwd); S=/home/claude/work/aitrends-2d-studio; P=$S/projects/clip$N
[ -d $S ] || { echo "studio lipsește: reinstalează din plugin (vezi ANIMATION_BRAIN.md §1.1)"; exit 1; }
mkdir -p $P/{scenes/shots,story,input,timeline,out} /home/claude/tts
cp $K/scenes/*.js $P/scenes/; cp $K/engine/rig2d_v2.js $S/engine/rig2d.js; cp $K/scenes/shots/g.example.js $P/scenes/shots/g.js
cp $K/build_shots.template.py $P/story/build_shots.py; cp $K/config.example.json $P/config.json
sed -i "s#clip7#clip$N#g" $P/story/build_shots.py
T=$S/projects/clip$N-th; mkdir -p $T/{scenes/shots,story,input,timeline,out}; cp $K/scenes/h.js $K/scenes/outro.js $T/scenes/; cp $K/thumb/g.js $T/scenes/shots/g.js; cp $K/thumb/config.json $T/config.json
echo "creat: $P și $T"; echo "unelte: python3 $K/tools/{align_words,qc_video,analyze_reference,sfx_map}.py ; node $K/tools/jsfxr_make.js"
