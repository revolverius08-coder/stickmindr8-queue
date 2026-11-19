import * as THREE from 'three';
import { makeHuman } from './human.js';
import { glowSprite, sparks } from './props.js';
import { materials } from './materials.js';
import { lerp, smooth, easeOut, easeInOut, range, clamp, V, cam, place, shake } from './anim.js';

export const DURATION = 31.6;

// [start, text, end?]  (numbers as digits; words shown as big numbers never repeated here)
export const CAPTIONS = [
  [0.12, 'What if you drank'], [0.98, 'only energy drinks'], [1.78, 'for 30 days?', 3.05],
  [3.18, '10 cans a day.', 4.3], [4.35, 'That is', 5.3],
  [9.39, 'You feel unstoppable.', 10.8],
  [11.8, 'Your heart races.', 12.9], [12.95, 'You cannot sleep.', 14.1],
  [15.07, 'Your hands shake,', 16.15], [17.8, 'eat your teeth.', 18.9],
  [19.9, 'No food,', 20.45], [20.48, 'no protein.', 21.25], [21.29, 'Doctors say', 22.0],
  [22.06, 'you would likely', 22.95], [23.0, 'end up in the', 23.65], [23.68, 'emergency room.', 24.7],
];
export const FADES = [];

const M = materials();
const SKIN0 = new THREE.Color(0xd99b7a), SKIN1 = new THREE.Color(0xc2ad98);
const TEETH0 = new THREE.Color(0xf0ece0), TEETH1 = new THREE.Color(0xb59a62);

// ---------------- helpers ----------------
const backOut = x => { x = clamp(x); const c = 1.8; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
function popScale(obj, t, t0, s = 1, d = 0.32) {
  const k = (t - t0) / d;
  if (k < 0) { obj.visible = false; return; }
  obj.visible = true; obj.scale.setScalar(Math.max(1e-3, s * backOut(k)));
}
function rngSeed(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

let _canTex;
function canTexture() {
  if (_canTex) return _canTex;
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#10d36b'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#0b0b0f'; g.fillRect(0, 0, 256, 54); g.fillRect(0, 202, 256, 54);
  g.fillStyle = '#fff'; g.font = '700 64px sans-serif'; g.textAlign = 'center'; g.fillText('ZAP', 128, 140);
  g.fillStyle = '#ffe600'; g.beginPath();
  g.moveTo(150, 150); g.lineTo(104, 196); g.lineTo(128, 196); g.lineTo(108, 244); g.lineTo(160, 188); g.lineTo(134, 188); g.closePath(); g.fill();
  _canTex = new THREE.CanvasTexture(c); _canTex.colorSpace = THREE.SRGBColorSpace; _canTex.wrapS = THREE.RepeatWrapping; _canTex.repeat.set(2, 1);
  return _canTex;
}
const canBodyMat = new THREE.MeshStandardMaterial({ map: canTexture(), metalness: 0.7, roughness: 0.32 });
const canTopMat = new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 1, roughness: 0.25 });
function makeCan() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.14, 28), [canBodyMat, canTopMat, canTopMat]);
  b.castShadow = true; g.add(b);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.033, 0.01, 28), canTopMat); top.position.y = 0.075; g.add(top);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.002, 0.02), canTopMat); tab.position.set(0, 0.081, 0); g.add(tab);
  return g;
}
const wallMat = new THREE.MeshStandardMaterial({ color: 0xc9c2b6, roughness: 0.95 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.7 });
const cabMat = new THREE.MeshStandardMaterial({ color: 0x3f5a73, roughness: 0.6 });
const counterMat = new THREE.MeshStandardMaterial({ color: 0xd8d6d2, roughness: 0.35 });
const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xe9eaec, metalness: 0.5, roughness: 0.3 });

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
}
function room(scene, { night = false } = {}) {
  const u = scene.userData.sky.material.uniforms;
  if (night) { u.top.value.set(0x07101f); u.mid.value.set(0x0b1830); u.horizon.value.set(0x142848); u.floorC.value.set(0x07101f); }
  else { u.top.value.set(0x3b6fa8); u.mid.value.set(0x6b9bcc); u.horizon.value.set(0xa8c6e2); u.floorC.value.set(0x6b4a33); }
  const g = new THREE.Group(); scene.add(g);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  g.add(box(8, 3, 0.1, wallMat, 0, 1.5, -1.3));
  g.add(box(0.1, 3, 6, wallMat, -2.3, 1.5, 1.2));
  g.add(box(0.1, 3, 6, wallMat, 2.3, 1.5, 1.2));
  g.add(box(1.5, 0.9, 0.62, cabMat, -1.15, 0.45, -0.9));
  g.add(box(1.56, 0.04, 0.68, counterMat, -1.15, 0.92, -0.9));
  g.add(box(1.5, 0.7, 0.34, cabMat, -1.15, 2.05, -1.12));
  g.add(box(0.78, 1.9, 0.68, fridgeMat, 1.2, 0.95, -0.9));
  g.add(box(0.03, 0.5, 0.04, canTopMat, 0.88, 1.2, -0.55));
  const winC = night ? 0x1b3566 : 0xbfe0ff;
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: winC, toneMapped: false }));
  win.position.set(0.1, 1.6, -1.24); g.add(win);
  g.add(box(0.96, 0.04, 0.05, wallMat, 0.1, 2.07, -1.23), box(0.96, 0.04, 0.05, wallMat, 0.1, 1.13, -1.23), box(0.04, 0.96, 0.05, wallMat, -0.36, 1.6, -1.23), box(0.04, 0.96, 0.05, wallMat, 0.56, 1.6, -1.23), box(0.02, 0.9, 0.05, wallMat, 0.1, 1.6, -1.23));
  if (night) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.09, 32), new THREE.MeshBasicMaterial({ color: 0xf3f0d8, toneMapped: false })); m.position.set(0.3, 1.82, -1.235); g.add(m);
    scene.userData.key.intensity = 0.35; scene.userData.key.color.set(0x6f8fd0);
    for (const l of scene.children) if (l.isHemisphereLight) { l.intensity = 0.28; l.color.set(0x5878b8); }
  } else {
    scene.userData.key.color.set(0xfff0d8); scene.userData.key.intensity = 2.4;
  }
  return g;
}

