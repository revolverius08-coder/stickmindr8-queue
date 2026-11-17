// outro2.js - StickMindR8 ENDING v2: glass cards with gradient borders, typed comment box, IG-style follow card, and Stick pointing with the motion layer.
import { K, NT, ease, clamp, lerp, prog, glow, circle, rr, stick, rng, seg } from './h.js';
import { measure } from '/engine/core.js';
import { pointSeq, fingerTip, posePlain, mixPose, spring, idle, body, toLocal } from './motion.js';
let AV = null; try { AV = new Image(); AV.src = '/project/input/avatar.png'; await AV.decode(); } catch (e) { AV = null; }
const popK = (T, t0, d = 0.45) => ease.outBack(prog(T, t0, t0 + d)), pul = (T, t0, a = 0.06) => 1 + a * Math.sin(Math.PI * clamp((T - t0) / 0.4));
const CY = '#7fd4ff', VI = '#a98bff', RED = '#ff4d5e', GRN = '#25d366';
export function bg2(g, T, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#0b0d14'); gr.addColorStop(0.5, '#1b2433'); gr.addColorStop(1, '#06070a'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
  glow(g, 540, 700, 760, o.q ? '#3aa8ff' : '#8a6bff', 0.16);
  const r = rng(11); for (let i = 0; i < 30; i++) { const x = r() * 1080, y0 = r() * 1920, ph = r() * 6.28, sp = 0.4 + r() * 0.8, y = (y0 - T * 24 * sp + 19200) % 1920, a = 0.16 + 0.16 * Math.sin(T * 1.4 + ph);
    if (o.q && i % 3 === 0) { g.save(); g.globalAlpha = a * 0.8; g.translate(x, y); g.rotate(Math.sin(T * 0.5 + ph) * 0.4); K.text(g, '?', 0, 0, { size: 60 + r() * 130, weight: 900, color: '#7fd4ff' }); g.restore(); } else { g.globalAlpha = a; circle(g, x, y, 2 + r() * 4, '#cfeeff'); g.globalAlpha = 1; } }
}
function glass(g, w, h, rad, c1, c2, T) { // gradient border + dark glass + moving shine
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 44; g.shadowOffsetY = 20; rr(g, -w / 2, -h / 2, w, h, rad); const gb = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); gb.addColorStop(0, c1); gb.addColorStop(1, c2); g.fillStyle = gb; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
  rr(g, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, rad - 12); const gi = g.createLinearGradient(0, -h / 2, 0, h / 2); gi.addColorStop(0, '#171c28'); gi.addColorStop(1, '#0a0c12'); g.fillStyle = gi; g.fill();
  g.save(); rr(g, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, rad - 12); g.clip(); const sx = -w + ((T * 260) % (w * 3)); g.translate(sx, 0); g.rotate(0.35); const sg = g.createLinearGradient(-40, 0, 40, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,.07)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(-40, -h, 80, h * 2); g.restore();
}
const tipGuide = (g, so, tip, tgt, k) => { if (k <= 0 || k >= 1) return; g.save(); g.globalAlpha = 0.7 * (1 - k); g.setLineDash([14, 16]); g.lineDashOffset = -k * 80; g.strokeStyle = '#cfeeff'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(lerp(tip[0], tgt[0], 0.15 + 0.85 * ease.out(k)), lerp(tip[1], tgt[1], 0.15 + 0.85 * ease.out(k))); g.stroke(); g.restore(); };
const ripple = (g, x, y, T, t0) => { const r = (T - t0) / 0.55; if (r < 0 || r > 1) return; g.save(); g.globalAlpha = 0.8 * (1 - r); g.strokeStyle = '#fff'; g.lineWidth = 6 * (1 - r) + 1; g.beginPath(); g.arc(x, y, 12 + 70 * r, 0, 7); g.stroke(); g.restore(); };
function stickPointing(g, T, so, targets, o) {
  const R = pointSeq(T, so, targets, { end: o.end, seed: o.seed });
  if (o.after && T >= o.after.t) { const k = spring(T, o.after.t, { f: 3.6, z: 0.45 }), c = posePlain('cheer'), hop = Math.max(0, Math.sin((T - o.after.t) * 9)) * 22 * Math.exp(-(T - o.after.t) * 1.6);
    const sw = Math.sin((T - o.after.t) * 11) * 7; c.hF = [c.hF[0] + sw, c.hF[1]]; c.hB = [c.hB[0] - sw, c.hB[1]]; const P2 = mixPose(R.pose, c, clamp(k)); stick(g, T, { ...so, y: so.y - hop * so.s * 0.5, pose: P2, expr: 'joy', hands: { F: { k: 'open' }, B: { k: 'open' } } }); return; }
  stick(g, T, { ...so, pose: R.pose, expr: o.expr || 'smile', hands: R.hands, look: R.look });
  if (R.hands.F.k === 'point') { const tip = fingerTip(so, R.pose, R.hands.F); for (const tg of targets) { tipGuide(g, so, tip, [tg.x, tg.y], (T - tg.t) / 0.7); for (const tt of tg.taps || []) ripple(g, tg.x, tg.y, T, tt); } }
}
export const Q2 = { x: 540, y: 600, w: 820, h: 500 };
export function outro2Question(g, T, o) {
  bg2(g, T, { q: true }); const k = popK(T, o.t0, 0.55), c = Q2;
  if (k > 0.01) { const fy = Math.sin(T * 1.3) * 6; g.save(); g.translate(c.x, c.y + fy); g.scale(k * pul(T, o.t0), k * pul(T, o.t0)); g.rotate((1 - Math.min(1, k)) * 0.35 + Math.sin(T * 0.8) * 0.01);
    glow(g, 0, 0, 560, CY, 0.2); glass(g, c.w, c.h, 60, CY, VI, T);
    g.save(); g.translate(-c.w / 2 + 70, -c.h / 2 + 62); rr(g, -46, -24, 92, 48, 24); g.fillStyle = CY; g.fill(); K.text(g, 'Q', 0, 2, { size: 34, weight: 900, color: '#07121c' }); g.restore();
    o.white.forEach((s, i) => K.text(g, s, 0, -92 + i * 80, { size: 76, weight: 900, color: '#fff', stroke: 10, strokeColor: '#000' }));
    const gk = popK(T, o.tGold, 0.38); if (gk > 0.01) o.gold.forEach((s, i) => { g.save(); g.translate(0, 82 + i * 84); g.scale(gk, gk); const gg = g.createLinearGradient(-200, -30, 200, 30); gg.addColorStop(0, '#cfeeff'); gg.addColorStop(1, '#7fd4ff'); K.text(g, s, 0, 0, { size: 84, weight: 900, color: '#cfeeff', stroke: 10, strokeColor: '#000' }); g.restore(); });
    g.restore(); }
  const so = { x: 420, y: 1420, s: 2.0, facing: 1 }, shrug = T >= o.tGold + 0.35;
  if (!shrug) stickPointing(g, T, so, [{ t: o.t0 + 0.05, x: Q2.x - 40, y: Q2.y + Q2.h / 2 + 18, taps: [o.t0 + 0.42] }], { end: o.tGold + 0.3, seed: 1 });
  else { const sh = spring(T, o.tGold + 0.35, { f: 3.2, z: 0.45 }), p = mixPose(idle(T, { seed: 1 }), posePlain('shrug'), clamp(sh)); stick(g, T, { ...so, pose: p, expr: 'thinking', hands: { F: { k: 'open' }, B: { k: 'open' } } }); }
}
export const CTA2 = { bub: { x: 540, y: 430 }, tag: { x: 540, y: 810 }, fol: { x: 540, y: 1170 } };
export function outro2CTA(g, T, o) {
  bg2(g, T, {}); const cs = 0.8, kb = popK(T, o.tC - 0.05, 0.5), kt = popK(T, o.tTg - 0.05, 0.45), kf = popK(T, o.tF - 0.05, 0.55), done = T > o.tTap + 0.04, flt = (p) => Math.sin(T * 1.7 + p) * 7, word = o.commentWord ?? 'BELOW';
  // 1) comment card: title + typed input
  if (kb > 0.01) { const b = CTA2.bub; g.save(); g.translate(b.x, b.y + flt(0)); g.scale(cs * kb * pul(T, o.tC), cs * kb * pul(T, o.tC)); g.rotate((1 - Math.min(1, kb)) * -0.3); glow(g, 0, 0, 520, '#f4f4fa', 0.07);
    g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 36; g.shadowOffsetY = 16; rr(g, -400, -190, 800, 380, 76); g.fillStyle = '#f6f6fb'; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    K.text(g, 'COMMENT', 0, -92, { size: 124, weight: 900, color: '#15152a' });
    rr(g, -340, 6, 680, 120, 60); g.fillStyle = '#e6e7f2'; g.fill(); g.save(); g.translate(-282, 66); g.beginPath(); g.arc(0, 0, 40, 0, 7); g.clip(); if (AV && AV.naturalWidth) g.drawImage(AV, -40, -40, 80, 80); else circle(g, 0, 0, 40, '#8a6bff'); g.restore();
    const n = Math.floor(clamp((T - (o.tC + 0.28)) / 0.5) * word.length + 0.001), txt = word.slice(0, n), cur = (Math.floor(T * 2.6) % 2 === 0) || n < word.length;
    g.textAlign = 'left'; K.text(g, txt, -222 + 0, 70, { size: 76, weight: 900, color: o.commentWord ? RED : '#15152a', align: 'left' }); if (cur && T > o.tC + 0.2) { g.fillStyle = '#15152a'; g.fillRect(-220 + (txt ? measure(g, txt, 76, undefined, 900) : 0) + 6, 36, 6, 64); }
    if (n === 0) for (let i = 0; i < 3; i++) circle(g, -200 + i * 38, 70 - 12 * Math.max(0, Math.sin(T * 8 - i * 0.9)), 10, '#8c90a8');
    circle(g, 294, 66, 38, n >= word.length ? '#3b82ff' : '#b8bccc'); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(282, 48); g.lineTo(314, 66); g.lineTo(282, 84); g.lineTo(287, 66); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-250, 186); g.lineTo(-206, 246); g.lineTo(-150, 186); g.closePath(); g.fillStyle = '#f6f6fb'; g.fill(); g.restore(); }
  // 2) tag chip
  if (kt > 0.01) { const b = CTA2.tag; g.save(); g.translate(b.x, b.y + flt(1.6)); g.scale(cs * kt * pul(T, o.tTg), cs * kt * pul(T, o.tTg)); g.rotate((1 - Math.min(1, kt)) * 0.3);
    g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 32; g.shadowOffsetY = 14; rr(g, -400, -96, 800, 192, 96); const gt = g.createLinearGradient(-400, 0, 400, 0); gt.addColorStop(0, '#ff4d5e'); gt.addColorStop(1, '#ff8a4d'); g.fillStyle = gt; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    circle(g, -296, 0, 66, '#fff'); K.text(g, '@', -296, 4, { size: 92, weight: 900, color: RED });
    K.text(g, o.tagText ?? 'TAG A FRIEND', 50, 4, { size: o.tagSize ?? 80, weight: 900, color: '#fff', stroke: 12, strokeColor: '#5a1010' });
    for (let i = 0; i < 2; i++) { const kk = popK(T, o.tTg + 0.2 + i * 0.12, 0.35); if (kk > 0.01) { g.save(); g.translate(318 + i * 40, 62); g.scale(kk, kk); circle(g, 0, 0, 22, i ? '#ffe08a' : '#7fd4ff'); circle(g, 0, -6, 7, '#15152a'); g.fillStyle = '#15152a'; g.beginPath(); g.arc(0, 14, 11, Math.PI, 0); g.fill(); g.restore(); } }
    g.restore(); }
  // 3) follow card
  const bx = CTA2.fol.x, by = CTA2.fol.y + 118 * cs;
  if (kf > 0.01) { const b = CTA2.fol; g.save(); g.translate(b.x, b.y + flt(3.2)); g.scale(cs * kf * pul(T, o.tF), cs * kf * pul(T, o.tF)); g.rotate((1 - Math.min(1, kf)) * 0.3); glow(g, 0, 0, 560, '#a98bff', 0.14); glass(g, 880, 500, 60, '#ff6a8a', '#8a6bff', T);
    const R = 108; g.save(); g.translate(-250, -84); const rg = g.createConicGradient ? g.createConicGradient(T * 1.2, 0, 0) : null; if (rg) { rg.addColorStop(0, '#feda75'); rg.addColorStop(0.3, '#fa7e1e'); rg.addColorStop(0.55, '#d62976'); rg.addColorStop(0.8, '#962fbf'); rg.addColorStop(1, '#feda75'); g.fillStyle = rg; } else g.fillStyle = '#d62976'; g.beginPath(); g.arc(0, 0, R + 12, 0, 7); g.fill(); g.beginPath(); g.arc(0, 0, R + 3, 0, 7); g.fillStyle = '#0b0d12'; g.fill();
    g.beginPath(); g.arc(0, 0, R - 4, 0, 7); g.clip(); if (AV && AV.naturalWidth) g.drawImage(AV, -R, -R, R * 2, R * 2); else circle(g, 0, 0, R, '#222'); g.restore();
    K.text(g, 'StickMindR8', 130, -124, { size: 68, weight: 900, color: '#fff', stroke: 10, strokeColor: '#000' }); circle(g, 400, -126, 20, '#3b9bff'); seg(g, [[390, -126], [397, -118], [411, -135]], 5, '#fff');
    K.text(g, 'new stories every day', 146, -52, { size: 38, weight: 800, color: '#c8c8e0' });
    const ru = T - o.tTap, sq = 1 - 0.1 * Math.sin(Math.PI * clamp((T - (o.tTap - 0.1)) / 0.28)) + 0.06 * Math.sin(Math.PI * clamp((T - o.tTap - 0.1) / 0.4));
    g.save(); g.translate(0, 122); g.scale(sq, sq); rr(g, -340, -68, 680, 136, 68); const gf = g.createLinearGradient(-340, 0, 340, 0); if (done) { gf.addColorStop(0, '#1fc15d'); gf.addColorStop(1, '#2be37a'); } else { gf.addColorStop(0, '#ff2d55'); gf.addColorStop(1, '#ff5a8a'); } g.fillStyle = gf; g.fill();
    K.text(g, done ? 'FOLLOWING ✓' : 'FOLLOW', 0, 6, { size: 84, weight: 900, color: '#fff', stroke: 12, strokeColor: '#000' }); g.restore();
    if (ru > -0.12 && ru < 0.7) { const r = clamp((ru + 0.12) / 0.5); g.globalAlpha = 0.55 * (1 - r); circle(g, 0, 122, 30 + 130 * r, 'rgba(255,255,255,0.9)'); g.globalAlpha = 1; }
    g.restore(); }
  // cursor + confetti
  const cu = ease.inOut(prog(T, o.tF + 0.25, o.tTap - 0.1));
  if (T > o.tF + 0.25 && T < o.tTap + 1.1) { const cx = lerp(640, bx + 40, cu), cy = lerp(1800, by + 30, cu), press = 1 - 0.18 * Math.sin(Math.PI * clamp((T - (o.tTap - 0.1)) / 0.28)); g.save(); g.translate(cx, cy); g.scale(press, press); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 78); g.lineTo(20, 60); g.lineTo(36, 98); g.lineTo(52, 90); g.lineTo(36, 54); g.lineTo(62, 52); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  const cu2 = T - o.tTap; if (cu2 > 0 && cu2 < 1.8) { const r = rng(5); for (let i = 0; i < 80; i++) { const a = -1.2 - r() * 1.6 + (r() - 0.5), v = 500 + r() * 900, ph = r() * 6.28, x = bx + Math.cos(a) * v * cu2 * 0.7 + (r() - 0.5) * 60, y = by + Math.sin(a) * v * cu2 * 0.7 + 1500 * cu2 * cu2; g.save(); g.globalAlpha = 1 - clamp((cu2 - 1.2) / 0.6); g.translate(x, y); g.rotate(ph + cu2 * (6 + r() * 8)); g.fillStyle = ['#cfeeff', '#ff2d55', '#4af08a', '#4ac8ff', '#ffe08a', '#a98bff'][i % 6]; g.fillRect(-9, -15, 18, 30); g.restore(); } }
  // Stick (bottom right) points at each card in turn, taps on its pop, then celebrates on FOLLOW
  const so = { x: 930, y: 1810, s: 1.9, facing: -1 };
  stickPointing(g, T, so, [{ t: o.tC, x: CTA2.bub.x + 330, y: CTA2.bub.y + 20, taps: [o.tC + 0.35] }, { t: o.tTg, x: CTA2.tag.x + 340, y: CTA2.tag.y, taps: [o.tTg + 0.3] }, { t: o.tF, x: CTA2.fol.x + 370, y: CTA2.fol.y + 40, taps: [o.tF + 0.3, o.tTap - 0.05] }], { end: 1e9, seed: 2, after: { t: o.tTap + 0.1 } });
}
