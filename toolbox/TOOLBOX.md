# StickMindR8 toolbox: 10 unelte gratuite (MIT / CC0 / Unlicense / GPL-3 pentru bpy)
Instalare într-o sesiune nouă: `bash toolbox/install.sh` (clone + npm). Sunetele uisfx sunt deja aici: `toolbox/sfx/uisfx-sounds/<pachet>/<cue>.mp3` (CC0, 936 fișiere).
Regula: Stick rămâne 2D-ul nostru. Luăm din ele idei, sunete, efecte și verificări, nu stilul altcuiva. Nimic nou în clip fără aprobarea lui.

## 1. uisfx (CC0): sunete pentru pop-up-uri
12 pachete × 78 cue-uri. Pachete: arcade, rubber (pop-uri elastice), glass (tech), mechanical, minimal, soft, organic, dreamy, scifi, cinematic, studio, zen.
Cue-uri utile: add-to-cart, reaction, badge, bonus, achievement, level-up, streak, reward, purchase, refund, error, blocked, warning, check, success, typing, swipe, drop, snap, press, toggle-on, scanning (buclă), recording (buclă), sleep, wake, notification, send, receive, undo/redo.
Hartă: obiect care apare = rubber/add-to-cart sau reaction · preț/monedă = arcade/purchase · număr mare = level-up/streak · eroare/roșu = error/blocked · tastare = typing · click FOLLOW = press + toggle-on · swipe/whip = swipe · scanare/căutare = scanning · lună/somn = sleep/wake.
Folosire: pachet diferit per clip (ca paleta), același pachet în tot clipul.

## 2. stickman-kino (MIT): poze, IK, props, tranziții
engine/: sm-rig.js (58 poze, mers/alergat în 4 faze, brațe IK, 6 emoții), sm-props.js (202 obiecte), sm-fx.js, sm-type.js (12 intrări de text, evidențieri), sm-world.js (7 medii), sm-charts.js (19 grafice), sm-titles.js (8 intro/outro). Rulare testată: `node bin/stickman.mjs build <proiect>` cu Chrome din Playwright (PUPPETEER_EXECUTABLE_PATH). Voce: provider "files" sau "none" (Kokoro-ul lor nu e instalat, folosim sherpa-onnx).
Folosire la noi: copiem ideile de poze/IK/props în kitul nostru canvas, nu înlocuim kitul.

## 3. claude-stickman-shorts (MIT): analizor + format A/B
scripts/analyze_reference.py <video> → report.md (tăieturi, lungime cadre, paletă, loudness, cuvinte/s), contact sheets, spectrogramă, audio.wav. Testat pe clipul 7. Folosire: la fiecare ReelMimic, rulat pe referință ÎNAINTE de refacere. src/kit/Stick.tsx = rig SVG de comparat cu al nostru. Format „You Decide” (alegere A/B + continuitate în stories/).
Notă: nu detectează tranziții animate, doar tăieturi dure.

## 4. animate (MIT): stiluri + verificări
Șapte stiluri (cut paper, crosshatch, riso, sketchbook, math, pixel, isometric), linie care „fierbe” (wobble pe 2s), cameră, mișcare cu arc, morph între scene, verificări de aliniere la beat, loudness și suprapunere text. Fișier de citit: craft.md. Folosire: efecte „boil” pe contururi la clipuri creative.

## 5. claude-animation-skills (MIT): contact sheet cu zonă sigură
kit/words.py (timpi de cuvinte), skills/stick-figure (canvas, whip transitions, captions 1–2 cuvinte), build.py cu contact sheet cu zona sigură Instagram marcată. Folosire: contact sheet pentru QC miniatură/cadre.

## 6. motion-design-skill (MIT): calitatea mișcării
SKILL.md + director/ (12 principii Disney, emoție→mișcare), patterns/ (intrare/ieșire, stagger), reference/timing-easing-tables.md. Folosire: tabele de easing pentru pop-uri și tranziții, regula de stagger pentru liste.

## 7. handdraw-story-video (MIT): trasat apoi colorat
scripts/make_lineart.py extrage linii local; revelare stânga→dreapta, apoi culoare. Folosire: reveal pentru imagini/diagrame, efect nou între clipuri.

## 8. Archscribe (MIT): aspect desenat de mână
rough.js + preseturi `draw`, `flow`, `trace`. Folosire: scheme de flux (ex. „chat spike → rewind → clip”) cu aspect desenat.

## 9. jsfxr + ZzFX (Unlicense / MIT): SFX din cod
`sfxgen/`: `sfxr.generate('pickupCoin'|'powerUp'|'hitHurt'|'laserShoot'|'explosion'|'blipSelect'|'jump')` → WAV. Testat. Folosire: sunete lipsă (coin, laser, glitch) și variații, ca să nu sune la fel în toate clipurile.

## 10. bpy = Blender ca pachet Python (GPL-3; imaginile randate sunt ale noastre): obiecte 3D realiste (telefon, mașină)
Verificat 2026-11-18 în cloud, fără PC-ul lui: `pip install bpy` (roata de 427 MB, 1 GB instalat; folosim `--target /tmp/b3d/pkg` ca să nu atingă restul). Merge pe CPU, fără GPU. Teste pe 2 nuclee: Cycles 540x960, 16 mostre = 10 s/cadru; 1080x1920, 48 mostre = 73 s/cadru; EEVEE merge doar prin GL software (85 s/cadru, fără câștig).
Concluzie: NU pentru animație cadru cu cadru (5 s la 24 fps = 120 cadre = 20 min la 540p, peste 2 ore la 1080p; depășește bugetul de 20 min). DA pentru un singur cadru fix per obiect (telefon, mașină, card), randat o dată cu fundal transparent (PNG, ~1–2 min), apoi animat în studio 2D: push-in, parallax, rotire cu mai multe poze, reflexii false. Pentru obiecte care se rotesc: 8–12 unghiuri randate o singură dată.
Exemplu testat: `studio-kit/tools/bpy_still_example.py <mostre>` (telefon cu ecran din PNG). Regula rămâne: Stick 2D, 3D doar mediu/obiecte, listat și aprobat înainte.
**FOLOSIM bpy DOAR când cere el special** (randarea durează foarte mult); implicit rămânem pe studioul 2D + three.js.

## Cum le combinăm pentru clipuri premium (propuneri, de aprobat)
1. Pop-uri cu obiecte reale + sunet uisfx pe cuvânt, cu easing din motion-design-skill (overshoot mic, stagger 60–80 ms).
2. Reveal „trasat apoi colorat” la obiectul-cheie al clipului (o singură dată, la hook).
3. Poze noi: alergat/mers în 4 faze, brațe IK care ating exact obiectul, emoții.
4. Un pachet de sunet și o paletă per clip, ca să se vadă că sunt „ediții” diferite.
5. Linie „boil” pe contururi la un clip pe lună, pentru variație.
6. QC mărit: analizor pe referință, contact sheet cu zona sigură, scor „prezentare PowerPoint animată” (idee din OpenMontage), 4 cadre după randare.
7. Seria A/B „You Decide”: continuitate în fișier, ca la Santa.
