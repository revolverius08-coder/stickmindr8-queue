import { TM, K, NT, S, ease, clamp, lerp, prog, glow, post, rr, circle, ring, seg, rng, P, stick } from '../h.js';
import { walkPose } from '/engine/rig2d.js';
import { walker, idle, body, arm, track, spring, pointSeq, fingerTip, toWorld, toLocal, aim, mixPose, posePlain, REST_F, REST_B, armAt, lookVec, strikes } from '../motion.js';
import { pointPose, finger } from '../outro.js';
import { bg2, outro2Question, outro2CTA, Q2 } from '../outro2.js';
const CY = '#7fd4ff', MI = '#5be3b0', RE = '#ff5a5a', GO = '#ffe08a', VI = '#a98bff';
const bgS = (g) => { const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#0b0d14'); gr.addColorStop(0.55, '#18202c'); gr.addColorStop(1, '#06080b'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920); glow(g, 540, 900, 700, '#5a7bff', 0.1); };
const title = (g, T, t0, a, b) => { const k = ease.outBack(prog(T, t0, t0 + 0.4)); if (k < 0.01) return; g.save(); g.translate(540, 250); g.scale(k, k); K.text(g, a, 0, 0, { size: 70, weight: 900, color: GO, stroke: 10, strokeColor: '#000' }); K.text(g, b, 0, 66, { size: 36, weight: 800, color: '#cfd8e6', stroke: 6, strokeColor: '#000' }); g.restore(); };
const pill = (g, T, t0, x, y, txt, col = CY, sz = 40) => { const k = ease.outBack(prog(T, t0, t0 + 0.34)); if (k < 0.01) return; const a = 1 - clamp((T - t0 - 1.7) / 0.3); if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y + Math.sin(T * 3 + x) * 3); g.scale(k, k); g.font = `900 ${sz}px sans-serif`; const w = g.measureText(txt).width + 56; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.shadowOffsetY = 8; rr(g, -w / 2, -34, w, 68, 34); g.fillStyle = '#10141c'; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.lineWidth = 5; g.strokeStyle = col; g.stroke(); K.text(g, txt, 0, 2, { size: sz, weight: 900, color: '#fff' }); g.restore();
  const b = (T - t0) / 0.5; if (b > 0 && b < 1) { g.save(); for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283, r = 30 + 60 * b; g.globalAlpha = 1 - b; circle(g, x + Math.cos(an) * (r + 40), y + Math.sin(an) * r * 0.7, 5 * (1 - b) + 1, col); } g.restore(); } };
const floor = (g, y, x0 = 0, x1 = 1080) => { g.fillStyle = 'rgba(127,212,255,.13)'; g.fillRect(x0, y, x1 - x0, 5); const gr = g.createLinearGradient(0, y, 0, y + 90); gr.addColorStop(0, 'rgba(127,212,255,.07)'); gr.addColorStop(1, 'rgba(127,212,255,0)'); g.fillStyle = gr; g.fillRect(x0, y + 5, x1 - x0, 90); };
const dust = (g, T, ts, x, y, s) => { for (const t of ts) { const u = (T - t) / 0.45; if (u < 0 || u > 1) continue; for (let i = 0; i < 4; i++) { g.globalAlpha = 0.35 * (1 - u); circle(g, x(t) - (i - 1.5) * 9 * s * 0.4 - u * 22 * (i + 1) * 0.5, y - 4 - u * (14 + i * 5), (5 + i * 2) * s * 0.5 * (0.6 + u), '#cfd8e6'); } g.globalAlpha = 1; } };
// ============ 1. MERS: vechi (sus) vs nou (jos) ============
const W = { t0: 0.5, t1: 4.0, x0: -170, x1: 770, s: 2.3 };
const WSTR = strikes(W.t0, W.t1, W.x1 - W.x0, W.s).map((q) => TM.f1[0] + q.t - 0.0);
S('f1', (g, T) => { bgS(g); const t = T - TM.f1[0]; title(g, T, TM.f1[0] + 0.1, '1 · MERS', 'picioare ancorate · săritură · balans · brațe');
  floor(g, 960); floor(g, 1700);
  // vechi
  const k = ease.inOut(prog(t, W.t0, W.t1)), xo = lerp(W.x0, W.x1, k), moving = t > W.t0 && t < W.t1; const ph = t * 7.4;
  stick(g, T, { x: xo, y: 960, s: W.s, pose: moving ? walkPose(ph, {}) : P('stand'), expr: 'neutral', rim: { color: '#8a93a8', dir: [0.8, -0.6], w: 3 } });
  K.text(g, 'ÎNAINTE', 130, 520, { size: 46, weight: 900, color: '#9aa6bd', stroke: 8, strokeColor: '#000' });
  // nou
  const R = walker(t, { s: W.s }, W.t0, W.t1, W.x0, W.x1, { seed: 3 });
  dust(g, T, WSTR, (tt) => W.x0 + (W.x1 - W.x0) * 0 + 0 + (W.x0 + (W.x1 - W.x0) * Math.min(1, Math.max(0, (tt - TM.f1[0] - W.t0) / (W.t1 - W.t0)))) + 26 * W.s * 0.9, 1700, W.s);
  stick(g, T, { x: R.x, y: 1700, s: W.s, pose: R.pose, hands: R.hands, expr: t > W.t1 + 0.4 ? 'smile' : 'neutral' });
  K.text(g, 'ACUM', 110, 1230, { size: 46, weight: 900, color: CY, stroke: 8, strokeColor: '#000' });
  const a = TM.f1[0]; pill(g, T, a + 1.7, 760, 1810, 'PICIOARE ANCORATE', MI); pill(g, T, a + 2.5, 300, 1130, 'BALANS + LEAN', CY); pill(g, T, a + 3.3, 780, 1130, 'RIDICARE PICIOR', GO); pill(g, T, a + 4.7, 380, 1040, 'GREUTATE LA OPRIRE', VI);
  post(g, T); });
