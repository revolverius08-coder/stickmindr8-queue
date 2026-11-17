// walkmath.js - pure math (no imports): Stick walk with ground-locked feet. Used in the browser (motion.js) and in node (footstep times).
export const DUTY = 0.58, C0 = 0.29;      // stance fraction of the cycle; start phase = feet together (passing pose)
const PER_CYCLE = 2 / DUTY;               // body travel per cycle in units of stride half-length st (stance foot sweeps 2*st in DUTY of the cycle)
export function trap(t, t0, t1, D, ta = 0.5, td = 0.6) { // distance travelled at time t (trapezoid speed profile)
  const Tt = t1 - t0, tau = Math.min(Math.max(t - t0, 0), Tt), v = D / (Tt - (ta + td) / 2);
  if (tau < ta) return v * tau * tau / (2 * ta);
  if (tau <= Tt - td) return v * ta / 2 + v * (tau - ta);
  return D - v * (Tt - tau) * (Tt - tau) / (2 * td);
}
export const speedAt = (t, t0, t1, D, ta = 0.5, td = 0.6) => (trap(t + 0.01, t0, t1, D, ta, td) - trap(t - 0.01, t0, t1, D, ta, td)) / 0.02;
// stride so that the walk ends in a passing pose: distance in LOCAL units (px / scale)
export function stride(dLocal, stNom = 26) { const N = Math.max(2, Math.round(dLocal / (stNom * PER_CYCLE / 2))); return { N, st: dLocal / (N * PER_CYCLE / 2) }; }
export const phaseAt = (distLocal, st) => C0 + distLocal / (st * PER_CYCLE);
// heel-strike times: [{t, leg:'F'|'B'}] by sampling the phase
export function strikes(t0, t1, D, s, stNom = 26, ta = 0.5, td = 0.6) {
  const { st } = stride(D / s, stNom), out = []; let prev = Math.floor(2 * phaseAt(0, st));
  for (let t = t0; t <= t1 + 1e-9; t += 1 / 480) { const k = Math.floor(2 * phaseAt(trap(t, t0, t1, D, ta, td) / s, st)); if (k > prev) { out.push({ t: +t.toFixed(3), leg: k % 2 === 0 ? 'F' : 'B' }); prev = k; } }
  return out;
}
const ik = (a, b, L1, L2, dir = 1) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01); const an = Math.atan2(dy, dx) - dir * Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))); return [a[0] + Math.cos(an) * L1, a[1] + Math.sin(an) * L1]; };
const lerp = (a, b, k) => a + (b - a) * k;
// one frame of the walk. c = phase, vk = speed 0..1, st = half-stride
export function walkFrame(c, o = {}) {
  const { st = 26, vk = 1, lift = 15, bob = 3.2, swing = 0.5, lean = 3.5 } = o, v = 0.3 + 0.7 * vk, TAU = Math.PI * 2;
  const foot = (cp) => {
    cp = ((cp % 1) + 1) % 1; let x, y = 0, a = 0;
    if (cp < DUTY) { const u = cp / DUTY; x = st * (1 - 2 * u); if (u < 0.14) a = -0.38 * (1 - u / 0.14); if (u > 0.72) { const w = (u - 0.72) / 0.28, h = 8 * w * w; y = -h; a = Math.asin(Math.min(1, h / 13)); } }
    else { const u = (cp - DUTY) / (1 - DUTY), e = 0.5 - 0.5 * Math.cos(Math.PI * u); x = -st + 2 * st * e; y = -(8 * (1 - Math.min(1, u * 2.2)) + lift * v * Math.sin(Math.PI * u)); a = u < 0.35 ? lerp(0.66, 0, u / 0.35) : lerp(0, -0.38, (u - 0.35) / 0.65); }
    return { p: [x, y], a };
  };
  const A = foot(c), B = foot(c + 0.5);
  const hipY = -99.6 + bob * v * 0.5 * (1 - Math.cos(2 * TAU * (c - C0))), hip = [0, hipY];
  const lx = lean * (0.4 + 0.6 * vk) + 1.1 * v * Math.sin(TAU * c), sh = [lx, hipY - 74], head = [lx + 4 + 0.6 * Math.sin(TAU * c), hipY - 74 - 34 + bob * v * 0.18];
  const arm = (ph, far) => { const f = -swing * v * Math.cos(TAU * ph), up = f * 0.8, bend = 0.22 + 0.45 * Math.max(0, f), lo = f + bend;
    const e = [sh[0] + 37 * Math.sin(up) + (far ? -1 : 0), sh[1] + 37 * Math.cos(up)]; return { e, h: [e[0] + 36 * Math.sin(lo), e[1] + 36 * Math.cos(lo)] }; };
  const aF = arm(c, false), aB = arm(c + 0.5, true);
  return { head, sh, hip, eF: aF.e, hF: aF.h, eB: aB.e, hB: aB.h, kF: ik(hip, A.p, 50.2, 50.2), fF: A.p, kB: ik(hip, B.p, 50.2, 50.2), fB: B.p, aF: A.a, aB: B.a };
}
