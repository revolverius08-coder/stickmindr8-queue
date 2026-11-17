"""align_words.py: aliniere REALĂ a cuvintelor din voce (faster-whisper) peste info.json produs de vo.py.
  python3 align_words.py <clipdir> [--model base.en]    # clipdir conține voice.wav + info.json
Scrie info.json (words = timpi reali; cheia 'words_est' păstrează estimarea) și raportează decalajul mediu.
Cuvintele scriptului se potrivesc secvențial cu cele recunoscute (difflib); ce nu se potrivește rămâne estimat, interpolat între vecini."""
import sys, json, re, difflib, argparse
import subprocess, numpy as np
from faster_whisper import WhisperModel
ap = argparse.ArgumentParser(); ap.add_argument('dir'); ap.add_argument('--model', default='base.en'); a = ap.parse_args()
info = json.load(open(f'{a.dir}/info.json')); W = info['words']
norm = lambda w: re.sub(r'[^a-z0-9$]', '', w.lower())
m = WhisperModel(a.model, device='cpu', compute_type='int8')
pcm = subprocess.run(['ffmpeg','-v','error','-i',f'{a.dir}/voice.wav','-f','f32le','-ac','1','-ar','16000','-'],capture_output=True,check=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)
segs, _ = m.transcribe(audio, word_timestamps=True, language='en', beam_size=5, vad_filter=False, condition_on_previous_text=False)
R = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
S = [norm(w['word']) for w in W]
sm = difflib.SequenceMatcher(None, S, [r[0] for r in R], autojunk=False)
new = [None] * len(W)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal':
        for k in range(i2 - i1): new[i1 + k] = (R[j1 + k][1], R[j1 + k][2])
hit = sum(x is not None for x in new)
# interpolare pentru cuvinte nepotrivite
for i, x in enumerate(new):
    if x is None:
        p = next((j for j in range(i - 1, -1, -1) if new[j]), None); n = next((j for j in range(i + 1, len(W)) if new[j]), None)
        a0 = new[p][1] if p is not None else W[i]['start']; b0 = new[n][0] if n is not None else W[i]['end']
        span = [j for j in range(i, len(W)) if new[j] is None and (n is None or j < n)]
        k = span.index(i); step = (b0 - a0) / (len(span) + 0) if len(span) else 0
        new[i] = (a0 + step * k, a0 + step * (k + 1))
# ancore de replică: Whisper întinde începutul primului cuvânt după o pauză în liniște, deci
# primul cuvânt al fiecărei replici începe exact la start-ul replicii (audio tăiat exact), ultimul se termină la end-ul ei,
# iar cuvintele din interior vin din Whisper, limitate la [start, end] ale replicii.
idx = 0
for c in info['cues']:
    n = len(c['text'].split()); lo, hi = c['start'], c['end']
    for k in range(n):
        i = idx + k; st, en = new[i]
        st = min(max(st, lo), hi); en = min(max(en, st + 0.05), hi)
        if k == 0: st = lo
        if k == n - 1: en = hi
        new[i] = (st, en)
    for k in range(1, n):  # fără suprapuneri
        i = idx + k
        if new[i][0] < new[i-1][0] + 0.04: new[i] = (new[i-1][0] + 0.04, max(new[i][1], new[i-1][0] + 0.09))
    idx += n
diff = [abs(new[i][0] - W[i]['start']) for i in range(len(W))]
info['words_est'] = W
info['words'] = [dict(word=W[i]['word'], start=round(new[i][0], 3), end=round(max(new[i][1], new[i][0] + 0.05), 3)) for i in range(len(W))]
json.dump(info, open(f'{a.dir}/info.json', 'w'), indent=1)
print(f'matched {hit}/{len(W)} words; mean shift vs estimate {sum(diff)/len(diff):.3f}s, max {max(diff):.3f}s')