// ============ 2. ARATĂ CU DEGETUL: vechi vs nou ============
S('f2', (g, T) => { bgS(g); const t = T - TM.f2[0], t0 = TM.f2[0]; title(g, T, t0 + 0.1, '2 · ARATĂ', 'anticipare · privire · overshoot · tap pe card');
  floor(g, 1580);
  const cards = [{ t: t0 + 1.4, y: 1010, txt: 'CARD 1', c: CY }, { t: t0 + 3.6, y: 1330, txt: 'CARD 2', c: MI }];
  for (const c of cards) { const k = ease.outBack(prog(T, c.t, c.t + 0.45)); if (k > 0.01) { g.save(); g.translate(540, c.y + Math.sin(T * 1.4) * 5); g.scale(k, k); g.rotate((1 - Math.min(1, k)) * 0.3); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 14; rr(g, -250, -110, 500, 220, 46); g.fillStyle = c.c; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; rr(g, -234, -94, 468, 188, 34); g.fillStyle = '#0b0d12'; g.fill(); K.text(g, c.txt, 0, 4, { size: 82, weight: 900, color: '#fff', stroke: 10, strokeColor: '#000' }); g.restore(); } }
  // vechi (stânga): linie + deget rigid
  const so1 = { x: 175, y: 1580, s: 2.15, facing: 1 }; let pose1 = 'stand', hand1, dir1;
  if (t > 0.9) [pose1, hand1, dir1] = pointPose(T, so1, [{ t: 0, x: 400, y: 1250 }, { t: cards[0].t, x: 400, y: 1010 }, { t: cards[1].t, x: 400, y: 1330 }]);
  stick(g, T, { ...so1, pose: pose1, expr: 'smile', rim: { color: '#8a93a8', dir: [0.8, -0.6], w: 3 } }); if (hand1) finger(g, hand1, dir1, so1.s);
  K.text(g, 'ÎNAINTE', 175, 1680, { size: 40, weight: 900, color: '#9aa6bd', stroke: 8, strokeColor: '#000' });
  // nou (dreapta)
  const so2 = { x: 905, y: 1580, s: 2.15, facing: -1 };
  const tg = [{ t: cards[0].t, x: 700, y: 1010, taps: [cards[0].t + 0.45] }, { t: cards[1].t, x: 700, y: 1330, taps: [cards[1].t + 0.45, cards[1].t + 0.8] }];
  const R = pointSeq(T, so2, tg, { end: t0 + 5.6, seed: 5 });
  stick(g, T, { ...so2, pose: R.pose, hands: R.hands, look: R.look, expr: T > t0 + 5.7 ? 'joy' : 'smile' });
  if (R.hands.F.k === 'point') { const tip = fingerTip(so2, R.pose, R.hands.F); for (const x of tg) { const u = (T - x.t) / 0.7; if (u > 0 && u < 1) { g.save(); g.globalAlpha = 0.7 * (1 - u); g.setLineDash([14, 16]); g.lineDashOffset = -u * 80; g.strokeStyle = '#cfeeff'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(lerp(tip[0], x.x, 0.2 + 0.8 * ease.out(u)), lerp(tip[1], x.y, 0.2 + 0.8 * ease.out(u))); g.stroke(); g.restore(); }
      for (const tt of x.taps) { const r = (T - tt) / 0.55; if (r > 0 && r < 1) { g.save(); g.globalAlpha = 0.8 * (1 - r); g.strokeStyle = '#fff'; g.lineWidth = 6 * (1 - r) + 1; g.beginPath(); g.arc(x.x + 20, x.y, 12 + 70 * r, 0, 7); g.stroke(); g.restore(); } } } }
  K.text(g, 'ACUM', 905, 1680, { size: 40, weight: 900, color: CY, stroke: 8, strokeColor: '#000' });
  pill(g, T, t0 + 1.0, 800, 760, 'ANTICIPARE', GO); pill(g, T, t0 + 1.7, 800, 560, 'PRIVIRE → TINTĂ', CY); pill(g, T, t0 + 2.4, 280, 700, 'OVERSHOOT', VI); pill(g, T, t0 + 3.9, 800, 760, 'TAP + RIPPLE', MI);
  post(g, T); });
