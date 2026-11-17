// motion.js - Stick motion layer v2 (2D, on the 11-point rig): springs with overshoot, idle weight shift, 2-bone arm IK with anticipation,
// look-at, drawn hands (point / grip), ground-locked walk, carry with weight. Pure code, no 3D.
import { POSES } from '/engine/rig2d.js';
import { walkFrame, trap, speedAt, stride, phaseAt, DUTY, RUN_DUTY } from './walkmath.js';
import { strikes } from './walkmath.js';
export { walkFrame, trap, speedAt, stride, phaseAt, strikes };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, DEG = Math.PI / 180;
export const SH_REST = [0, -174], L1 = 37, L2 = 37, LEG = 50.2;
export const toLocal = (so, x, y) => [(x - so.x) / ((so.facing ?? 1) * so.s), (y - so.y) / so.s];
export const toWorld = (so, lx, ly) => [so.x + (so.facing ?? 1) * so.s * lx, so.y + so.s * ly];
// damped spring step 0->1 (overshoots). f Hz, z damping (0.5 ~ 16% overshoot)
export function spring(t, t0, { f = 3.4, z = 0.5 } = {}) { const x = t - t0; if (x <= 0) return 0; const w = 2 * Math.PI * f, q = Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * x) * (Math.cos(w * q * x) + z / q * Math.sin(w * q * x)); }
// keys [{t, v:[...], f?, z?}] -> vector at T; each key springs from the value reached when it fires
export function track(T, keys) { const ev = (i, tt) => { if (i === 0) return keys[0].v; const k = keys[i]; if (tt <= k.t) return ev(i - 1, tt); const a = ev(i - 1, k.t), s = spring(tt, k.t, { f: k.f ?? 3.4, z: k.z ?? 0.5 }); return a.map((x, j) => x + (k.v[j] - x) * s); }; return ev(keys.length - 1, T); }
export const bendFor = (ang) => { const d = ang / DEG, u = clamp((d - 35) / 45); return -1 + 2 * (u * u * (3 - 2 * u)); }; // -1 forward/up (elbow down) .. +1 hanging (elbow forward)
export function ik2(a, b, l1, l2, s) { const dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01)); const th = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)); const an = Math.atan2(dy, dx) - s * th; return [a[0] + Math.cos(an) * l1, a[1] + Math.sin(an) * l1]; }
export const fixLegs = (p) => { p.kF = ik2(p.hip, p.fF, LEG, LEG, 1); p.kB = ik2(p.hip, p.fB, LEG, LEG, 1); return p; };
export const armAt = (sh, ang, ext) => { const R = (L1 + L2) * ext, h = [sh[0] + Math.cos(ang) * R, sh[1] + Math.sin(ang) * R]; return { e: ik2(sh, h, L1, L2, bendFor(ang)), h }; };
export const REST_F = [84 * DEG, 0.97, 0], REST_B = [97 * DEG, 0.97, 0];
// aim: polar (ang, ext) for a world target seen from the (rest) shoulder
export function aim(so, tx, ty, sh = SH_REST, ext = 0.97) { const [lx, ly] = toLocal(so, tx, ty); return { ang: Math.atan2(ly - sh[1], lx - sh[0]), dist: Math.hypot(lx - sh[0], ly - sh[1]), ext }; }
const shift = (p, ks, dx, dy) => { for (const k of ks) p[k] = [p[k][0] + dx, p[k][1] + dy]; };
const fresh = (name = 'stand') => { const b = POSES[name]; const p = {}; for (const k in b) p[k] = [...b[k]]; p.aF = 0; p.aB = 0; return p; };
// idle: breathing + slow weight shift (feet stay planted), tiny head drift
export function idle(T, { base = 'stand', seed = 0, amt = 1 } = {}) {
  const p = fresh(base), br = Math.sin(T * 2.1 + seed) * 1.5 * amt, sw = Math.sin(T * 0.55 + seed * 1.7) * 2.4 * amt, hd = Math.sin(T * 0.8 + seed) * 1.1 * amt;
  shift(p, ['sh', 'eF', 'hF', 'eB', 'hB'], sw * 0.35, br); shift(p, ['head'], sw * 0.35 + hd, br * 1.1 + Math.sin(T * 1.3 + seed) * 0.5); shift(p, ['hip'], sw, 0); p.hip[1] += br * 0.3; return fixLegs(p);
}
// body offsets [lean, dip, headX, headY]: lean moves shoulders/head forward, dip lowers the hips (knees bend, feet stay)
export function body(p, [lean, dip, hx, hy]) { shift(p, ['sh', 'head', 'eF', 'hF', 'eB', 'hB'], lean, 0); shift(p, ['hip'], -lean * 0.3, dip); shift(p, ['sh', 'head', 'eF', 'hF', 'eB', 'hB'], 0, dip); shift(p, ['head'], hx, hy); return fixLegs(p); }
// arm track -> sets eF/hF (or eB/hB) on p, returns {hand, ang}
export function arm(T, p, keys, side = 'F', mod = null) {
  const v = track(T, keys.map((k) => ({ ...k, v: [k.ang, k.ext, k.tap ?? 0] }))); if (mod) mod(v);
  let hand = keys[0].hand || 'relax', prev = hand, ts = -9, ho = {};
  for (const k of keys) if (T >= k.t) { if (k.hand && k.hand !== hand) { prev = hand; hand = k.hand; ts = k.t; } if (k.ho) ho = k.ho; }
  const sh = p.sh, A = armAt(sh, v[0], v[1]); p['e' + side] = A.e; p['h' + side] = A.h;
  const fa = Math.atan2(A.h[1] - A.e[1], A.h[0] - A.e[0]); let rot = 0; if (hand === 'point') rot = v[0] - fa + (ho.rot || 0);
  return { hand: { k: hand, prev, u: clamp((T - ts) / 0.16), tap: v[2], rot, tm: T, ...ho }, ang: v[0] };
}
export const lookVec = (so, p, tx, ty) => { const [lx, ly] = toLocal(so, tx, ty), d = [lx - p.head[0], ly - p.head[1]], n = Math.hypot(d[0], d[1]) || 1; return [d[0] / n, d[1] / n]; };
// ---- pointing sequence: anticipation -> strike with overshoot -> taps -> hold micro-motion -> return. targets [{t,x,y,taps:[t..]}]
export function pointSeq(T, so, targets, o = {}) {
  const p = idle(T, { seed: o.seed || 0 }), end = o.end ?? 1e9, kF = [{ t: -9, v: [...REST_F], ang: REST_F[0], ext: REST_F[1], hand: o.startHand || 'relax' }], kB = [], bk = [{ t: -9, v: [0, 0, 0, 0] }];
  let lk = [{ t: -9, v: [0, 0] }]; let prevAng = REST_F[0];
  for (const tg of targets) {
    const a = aim(so, tg.x, tg.y), t0 = tg.t, ang = a.ang, ext = Math.min(0.985, Math.max(0.5, (a.dist - 27) / (L1 + L2)));
    kF.push({ t: t0 - 0.34, ang: lerp(prevAng, ang, -0.22), ext: 0.7, tap: 0, hand: 'point', f: 4.2, z: 0.9 });  // pull back (anticipation)
    kF.push({ t: t0 - 0.04, ang, ext, tap: 0, hand: 'point', f: 3.3, z: 0.46 });                                  // strike (overshoots)
    for (const tt of (tg.taps || [])) { kF.push({ t: tt, ang, ext: ext - 0.03, tap: 8, f: 9, z: 0.55 }); kF.push({ t: tt + 0.1, ang, ext, tap: 0, f: 8, z: 0.6 }); }
    for (const tt of tg.press || []) { kF.push({ t: tt - 0.2, ang, ext: ext - 0.05, tap: -4, f: 6, z: 0.8 }); kF.push({ t: tt - 0.07, ang, ext: Math.min(1.0, ext + 0.02), tap: 16, f: 12, z: 0.7 }); kF.push({ t: tt + 0.16, ang, ext, tap: 2, f: 6, z: 0.7 }); }
    const hx = Math.cos(ang) * 4.5, hy = Math.sin(ang) * 3;
    bk.push({ t: t0 - 0.34, v: [-1.5, 2.8, -1.2, 1.2], f: 3.5, z: 0.85 }); bk.push({ t: t0 - 0.06, v: [Math.max(0, Math.cos(ang)) * 5.5 + 1, -0.5, hx, hy - 0.6], f: 3, z: 0.5 });
    lk.push({ t: t0 - 0.16, v: [Math.cos(ang) * 1.6, Math.sin(ang) * 1.6], f: 4, z: 0.7 }); prevAng = ang;
  }
  kF.push({ t: end, ang: REST_F[0], ext: REST_F[1], tap: 0, hand: 'relax', f: 3.2, z: 0.62 }); bk.push({ t: end, v: [0, 0, 0, 0], f: 3, z: 0.7 }); lk.push({ t: end, v: [0, 0], f: 3, z: 0.8 });
  const b = track(T, bk); body(p, b); const A = arm(T, p, kF, 'F'); const lv = track(T, lk);
  if (T > end && A.hand.k === 'point') A.hand.k = 'relax';
  if (T > end - 0.001 && T < end + 0.12) A.hand.k = 'relax';
  return { pose: p, hands: { F: A.hand, B: { k: 'relax' } }, look: lv };
}
// ---- walking: x from x0 to x1 during [t0,t1], then settles into idle; returns {x, pose, hands, moving, vk, dist}
export function walker(T, so, t0, t1, x0, x1, o = {}) {
  const run = !!o.run, duty = run ? RUN_DUTY : DUTY, D = Math.abs(x1 - x0), dir = Math.sign(x1 - x0) || 1, s = so.s, { st } = stride(D / s, o.st || (run ? 42 : 26), duty), ta = o.ta ?? (run ? 0.35 : 0.5), td = o.td ?? (run ? 0.3 : 0.6);
  const dist = trap(T, t0, t1, D, ta, td), x = x0 + dir * dist, vmax = D / ((t1 - t0) - (ta + td) / 2), vk = clamp(speedAt(T, t0, t1, D, ta, td) / vmax);
  const hands = { F: { k: run ? 'fist' : 'relax' }, B: { k: run ? 'fist' : 'relax' } }, wo = { st, run, lift: o.lift ?? (run ? 32 : 15), bob: o.bob ?? (run ? 14 : 3.2), swing: o.swing ?? (run ? 0.9 : 0.5), lean: o.lean ?? (run ? 12 : 3.5) };
  if (T <= t0) return { x, pose: idle(T, { seed: o.seed || 0 }), hands: { F: { k: 'relax' }, B: { k: 'relax' } }, moving: false, vk: 0, dist };
  if (T <= t1) return { x, pose: walkFrame(phaseAt(dist / s, st, duty), { ...wo, vk }), hands, moving: true, vk, dist };
  const k = clamp((T - t1) / (o.settle ?? 0.5)), e = k * k * (3 - 2 * k);
  return { x, pose: mixPose(walkFrame(phaseAt(D / s, st, duty), { ...wo, vk: 0 }), idle(T, { seed: o.seed || 0 }), e), hands: { F: { k: 'relax' }, B: { k: 'relax' } }, moving: false, vk: 0, dist };
}
// blend two poses (all numeric fields incl. aF/aB)
export const mixPose = (a, b, k) => { const o = {}; for (const key in a) o[key] = Array.isArray(a[key]) ? a[key].map((v, i) => lerp(v, b[key][i], k)) : lerp(a[key], b[key], k); return o; };
export const posePlain = fresh;
// fingertip in world coords (for guide lines / ripples) from pointSeq output
export function fingerTip(so, p, hand) { const e = p.eF, h = p.hF, a = Math.atan2(h[1] - e[1], h[0] - e[0]) + (hand.rot || 0); const L = 8 + 19 + (hand.tap || 0); return toWorld(so, h[0] + Math.cos(a) * L, h[1] + Math.sin(a) * L); }

