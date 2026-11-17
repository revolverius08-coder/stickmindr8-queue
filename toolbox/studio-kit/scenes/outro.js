// outro.js - the standard StickMindR8 ENDING (question card -> comment bubble -> tag chip -> follow card + click).
// Stick always points his hand AT the card that is popping (arm direction = direction to the card).
import { K, NT, ease, clamp, lerp, prog, glow, circle, rr, layer, F, P, stick, rng, seg } from './h.js';
import { drawFigure } from '/engine/rig2d.js';

let AV = null; try { AV = new Image(); AV.src = '/project/input/avatar.png'; await AV.decode(); } catch (e) { AV = null; }
const pul = (T, t0, a = 0.07) => 1 + a * Math.sin(Math.PI * clamp((T - t0) / 0.4));
const popK = (T, t0, d = 0.42) => ease.outBack(prog(T, t0, t0 + d));

export function outroBG(g, T, o = {}) {
  NT.scr(g, (g3) => {
    const gr = g3.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#101216'); gr.addColorStop(0.55, '#26323f'); gr.addColorStop(1, '#07080a');
    g3.fillStyle = gr; g3.fillRect(0, 0, 1080, 1920);
    const r = rng(11);
    for (let i = 0; i < 26; i++) {
      const x = r() * 1080, y0 = r() * 1920, ph = r() * 6.28, sp = 0.4 + r() * 0.8, y = (y0 - T * 22 * sp + 1920 * 10) % 1920, a = 0.18 + 0.18 * Math.sin(T * 1.4 + ph);
      if (o.q) { g3.save(); g3.globalAlpha = a * 0.9; g3.translate(x, y); g3.rotate(Math.sin(T * 0.5 + ph) * 0.4); K.text(g3, '?', 0, 0, { size: 70 + r() * 150, weight: 900, color: '#7fd4ff' }); g3.restore(); }
      else { g3.globalAlpha = a; circle(g3, x, y, 2 + r() * 4, '#cfeeff'); g3.globalAlpha = 1; }
    }
  });
}

// pose whose near arm points from the shoulder toward world target (tx,ty)
function armTo(so, tx, ty, base = 'stand') {
  const b = P(base), f = so.facing ?? 1, s = so.s;
  const shW = [so.x + f * s * b.sh[0], so.y + s * b.sh[1]];
  let dx = (tx - shW[0]) / (f * s), dy = (ty - shW[1]) / s; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  const hF = [b.sh[0] + dx * 74, b.sh[1] + dy * 74], eF = [b.sh[0] + dx * 38, b.sh[1] + dy * 38 + 6];
  const hand = [so.x + f * s * hF[0], so.y + s * hF[1]], wd = [(hand[0] - shW[0]), (hand[1] - shW[1])]; const wl = Math.hypot(wd[0], wd[1]) || 1;
  return [{ ...b, eF, hF }, hand, [wd[0] / wl, wd[1] / wl]];
}
export function pointPose(T, so, targets, base = 'stand') {
  let a = targets[0], b = targets[0], k = 1;
  for (let i = 0; i < targets.length; i++) if (T >= targets[i].t) { a = targets[Math.max(0, i - 1)]; b = targets[i]; k = ease.inOut(prog(T, b.t - 0.05, b.t + 0.3)); }
  return armTo(so, lerp(a.x, b.x, k), lerp(a.y, b.y, k), base);
}
export function finger(g2, hand, dir, s) { const e = [hand[0] + dir[0] * 28 * s, hand[1] + dir[1] * 28 * s]; seg(g2, [hand, e], 10 * s, '#0b0910'); }

