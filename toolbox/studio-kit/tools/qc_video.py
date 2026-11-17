#!/usr/bin/env python3
"""qc_video.py: QC automat pentru un Short StickMindR8 (recreat 2026-11-17 după specificația din video-qc).
  python3 qc_video.py --video out/X.mp4 --meta meta.json --cover cover.jpg --words timeline/words.json --duration 32.35 [--series] [--vote] [--lines lines.json] [--keep] [--out qc_out]
Verifică: format, durată, loudness, liniște, cadre negre/înghețate, hook, text suprapus (OCR), subtitrare vs text mare,
cifre ca digits, final (follow/comment), vot A/B, metadate IG/YT/TikTok, miniatură (bandă sigură y300-1640, badge EPISODE).
Cod de ieșire 1 dacă există FAIL. Necesită ffmpeg, tesseract, numpy, Pillow."""
import argparse, json, os, re, subprocess, sys, shutil, glob
import numpy as np
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser()
ap.add_argument('--video', required=True); ap.add_argument('--meta'); ap.add_argument('--cover'); ap.add_argument('--words')
ap.add_argument('--duration', type=float); ap.add_argument('--series', action='store_true'); ap.add_argument('--vote', action='store_true')
ap.add_argument('--lines'); ap.add_argument('--out', default='qc_out'); ap.add_argument('--keep', action='store_true'); ap.add_argument('--fps', type=float, default=3)
a = ap.parse_args()
R = []  # (level, check, msg)
def add(l, c, m): R.append((l, c, m)); print(f'[{l}] {c}: {m}')
sh = lambda *c: subprocess.run(c, capture_output=True, text=True)
os.makedirs(a.out, exist_ok=True); FR = f'{a.out}/frames'; shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)