// ---- secondary motion: spring-filtered acceleration of a support point -> hood / hem / drawstring offsets (stateless; feed poseAt(t) -> {sh,hip} in local units incl. body travel)
export function secondary(poseAt, T, { f = 2.8, z = 0.3, gain = 1 } = {}) {
  const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z), dt = 0.04; let dx = 0, dy = 0, dh = 0;
  for (let i = 0; i < 16; i++) { const tau = T - i * dt, a = poseAt(tau - dt), b = poseAt(tau), c = poseAt(tau + dt), h = Math.exp(-z * w * i * dt) * Math.sin(wd * i * dt) / wd;
    dx -= (a.sh[0] - 2 * b.sh[0] + c.sh[0]) / (dt * dt) * h * dt; dy -= (a.sh[1] - 2 * b.sh[1] + c.sh[1]) / (dt * dt) * h * dt; dh -= (a.hip[0] - 2 * b.hip[0] + c.hip[0]) / (dt * dt) * h * dt; }
  const cl = (v, m) => Math.max(-m, Math.min(m, v));
  return { hood: [cl(dx * 0.05 * gain, 7), cl(dy * 0.04 * gain, 5), cl(dx * 0.004 * gain, 0.35)], hem: cl(dh * 0.07 * gain, 8), str: cl(dx * 0.06 * gain, 9) };
}
// ---- turn: facing flips through a thin silhouette (head/eyes should lead the turn)
export function turnF(T, t0, dur, from = 1, to = -1) { const u = clamp((T - t0) / dur); if (u <= 0) return from; if (u >= 1) return to; const m = 0.2 + 0.8 * Math.abs(Math.cos(Math.PI * u)); return (u < 0.5 ? from : to) * m; }
// ---- jump: anticipation crouch -> launch -> arc -> landing squash. returns {pose, lift (local units up), phase}
export function jumpAt(T, t0, { dur = 0.75, H = 150, crouch = 0.3, from = null } = {}) {
  const E = (a, b, k) => mixPose(a, b, clamp(k)), st = idle(T, { seed: 0 }), rd = posePlain('ready'), cr = posePlain('crouch'), jp = posePlain('jump'), tL = t0 + dur;
  if (T < t0 - crouch) return { pose: from || st, lift: 0, phase: 'pre' };
  if (T < t0) { const u = (T - (t0 - crouch)) / crouch; return { pose: E(from || st, E(rd, cr, 0.55), u * u * (3 - 2 * u)), lift: 0, phase: 'crouch' }; }
  if (T < tL) { const u = (T - t0) / dur, k = spring(T, t0, { f: 4.2, z: 0.6 }); return { pose: u < 0.78 ? E(E(rd, cr, 0.3), jp, k) : E(jp, rd, (u - 0.78) / 0.22), lift: H * 4 * u * (1 - u), phase: 'air', u }; }
  const u = T - tL, sq = Math.exp(-u * 6) * Math.cos(u * 11);
  return { pose: E(cr, st, clamp((u - 0.12) / 0.5)), lift: -Math.max(0, sq) * 0, phase: 'land', since: u };
}
// ---- camera: apply before drawing the world, restore before UI. c = {z, fx, fy, x, y, rot}
export function camera(g, c = {}) { g.translate(540 + (c.x || 0), 960 + (c.y || 0)); g.rotate(c.rot || 0); g.scale(c.z || 1, c.z || 1); g.translate(-(c.fx ?? 540), -(c.fy ?? 960)); }
export function shakeAt(T, t0, amp = 14, dur = 0.45) { const u = (T - t0) / dur; if (u < 0 || u > 1) return { x: 0, y: 0, rot: 0 }; const e = (1 - u) * (1 - u); return { x: Math.sin(u * 70) * amp * e, y: Math.cos(u * 83) * amp * e * 0.8, rot: Math.sin(u * 55) * 0.012 * e * amp / 14 }; }
export const camLerp = (T, t0, t1, a, b, ease = (u) => u * u * (3 - 2 * u)) => { const u = ease(clamp((T - t0) / (t1 - t0))); return a + (b - a) * u; };
