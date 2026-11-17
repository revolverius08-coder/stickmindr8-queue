import { TM, K, NT, S, ease, clamp, lerp, prog, glow, post, rr, circle, ring, seg, rng, P, stick } from '../h.js';
import { walker, idle, body, arm, track, spring, aim, toWorld, mixPose, posePlain, REST_F, REST_B, secondary, turnF, jumpAt, camera, shakeAt, camLerp, strikes } from '../motion.js';
import { outro3Question, outro3CTA } from '../outro3.js';
const CY = '#7fd4ff', MI = '#5be3b0', RE = '#ff5a5a', GO = '#ffe08a', VI = '#a98bff';
const bgS = (g) => { g.fillStyle = '#05070a'; g.fillRect(-400, -400, 1900, 2700); const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#0b0d14'); gr.addColorStop(0.55, '#18202c'); gr.addColorStop(1, '#06080b'); g.fillStyle = gr; g.fillRect(-200, -200, 1480, 2320); glow(g, 540, 900, 700, '#5a7bff', 0.1); };
const title = (g, T, t0, a, b) => { const k = ease.outBack(prog(T, t0, t0 + 0.4)); if (k < 0.01) return; g.save(); g.translate(540, 250); g.scale(k, k); K.text(g, a, 0, 0, { size: 66, weight: 900, color: GO, stroke: 10, strokeColor: '#000' }); K.text(g, b, 0, 62, { size: 34, weight: 800, color: '#cfd8e6', stroke: 6, strokeColor: '#000' }); g.restore(); };
const pill = (g, T, t0, x, y, txt, col = CY, sz = 38) => { const k = ease.outBack(prog(T, t0, t0 + 0.34)); if (k < 0.01) return; const a = 1 - clamp((T - t0 - 1.7) / 0.3); if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y + Math.sin(T * 3 + x) * 3); g.scale(k, k); g.font = `900 ${sz}px sans-serif`; const w = g.measureText(txt).width + 56; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.shadowOffsetY = 8; rr(g, -w / 2, -34, w, 68, 34); g.fillStyle = '#10141c'; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.lineWidth = 5; g.strokeStyle = col; g.stroke(); K.text(g, txt, 0, 2, { size: sz, weight: 900, color: '#fff' }); g.restore();
  const b = (T - t0) / 0.5; if (b > 0 && b < 1) { g.save(); for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283, r = 30 + 60 * b; g.globalAlpha = 1 - b; circle(g, x + Math.cos(an) * (r + 40), y + Math.sin(an) * r * 0.7, 5 * (1 - b) + 1, col); } g.restore(); } };
const floor = (g, y) => { g.fillStyle = 'rgba(127,212,255,.13)'; g.fillRect(-200, y, 1480, 5); const gr = g.createLinearGradient(0, y, 0, y + 90); gr.addColorStop(0, 'rgba(127,212,255,.07)'); gr.addColorStop(1, 'rgba(127,212,255,0)'); g.fillStyle = gr; g.fillRect(-200, y + 5, 1480, 90); };
const puff = (g, T, t0, x, y, n = 5, spread = 60) => { const u = (T - t0) / 0.6; if (u < 0 || u > 1) return; for (let i = 0; i < n; i++) { const dir = (i / (n - 1) - 0.5) * 2; g.globalAlpha = 0.4 * (1 - u); circle(g, x + dir * spread * u * 1.4, y - 6 - u * 26 - Math.abs(dir) * 4, 7 + 14 * u + (i % 2) * 4, '#cfd8e6'); } g.globalAlpha = 1; };
// draw Stick from a pure state function fn(t) -> {x, pose, hands, facing, look, lift, expr}; secondary motion (hood / hem / strings) comes from the state history
const actor = (g, T, fn, so) => { const st = fn(T), fs = Math.sign(st.facing) || 1;
  const sec = secondary((tt) => { const r = fn(tt), lx = r.x / (fs * so.s), lf = r.lift || 0; return { sh: [r.pose.sh[0] + lx, r.pose.sh[1] - lf], hip: [r.pose.hip[0] + lx, r.pose.hip[1] - lf] }; }, T, { gain: 1.25 });
  stick(g, T, { x: st.x, y: so.y - (st.lift || 0) * so.s, s: so.s, facing: st.facing, pose: st.pose, hands: st.hands, look: st.look, expr: st.expr || 'smile', sec }); return st; };
