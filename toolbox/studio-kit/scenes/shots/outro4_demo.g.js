import { TM, K, NT, S, ease, clamp, lerp, prog, glow, post, rr, circle, ring, seg, rng, P, stick } from '../h.js';
import { walker, idle, body, arm, track, spring, aim, toWorld, mixPose, posePlain, REST_F, REST_B, secondary, turnF, jumpAt, camera, shakeAt, camLerp, strikes } from '../motion.js';
import { outro4Question, outro4CTA } from '../outro4.js';
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
// ============ OUTRO v4: Stick in the corner; comment typed -> SEND pressed -> card up -> TAG pressed (turns green) -> up -> FOLLOW pressed ============
const O = { t0: TM.q[0] + 0.45, tGold: TM.q[0] + 1.9 };
S('q', (g, T) => { outro4Question(g, T, { ...O, white: ['Would you rather', 'film with this?'], gold: ['YES or NO?'] }); post(g, T); });
const c0 = TM.c[0], OC = { tC: c0 + 0.4, tSend: c0 + 1.65, tTg: c0 + 2.5, tTagP: c0 + 3.1, tF: c0 + 3.65, tFP: c0 + 4.2, commentWord: 'CLIP' };
S('c', (g, T) => { outro4CTA(g, T, OC); post(g, T); });
