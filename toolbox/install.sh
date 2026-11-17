#!/usr/bin/env bash
# Recreează biblioteca de unelte StickMindR8 (toate MIT / CC0 / Unlicense). Rulează într-o sesiune nouă.
set -e
T=${1:-/home/claude/toolbox}; mkdir -p $T && cd $T
for r in dsauce/stickman-kino SyedBahjat/claude-stickman-shorts cth9191/animate artemnovitckii/claude-animation-skills \
         LottieFiles/motion-design-skill xiejunjie524/handdraw-story-video lazypay/Archscribe romainsimon/uisfx chr15m/jsfxr KilledByAPixel/ZzFX; do
  n=$(basename $r); [ -d $n ] || git clone -q --depth 1 https://github.com/$r $n
done
(cd stickman-kino && npm install --no-audit --no-fund)
mkdir -p sfxgen && (cd sfxgen && npm init -y >/dev/null && npm i jsfxr --no-audit --no-fund)
echo "Chrome pentru stickman-kino: export PUPPETEER_EXECUTABLE_PATH=\$(node -e \"console.log(require('playwright').chromium.executablePath())\")"
pip install --break-system-packages faster-whisper 2>&1 | tail -1
bash "$(dirname "$0")/studio-kit/get_voice.sh" /home/claude/tts   # voce Kokoro + sherpa-onnx (~50 s, gratuit)
# tesseract: apt/preinstalat (necesar pentru qc_video.py)