// ============ 3. APUCĂ + CARE: cu greutate ============
const G = { x0: -130, xs: 640, s: 2.25, y: 1620 }, TB = { x: 770, top: 1620 - 98 * 2.25 };
const OBJ = [TB.x + 30, TB.top - 34];
S('f3', (g, T) => { bgS(g); const t = T - TM.f3[0], t0 = TM.f3[0]; title(g, T, t0 + 0.1, '3 · APUCĂ', 'întindere · strângere · ridicare cu greutate · arată');
  floor(g, G.y);
  // masă
  g.fillStyle = '#26303f'; rr(g, TB.x - 30, TB.top, 330, 24, 8); g.fill(); g.fillStyle = '#1b2330'; g.fillRect(TB.x + 10, TB.top + 24, 22, G.y - TB.top - 24); g.fillRect(TB.x + 250, TB.top + 24, 22, G.y - TB.top - 24);
  const wk = walker(t, { s: G.s }, 0.3, 2.9, G.x0, G.xs, { seed: 1 });
  const so = { x: wk.x, y: G.y, s: G.s, facing: 1 }, ob = aim(so, OBJ[0], OBJ[1]);
  const tR = 3.2, tG = 4.0, tL = 4.25, tUp = 5.6;                       // reach, grip, lift, show
  const chest = { ang: 0.62, ext: 0.62 }, show = { ang: -0.78, ext: 0.92 };
  const kF = [{ t: -9, ang: REST_F[0], ext: REST_F[1], hand: 'relax' },
    { t: tR - 0.32, ang: 1.35, ext: 0.7, hand: 'open', f: 4.2, z: 0.9 }, { t: tR, ang: ob.ang, ext: Math.min(0.99, ob.dist / 74), hand: 'open', f: 3.4, z: 0.5 },
    { t: tG, ang: ob.ang, ext: Math.min(0.99, ob.dist / 74), hand: 'grip', f: 9, z: 0.8 },
    { t: tL, ang: chest.ang + 0.18, ext: chest.ext + 0.07, hand: 'grip', f: 3.2, z: 0.28 },   // heavy lift: sags, bounces
    { t: tL + 0.5, ang: chest.ang, ext: chest.ext, hand: 'grip', f: 3.4, z: 0.6 },
    { t: tUp, ang: show.ang, ext: show.ext, hand: 'grip', f: 3.4, z: 0.42 }];
  const kB = [{ t: -9, ang: REST_B[0], ext: REST_B[1], hand: 'relax' }, { t: tR - 0.1, ang: 2.15, ext: 0.9, hand: 'open', f: 3, z: 0.6 }, { t: tL + 0.4, ang: 1.75, ext: 0.97, hand: 'relax', f: 3, z: 0.6 }];
  const bk = [{ t: -9, v: [0, 0, 0, 0] }, { t: tR - 0.4, v: [-1, 3, 0, 1], f: 3.5, z: 0.85 }, { t: tR - 0.05, v: [10, 6, 3, 2], f: 3, z: 0.5 }, { t: tG + 0.25, v: [3, 1, 2, 3.5], f: 3, z: 0.6 }, { t: tUp - 0.2, v: [2, -1, 1, -3], f: 3.5, z: 0.6 }, { t: tUp + 1.0, v: [0, 0, 0, 0], f: 3, z: 0.7 }];
  let pose = wk.pose; if (t > 2.9) { pose = idle(T, { seed: 1 }); body(pose, track(t, bk)); }
  let hands = wk.hands; if (t > 2.9) { const A = arm(t, pose, kF, 'F'), B = arm(t, pose, kB, 'B'); hands = { F: A.hand, B: B.hand }; }
  const looks = [{ t: -9, v: [0, 0] }, { t: tR - 0.2, v: [0.8, 0.5], f: 4, z: 0.7 }, { t: tL + 0.6, v: [0.6, 0.95], f: 3, z: 0.7 }, { t: tUp, v: [1, -0.2], f: 3, z: 0.7 }];
  const lk = t > 2.9 ? track(t, looks) : [0, 0];
  const joy = t > tUp + 0.3 ? 'joy' : t > tL ? 'smile' : 'neutral';
  stick(g, T, { ...so, pose, hands, look: lk, expr: joy });
  // obiectul: pe masă -> în mână (cu legănare)
  const drawBox = (x, y, rot, sc) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 6; rr(g, -42, -34, 84, 68, 8); g.fillStyle = GO; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = '#e0b440'; g.fillRect(-42, -8, 84, 16); g.fillStyle = RE; g.fillRect(-9, -34, 18, 68); K.text(g, '★', 0, -50, { size: 38, weight: 900, color: RE }); g.restore(); };
  if (t < tG) drawBox(OBJ[0], OBJ[1] + 34 - 34, 0, 1);
  else { const hw = toWorld(so, pose.hF[0], pose.hF[1]), since = t - tL, sw = since > 0 ? 0.3 * Math.exp(-since * 2.6) * Math.sin(since * 13) : 0, sw2 = t > tUp ? 0.25 * Math.exp(-(t - tUp) * 2.2) * Math.sin((t - tUp) * 12) : 0; drawBox(hw[0] + 24 + Math.sin(sw + sw2) * 8, hw[1] - 14 + Math.abs(sw + sw2) * 6, sw + sw2, 1); }
  if (t < tG && t > tR) { const u = (t - tR) / (tG - tR); }
  pill(g, T, t0 + 3.5, 380, 1180, 'ÎNTINDE MÂNA', CY); pill(g, T, t0 + 4.15, 380, 1290, 'STRÂNGE · CLICK', MI); pill(g, T, t0 + 4.7, 300, 960, 'GREUTATE: SE LEAGĂ', GO); pill(g, T, t0 + 6.0, 560, 760, 'ARATĂ-L!', VI);
  const bu = (t - tUp) / 0.8; if (bu > 0 && bu < 1) { for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283, r = 70 + 220 * bu; g.globalAlpha = 1 - bu; circle(g, 900 + Math.cos(an) * r * 0.5, 900 + Math.sin(an) * r, 6, ['#ffe08a', '#7fd4ff', '#ff5a5a', '#5be3b0'][i % 4]); } g.globalAlpha = 1; }
  post(g, T); });
// ============ 4. OUTRO NOU ============
const O = { t0: TM.q[0] + 0.45, tGold: TM.q[0] + 2.0 };
S('q', (g, T) => { outro2Question(g, T, { ...O, white: ['Would you rather', 'film with this?'], gold: ['YES or NO?'] }); post(g, T, { noMark: false }); });
const OC = { tC: TM.c[0] + 0.5, tTg: TM.c[0] + 1.8, tF: TM.c[0] + 3.0, tTap: TM.c[0] + 4.9, commentWord: 'CLIP' };
S('c', (g, T) => { outro2CTA(g, T, OC); post(g, T); });