const REL = { F: { k: 'relax' }, B: { k: 'relax' } };
// ============ 1. MERS + ÎNTOARCERE + SALUT ============
const W1 = { s: 2.3, y: 1600, a: [0.4, 3.6, -170, 720], b: [4.7, 6.9, 720, 300] }, SOA = { s: W1.s };
const w1 = (t) => {
  const so = { s: W1.s }; let wk, facing = 1;
  if (t < 4.6) wk = walker(t, so, W1.a[0], W1.a[1], W1.a[2], W1.a[3], { seed: 3 }); else { wk = walker(t, so, W1.b[0], W1.b[1], W1.b[2], W1.b[3], { seed: 3 }); }
  facing = turnF(t, 3.95, 0.7, 1, -1);
  let pose = wk.pose, hands = wk.hands, look = [0, 0];
  if (t > 3.7 && t < 4.7) look = [-1.2 * clamp((t - 3.8) / 0.3), 0];                 // head leads the turn
  const kF = [{ t: -9, ang: REST_F[0], ext: REST_F[1], hand: 'relax' }, { t: 7.0 - 0.22, ang: 1.9, ext: 0.7, hand: 'open', f: 4, z: 0.9 }, { t: 7.15, ang: -1.28, ext: 0.92, hand: 'open', f: 3.2, z: 0.45, ho: { wig: 1 } }, { t: 9.1, ang: REST_F[0], ext: REST_F[1], hand: 'relax', f: 3, z: 0.7 }];
  if (t > 6.85) { pose = idle(t, { seed: 3 }); const bk = track(t, [{ t: -9, v: [0, 0, 0, 0] }, { t: 6.95, v: [-1, 2, -1, 1], f: 4, z: 0.8 }, { t: 7.15, v: [1, -1, 2, -1.5], f: 3, z: 0.5 }, { t: 9.1, v: [0, 0, 0, 0], f: 3, z: 0.7 }]); body(pose, bk); const A = arm(t, pose, kF, 'F', (v) => { if (t > 7.5 && t < 9.0) v[0] += 0.3 * Math.sin((t - 7.5) * 10); }); hands = { F: A.hand, B: { k: 'relax' } }; look = [0.4, 0]; }
  return { x: wk.x, pose, hands, facing, look, expr: t > 7 ? 'joy' : 'smile' };
};
const W1STR = [...strikes(W1.a[0], W1.a[1], W1.a[3] - W1.a[2], W1.s).map((q) => ({ ...q, seg: 0 })), ...strikes(W1.b[0], W1.b[1], W1.b[2] - W1.b[3], W1.s).map((q) => ({ ...q, seg: 1 }))];
S('f1', (g, T) => { const t = T - TM.f1[0], t0 = TM.f1[0]; const z = camLerp(t, 6.9, 9.3, 1, 1.28);
  g.save(); camera(g, { z, fx: 380, fy: 1250 }); bgS(g); floor(g, W1.y);
  for (const q of W1STR) { const xx = q.seg ? lerp(W1.b[2], W1.b[3], clamp((q.t - W1.b[0]) / (W1.b[1] - W1.b[0]))) : lerp(W1.a[2], W1.a[3], clamp((q.t - W1.a[0]) / (W1.a[1] - W1.a[0]))); puff(g, t, q.t, xx + (q.seg ? -1 : 1) * 40, W1.y, 3, 26); }
  actor(g, t, w1, { s: W1.s, y: W1.y }); g.restore();
  title(g, T, t0 + 0.1, '1 · MERS · ÎNTOARCERE · SALUT', 'picioare ancorate · haina se mișcă · degete');
  pill(g, T, t0 + 1.2, 800, 1250, 'PICIOARE ANCORATE', MI); pill(g, T, t0 + 2.4, 300, 1000, 'HANORAC + GLUGĂ', CY); pill(g, T, t0 + 4.0, 540, 820, 'ÎNTOARCERE · CAPUL ÎNAINTE', GO); pill(g, T, t0 + 7.4, 700, 760, 'DEGETE INDIVIDUALE', VI);
  post(g, T); });
