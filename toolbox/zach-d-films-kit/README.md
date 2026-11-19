# zach-d-films-kit: scurte 3D în stil Zack D. Films (motor three.js, randare în cloud, fără GPU)

Sursa: github.com/artemnovitckii/claude-animation-skills (skill `/zach-d-films`, MIT). Aici e motorul adaptat de noi (testat 2026-11-19).
- `engine/` = proiectul (index.html, render.mjs, src/). Se copiază într-un folder de lucru, cu `node_modules` simlinkat din kit (three.js + Playwright, `npm install` în kit/).
- Adaptări ale noastre: outfit `casual` (tricou, blugi, adidași) în `src/human.js` + materiale în `materials.js`; antebraț prelungit (mâinile nu mai plutesc); `man.face` expus (pleoape/sprâncene); `overlay.js` = numere mari, badge-uri DAY, carduri finale; `render.mjs` cu `CHROME=` (executabil Chromium existent) și `HIDE=1` (stills fără overlay, pentru miniatură).
- `example_energy_30days/` = scurtul „30 days of only energy drinks”: `shots_energy.js` (7 cadre), `overlay_energy.js`, `mix.py` (SFX + muzică sintetizate din cod, duck sub voce), `run2.sh` (randare pe bucăți cu reluare automată), `l.json` (replicile pentru vocea Kokoro).
## Cum rulezi
`export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers CHROME=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome GL=swiftshader` apoi `node render.mjs stills t1,t2 dir` sau `node render.mjs video out.mp4 24 [from] [to]`.
## Limite (verificate)
- Randare software: ~3 s/cadru la 720x1280; 31,6 s la 24 fps = 42 min. Peste regula de 20 min, deci doar cu acordul lui.
- Personaj 3D „păpușă”: față simplă, mâinile fac pumn în jurul obiectului, hem de tricou zimțat. NU arată realist ca la Zack D. Films.
- Nu înlocuiește Stick 2D. Folosire: modele/obiecte/medii 3D, eventual personaje secundare, doar cu aprobare.
