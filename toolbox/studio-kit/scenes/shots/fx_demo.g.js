import { TM, K, NT, S, ease, clamp, lerp, prog, veil, post, rr, circle, ring, seg, rng, P, stick } from '../h.js';
const T3 = (g, fn) => NT.scr(g, fn);
const CY = '#7fd4ff', MI = '#5be3b0', RE = '#ff5a5a', GO = '#ffe08a', INK = '#f2f7fb';
const bg = (g, T) => T3(g, (g3) => { const gr = g3.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#0a0c10'); gr.addColorStop(.55, '#151b24'); gr.addColorStop(1, '#07090c'); g3.fillStyle = gr; g3.fillRect(0, 0, 1080, 1920);
  g3.strokeStyle = 'rgba(127,212,255,.06)'; g3.lineWidth = 2; for (let x = 0; x <= 1080; x += 90) { g3.beginPath(); g3.moveTo(x, 0); g3.lineTo(x, 1920); g3.stroke(); } for (let y = 0; y <= 1920; y += 90) { g3.beginPath(); g3.moveTo(0, y); g3.lineTo(1080, y); g3.stroke(); } });
const label = (g, T, t0, ro, en) => T3(g, (g3) => { const k = ease.outBack(prog(T, t0, t0 + 0.4)); if (k < 0.01) return; g3.save(); g3.translate(540, 300); g3.scale(k, k); K.text(g3, ro, 0, 0, { size: 74, weight: 900, color: GO, stroke: 10, strokeColor: '#050a18' }); K.text(g3, en, 0, 70, { size: 34, weight: 800, color: INK, alpha: 0.75 }); g3.restore(); });
// ---- 1. TRASAT APOI COLORAT: contur desenat stânga→dreapta, apoi culoarea umple tot stânga→dreapta
const coinStack = (g3, mode) => { // mode 'line' | 'color'
  const line = mode === 'line'; const stroke = line ? INK : '#07090c';
  const col = (c) => line ? 'rgba(0,0,0,0)' : c;
  g3.lineWidth = 12; g3.lineJoin = 'round'; g3.lineCap = 'round';
  // coin mare
  g3.beginPath(); g3.arc(540, 900, 250, 0, Math.PI * 2); g3.fillStyle = col(GO); g3.fill(); g3.strokeStyle = stroke; g3.stroke();
  g3.beginPath(); g3.arc(540, 900, 195, 0, Math.PI * 2); g3.fillStyle = col('#e8b84a'); g3.fill(); g3.stroke();
  // $
  g3.font = '900 260px Arial'; g3.textAlign = 'center'; g3.textBaseline = 'middle'; g3.fillStyle = col('#7a4b00'); g3.fillText('$', 540, 915); if (line) { g3.strokeStyle = stroke; g3.lineWidth = 6; g3.strokeText('$', 540, 915); }
  // barele graficului
  const bars = [[250, 1250, 120, 220, MI], [400, 1250, 120, 320, CY], [550, 1250, 120, 440, RE], [700, 1250, 120, 560, GO]];
  for (const [x, y, w, h, c] of bars) { g3.beginPath(); g3.roundRect ? g3.roundRect(x, y - h + 130, w, h, 14) : g3.rect(x, y - h + 130, w, h); g3.fillStyle = col(c); g3.fill(); g3.strokeStyle = stroke; g3.lineWidth = 10; g3.stroke(); }
};
S('f1', (g, T) => { bg(g, T); const t = T - TM.f1[0]; T3(g, (g3) => {
  const pl = ease.inOut(prog(t, 0.35, 1.7)), pc = ease.inOut(prog(t, 1.75, 3.0));
  // 1) contur: dezvelit stânga→dreapta
  g3.save(); g3.beginPath(); g3.rect(0, 0, 1080 * pl, 1920); g3.clip(); coinStack(g3, 'line'); g3.restore();
  // 2) culoare: umple stânga→dreapta, peste contur
  if (pc > 0) { g3.save(); g3.beginPath(); g3.rect(0, 0, 1080 * pc, 1920); g3.clip(); coinStack(g3, 'color'); g3.restore(); }
  // creionul/marginea de revelare
  const px = pc > 0 && pc < 1 ? 1080 * pc : (pl < 1 ? 1080 * pl : -50); if (px > 0) { g3.fillStyle = pc > 0 ? 'rgba(255,224,138,.9)' : 'rgba(255,255,255,.9)'; g3.fillRect(px - 3, 560, 6, 760); }
}); label(g, T, TM.f1[0] + 0.1, '1 · TRASAT → COLORAT', 'contur desenat, apoi umplut cu culoare'); post(g, T); });
// ---- 2. LINIE CARE „FIERBE": același contur se re-desenează cu tremur la 12 fps
const boil = (seed, amp) => { const r = rng(seed); return () => (r() - 0.5) * amp * 2; };
const wobPath = (g3, pts, j) => { g3.beginPath(); pts.forEach(([x, y], i) => { const X = x + j(), Y = y + j(); i ? g3.lineTo(X, Y) : g3.moveTo(X, Y); }); };
const circPts = (cx, cy, r, n = 40) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
const rectPts = (x, y, w, h, n = 12) => { const a = []; for (let i = 0; i < n; i++) a.push([x + w * i / n, y]); for (let i = 0; i < n; i++) a.push([x + w, y + h * i / n]); for (let i = 0; i < n; i++) a.push([x + w - w * i / n, y + h]); for (let i = 0; i < n; i++) a.push([x, y + h - h * i / n]); a.push([x, y]); return a; };
const starPts = (cx, cy, r) => Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5 * 2 % (Math.PI * 2) * 1; const k = i % 5 * 0.8 * Math.PI; return [cx + Math.cos(-Math.PI / 2 + (i * 4 * Math.PI) / 5) * r, cy + Math.sin(-Math.PI / 2 + (i * 4 * Math.PI) / 5) * r]; });
S('f2', (g, T) => { bg(g, T); const t = T - TM.f2[0]; const step = Math.floor(t * 12); T3(g, (g3) => {
  g3.lineWidth = 9; g3.lineCap = 'round'; g3.lineJoin = 'round';
  const sh = [[circPts(540, 760, 230), CY, 1], [rectPts(190, 1130, 700, 270), MI, 2], [starPts(540, 1640, 150), GO, 3]];
  sh.forEach(([pts, c, id], i) => { const k = ease.outBack(prog(t, 0.2 + i * 0.25, 0.7 + i * 0.25)); if (k < 0.02) return; g3.save(); g3.translate(540, 960); g3.scale(k, k); g3.translate(-540, -960);
    const j = boil(step * 31 + id * 7, 4.2); g3.fillStyle = c + '22'; wobPath(g3, pts, boil(step * 31 + id * 7, 0)); g3.fill(); g3.strokeStyle = c; wobPath(g3, pts, j); g3.stroke(); g3.restore(); });
  const k2 = ease.outBack(prog(t, 0.9, 1.3)); if (k2 > 0.01) { g3.save(); g3.translate(540, 1265); g3.scale(k2, k2); K.text(g3, 'OPEN SOURCE', 0, 0, { size: 86, weight: 900, color: INK }); g3.restore(); }
  const k3 = ease.outBack(prog(t, 0.4, 0.8)); if (k3 > 0.01) { g3.save(); g3.translate(540, 760); g3.scale(k3, k3); K.text(g3, '$29', 0, 0, { size: 150, weight: 900, color: CY }); g3.restore(); }
}); label(g, T, TM.f2[0] + 0.1, '2 · LINIE CARE „FIERBE"', 'conturul tremură la 12 fps, ca desenat de mână'); post(g, T); });
// ---- 3. SCHEMĂ DESENATĂ DE MÂNĂ: cutii „schițate" (două treceri), săgeți care se trasează, un punct călătorește
const sketchBox = (g3, x, y, w, h, c, k, seed) => { if (k < 0.02) return; for (let pass = 0; pass < 2; pass++) { const j = boil(seed + pass * 13, 3.2); g3.strokeStyle = pass ? c : c + 'aa'; g3.lineWidth = pass ? 8 : 5; wobPath(g3, rectPts(x - w / 2, y - h / 2, w, h, 10), j); g3.stroke(); } g3.fillStyle = c + '1c'; g3.beginPath(); g3.rect(x - w / 2, y - h / 2, w, h); g3.fill(); };
const arrow = (g3, x0, y0, x1, y1, p, c, seed) => { if (p <= 0) return; const j = boil(seed, 3); const n = 14, pts = []; for (let i = 0; i <= n * p; i++) { const u = i / n; pts.push([lerp(x0, x1, u), lerp(y0, y1, u)]); } const e = [lerp(x0, x1, p), lerp(y0, y1, p)]; pts[pts.length - 1] = e; g3.strokeStyle = c; g3.lineWidth = 9; wobPath(g3, pts, j); g3.stroke(); if (p > 0.97) { g3.beginPath(); g3.moveTo(x1 - 26, y1 - 34); g3.lineTo(x1, y1); g3.lineTo(x1 + 26, y1 - 34); g3.stroke(); } };
S('f3', (g, T) => { bg(g, T); const t = T - TM.f3[0]; T3(g, (g3) => {
  g3.lineCap = 'round'; g3.lineJoin = 'round';
  const B = [[540, 640, CY, 'CHAT SPIKE'], [540, 1020, MI, 'REWIND 20s'], [540, 1400, GO, 'CLIP']];
  B.forEach(([x, y, c, tx], i) => { const k = ease.outBack(prog(t, 0.2 + i * 0.55, 0.65 + i * 0.55)); sketchBox(g3, x, y, 620, 200, c, k, 100 + i * 17); if (k > 0.1) { g3.save(); g3.translate(x, y + 4); g3.scale(k, k); K.text(g3, tx, 0, 0, { size: 74, weight: 900, color: INK }); g3.restore(); } });
  arrow(g3, 540, 760, 540, 905, ease.inOut(prog(t, 0.75, 1.2)), CY, 200); arrow(g3, 540, 1140, 540, 1285, ease.inOut(prog(t, 1.3, 1.75)), MI, 210);
  const dp = ease.inOut(prog(t, 2.0, 3.3)); if (dp > 0 && dp < 1) { const y = lerp(640, 1400, dp); circle(g3, 540, y, 22, '#ffffff'); g3.fillStyle = 'rgba(255,255,255,.25)'; g3.beginPath(); g3.arc(540, y, 40, 0, 6.3); g3.fill(); }
}); label(g, T, TM.f3[0] + 0.1, '3 · SCHEMĂ DE MÂNĂ', 'cutii schițate în 2 treceri + săgeți care se trasează'); post(g, T); });
// ---- 4. MIȘCARE: mers în 4 faze + pop de obiect cu overshoot + burst (rig-ul NOSTRU, existent)
S('f4', (g, T) => { bg(g, T); const t = T - TM.f4[0]; const walk = prog(t, 0.2, 1.6); const x = lerp(160, 520, ease.out(walk)); const stopped = walk >= 1;
  T3(g, (g3) => { g3.fillStyle = 'rgba(127,212,255,.12)'; g3.fillRect(0, 1480, 1080, 4); });
  const pose = stopped ? (t > 2.4 ? 'cheer' : 'point') : 'stand';
  stick(g, T, { x, y: 1480, s: 2.6, pose, expr: t > 2.4 ? 'joy' : 'smile', facing: 1 });
  T3(g, (g3) => { const k = ease.outBack(prog(t, 1.9, 2.3)); if (k > 0.01) { g3.save(); g3.translate(760, 1010); g3.scale(k, k); g3.fillStyle = GO; g3.beginPath(); g3.arc(0, 0, 120, 0, 6.3); g3.fill(); g3.lineWidth = 12; g3.strokeStyle = '#07090c'; g3.stroke(); K.text(g3, '$', 0, 8, { size: 170, weight: 900, color: '#7a4b00' }); g3.restore(); }
    const b = prog(t, 1.9, 2.5); if (b > 0 && b < 1) { for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, r = 140 + 180 * b; g3.fillStyle = `rgba(255,224,138,${1 - b})`; g3.beginPath(); g3.arc(760 + Math.cos(a) * r, 1010 + Math.sin(a) * r, 10 * (1 - b) + 3, 0, 6.3); g3.fill(); } } });
  label(g, T, TM.f4[0] + 0.1, '4 · MIȘCARE', 'mers + arată + bucurie, cu pop și burst (rig-ul nostru)'); post(g, T); });