// ============ 2. ALERGARE + SĂRITURĂ ============
const R1 = { s: 2.3, y: 1600, run: [0.3, 2.1, -170, 440], jt: 2.25, jd: 0.8, jx: [440, 900], H: 78 };
const r1 = (t) => { const so = { s: R1.s }; const wk = walker(t, so, R1.run[0], R1.run[1], R1.run[2], R1.run[3], { run: true, seed: 5, settle: 0.12 }); let pose = wk.pose, hands = wk.hands, x = wk.x, lift = 0, expr = 'determined';
  if (t > R1.jt - 0.14) { const J = jumpAt(t, R1.jt, { dur: R1.jd, H: R1.H, crouch: 0.14, from: pose }); pose = J.pose; lift = J.lift; x = t < R1.jt ? R1.run[3] : lerp(R1.jx[0], R1.jx[1], clamp((t - R1.jt) / R1.jd)); hands = { F: { k: t > R1.jt && t < R1.jt + R1.jd ? 'open' : 'fist' }, B: { k: t > R1.jt && t < R1.jt + R1.jd ? 'open' : 'fist' } }; if (t > R1.jt + R1.jd + 0.5) { hands = REL; expr = 'joy'; } else if (t > R1.jt + R1.jd) expr = 'surprised'; }
  if (t > 4.0) { const c = posePlain('cheer'), k = spring(t, 4.0, { f: 3.4, z: 0.45 }); pose = mixPose(idle(t, { seed: 5 }), c, clamp(k)); hands = { F: { k: 'fist' }, B: { k: 'fist' } }; expr = 'joy'; lift = Math.max(0, Math.sin((t - 4.0) * 9)) * 18 * Math.exp(-(t - 4.0) * 1.2); x = R1.jx[1]; }
  return { x, pose, hands, facing: 1, look: [0, 0], lift, expr }; };
const RSTR = strikes(R1.run[0], R1.run[1], R1.run[3] - R1.run[2], R1.s, 42, 0.35, 0.3, 0.38);
S('f2', (g, T) => { const t = T - TM.f2[0], t0 = TM.f2[0]; const st = r1(t), tl = R1.jt + R1.jd, sk = shakeAt(t, tl, 18, 0.5);
  const fx = clamp(st.x + 140, 400, 760); g.save(); camera(g, { z: 1.1 + camLerp(t, 2.0, 3.0, 0, 0.08), fx, fy: 1330, x: sk.x, y: sk.y, rot: sk.rot }); bgS(g); floor(g, R1.y);
  g.fillStyle = '#26303f'; rr(g, 620, R1.y - 95, 90, 95, 10); g.fill(); g.fillStyle = '#e0b440'; g.fillRect(620, R1.y - 95, 90, 12);
  for (const q of RSTR) puff(g, t, q.t, lerp(R1.run[2], R1.run[3], clamp((q.t - R1.run[0]) / (R1.run[1] - R1.run[0]))) - 30, R1.y, 3, 30);
  puff(g, t, R1.jt, R1.jx[0] - 10, R1.y, 5, 50); puff(g, t, tl, R1.jx[1], R1.y, 7, 90);
  actor(g, t, r1, { s: R1.s, y: R1.y }); g.restore();
  title(g, T, t0 + 0.1, '2 · ALERGARE · SĂRITURĂ', 'anticipare · zbor · aterizare cu șoc');
  pill(g, T, t0 + 0.9, 300, 1100, 'ALERGARE: ÎNCLINARE', MI); pill(g, T, t0 + 2.05, 440, 1000, 'ANTICIPARE', GO); pill(g, T, t0 + 2.6, 700, 760, 'ZBOR PESTE OBSTACOL', CY); pill(g, T, t0 + 3.2, 560, 1080, 'ATERIZARE + ȘOC', RE);
  post(g, T); });