const REST = {
  lSh: [0.05, 0, 0.16], rSh: [0.05, 0, -0.16], lEl: [-0.25, 0, 0], rEl: [-0.25, 0, 0],
  lHip: [0, 0, 0.07], rHip: [0, 0, -0.07], lAn: [0, 0, -0.07], rAn: [0, 0, 0.07],
};
function lerpP(a, b, t) {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (k === 'drop') { o[k] = (a[k] || 0) + ((b[k] || 0) - (a[k] || 0)) * t; continue; }
    const va = a[k] || [0, 0, 0], vb = b[k] || [0, 0, 0]; o[k] = [0, 1, 2].map(i => va[i] + (vb[i] - va[i]) * t);
  }
  return o;
}
function apply(man, p, t) {
  const q = { ...REST, ...p };
  q.chest = [(p.chest?.[0] || 0) + Math.sin(t * 1.6) * 0.012, p.chest?.[1] || 0, p.chest?.[2] || 0];
  man.setPose(q);
}
const P = {
  hold: { rSh: [-0.55, 0, -0.18], rEl: [-1.9, 0, 0], head: [0, -0.1, 0], neck: [0.02, 0, 0] },
  drink: { rSh: [-1.0, 0, -0.3], rEl: [-2.35, 0, 0], head: [-0.38, 0, 0], neck: [-0.1, 0, 0], chest: [-0.06, 0, 0] },
  pump: { lSh: [-2.7, 0, 0.35], rSh: [-2.7, 0, -0.35], lEl: [-0.3, 0, 0], rEl: [-0.3, 0, 0], head: [-0.15, 0, 0], neck: [-0.05, 0, 0] },
  pumpLow: { lSh: [-1.0, 0, 0.5], rSh: [-1.0, 0, -0.5], lEl: [-1.4, 0, 0], rEl: [-1.4, 0, 0] },
  heart: { rSh: [-0.45, 0, -0.1], rEl: [-1.95, 0.3, 0], lSh: [0.1, 0, 0.3], head: [0.12, 0, 0], neck: [0.1, 0, 0], chest: [0.1, 0, 0] },
  headHold: { lSh: [-2.0, 0, 0.5], rSh: [-2.0, 0, -0.5], lEl: [-1.9, 0, 0.0], rEl: [-1.9, 0, 0.0], head: [0.25, 0, 0], neck: [0.18, 0, 0], chest: [0.12, 0, 0] },
  shake: { rSh: [-1.1, 0, -0.15], rEl: [-1.2, 0, 0], lSh: [-0.9, 0, 0.2], lEl: [-1.3, 0, 0], head: [0.18, 0, 0] },
  sit: { drop: -0.52, lHip: [-1.45, 0, 0.12], rHip: [-1.45, 0, -0.12], lKn: [1.45, 0, 0], rKn: [1.45, 0, 0], lAn: [0.1, 0, 0], rAn: [0.1, 0, 0],
    spine: [0.35, 0, 0], head: [0.55, 0, 0], neck: [0.3, 0, 0], lSh: [-0.2, 0, 0.5], rSh: [-0.2, 0, -0.5], lEl: [-0.3, 0, 0], rEl: [-0.3, 0, 0] },
  point: { rSh: [-1.4, -0.55, -0.1], rEl: [-0.15, 0, 0], head: [0, -0.2, 0] },
  pointUp: { rSh: [-2.8, 0.2, -0.2], rEl: [-0.1, 0, 0], head: [-0.2, 0, 0] },
};

