// 2D overlays: big numbers, day badges, ending cards. Pure function of t.
const stage = document.getElementById('stage');
const css = document.createElement('style');
css.textContent = `
.ov{position:absolute;left:0;right:0;text-align:center;font-family:'Cap',sans-serif;font-weight:700;pointer-events:none;color:#fff}
.big{top:300px;font-size:120px;line-height:1;text-shadow:0 6px 24px rgba(0,0,0,.7);letter-spacing:-2px}
.big small{display:block;font-size:40px;letter-spacing:4px;margin-top:6px;color:#ffe14a}
.badge{left:24px;right:auto;top:150px;font-size:46px;background:#ffd400;color:#111;padding:6px 22px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.5)}
.card{left:40px;right:40px;border-radius:22px;box-sizing:border-box;padding:16px 20px}
#q{background:#141418;border:5px solid #d9a93c;font-size:40px;line-height:1.15}
#q .y{color:#ffd23c;display:block;margin-top:6px}
#cm{background:#fff;color:#111;font-size:36px;border-radius:30px;padding:14px 20px;left:90px;right:90px}
#tg{background:#ff3b6b;color:#fff;font-size:40px;left:130px;right:130px}
#fw{background:#17171b;border:3px solid #444;display:flex;align-items:center;justify-content:center;gap:16px;font-size:34px;padding:14px;left:70px;right:70px}
#fw .av{width:64px;height:64px;border-radius:50%;background:#ffd400;display:inline-block}
#fw .btn{background:#e0213c;color:#fff;border-radius:12px;padding:10px 24px;font-size:32px}
`;
document.head.appendChild(css);
const mk = (cls, id) => { const d = document.createElement('div'); d.className = 'ov ' + cls; if (id) d.id = id; d.style.opacity = 0; stage.appendChild(d); return d; };
const big = mk('big'); const badge = mk('badge');
const q = mk('card', 'q'); const cm = mk('card', 'cm'); const tg = mk('card', 'tg'); const fw = mk('card', 'fw');
q.innerHTML = 'COULD YOU LIVE ON<span class="y">ENERGY DRINKS ONLY?</span>';
cm.textContent = '⌨ COMMENT BELOW';
tg.textContent = '🏷 TAG A FRIEND';
fw.innerHTML = '<span class="av"></span><span>StickMindR8</span><span class="btn" id="fbtn">FOLLOW</span>';
const fbtn = fw.querySelector('#fbtn');
export const BIGS = [
  [5.38, 6.9, '1,600 mg', 'OF CAFFEINE'],
  [6.92, 8.5, '4×', 'THE SAFE LIMIT'],
  [16.19, 17.95, '540 g', 'OF SUGAR / DAY'],
];
export const DAYS = [[8.59, 'DAY 1', 10.9], [10.94, 'DAY 3', 14.15], [14.2, 'DAY 10', 18.95], [18.97, 'DAY 30', 24.75]];
const easeOutBack = x => { x = Math.min(1, Math.max(0, x)); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const pop = (el, t, t0, extra = '') => {
  const k = (t - t0) / 0.3;
  if (k < 0) { el.style.opacity = 0; return; }
  el.style.opacity = Math.min(1, k * 3);
  el.style.transform = `scale(${easeOutBack(k)}) ${extra}`;
};
export function updateOverlay(t) {
  let hide = false;
  // big numbers
  big.style.opacity = 0;
  for (const [a, b, txt, sub] of BIGS) if (t >= a && t < b) {
    big.innerHTML = `${txt}<small>${sub}</small>`; pop(big, t, a); hide = true;
    big.style.opacity = t > b - 0.12 ? (b - t) / 0.12 : big.style.opacity;
  }
  // day badge: big pop for 0.9 s then small corner tag
  badge.style.opacity = 0;
  for (const [a, txt, b] of DAYS) if (t >= a && t < b) {
    badge.textContent = txt;
    if (t < a + 0.9) { badge.style.cssText = 'opacity:1;left:0;right:0;top:420px;font-size:150px;background:transparent;color:#ffd400;box-shadow:none;text-shadow:0 8px 30px rgba(0,0,0,.8);transform:scale(' + easeOutBack((t - a) / 0.3) + ')'; hide = true; }
    else { badge.style.cssText = 'opacity:1;left:24px;right:auto;top:150px;transform:none'; }
  }
  // ending cards (one at a time, previous moves up)
  const E = 24.75;
  const lift = (el, t, t1, from, to) => { const k = Math.min(1, Math.max(0, (t - t1) / 0.35)); const s = k * k * (3 - 2 * k); el.style.top = (from + (to - from) * s) + 'px'; };
  [q, cm, tg, fw].forEach(e => e.style.opacity = 0);
  if (t >= E) {
    hide = true;
    q.style.top = '0px'; lift(q, t, 26.4, 420, 200); pop(q, t, E);
    if (t >= 26.4) { cm.style.top = '0px'; lift(cm, t, 27.2, 560, 380); pop(cm, t, 26.4); }
    if (t >= 27.2) { tg.style.top = '0px'; lift(tg, t, 29.0, 700, 520); pop(tg, t, 27.2); }
    if (t >= 29.0) { fw.style.top = '860px'; pop(fw, t, 29.0); }
    // fix top after pop transforms (pop sets transform only)
    if (t >= 26.4) q.style.top = (200 + (420 - 200) * (1 - Math.min(1, (t - 26.4) / 0.35)) ) + 'px';
    if (t >= 27.2) cm.style.top = (380 + (560 - 380) * (1 - Math.min(1, (t - 27.2) / 0.35))) + 'px';
    if (t >= 29.0) tg.style.top = (520 + (700 - 520) * (1 - Math.min(1, (t - 29.0) / 0.35))) + 'px';
    if (t < 26.4) q.style.top = '420px';
    if (t < 27.2) cm.style.top = '560px';
    if (t < 29.0) tg.style.top = '700px';
    fbtn.style.background = t >= 30.7 ? '#1fbf5b' : '#e0213c';
    fbtn.style.transform = t >= 30.65 && t < 30.8 ? 'scale(.9)' : 'none';
    fbtn.textContent = t >= 30.7 ? 'FOLLOWING ✓' : 'FOLLOW';
  }
  return hide;
}