# 1 format
pr = json.loads(sh('ffprobe', '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', a.video).stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video'); au = [s for s in pr['streams'] if s['codec_type'] == 'audio']
dur = float(pr['format']['duration'])
if (v['width'], v['height']) != (1080, 1920): add('FAIL', 'format', f"{v['width']}x{v['height']} (cer 1080x1920)")
else: add('PASS', 'format', '1080x1920')
if v['codec_name'] != 'h264': add('FAIL', 'format', f"codec {v['codec_name']}")
if not au: add('FAIL', 'audio', 'fără audio')
if a.duration and abs(dur - a.duration) > 0.6: add('FAIL', 'durată', f'{dur:.2f}s vs {a.duration:.2f}s')
else: add('PASS', 'durată', f'{dur:.2f}s')
if dur > 60: add('WARN', 'durată', 'peste 60 s (Short-urile din video lung trebuie ≤ 60 s)')

# 2 audio
if au:
    e = sh('ffmpeg', '-nostats', '-i', a.video, '-af', 'ebur128=peak=true', '-f', 'null', '-').stderr
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', e)
    if m:
        L = float(m[-1]); add('PASS' if -16 <= L <= -12 else 'WARN', 'loudness', f'{L} LUFS (țintă −14)')
    pk = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', e)
    if pk and float(pk[-1]) > -0.5: add('WARN', 'loudness', f'peak {pk[-1]} dBFS (clipping posibil)')
    s = sh('ffmpeg', '-nostats', '-i', a.video, '-af', 'silencedetect=n=-45dB:d=1.5', '-f', 'null', '-').stderr
    sil = re.findall(r'silence_start: ([\d.]+)', s)
    if sil: add('WARN', 'liniște', f'liniște > 1.5 s la {", ".join(sil[:5])} s')
    else: add('PASS', 'liniște', 'fără pauze lungi de audio')
bl = sh('ffmpeg', '-nostats', '-i', a.video, '-vf', 'blackdetect=d=0.4:pix_th=0.06', '-an', '-f', 'null', '-').stderr
b = re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', bl)
b = [x for x in b if float(x[0]) > 0.2 and float(x[1]) < dur - 0.3]
add('FAIL' if b else 'PASS', 'cadre negre', f'{b[:4]}' if b else 'niciunul')

# 3 cadre + OCR
sh('ffmpeg', '-y', '-v', 'error', '-i', a.video, '-vf', f'fps={a.fps},scale=540:960', f'{FR}/f_%04d.png')
files = sorted(glob.glob(f'{FR}/f_*.png')); n = len(files); dt = 1 / a.fps
imgs = [np.asarray(Image.open(f).convert('L'), dtype=np.float32) for f in files]
# hook
def sd(i): return float(imgs[i].std())
h0 = [sd(i) for i in range(min(int(2 * a.fps), n))]
add('FAIL' if h0 and max(h0) < 12 else 'PASS', 'hook', f'contrast cadre 0–2 s max {max(h0):.0f}' if h0 else 'n/a')
# dead air = cadre aproape identice > 2 s
run = 0; worst = 0; at = 0
for i in range(1, n):
    d = float(np.abs(imgs[i] - imgs[i - 1]).mean())
    run = run + 1 if d < 0.15 else 0
    if run > worst: worst, at = run, i
if worst * dt > 2.0: add('WARN', 'înghețat', f'imagine statică {worst*dt:.1f}s lângă {at*dt:.1f}s')
else: add('PASS', 'înghețat', 'mișcare constantă')

def ocr(path):
    o = sh('tesseract', path, 'stdout', '--psm', '11', 'tsv').stdout.splitlines(); out = []
    for l in o[1:]:
        p = l.split('\t')
        if len(p) >= 12 and p[11].strip() and float(p[10]) > 55 and re.search(r'[A-Za-z0-9$]', p[11]):
            out.append((p[11].strip(), int(p[6]), int(p[7]), int(p[8]), int(p[9]), int(p[2]), int(p[4])))
    return out  # text,x,y,w,h,block,line
CAP_LO, CAP_HI = 1500 / 2, 1850 / 2
overl = []; capbig = []; caps_words = {}; big_words = {}
from concurrent.futures import ThreadPoolExecutor
step = max(1, int(round(a.fps / 2)))  # ~2 OCR/s
idxs = list(range(0, n, step))
with ThreadPoolExecutor(4) as ex: res = list(ex.map(lambda i: ocr(files[i]), idxs))
for i, ws in zip(idxs, res):
    t = i * dt; lines = {}
    for w in ws: lines.setdefault((w[5], w[6]), []).append(w)
    boxes = []
    for k, L in lines.items():
        x0 = min(w[1] for w in L); y0 = min(w[2] for w in L); x1 = max(w[1] + w[3] for w in L); y1 = max(w[2] + w[4] for w in L)
        boxes.append((x0, y0, x1, y1, ' '.join(w[0] for w in L), max(w[4] for w in L)))
    for p in range(len(boxes)):
        for q in range(p + 1, len(boxes)):
            A, B = boxes[p], boxes[q]; ix = max(0, min(A[2], B[2]) - max(A[0], B[0])); iy = max(0, min(A[3], B[3]) - max(A[1], B[1]))
            inter = ix * iy; mn = min((A[2]-A[0])*(A[3]-A[1]), (B[2]-B[0])*(B[3]-B[1]))
            if mn > 0 and inter / mn > 0.25 and len(A[4]) > 2 and len(B[4]) > 2: overl.append((round(t, 1), A[4], B[4]))
    incap = [b for b in boxes if CAP_LO <= (b[1] + b[3]) / 2 <= CAP_HI and b[5] * 2 < 84 * 1.6 and len(b[4]) > 2]
    big = [b for b in boxes if not (CAP_LO <= (b[1] + b[3]) / 2 <= CAP_HI) and b[5] * 2 >= 84 and len(b[4]) > 2]
    if incap and big: capbig.append((round(t, 1), incap[0][4], big[0][4]))
    for b in big: big_words.setdefault(t, []).append(b[4])
    for b in incap: caps_words[t] = b[4]
def group(lst):
    out = []
    for x in lst:
        if out and x[0] - out[-1][-1][0] <= 1.0 and x[1:] == out[-1][-1][1:]: out[-1].append(x)
        else: out.append([x])
    return [(g[0][0], g[-1][0]) + g[0][1:] for g in out]
from collections import Counter
cnt = Counter((o[1], o[2]) for o in overl)
ovl = [o for o in overl if cnt[(o[1], o[2])] >= 2]  # ignoră citirile OCR izolate
ov = group(ovl)
add('FAIL' if ov else 'PASS', 'text suprapus', '; '.join(f'{o[0]}–{o[1]}s "{o[2]}" × "{o[3]}"' for o in ov[:5]) if ov else 'niciun text suprapus detectat')
cb = group(capbig)
add('FAIL' if cb else 'PASS', 'subtitrare vs text mare', '; '.join(f'{o[0]}–{o[1]}s sub "{o[2]}" + mare "{o[3]}"' for o in cb[:5]) if cb else 'subtitrările sunt ascunse la text mare')
# cuvânt mare repetat în subtitrare
rep = []
for t, bs in big_words.items():
    cw = caps_words.get(t, '').lower()
    for w in bs:
        ww = re.sub(r'[^a-z0-9$]', '', w.lower())
        if len(ww) > 3 and ww in re.sub(r'[^a-z0-9$ ]', '', cw): rep.append((t, w))
add('FAIL' if rep else 'PASS', 'cuvânt mare în subtitrare', f'{rep[:4]}' if rep else 'nu se repetă')

# 4 cifre în subtitrări
if a.words and os.path.exists(a.words):
    W = json.load(open(a.words)); txt = ' '.join(w['word'] for w in W).lower()
    nw = re.findall(r'\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred|thousand|million|billion)\b', txt)
    add('WARN' if nw else 'PASS', 'cifre în subtitrări', f'cuvinte-număr în subtitrări: {sorted(set(nw))}' if nw else 'numerele sunt cifre')
if a.lines and os.path.exists(a.lines):
    L = json.load(open(a.lines)); bad = [l[0] for l in L if '$' in l[0] or re.search(r'dollars? \d', l[0], re.I)]
    add('FAIL' if bad else 'PASS', 'voce: bani', f'{bad}' if bad else 'bani spuși cu numărul întâi, fără "$"')
    pro = [l[0] for l in L if re.search(r'\b(i will send|i\'ll send|i will give|i\'ll give|dm you|get the link)\b', l[0], re.I)]
    add('FAIL' if pro else 'PASS', 'voce: promisiuni', f'{pro}' if pro else 'fără promisiuni de trimis/dat')

# 5 final
tail = [i for i in range(n) if i * dt >= dur - 4.5]; txt_end = ''
with ThreadPoolExecutor(4) as ex:
    for ws in ex.map(lambda i: ocr(files[i]), tail[::step]): txt_end += ' ' + ' '.join(w[0] for w in ws)
# cadre full-res la final (butonul FOLLOW/FOLLOWING e mic și colorat: OCR-ul pe 540x960 îl ratează)
hi = ''
for k, off in enumerate((3.0, 2.6, 2.2, 1.8, 1.5, 1.2, 0.9)):  # înainte de fade-out final (~0.6 s)
    fp = f'{a.out}/end_{k}.png'; sh('ffmpeg', '-y', '-v', 'error', '-ss', f'{max(0, dur - off):.2f}', '-i', a.video, '-frames:v', '1', fp)
    if os.path.exists(fp):
        im = Image.open(fp).convert('L')
        from PIL import ImageOps
        ImageOps.autocontrast(im, cutoff=1).save(fp)
        hi += ' ' + sh('tesseract', fp, 'stdout', '--psm', '11').stdout.replace('\n', ' ')
        os.remove(fp)
te = (txt_end + ' ' + hi).lower()
fol = 'follow' in te or 'stories every day' in te or 'stories ery day' in te  # butonul roșu poate fi greu de citit; cardul are și „new stories every day”
add('PASS' if fol else 'FAIL', 'final', 'card FOLLOW vizibil' if fol else 'nu văd cardul FOLLOW în final')
add('PASS' if 'stickmind' in te.replace(' ', '') else 'WARN', 'final', 'StickMindR8 vizibil' if 'stickmind' in te.replace(' ', '') else 'nu văd StickMindR8 în final')
if a.vote:
    tl = []
    with ThreadPoolExecutor(4) as ex:
        for ws in ex.map(lambda i: ocr(files[i]), [i for i in range(n) if i * dt >= dur - 12][::step]): tl += [w[0] for w in ws]
    ok = any(x.upper() in ('A', 'A)') for x in tl) and any(x.upper() in ('B', 'B)') for x in tl)
    add('PASS' if ok else 'FAIL', 'vot', 'carduri A și B detectate' if ok else 'nu detectez cardurile A/B')

# 6 metadate
if a.meta and os.path.exists(a.meta):
    M = json.load(open(a.meta)); cap = M.get('caption', '')
    tags = re.findall(r'#\w+', cap)
    add('PASS' if len(tags) == 5 else 'FAIL', 'meta IG', f'{len(tags)} hashtag-uri (cer exact 5)')
    if '#reels' in [t.lower() for t in tags]: add('FAIL', 'meta IG', 'folosește #reels (cer #reelsinstagram)')
    elif '#reelsinstagram' not in [t.lower() for t in tags]: add('WARN', 'meta IG', 'lipsește #reelsinstagram')
    if re.search(r'^(description|hashtags|pinned comment|caption)\s*:', cap, re.I | re.M): add('FAIL', 'meta IG', 'etichete în caption')
    if not M.get('first_comment'): add('FAIL', 'meta', 'lipsește first_comment')
    if 'comment' not in cap.lower(): add('WARN', 'meta IG', 'caption fără „Comment …”')
    op = M.get('other_platforms', {}); yt = op.get('youtube_shorts', {}); tt = op.get('tiktok', {})
    if not (yt.get('title') and yt.get('description') and yt.get('tags')): add('FAIL', 'meta YT', 'lipsesc titlu/descriere/tag-uri')
    if len(re.findall(r'#\w+', tt.get('hashtags', '') + ' ' + tt.get('description', ''))) != 5: add('WARN', 'meta TikTok', 'nu are exact 5 hashtag-uri')
    if re.search(r'tool|opusclip|supoclip|openshorts|affiliat', cap, re.I) and 'not affiliated' not in cap.lower(): add('WARN', 'meta IG', 'nume de unelte fără „Not affiliated”')
    if M.get('publish_at') is None: add('WARN', 'meta', 'fără publish_at')
    add('PASS', 'meta', 'verificată')

# 7 miniatură
if a.cover and os.path.exists(a.cover):
    im = Image.open(a.cover); add('PASS' if im.size == (1080, 1920) else 'FAIL', 'miniatură', f'{im.size}')
    ws = ocr(a.cover) if im.size == (1080, 1920) else []
    # ocr() e calibrat pe 540x960; pentru full-res folosim direct tesseract
    o = sh('tesseract', a.cover, 'stdout', '--psm', '11', 'tsv').stdout.splitlines(); out = []
    for l in o[1:]:
        p = l.split('\t')
        if len(p) >= 12 and p[11].strip() and float(p[10]) > 55 and len(p[11].strip()) > 2: out.append((p[11], int(p[7]), int(p[7]) + int(p[9])))
    outside = [w for w in out if w[1] < 290 or w[2] > 1650]
    add('FAIL' if outside else 'PASS', 'miniatură', f'text în afara benzii y300–1640: {[w[0] for w in outside][:5]}' if outside else 'tot textul e în banda y300–1640')
    g = np.asarray(im.convert('L'), dtype=np.float32); top, bot = g[:280], g[1660:]
    for nm, z in (('sus', top), ('jos', bot)):
        if z.std() > 40: add('WARN', 'miniatură', f'zona {nm} (y {"0–280" if nm=="sus" else "1660–1920"}) are conținut puternic: se taie în grila IG')
    if a.series:
        add('PASS' if any('episode' in w[0].lower() for w in out) else 'FAIL', 'miniatură', 'badge EPISODE' if any('episode' in w[0].lower() for w in out) else 'lipsește badge-ul EPISODE n')

# contact sheet
sel = files[::max(1, n // 24)][:24]; tiles = [Image.open(f).resize((270, 480)) for f in sel]
cols = 6; rows = (len(tiles) + cols - 1) // cols; sheet = Image.new('RGB', (cols * 270, rows * 480))
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * 270, (i // cols) * 480))
sheet.save(f'{a.out}/qc_sheet.jpg', quality=85)
nf = sum(1 for r in R if r[0] == 'FAIL'); nw = sum(1 for r in R if r[0] == 'WARN')
with open(f'{a.out}/qc_report.md', 'w') as f:
    f.write(f'# QC {os.path.basename(a.video)}\n\nFAIL {nf} · WARN {nw} · PASS {len(R)-nf-nw}\n\n' + '\n'.join(f'- **{l}** {c}: {m}' for l, c, m in R) + '\n')
if not a.keep: shutil.rmtree(FR, ignore_errors=True)
print(f'\nQC: {nf} FAIL, {nw} WARN. Raport: {a.out}/qc_report.md, contact sheet: {a.out}/qc_sheet.jpg')
sys.exit(1 if nf else 0)