function face(man, { mouth = 0, lid = 0.25, brow = 0, browTilt = 0 } = {}) {
  man.setMouth(mouth);
  for (const s of [-1, 1]) {
    man.face['lid' + s].rotation.x = lid;
    man.face['brow' + s].position.y = 0.134 + brow;
    man.face['brow' + s].rotation.z = Math.PI / 2 + s * (0.12 + browTilt);
  }
}
function holdCan(man, side, can) {
  man.j[side + 'Wr'].add(can); can.position.set(0, -0.075, 0.02); can.rotation.set(0, 0, 0);
}
function stage(makeStage, { night = false } = {}) {
  const scene = makeStage({ shadowSize: 3 });
  const set = room(scene, { night });
  return { scene, set };
}
function glowBolts(scene, color = 0xffe14a, n = 6, r = 0.55, y = 1.1, seed = 3) {
  const R = rngSeed(seed), arr = [];
  for (let i = 0; i < n; i++) { const s = glowSprite(color, 0.12); s.userData = { a: R() * 6.28, r: r * (0.7 + R() * 0.6), y: y + (R() - 0.5) * 0.9, sp: 1 + R() * 2 }; scene.add(s); arr.push(s); }
  return arr;
}

// ============ SHOT 1: hook (0 – 3.1) ============
function shot1({ makeStage }) {
  const { scene } = stage(makeStage);
  const man = makeHuman('casual'); man.root.position.set(0, 0, 0.1); man.root.rotation.y = -0.15; scene.add(man.root);
  const can = makeCan(); holdCan(man, 'r', can);
  const pile = [0, 1, 2].map(i => { const c = makeCan(); c.position.set(-1.45 + i * 0.1, 0.99, -0.85); scene.add(c); return c; });
  const cal = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#d0202a'; g.fillRect(0, 0, 256, 60);
    g.fillStyle = '#111'; g.font = '700 150px sans-serif'; g.textAlign = 'center'; g.fillText('30', 128, 190);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tx })); m.position.set(0.9, 2.15, -1.2); scene.add(m); return m;
  })();
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, T) {
      const sip = range(T, 1.9, 2.4);
      apply(man, lerpP(P.hold, P.drink, smooth(sip) * (1 - smooth(range(T, 2.7, 3.1)))), T + 1);
      face(man, { lid: lerp(0.25, 0.1, sip), brow: 0.003 });
      pile.forEach((p, i) => popScale(p, T, 1.0 + i * 0.14, 1));
      popScale(cal, T, 2.06, 1, 0.35);
      const k = easeInOut(range(T, 0, 3.1));
      place(c, [lerp(0.2, -0.05, k), lerp(1.45, 1.55, k), lerp(3.4, 1.55, k)], [lerp(-0.3, 0, k), lerp(1.35, 1.55, k), 0]);
      return { dof: { focus: lerp(3.4, 1.55, k), aperture: 0.003, maxblur: 0.008 }, bloom: 0.35 };
    },
  };
}

