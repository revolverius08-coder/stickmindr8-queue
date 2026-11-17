// jsfxr_make.js: generează SFX din cod (jsfxr, Unlicense) în WAV.
//   node jsfxr_make.js <outdir> [preset...]   presets: pickupCoin powerUp hitHurt laserShoot explosion jump blipSelect synth tone click random
// jsfxr se instalează în toolbox/sfxgen (bash toolbox/install.sh). Folosește WAV-urile ca "name" în shots.json (cale absolută).
const path = require('path'), fs = require('fs');
const { sfxr } = require(process.env.JSFXR_PATH || '/home/claude/toolbox/sfxgen/node_modules/jsfxr');
const out = process.argv[2] || '.'; fs.mkdirSync(out, { recursive: true });
const presets = process.argv.slice(3).length ? process.argv.slice(3) : ['pickupCoin', 'powerUp', 'hitHurt', 'laserShoot', 'explosion', 'jump', 'blipSelect'];
for (const p of presets) {
  const s = sfxr.generate(p); const w = sfxr.toWave(s);
  fs.writeFileSync(path.join(out, p + '.wav'), Buffer.from(w.dataURI.split(',')[1], 'base64')); console.log('ok', p);
}