export const Q_CARD = { x: 540, y: 580, w: 800, h: 490 };
export function outroQuestion(g, T, o) {
  outroBG(g, T, { q: true });
  const k = popK(T, o.t0, 0.5), c = Q_CARD;
  NT.scr(g, (g3) => {
    if (k <= 0.01) return; const fy = Math.sin(T * 1.3) * 6;
    g3.save(); g3.translate(c.x, c.y + fy); g3.scale(k * pul(T, o.t0), k * pul(T, o.t0)); g3.rotate((1 - Math.min(1, k)) * 0.35 + Math.sin(T * 0.8) * 0.012);
    glow(g3, 0, 0, 520, '#7fd4ff', 0.18);
    g3.shadowColor = 'rgba(0,0,0,.55)'; g3.shadowBlur = 40; g3.shadowOffsetY = 18; rr(g3, -c.w / 2, -c.h / 2, c.w, c.h, 54); g3.fillStyle = '#7fd4ff'; g3.fill(); g3.shadowBlur = 0; g3.shadowOffsetY = 0;
    rr(g3, -c.w / 2 + 20, -c.h / 2 + 20, c.w - 40, c.h - 40, 40); g3.fillStyle = '#0b0d12'; g3.fill();
    o.white.forEach((s, i) => K.text(g3, s, 0, -112 + i * 78, { size: 74, weight: 900, color: '#ffffff', stroke: 10, strokeColor: '#000' }));
    const gk = popK(T, o.tGold, 0.35);
    if (gk > 0.01) o.gold.forEach((s, i) => { g3.save(); g3.translate(0, 70 + i * 82); g3.scale(gk, gk); K.text(g3, s, 0, 0, { size: 80, weight: 900, color: '#cfeeff', stroke: 10, strokeColor: '#000' }); g3.restore(); });
    g3.restore();
  });
  const so = { x: 440, y: 1390, s: 2.0, facing: 1 }, shrug = T >= o.tGold + 0.25;
  let pose, hand, dir;
  if (!shrug) [pose, hand, dir] = pointPose(T, so, [{ t: 0, x: 700, y: 1100 }, { t: o.t0, x: Q_CARD.x + 170, y: Q_CARD.y + Q_CARD.h / 2 + 15 }]); else pose = 'shrug';
  stick(g, T, { ...so, pose, expr: shrug ? 'thinking' : 'smile' }); if (!shrug && hand) finger(g, hand, dir, so.s);
}