// ============ SHOT 2: 10 cans, caffeine, 4x (3.1 – 8.55) ============
function shot2({ makeStage }) {
  const { scene } = stage(makeStage);
  const man = makeHuman('casual'); man.root.position.set(-0.2, 0, 0.3); man.root.rotation.y = 0.3; scene.add(man.root);
  const can = makeCan(); holdCan(man, 'r', can);
  const row = []; for (let i = 0; i < 10; i++) { const c = makeCan(); c.position.set(-1.3 + i * 0.085, 0.99, -0.92 + (i % 2) * 0.04); scene.add(c); row.push(c); }
  const bolts = glowBolts(scene, 0xffe14a, 8, 0.5, 1.2, 5);
  const flash = glowSprite(0xfff2a0, 1.0); flash.position.set(-0.2, 1.4, 0.8); scene.add(flash);
  const c = cam(40);
  return {
    scene, camera: c,
    update(t, T) {
      row.forEach((r, i) => popScale(r, T, 3.18 + i * 0.1, 1, 0.25));
      const dr = smooth(range(T, 3.5, 4.1)) * (1 - smooth(range(T, 5.0, 5.4)));
      apply(man, lerpP(P.hold, P.drink, dr), T);
      face(man, { lid: lerp(0.25, 0.05, smooth(range(T, 5.4, 6.4))), mouth: 0.15 * smooth(range(T, 5.4, 6)), brow: 0.006 });
      const cr = smooth(range(T, 5.45, 5.6));
      can.scale.set(1 + 0.25 * cr, 1 - 0.45 * cr, 1 + 0.25 * cr);
      const ch = smooth(range(T, 5.38, 6.4));
      flash.material.opacity = 0.35 * ch * (0.7 + 0.3 * Math.sin(T * 25)); flash.scale.setScalar(0.8 + ch * 0.9);
      bolts.forEach((b, i) => { const u = b.userData; const a = u.a + T * u.sp; b.position.set(-0.2 + Math.cos(a) * u.r, u.y + Math.sin(T * 3 + i) * 0.1, 0.3 + Math.sin(a) * u.r * 0.6); b.material.opacity = ch * 0.9; b.scale.setScalar(0.06 + 0.06 * Math.abs(Math.sin(T * 12 + i))); });
      const k = easeInOut(range(T, 3.1, 8.55));
      const sh = shake(T, 0.4 + 2.2 * range(T, 6.9, 8.4));
      place(c, [lerp(-0.1, -0.7, k) + sh[0], 1.3 + sh[1], lerp(3.6, 3.0, k)], [lerp(-0.3, -0.85, k), 1.05, 0]);
      return { dof: { focus: lerp(3.6, 3.0, k), aperture: 0.001, maxblur: 0.006 }, bloom: 0.4 + ch * 0.4 };
    },
  };
}

