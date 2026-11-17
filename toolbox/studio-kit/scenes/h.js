// h.js - thin compatibility layer so shots read like the old studio helpers
import { E, registerShot, clamp, lerp, prog, ease, veil, alpha, glow, circle, ring, rr, seg, rng, text, mix, shade, linGrad, radGrad } from '/engine/core.js';
import { drawFigure, POSES, bigFace } from '/engine/rig2d.js';
import { TM, WORDS } from './times.js';
export { TM, clamp, lerp, prog, ease, veil, alpha, glow, circle, ring, rr, seg, rng, mix, shade, linGrad, radGrad, text };
export const STICK = { top: 'hoodie', color: '#2a2a35', head: 'none', stick: true, shoes: true };
const vignette = (g, a = 0.4) => { const W = E.W, H = E.H; const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); };
export const K = { text, rr, vignette, drawFigure, bigFace };
export const NT = { scr: (g, fn) => fn(g) };
export const F = () => ({ x: 0, y: 0, z: 1 });
export const layer = (g, cam, depth, fn) => { g.save(); fn(g); g.restore(); };
export const P = (n) => (typeof n === 'object' && n) ? n : (POSES[n] || POSES.stand);
export const S = (id, fn) => registerShot(id, { draw(g, t, info) { fn(g, info.globalT); } });
export const WT = (w, after = 0) => { for (const [x, a] of WORDS) if (x.replace(/[.,?!:"“”]/g, '').toLowerCase() === w.toLowerCase() && a >= after) return a; throw new Error('word ' + w); };
export const stick = (g, T, o) => drawFigure(g, { outfit: STICK, x: o.x, y: o.y, s: o.s ?? 1.9, facing: o.facing ?? 1, pose: P(o.pose || 'stand'), rot: o.rot, expr: o.expr || 'neutral', rim: o.rim ?? { color: '#8ae8ff', dir: [0.8, -0.6], w: 4 }, shadow: o.shadow ?? false, blink: Math.sin(T * 1.3 + (o.seed || 0)) > 0.97 ? 1 : 0, hands: o.hands, look: o.look, talk: o.talk, prop: o.prop });
export const post = (g, T, o = {}) => { vignette(g, o.vig ?? 0.42); if (!o.noMark) text(g, 'StickMindR8', E.W - 150, 60, { size: 30, weight: 800, color: '#ffffff', alpha: 0.7, stroke: 5, strokeColor: 'rgba(0,0,0,.6)' }); };
export const H = { popK: (T, t0, d = 0.38) => ease.outBack(prog(T, t0, t0 + d)) };