// ============ 3. APUCĂ + ARUNCĂ ============
const A3 = { s: 2.25, y: 1620, walk: [0.3, 2.0, -160, 290], tR: 2.5, tG: 3.1, tL: 3.3, tW: 4.1, tT: 4.55, tRel: 4.67, flight: 0.95 };
const TBL = { x: 385, top: 1620 - 98 * 2.25 }, BALL = [TBL.x + 46, TBL.top - 26], HOOP = { x: 905, y: 1230 }, BR = 26;
const a3 = (t) => { const so = { s: A3.s }, wk = walker(t, so, A3.walk[0], A3.walk[1], A3.walk[2], A3.walk[3], { seed: 1 }); let pose = wk.pose, hands = wk.hands, look = [0, 0], expr = 'neutral', lift = 0;
  const sh0 = { x: 290, y: A3.y, s: A3.s, facing: 1 }, ob = aim(sh0, BALL[0], BALL[1]), ext = Math.min(0.99, ob.dist / 74), tr = A3.tRel;
  if (t > 2.0) { pose = idle(t, { seed: 1 });
    const kF = [{ t: -9, ang: REST_F[0], ext: REST_F[1], hand: 'relax' }, { t: A3.tR - 0.3, ang: 1.35, ext: 0.7, hand: 'open', f: 4.2, z: 0.9 }, { t: A3.tR, ang: ob.ang, ext, hand: 'open', f: 3.4, z: 0.5 }, { t: A3.tG, ang: ob.ang, ext, hand: 'grip', f: 9, z: 0.8 },
      { t: A3.tL, ang: 0.62, ext: 0.7, hand: 'grip', f: 3.2, z: 0.3 }, { t: A3.tW - 0.5, ang: 0.3, ext: 0.7, hand: 'grip', f: 3, z: 0.7 }, { t: A3.tW, ang: -2.35, ext: 0.97, hand: 'grip', f: 3.6, z: 0.6 },
      { t: A3.tT, ang: -0.95, ext: 0.98, hand: 'grip', f: 6.5, z: 0.38 }, { t: tr, ang: -0.7, ext: 0.99, hand: 'open', f: 8, z: 0.7 }, { t: tr + 0.3, ang: 0.2, ext: 0.9, hand: 'open', f: 3, z: 0.55 }, { t: tr + 1.6, ang: REST_F[0], ext: REST_F[1], hand: 'relax', f: 3, z: 0.7 }];
    const kB = [{ t: -9, ang: REST_B[0], ext: REST_B[1], hand: 'relax' }, { t: A3.tR - 0.1, ang: 2.15, ext: 0.9, hand: 'open', f: 3, z: 0.6 }, { t: A3.tL + 0.3, ang: 1.75, ext: 0.97, hand: 'relax', f: 3, z: 0.6 }, { t: A3.tW, ang: 0.5, ext: 0.85, hand: 'open', f: 3.2, z: 0.6 }, { t: tr + 0.2, ang: 1.9, ext: 0.97, hand: 'relax', f: 3, z: 0.6 }];
    const bk = [{ t: -9, v: [0, 0, 0, 0] }, { t: A3.tR - 0.4, v: [-1, 3, 0, 1], f: 3.5, z: 0.85 }, { t: A3.tR - 0.05, v: [10, 6, 3, 2], f: 3, z: 0.5 }, { t: A3.tG + 0.25, v: [3, 1, 2, 3.5], f: 3, z: 0.6 }, { t: A3.tW, v: [-7, 5, -2, 0], f: 3.2, z: 0.6 }, { t: A3.tT, v: [11, -1, 4, -1], f: 6, z: 0.4 }, { t: tr + 1.2, v: [0, 0, 0, 0], f: 3, z: 0.7 }];
    body(pose, track(t, bk)); const A = arm(t, pose, kF, 'F'), B = arm(t, pose, kB, 'B'); hands = { F: A.hand, B: B.hand };
    look = t < A3.tT ? [0.8, 0.4] : [1, -0.5]; expr = t > tr + A3.flight ? 'joy' : t > A3.tL ? 'smile' : 'neutral';
    if (t > tr + A3.flight + 0.15) { const c = posePlain('cheer'), k = spring(t, tr + A3.flight + 0.15, { f: 3.6, z: 0.45 }); pose = mixPose(pose, c, clamp(k)); hands = { F: { k: 'open', wig: 1, tm: t }, B: { k: 'open', wig: 1, tm: t } }; lift = Math.max(0, Math.sin((t - tr - A3.flight - 0.15) * 9)) * 16 * Math.exp(-(t - tr - A3.flight) * 1.3); } }
  return { x: wk.x, pose, hands, facing: 1, look, expr, lift }; };