// ============ SHOT 3: Day 1 (8.55 – 10.9) ============
function shot3({ makeStage }) {
  const { scene } = stage(makeStage);
  const man = makeHuman('casual'); man.root.position.set(0, 0, 0.2); scene.add(man.root);
  const bolts = glowBolts(scene, 0xffe14a, 10, 0.7, 1.1, 8);
  const burst = sparks(70, { speed: 1.8, spread: 1.5, gravity: -2, life: 0.9, color: [1, 0.85, 0.2], size: 0.05, seed: 3, dir: V(0, 1, 0) }); burst.position.set(0, 1.0, 0.4); scene.add(burst);
  const c = cam(40);
  return {
    scene, camera: c,
    update(t, T) {
      const lt = T - 8.55;
      const bounce = Math.abs(Math.sin(lt * 7.5));
      const arms = lerpP(P.pumpLow, P.pump, 0.5 + 0.5 * Math.sin(lt * 7.5 - 1.2));
      apply(man, { ...arms, drop: -0.05 * (1 - bounce) }, T);
      man.root.position.y = 0.1 * bounce;
      face(man, { mouth: 0.55 + 0.2 * Math.sin(lt * 7.5), lid: -0.35, brow: 0.012 });
      bolts.forEach((b, i) => { const u = b.userData; const a = u.a + T * u.sp * 2; b.position.set(Math.cos(a) * u.r, u.y + 0.15 * Math.sin(T * 6 + i), 0.2 + Math.sin(a) * u.r * 0.6); b.material.opacity = 0.9; b.scale.setScalar(0.07 + 0.05 * Math.abs(Math.sin(T * 14 + i))); });
      burst.update(T - 8.65);
      const k = easeOut(range(T, 8.55, 10.9));
      place(c, [lerp(0.5, -0.1, k), lerp(0.45, 1.0, k), lerp(1.6, 3.0, k)], [0, lerp(1.4, 1.35, k), 0.2], lerp(0.12, 0, k));
      return { dof: { focus: lerp(1.5, 3.0, k), aperture: 0.002, maxblur: 0.006 }, bloom: 0.8 };
    },
  };
}

// ============ SHOT 4: Day 3 (10.9 – 14.15) ============
function shot4({ makeStage }) {
  const { scene } = stage(makeStage, { night: true });
  const man = makeHuman('casual'); man.root.position.set(0.1, 0, 0.3); man.root.rotation.y = -0.2; scene.add(man.root);
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), new THREE.MeshStandardMaterial({ color: 0xff2030, emissive: 0xff1020, emissiveIntensity: 0.9, roughness: 0.3 }));
  heart.position.set(0.3, 1.32, 0.55); scene.add(heart);
  const hg = glowSprite(0xff2030, 0.35); heart.add(hg);
  const lamp = new THREE.PointLight(0xffd9a0, 1.2, 4); lamp.position.set(-0.4, 2.2, 1.0); scene.add(lamp);
  const c = cam(32);
  return {
    scene, camera: c,
    update(t, T) {
      const lt = T - 10.9;
      const rate = lerp(1.6, 4.2, range(lt, 0.8, 3.1));
      const beat = Math.pow(Math.max(0, Math.sin(lt * rate * Math.PI)), 6);
      apply(man, lerpP(P.heart, P.headHold, smooth(range(T, 12.9, 13.5))), T);
      man.j.chest.scale.setScalar(1 + 0.018 * beat);
      face(man, { mouth: 0.1, lid: lerp(-0.3, -0.1, range(T, 12.9, 14)), brow: 0.01, browTilt: 0.25 });
      popScale(heart, T, 11.1, 1.0); if (heart.visible) heart.scale.multiplyScalar(1 + 0.28 * beat);
      hg.material.opacity = 0.5 + 0.5 * beat;
      lamp.intensity = 1.2 + 0.4 * Math.sin(T * 30) * range(T, 13, 14.1);
      const k = easeInOut(range(T, 10.9, 14.15));
      const sh = shake(T, 0.7 + 3.2 * range(lt, 1, 3.2));
      place(c, [lerp(0.35, 0.2, k) + sh[0], lerp(1.45, 1.5, k) + sh[1], lerp(3.0, 2.0, k)], [lerp(0.15, 0.12, k), lerp(1.4, 1.45, k), 0.3], sh[2] * 3);
      return { dof: { focus: lerp(3.0, 2.0, k), aperture: 0.002, maxblur: 0.006 }, bloom: 0.5 + 0.3 * beat, exposure: 0.95 };
    },
  };
}

