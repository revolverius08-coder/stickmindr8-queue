#!/usr/bin/env bash
# get_voice.sh [dir] : instalează vocea Kokoro EN + binarul sherpa-onnx (gratuit, fără cont/API key), ~330 MB, 1–2 min.
# Rezultat: <dir>/kokoro-en-v0_19 și <dir>/sherpa-onnx-v1.13.8-linux-x64-shared (exact ce așteaptă vo.py). Implicit dir=/home/claude/tts
set -e; D=${1:-/home/claude/tts}; mkdir -p $D && cd $D
[ -f kokoro-en-v0_19/model.onnx ] || { curl -sL -o kokoro.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-en-v0_19.tar.bz2 && tar xjf kokoro.tar.bz2; }
[ -x sherpa-onnx-v1.13.8-linux-x64-shared/bin/sherpa-onnx-offline-tts ] || { curl -sL -o sh.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.13.8/sherpa-onnx-v1.13.8-linux-x64-shared.tar.bz2 && tar xjf sh.tar.bz2; }
cp "$(dirname "$0")/vo.py" $D/vo.py 2>/dev/null || true
echo "voce OK în $D"