export const CTA = { bub: { x: 540, y: 440 }, tag: { x: 540, y: 800 }, fol: { x: 540, y: 1157 } };
export function outroCTA(g, T, o) {
  outroBG(g, T, {});
  const cs = 0.78, kb = popK(T, o.tC - 0.05, 0.5), kt = popK(T, o.tTg - 0.05, 0.45), kf = popK(T, o.tF - 0.05, 0.55);
  const done = T > o.tTap + 0.04, flt = (p) => Math.sin(T * 1.7 + p) * 7;
  NT.scr(g, (g3) => {
    if (kb > 0.01) { const b = CTA.bub; g3.save(); g3.translate(b.x, b.y + flt(0)); g3.scale(cs * kb * pul(T, o.tC), cs * kb * pul(T, o.tC)); g3.rotate((1 - Math.min(1, kb)) * -0.3);
      g3.shadowColor = 'rgba(0,0,0,.5)'; g3.shadowBlur = 34; g3.shadowOffsetY = 16; rr(g3, -390, -170, 780, 340, 90); g3.fillStyle = '#f4f4fa'; g3.fill(); g3.beginPath(); g3.moveTo(-250, 150); g3.lineTo(-200, 250); g3.lineTo(-120, 150); g3.closePath(); g3.fill(); g3.shadowBlur = 0; g3.shadowOffsetY = 0;
      K.text(g3, 'COMMENT', 0, -52, { size: 128, weight: 900, color: '#15152a' }); K.text(g3, o.commentWord ?? 'BELOW', o.commentWord ? -40 : -60, 62, { size: o.commentWord ? 150 : 128, weight: 900, color: o.commentWord ? '#ff5a5a' : '#15152a' });
      for (let i = 0; i < 3; i++) circle(g3, 190 + i * 52, 96 - 18 * Math.max(0, Math.sin(T * 8 - i * 0.9)), 15, '#555a74'); g3.restore(); }
    if (kt > 0.01) { const b = CTA.tag; g3.save(); g3.translate(b.x, b.y + flt(1.6)); g3.scale(cs * kt * pul(T, o.tTg), cs * kt * pul(T, o.tTg)); g3.rotate((1 - Math.min(1, kt)) * 0.3);
      g3.shadowColor = 'rgba(0,0,0,.5)'; g3.shadowBlur = 30; g3.shadowOffsetY = 14; rr(g3, -380, -90, 760, 180, 90); g3.fillStyle = '#ff5a5a'; g3.fill(); g3.shadowBlur = 0; g3.shadowOffsetY = 0;
      K.text(g3, o.tagText ?? '@ TAG A FRIEND', 0, 4, { size: o.tagSize ?? 98, weight: 900, color: '#fff', stroke: 12, strokeColor: '#5a1010' }); g3.restore(); }
    if (kf > 0.01) { const b = CTA.fol; g3.save(); g3.translate(b.x, b.y + flt(3.2)); g3.scale(cs * kf * pul(T, o.tF), cs * kf * pul(T, o.tF)); g3.rotate((1 - Math.min(1, kf)) * 0.3);
      g3.shadowColor = 'rgba(0,0,0,.55)'; g3.shadowBlur = 36; g3.shadowOffsetY = 16; rr(g3, -430, -245, 860, 490, 56); g3.fillStyle = '#7fd4ff'; g3.fill(); g3.shadowBlur = 0; g3.shadowOffsetY = 0;
      rr(g3, -412, -227, 824, 454, 44); g3.fillStyle = '#0b0d12'; g3.fill();
      const R = 112; g3.save(); g3.translate(-232, -78); g3.beginPath(); g3.arc(0, 0, R, 0, 7); g3.clip(); if (AV && AV.naturalWidth) g3.drawImage(AV, -R, -R, R * 2, R * 2); else circle(g3, 0, 0, R, '#222'); g3.restore();
      g3.lineWidth = 8; g3.strokeStyle = '#fff'; g3.beginPath(); g3.arc(-232, -78, R, 0, 7); g3.stroke();
      K.text(g3, 'StickMindR8', 118, -118, { size: 72, weight: 900, color: '#fff', stroke: 10, strokeColor: '#000' }); K.text(g3, 'new stories every day', 118, -46, { size: 38, weight: 800, color: '#c8c8e0' });
      const ru = T - o.tTap, sq = 1 - 0.1 * Math.sin(Math.PI * clamp((T - (o.tTap - 0.1)) / 0.28)) + 0.06 * Math.sin(Math.PI * clamp((T - o.tTap - 0.1) / 0.4));
      g3.save(); g3.translate(0, 118); g3.scale(sq, sq); rr(g3, -330, -66, 660, 132, 66); g3.fillStyle = done ? '#25d366' : '#fe2c55'; g3.fill();
      K.text(g3, done ? 'FOLLOWING ✓' : 'FOLLOW', 0, 6, { size: 82, weight: 900, color: '#fff', stroke: 12, strokeColor: '#000' }); g3.restore();
      if (ru > -0.12 && ru < 0.7) { const r = clamp((ru + 0.12) / 0.5); g3.globalAlpha = 0.55 * (1 - r); circle(g3, 0, 118, 30 + 120 * r, 'rgba(255,255,255,0.9)'); g3.globalAlpha = 1; }
      g3.restore(); }
    const bx = CTA.fol.x, by = CTA.fol.y + 118 * cs, cu = ease.inOut(prog(T, o.tF + 0.25, o.tTap - 0.1));
    if (T > o.tF + 0.25 && T < o.tTap + 1.1) { const cx = lerp(900, bx + 40, cu), cy = lerp(1720, by + 30, cu), press = 1 - 0.18 * Math.sin(Math.PI * clamp((T - (o.tTap - 0.1)) / 0.28));
      g3.save(); g3.translate(cx, cy); g3.scale(press, press); g3.fillStyle = '#fff'; g3.strokeStyle = '#000'; g3.lineWidth = 6; g3.beginPath(); g3.moveTo(0, 0); g3.lineTo(0, 78); g3.lineTo(20, 60); g3.lineTo(36, 98); g3.lineTo(52, 90); g3.lineTo(36, 54); g3.lineTo(62, 52); g3.closePath(); g3.fill(); g3.stroke(); g3.restore(); }
    const cu2 = T - o.tTap; if (cu2 > 0 && cu2 < 1.8) { const r = rng(5); for (let i = 0; i < 70; i++) { const a = -1.2 - r() * 1.6 + (r() - 0.5) * 1.0, v = 500 + r() * 900, ph = r() * 6.28;
      const x = bx + Math.cos(a) * v * cu2 * 0.7 + (r() - .5) * 60, y = by + Math.sin(a) * v * cu2 * 0.7 + 1500 * cu2 * cu2; g3.save(); g3.globalAlpha = 1 - clamp((cu2 - 1.2) / 0.6); g3.translate(x, y); g3.rotate(ph + cu2 * (6 + r() * 8)); g3.fillStyle = ['#cfeeff', '#fe2c55', '#4af08a', '#4ac8ff', '#fff'][i % 5]; g3.fillRect(-9, -15, 18, 30); g3.restore(); } }
  });
  const so = { x: 945, y: 1500, s: 1.35, facing: -1 };
  let pose, expr = 'smile', hand, dir;
  if (done) { pose = 'cheer'; expr = 'joy'; }
  else if (T >= o.tC - 0.1) [pose, hand, dir] = pointPose(T, so, [{ t: 0, x: 600, y: 1300 }, { t: o.tC - 0.1, x: CTA.bub.x - 130, y: CTA.bub.y }, { t: o.tTg - 0.1, x: CTA.tag.x - 130, y: CTA.tag.y }, { t: o.tF - 0.1, x: CTA.fol.x - 130, y: CTA.fol.y + 40 }]);
  else pose = 'wave';
  stick(g, T, { ...so, pose, expr }); if (hand) finger(g, hand, dir, so.s);
}