// ============ SHOT 5: Day 10 (14.15 – 18.95) ============
function shot5({ makeStage }) {
  const { scene } = stage(makeStage);
  const man = makeHuman('casual'); man.root.position.set(0, 0, 0.3); man.root.rotation.y = 0.15; scene.add(man.root);
  const can = makeCan(); holdCan(man, 'r', can);
  const tbl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 36), counterMat); tbl.position.set(0.5, 0.7, 0.75); tbl.castShadow = tbl.receiveShadow = true; scene.add(tbl);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.68, 12), cabMat); leg.position.set(0.5, 0.34, 0.75); scene.add(leg);
  const R = rngSeed(11); const cubes = [];
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
  for (let i = 0; i < 90; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.035), cubeMat); m.castShadow = true;
    const ang = R() * 6.28, rad = Math.sqrt(R()) * 0.28; const layer = Math.floor(i / 25);
    m.userData = { x: 0.5 + Math.cos(ang) * rad * 0.8 * (1 - layer * 0.25), z: 0.75 + Math.sin(ang) * rad * 0.8 * (1 - layer * 0.25), y1: 0.74 + layer * 0.035, t0: 16.19 + (i / 90) * 1.5, r: [R() * 3, R() * 3, R() * 3] };
    scene.add(m); cubes.push(m);
  }
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, T) {
      apply(man, P.shake, T);
      const j = (a) => Math.sin(T * 38 + a) * 0.035 * smooth(range(T, 14.5, 15.2));
      man.j.rSh.rotation.x += j(0); man.j.rEl.rotation.x += j(1.3); man.j.lSh.rotation.x += j(2.1);
      face(man, { mouth: 0.05 + 0.4 * smooth(range(T, 17.5, 18.2)), lid: 0.35, brow: -0.004, browTilt: 0.2 });
      cubes.forEach(m => {
        const u = m.userData; const dt = T - u.t0;
        if (dt < 0) { m.visible = false; return; }
        m.visible = true; const fall = Math.min(dt, 0.55);
        const y0 = 2.3; const g = 2 * (y0 - u.y1) / 0.55 / 0.55;
        m.position.set(u.x, Math.max(u.y1, y0 - 0.5 * g * fall * fall), u.z);
        m.rotation.set(u.r[0] * Math.min(1, dt / 0.55), u.r[1] * Math.min(1, dt / 0.55), u.r[2]);
      });
      const d = smooth(range(T, 17.6, 18.9)); M.teeth.color.copy(TEETH0).lerp(TEETH1, d);
      const k = easeInOut(range(T, 14.15, 18.95));
      const cu = smooth(range(T, 17.5, 18.4));
      const sh = shake(T, 1.5 + 2 * cu);
      const px = lerp(lerp(0.3, 0.5, k), 0.0, cu), py = lerp(lerp(1.3, 1.35, k), 1.58, cu), pz = lerp(lerp(2.9, 2.5, k), 0.75, cu);
      place(c, [px + sh[0], py + sh[1], pz], [lerp(0.15, 0.35, k) * (1 - cu), lerp(1.15, 1.2, k) * (1 - cu) + 1.6 * cu, 0.3 * (1 - cu)]);
      return { dof: { focus: lerp(2.9, 0.75, cu), aperture: 0.0015 + 0.005 * cu, maxblur: 0.01 }, bloom: 0.35 };
    },
  };
}