const ballAt = (t, st) => { // -> {x,y,rot,state}
  const so = { x: st.x, y: A3.y, s: A3.s, facing: 1 }, tr = A3.tRel;
  if (t < A3.tG) return { x: BALL[0], y: BALL[1], rot: 0, on: 'table' };
  if (t < tr) { const h = toWorld(so, st.pose.hF[0], st.pose.hF[1]); return { x: h[0] + 22, y: h[1] - 16, rot: (t - A3.tG) * 0.4, on: 'hand' }; }
  const so2 = { x: 290, y: A3.y, s: A3.s, facing: 1 }, tT = tr + A3.flight, rel = a3(tr), h0 = toWorld(so2, rel.pose.hF[0], rel.pose.hF[1]), p0 = [h0[0] + 22, h0[1] - 16], p1 = [HOOP.x, HOOP.y + 5], g_ = 2400, u = t - tr;
  const vx = (p1[0] - p0[0]) / A3.flight, vy = (p1[1] - p0[1]) / A3.flight - 0.5 * g_ * A3.flight;
  if (t < tT) return { x: p0[0] + vx * u, y: p0[1] + vy * u + 0.5 * g_ * u * u, rot: u * 9, on: 'air', u: u / A3.flight };
  const w = t - tT, fl = A3.y - BR, yf = HOOP.y + 5 + 700 * w * w + 60 * w; if (yf < fl) return { x: HOOP.x - 8 * w, y: yf, rot: u * 9, on: 'fall' }; const tf = (Math.sqrt(60 * 60 + 4 * 700 * (fl - HOOP.y - 5)) - 60) / 1400, w2 = w - tf; return { x: HOOP.x - 8 * w + 40 * w2, y: fl - 110 * Math.abs(Math.sin(w2 * 7)) * Math.exp(-w2 * 2.6), rot: u * 9 + w2 * 6, on: 'fall' };
};
S('f3', (g, T) => { const t = T - TM.f3[0], t0 = TM.f3[0], tHit = A3.tRel + A3.flight, sk = shakeAt(t, tHit, 10, 0.4);
  const z = 1 + camLerp(t, A3.tW - 0.3, A3.tT, 0, 0.06) + camLerp(t, tHit - 0.2, tHit + 0.15, 0, 0.12) - camLerp(t, tHit + 0.3, tHit + 1.4, 0, 0.12);
  g.save(); camera(g, { z, fx: 620, fy: 1350, x: sk.x, y: sk.y, rot: sk.rot }); bgS(g); floor(g, A3.y);
  g.fillStyle = '#26303f'; rr(g, TBL.x - 30, TBL.top, 290, 24, 8); g.fill(); g.fillStyle = '#1b2330'; g.fillRect(TBL.x + 5, TBL.top + 24, 20, A3.y - TBL.top - 24); g.fillRect(TBL.x + 205, TBL.top + 24, 20, A3.y - TBL.top - 24);
  // coș: panou + inel + plasă (partea din spate)
  g.fillStyle = '#e8edf5'; rr(g, HOOP.x + 40, HOOP.y - 210, 26, 250, 8); g.fill(); g.fillStyle = '#26303f'; g.fillRect(HOOP.x + 60, HOOP.y + 40, 14, A3.y - HOOP.y - 40);
  const wig = t > tHit ? Math.exp(-(t - tHit) * 4) * Math.sin((t - tHit) * 26) * 9 : 0;
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(HOOP.x + i * 14, HOOP.y); g.lineTo(HOOP.x + i * 8 + wig, HOOP.y + 62 + Math.abs(wig) * 0.3); g.stroke(); } g.beginPath(); g.moveTo(HOOP.x - 42 + wig, HOOP.y + 40); g.lineTo(HOOP.x + 42 + wig, HOOP.y + 40); g.stroke();
  g.strokeStyle = RE; g.lineWidth = 10; g.beginPath(); g.ellipse(HOOP.x, HOOP.y, 56, 12, 0, Math.PI, 0); g.stroke();
  const st = actor(g, t, a3, { s: A3.s, y: A3.y }), b = ballAt(t, st);
  const drawBall = () => { g.save(); g.translate(b.x, b.y); g.rotate(b.rot); circle(g, 0, 0, BR, '#ff8a3d'); g.strokeStyle = '#7a3410'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, BR, 0, 7); g.moveTo(-BR, 0); g.lineTo(BR, 0); g.moveTo(0, -BR); g.lineTo(0, BR); g.stroke(); g.restore(); };
  if (b.on === 'air' || b.on === 'fall') for (let i = 1; i <= 4; i++) { const tb = ballAt(t - i * 0.04, st); g.globalAlpha = 0.2 * (1 - i / 5); circle(g, tb.x, tb.y, BR * (1 - i * 0.1), '#ff8a3d'); g.globalAlpha = 1; }
  drawBall(); g.strokeStyle = RE; g.lineWidth = 10; g.beginPath(); g.ellipse(HOOP.x, HOOP.y, 56, 12, 0, 0, Math.PI); g.stroke();
  if (t > tHit) { const u = (t - tHit) / 0.8; if (u < 1) for (let i = 0; i < 18; i++) { const an = i / 18 * 6.283, r = 40 + 260 * u; g.globalAlpha = 1 - u; circle(g, HOOP.x + Math.cos(an) * r, HOOP.y + Math.sin(an) * r * 0.8, 6, [GO, CY, RE, MI][i % 4]); } g.globalAlpha = 1; }
  g.restore();
  title(g, T, t0 + 0.1, '3 · APUCĂ · ARUNCĂ', 'degete care strâng · greutate · coș');
  pill(g, T, t0 + 2.7, 330, 1130, 'ÎNTINDE MÂNA', CY); pill(g, T, t0 + 3.3, 330, 1230, 'DEGETE STRÂNG MINGEA', MI); pill(g, T, t0 + 4.1, 360, 1000, 'ÎNCĂRCARE', GO); pill(g, T, t0 + 4.8, 600, 930, 'ARUNCĂ!', RE); pill(g, T, t0 + tHit + 0.1, 700, 860, 'COȘ!', VI);
  post(g, T); });
// ============ 4. OUTRO v3 ============
const O = { t0: TM.q[0] + 0.45, tGold: TM.q[0] + 2.0 };
S('q', (g, T) => { outro3Question(g, T, { ...O, white: ['Would you rather', 'film with this?'], gold: ['YES or NO?'] }); post(g, T); });
const OC = { tC: TM.c[0] + 0.5, tTg: TM.c[0] + 1.9, tF: TM.c[0] + 3.4, tTap: TM.c[0] + 5.6, commentWord: 'CLIP' };
S('c', (g, T) => { outro3CTA(g, T, OC); post(g, T); });