// ============ SHOT 6: Day 30 (18.95 – 24.75) ============
function shot6({ makeStage }) {
  const { scene } = stage(makeStage, { night: true });
  const man = makeHuman('casual'); man.root.position.set(1.0, 0, -0.1); man.root.rotation.y = -0.5; scene.add(man.root);
  const R = rngSeed(21);
  for (let i = 0; i < 38; i++) {
    const c = makeCan(); const tip = R() > 0.45;
    c.position.set(-0.6 + R() * 2.0, tip ? 0.034 : 0.07, -0.6 + R() * 1.6);
    if (tip) c.rotation.set(0, R() * 6.28, Math.PI / 2); c.scale.set(1, R() > 0.5 ? 0.7 : 1, 1); scene.add(c);
  }
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.02, 40), new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.2 })); plate.position.set(0.3, 0.015, 0.9); scene.add(plate);
  const steak = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.14), new THREE.MeshStandardMaterial({ color: 0x7a3322, roughness: 0.6 })); steak.position.set(0.8, 0.03, 0.9); steak.rotation.y = 0.4; scene.add(steak);
  const xm = new THREE.MeshBasicMaterial({ color: 0xff2030, toneMapped: false });
  const X = new THREE.Group(); const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.04), xm), b2 = b1.clone(); b1.rotation.z = 0.78; b2.rotation.z = -0.78; X.add(b1, b2); X.position.set(0.55, 0.5, 0.8); scene.add(X);
  const red = new THREE.PointLight(0xff2030, 0, 6), blue = new THREE.PointLight(0x2050ff, 0, 6); red.position.set(0.1, 1.6, -0.9); blue.position.set(0.1, 1.6, -0.9); scene.add(red, blue);
  const rg = glowSprite(0xff2030, 2.2), bg = glowSprite(0x2050ff, 2.2); rg.position.set(-0.15, 1.6, -1.2); bg.position.set(0.35, 1.6, -1.2); scene.add(rg, bg);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, T) {
      apply(man, lerpP(P.sit, { ...P.sit, head: [0.7, 0.1, 0], spine: [0.45, 0, 0] }, smooth(range(T, 20, 24))), T);
      M.teeth.color.copy(TEETH1);
      M.skin.color.copy(SKIN0).lerp(SKIN1, smooth(range(T, 19, 21)));
      face(man, { mouth: 0.02, lid: lerp(0.35, 0.95, smooth(range(T, 19.5, 23))), brow: -0.004, browTilt: -0.15 });
      popScale(plate, T, 20.0, 1); popScale(steak, T, 20.5, 1); popScale(X, T, 21.0, 0.45, 0.25);
      const siren = T >= 23.3; const ph = Math.sin(T * 12) > 0;
      red.intensity = siren && ph ? 2.5 : 0; blue.intensity = siren && !ph ? 2.5 : 0;
      rg.material.opacity = siren && ph ? 0.9 : 0; bg.material.opacity = siren && !ph ? 0.9 : 0;
      const k = easeInOut(range(T, 18.95, 24.75));
      place(c, [lerp(0.3, 0.8, k), lerp(0.7, 1.0, k), lerp(2.9, 2.0, k)], [lerp(0.6, 0.95, k), lerp(0.45, 0.55, k), 0.3]);
      return { dof: { focus: lerp(2.5, 1.7, k), aperture: 0.003, maxblur: 0.008 }, bloom: 0.45, exposure: 0.95 };
    },
  };
}

// ============ SHOT 7: ending (24.75 – 32) ============
function shot7({ makeStage }) {
  const { scene } = stage(makeStage, { night: true });
  const man = makeHuman('casual'); man.root.position.set(0, 0, 0.0); man.root.rotation.y = -0.1; scene.add(man.root);
  const R = rngSeed(33);
  for (let i = 0; i < 20; i++) { const c = makeCan(); c.position.set(-1 + R() * 2, 0.034, -0.6 + R() * 1.4); c.rotation.set(0, R() * 6.28, Math.PI / 2); scene.add(c); }
  const c = cam(40);
  return {
    scene, camera: c,
    update(t, T) {
      const pt = T < 26.4 ? P.point : T < 27.2 ? P.pointUp : T < 29.0 ? lerpP(P.pointUp, P.point, 0.5) : P.point;
      apply(man, lerpP(P.hold, pt, smooth(range(T, 25.4, 26.0))), T);
      M.teeth.color.copy(TEETH1);
      M.skin.color.copy(SKIN1).lerp(SKIN0, 0.5 * smooth(range(T, 24.75, 28)));
      face(man, { mouth: 0.1 + 0.08 * Math.sin(T * 9), lid: 0.2, brow: 0.01 });
      const k = easeInOut(range(T, 24.75, 31.6));
      place(c, [lerp(0.2, 0.0, k), lerp(1.2, 1.15, k), lerp(3.6, 3.2, k)], [0, 0.75, 0]);
      return { dof: { focus: 3.4, aperture: 0.0012, maxblur: 0.005 }, bloom: 0.3, exposure: 0.95 };
    },
  };
}

export const SHOTS = [
  { start: 0.0, end: 3.1, build: shot1 },
  { start: 3.1, end: 8.55, build: shot2 },
  { start: 8.55, end: 10.9, build: shot3 },
  { start: 10.9, end: 14.15, build: shot4 },
  { start: 14.15, end: 18.95, build: shot5 },
  { start: 18.95, end: 24.75, build: shot6 },
  { start: 24.75, end: DURATION + 1, build: shot7 },
];
