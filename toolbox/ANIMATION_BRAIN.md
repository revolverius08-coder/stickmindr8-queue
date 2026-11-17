# ANIMATION_BRAIN: creierul de animații StickMindR8

**Regula #1 (de la utilizator):** când zice „facem un videoclip", citesc ÎNTÂI acest fișier (`toolbox/ANIMATION_BRAIN.md` din repo `revolverius08-coder/stickmindr8-queue`, branch main) și iau de aici tot ce trebuie: sunet, animații, tranziții, subtitrări, QC, livrare. Răspund MEREU în română; textul din video/metadate e în engleză.
Actualizat: 2026-11-17 (v2: infrastructura din §13 e instalată și testată). Ce e deja făcut vs. ce e propunere e marcat. Elementele vizuale NOI într-un clip se listează înainte și se aprobă; infrastructura (QC, aliniere, sunet) rulează mereu.

---

## 0. Checklist rapid (ordinea de lucru la fiecare video nou)
1. **Citesc acest MD** + `toolbox/TOOLBOX.md` (uneltele noi) + memoria (preferințe).
2. Scriu/primesc scriptul. Aplic `spoken_money()` pe replici (bani: număr întâi, apoi moneda). Cuvinte fără promisiuni de tip „trimit/dau ceva". Numele reale de unelte rămân, cu „not affiliated" în caption.
3. Listez elementele propuse (obiecte care apar, sunete, efecte) și aștept da/nu dacă e ceva nou față de standard.
4. Voce: `vo.py` (Kokoro EN, sid 6) → `voice.mp3` + `info.json`. **`vo.py` rulează automat `tools/align_words.py` (faster-whisper): timpii de cuvinte sunt REALI** (media estimării greșea ~0.17 s, max ~0.5 s).
5. Proiect nou: `bash toolbox/studio-kit/new_clip.sh N` (creează `clipN` + `clipN-th` din șabloane). Conține: `config.json`, `scenes/{h.js,outro.js,times.js}`, `scenes/shots/g.js`, `story/build_shots.py` → generează `times.js`, `timeline/words.json`, `story/shots.json`, config (hide/keywords).
6. Desenez shoturile; randez 10–15 cadre-cheie (`--stills`, `--sheet`) și mă uit la ele. Repar ciocnirile de text.
7. Randare completă în fundal: `wd.sh <proiect> <durata>` (segmente de 5 s, restart la blocaj). Max ~20 min.
8. Miniatură: proiect `clipN-th`, un singur shot `th`, `--stills 0.5 --scale 1` → `cover.jpg`.
9. **QC obligatoriu:** `python3 toolbox/studio-kit/tools/qc_video.py ...` (§10) + mă uit la `qc_sheet.jpg`; repar FAIL-urile; nu trimit până nu e 0 FAIL.
10. Livrare (secțiunea 11): mp4 + cover în chat (SendUserFile), metadate (un bloc/platformă), Slack DM + push (o dată), GitHub + trigger Instagram doar dacă e în fluxul curent al lui (acum DA pentru clipurile reelmimic).

---

## 1. Inventar: ce avem (stare la 2026-11-17)

### 1.1 Studioul propriu: aiTrends 2D Studio (plugin `aitrends-2d-studio`)
Rădăcină: `/home/claude/work/aitrends-2d-studio/`. Reinstalare: copiez `kit/` din plugin (`/root/.claude/plugins/synced/*/aitrends-2d-studio/skills/make-2d-video/kit`) ca `aitrends-2d-studio/`, apoi `npm install` + `python tools/doctor.py` (detalii în `references/install.md` din plugin).
- **Motor:** canvas 2D în Chromium headless (Playwright preinstalat), cadru cu cadru → ffmpeg. 9:16 = 1080×1920, 24 fps. Fără modele generative de imagini: Stick e identic în fiecare cadru.
- `engine/`: `core.js` (E, V, ease, key, prog, shake, text, glow, circle, ring, rr, seg, veil, layer, blurLayer, wordTime, registerShot), `rig2d.js` (drawFigure, POSES, posesAt, breathe, walkPose, face, bigFace, headPos), `fx2d.js` (rain, drops, dust, snow, stars, fog, sun, moon, godRays, lightCone, pool, lensStreak, sparkle, lightning, speedLines, rings, skyline…), `ui2d.js` (titleCard, bigLine, badge, readout, callout, dimension, dataCard, compareBars, meter, blueprint, bubble, endScreen, captions), `three-kit.js` (3D: stage, orbit, dolly, builders), `styles.js` (grade: dusk, midnight, golden, neon, storybook), `player.js`.
- `tools/`: `new_project.py`, `transcribe.py` (Whisper), `parse_script.py`, `beats.py`, `doctor.py`, `verify_kit.py`. `qc_video.py` recreat: `toolbox/studio-kit/tools/qc_video.py` (copiază-l în `tools/` din studio dacă vrei, dar îl rulez direct din repo).
- `audio/`: `sfx.py` (35 SFX sintetizate), `music.py` (11 stări), `mix.py` (duck + −14 LUFS), `dsp.py`.
- `render.mjs`: `--project --from --to --stills t1,t2 --sheet --scale --workers --format jpeg --preset --out`.
- Poziții Stick (POSES): stand, relaxed, talk, explain, point, pointUp, wave, cheer, handsOnHead, crossArms, think, shrug, holdFront, phone, reach, sad, facepalm, ready, crouch, sit, sitBack, kneel, lie, dive, kick, jump, fall. Expresii: neutral, smile, happy, joy, surprised, shocked, scared, worried, nervous, angry, determined, sad, cry, smirk, sleepy, thinking, confused, awe.

### 1.2 Kitul nostru de producție (în repo: `toolbox/studio-kit/`)
Salvat aici ca să nu se piardă la reset:
- `vo.py`: Kokoro EN prin sherpa-onnx CLI. Intrare `[[text, min_start, gap_before, inner_pause], ...]` → `voice.wav/mp3` + `info.json` (cues + words). **Atenție:** timpii de cuvinte sunt ESTIMAȚI din greutatea cuvântului, nu aliniere reală. Verificat vizual la clipurile 1–7; pentru precizie maximă vezi „Upgrade-uri" 6.
- `wd.sh`: randare de fundal pe segmente de 5 s, reutilizează segmentele existente (șterg `build/segs/seg_NNN.mp4` ca să re-randez doar ce s-a schimbat), restart la blocaj 420 s, concat + mix audio → `out/<Titlu>.mp4` + `out/done.flag`.
- `build_shots.template.py`: din `info.json` → `times.js` (TM, CUES, WORDS), `timeline/words.json` (cu înlocuiri de cifre, ex. „twenty nine dollars" → „$29"), `story/shots.json` (SFX pe cuvinte, muzică pe secțiuni), config (`hide` pentru subtitrări, `keywords`).
- `scenes/h.js`: strat de compatibilitate: `S(id, fn(g,T))`, `WT(cuvânt)` = timpul cuvântului, `stick(g,T,{x,y,s,pose,expr,facing,rim})`, `post()` (vignetă + marcă „StickMindR8"), `H.popK` (pop cu overshoot), `STICK` (hanorac negru, fără cap, `stick:true`).
- `scenes/outro.js`: `outroQuestion` (card întrebare cu cadru auriu + Stick care arată), `outroCTA` (bulă COMMENT <cuvânt> cu tastat, TAG A FRIEND, card FOLLOW cu click roșu→verde), `pointPose/finger` (mâna arată spre fiecare card). Opțiuni: `commentWord`, `tagText`, `tagSize`. Paleta se schimbă per clip (sed pe culori).
- `scenes/shots/g.example.js`: toate helperele de shot folosite (vezi 3.3).
- `thumb/`: proiectul de miniatură (un shot `th`, captions off).
- `config.example.json`: captions on, `captionStyle {y:1480,size:70,max:4,keywords,hide}`, music −17 dB, sfx −6 dB, loudness −14.

### 1.3 Skill-uri ale utilizatorului (sincronizate)
- **reelmimic**: analizează un video de referință și îl refac cu Stick-ul nostru (rea-video pentru analiză, repo `edenfunf/reelmimic` pentru producție; HyperFrames). Stick rămâne 2D-ul nostru; motoarele externe doar pentru mediu/stil/efecte. Rețetă: păstrez structura și efectele, schimb vocea, personajul, formularea, paleta și câteva efecte.
- **video-qc**: reguli permanente + `qc_video.py` (OCR, suprapuneri, subtitrări vs text mare, final, metadate, miniatură). Se rulează pe videoul NOU.
- **video-making**: randare pe fișiere per scenă, concat `-c copy`, un singur render complet, cadre de probă înainte.
- **santa** (/santa): seria „What If You Woke Up as Santa?”: statistici, voturi A/B, part următor, Slack + push.
- **ztm** (/ztm): Zero to Million: episod următor după vot.
- **tn** (/tn): The Note.
- **wi** (/wi): What If: analiză, 10 idei, producție, postare.
- **statistici** (/statistici): statistici YouTube (GitHub yt-stats) + Instagram prin Composio.
- **coada** (/coada): coada de postare (ce e programat/urcat/eșuat, reprogramare).
- **lemo-opuscar**: scurtmetraj în cod în 66 de stiluri (ulei, acuarelă, ukiyo-e…), fără model video.
- **hacking-everything**, **import-memory**, **skill-creator**, **morning**: nu țin de video.
- Skill-uri generale utile la video: **artifact-design/diagramming/capabilities** (pagini/artefacte), **dataviz** (grafice), **docs/docx/pdf/pptx/xlsx** (documente), **canva:*** (design Canva), **frontend-design**, **claude-in-chrome / built-in-browser / computer-use** (browser/desktop), **deep-research**.
- Plugin-uri din sesiune: **aitrends-2d-studio** (make-2d-video, new-video, video-styles, render-video, video-sound).

### 1.4 Conectori / servicii
- **Composio** (`mcp__Compasio__*`): Instagram (INSTAGRAM_POST_IG_USER_MEDIA, …_PUBLISH, GET_IG_MEDIA, comentarii), Slack (SLACK_SEND_MESSAGE, upload), GitHub, etc. Început cu COMPOSIO_SEARCH_TOOLS, `session_id` „kids”.
- **Buzzfy** (statistici IG), **Claude Docs** (documente), **Metricool** (abandonat), `claude-code-remote` (triggere programate), **memory**.
- Conturi: StickMindR8 = Instagram `stickmindr8` (ig_user_id 27949535831388978), Facebook `stickmind`, YouTube `stickmindr8`. GTA 6 = alte conturi (r.evolver08, marius-mihai, wantedvl): nu amesteca.
- Slack: DM `D0CCSUHT2FN` (utilizator U0CCHUUDFRT).
- GitHub: `revolverius08-coder/stickmindr8-queue` (posts/…, series/…, toolbox/…). `git push` merge direct.

### 1.5 Voce, transcriere, audio
- **TTS:** Kokoro-82M `kokoro-en-v0_19`, voce sid 6, prin `sherpa-onnx-offline-tts` (în `/home/claude/tts/`). La container nou: re-descarc binarul sherpa-onnx și modelul `kokoro-en-v0_19` din releases `k2-fsa/sherpa-onnx` (GitHub). Gratuit, fără cont.
- **Whisper:** `faster-whisper` instalat (`pip install --break-system-packages faster-whisper`; modelul `base.en` se descarcă automat din Hugging Face; PyAV dă eroare la deschiderea fișierelor, deci decodăm audio cu ffmpeg în numpy). Folosit în `align_words.py`, `tools/transcribe.py`, transcrierea referințelor.
- **Tesseract** instalat (OCR pentru QC). **ffmpeg 6.1**, **Node 22**, **Python 3.13**, numpy/scipy/opencv.
- **Muzică:** generată local (11 stări: mystery, tension, action, wonder, hopeful, sad, triumph, playful, calm, dark, epic). Folosim mai ales `playful` (intensitate 0.45–0.75). Mixaj: voce curată, muzică −9 dB sub voce, ambianță −5, master −14 LUFS.
- **SFX proprii (35):** whoosh, swish, impact, hit, riser, slowmo, freeze, tick, clock, heartbeat, pop, blip, counter, ding, shimmer, stinger, footstep, kick, whistle, carpass, phonebuzz, phonering, cheer, applause, murmur, rain, thunder, wind, roomtone, city, hum, powerup, glitch, flash, buzz, keys, kaching, scratch. Opțiuni per cue: `at, name, gain, pitch, dur, seed`; `name` poate fi cale la WAV/MP3 propriu.
- **SFX noi:** `toolbox/sfx/uisfx-sounds/<pachet>/<cue>.mp3` (936, CC0) + `sfxgen/` (jsfxr). Vezi 4.

### 1.5b Unelte noi descărcate azi (detalii în `TOOLBOX.md`)
uisfx, stickman-kino, claude-stickman-shorts (analizor), animate, claude-animation-skills, motion-design-skill, handdraw-story-video, Archscribe, jsfxr/ZzFX. Instalare: `bash toolbox/install.sh`.

---

## 2. Reguli permanente ale utilizatorului (le aplic AUTOMAT)
**Calitate:** profesional, cinematic, fără bug-uri, nimic nepetit; realist și logic. Fiecare acțiune din voce o face Stick vizibil EXACT atunci (sincron cu audio real). Camera dirijată (push-in, tracking, low-angle, whip-pan, shake la impact). Ușurință/anticipație/follow-through, fără teleportare, fără alunecare de picioare. Obiectele se țin în mână cadru cu cadru (grip), accesoriile de cap urmează capul. Contact shadows, praf atmosferic, un singur grading per video, contrast mai mare în scene dramatice, liniște înainte de momente mari + stinger la sfârșit de scenă, aceeași privire/ritm pe toată seria.
**Hook:** în primele 2 s, primul cadru puternic; fără pauză moartă > ~2 s; cadru final care încheie povestea.
**Pop-up:** orice numește vocea apare brusc EXACT pe acel cuvânt, cu sunet. Preferă obiectul mic real (felie de pizza, monedă, casă) în loc de cadru/card.
**Text:** niciodată suprapus. Când e text mare/card pe ecran (preț, număr, FREE), subtitrările se ascund, iar cuvântul mare nu apare și în subtitrări. Numerele în subtitrări = cifre.
**Voce:** bani număr întâi apoi moneda („twenty nine dollars"); fără promisiuni de a trimite/da ceva; dacă are întrebare: „comment below" + „follow StickMindR8" + „tag a friend who …" (nu „send this to a friend"). Fără întrebare: card follow + vocea spune „follow StickMindR8".
**Final standard (întrebare):** card întrebare cu cadru auriu (linie albă sus, linie galbenă „or"), Stick mic în dreapta arătând spre el → bulă „COMMENT <cuvânt>" cu sunet de tastare, Stick arată în sus → „TAG A FRIEND …", Stick arată puțin mai jos → card StickMindR8 FOLLOW, click mouse: roșu → verde (+ confetti). Direcția mâinii = locul cardului. Întrebare nouă la fiecare video.
**Final vot A/B (serii):** vocea citește A și B, fiecare card apare pe litera lui cu sunet; „comment below" cu tastat; follow cu tap; vocea se termină pe „follow StickMindR8". „Part N începe cu câștigătorul" doar în descriere și comentariu fixat.
**Subtitrări:** apar doar când se rostește cuvântul (nu înainte), dispar în pauze. Pe clipuri cu hook: tranziție vizuală scurtă între hook și parte, nu tăietură dură.
**Miniatură:** JPG 1080×1920; TOT conținutul în y≈300–1640 (referință „perfect încadrat" = v4 „WHAT IF YOU BECAME FAMOUS OVERNIGHT?"); fără text sus; nimic important jos; Stick nu acoperă text; badge „EPISODE n" la serii; wow, legată direct de video.
**Randare:** mereu ca task de fundal legat de sesiune, max 20 min, repornire automată dacă moare, nu suprascriu un render bun cu unul neverificat. Videouri ușoare ca „What if you won the lottery today?" (fără 3D greu/multe camere). Stick și toate personajele rămân 2D; 3D doar pentru mediu/obiecte, și doar dacă e aprobat.
**Idei:** fără biologie/istorie; subiecte de zi cu zi, relatabile, ușor de animat, care generează share/comentarii/watch-through. Titluri scurte. Șorturi tăiate din video lung: ≤ 1 minut cu tot cu intro.
**Reel trial pe Instagram:** descrierea/caption/hashtag-urile identice cu videoul de bază; doar imaginea diferă.
**Comentarii IG:** răspunsurile se redactează în chat pentru aprobare; doar pe videouri independente, nu pe serii vechi. Pin-ul îl face el manual.

---

## 3. Cum construiesc un video clip cu clip (rețeta testată pe clipurile 1–7)

### 3.1 Voce și timp
1. `lines.json`: `[[text, min_start, gap_before, inner_pause], ...]`; o replică = o idee. `python3 /home/claude/tts/vo.py /home/claude/tts/clipN /home/claude/tts/clipN_lines.json`.
2. Copiez `voice.mp3` ca `projects/clipN/input/voiceover.mp3`; `info.json` alimentează `build_shots.py` → `times.js` cu `TM = {g0:[t0,t1], g1:…, q:…, c:…}`.
3. `wd('cuvânt', after)` din `build_shots.py` dă start-ul cuvântului; shoturile taie la început de replică (−0.1 s).
4. Durata țintă: 30–45 s pentru Reels; final în ultimele ~8–10 s.

### 3.2 Structura unui shot
`S('g1', (g,T) => { ... })`: `T` = secunde globale. Fiecare element apare cu `pk(T, A('cuvânt'))` (pop cu overshoot ~0.32 s) și dispare cu `fadeOut`. Camera: `zoom(g3,k,cx,cy)`, `kick(T,[t1,t2],amp,dec)` pentru shake la impact. La final de shot: `post(g,T)` (vignetă + marcă).

### 3.3 Helpere din `g.example.js` (copiate între proiecte)
`bgNight` (fundal + grilă), `streamPic`, `monitor`, `chatGraph` (bare cu spike), `ico(kind: scissors, rec, counter, cc, eye, cal, clock, moon, zzz, gear, terminal, spark, check, chip, phone)`, `StickAt/stickL` (Stick cu glow), `LB` (label mare), `INKT`, `card`, `burst`, `bigcoin`, `wave` (undă audio), `strip`, `stamp` (ștampilă), `chipT`, `mitBadge`, `paperPiece`, `flag`, `mini`, `big` (cuvânt mare cu pop+rotație), `flash`, `kick`, `zoom`.
- **Paletă distinctă per clip** (deja folosite: navy/cyan, mentă/violet/coral, verde pădure/auriu, prună/portocaliu, crem/cerneală, albastru deschis/portocaliu, antracit/albastru gheață). Alege una nouă. Stick pe fundal închis: glow 0.4.

### 3.4 Subtitrări (config.json)
`captions: true`, `captionStyle {y:1480, size:70, max:4, keywords:[…evidențiate], hide:[[t0,t1],…]}`. `hide` = intervalele cu text mare/card (generate în `build_shots.py` din cuvinte-cheie). Cifrele ca digits prin `PH` (frază→înlocuire) în `build_shots.py`. Captions off pe miniatură.

### 3.5 Sunet per clip (în `build_shots.py`)
Pe fiecare cuvânt-obiect: `pp(t)` = `pop` cu `pitch` variat + un al doilea sunet tematic (`ding`/`blip`/`kaching`/`keys`/`impact`/`swish`/`shimmer`/`hit`/`scratch`). La întrebare: `whoosh`+`pop`. La COMMENT: `keys`. La TAG: `pop`+`ding`. La FOLLOW: `whoosh`, `pop`, apoi `blip`+`ding`+`shimmer` la click. Max ~2 cue-uri simultan; gain: subtil −12…−16, normal −6…−10, momente mari −3…−6. Ambianță `roomtone` −34. Muzică `playful`, secțiuni pe intensitate.

### 3.6 Randare și verificare vizuală
- Cadre: `node render.mjs --project projects/clipN --stills t1,t2,t3 --scale 0.5` și `--sheet`. Mă uit la ele (Read) înainte de randarea completă.
- Complet: `bash /home/claude/work/wd.sh clipN <durata>` în fundal (Bash `run_in_background`), apoi `done.flag`. Re-randare parțială = șterg segmentul și rulez din nou.
- Conflicte frecvente deja întâlnite: text peste text, iconițe peste text, monede peste cifre, Stick peste text în miniatură, cadre goale la început (rezolvare: label mare de la 0.4 s + ascund subtitrarea).

### 3.7 Miniatură
Proiect `clipN-th`: `config.json` cu `captions:false`, `duration:1`, un shot `th`. `node render.mjs --project projects/clipN-th --stills 0.5 --scale 1` → JPG 1080×1920 → `out/cover.jpg`. Gândesc 3 variante de text/imagine, aleg una și spun de ce. Ținta: y 300–1640, fără text sus, Stick pe lateral sau jos (y 1640–1790) sau poză `stand`.

---

## 4. Sunet: harta completă (sintetizat + uisfx + jsfxr)
| Moment | SFX propriu | uisfx (CC0) | Note |
|---|---|---|---|
| obiect/cuvânt apare | pop, blip | `rubber/add-to-cart`, `arcade/reaction`, `glass/badge` | pitch 0.9–1.4 ca să nu sune la fel |
| preț/monedă | kaching, impact | `arcade/purchase`, `arcade/bonus` | + jsfxr `pickupCoin` |
| număr mare / reușită | ding, shimmer | `arcade/level-up`, `arcade/streak`, `studio/achievement` | |
| eroare / roșu | buzz, hit | `*/error`, `*/blocked`, `*/warning` | |
| tastare | keys | `mechanical/typing` | la bula COMMENT |
| scanare/căutare | tick, hum | `scifi/scanning` (buclă) | |
| swipe/whip/tranziție | whoosh, swish | `*/swipe`, `*/drop`, `*/snap` | |
| click FOLLOW | blip+ding+shimmer | `*/press` + `*/toggle-on` | roșu → verde |
| somn/lună | roomtone, hum | `dreamy/sleep`, `*/wake` | |
| dramatic | riser, impact, stinger | `cinematic/*` | riser 1–2 s înainte de reveal |
Pachetele uisfx: arcade, rubber, glass, mechanical, minimal, soft, organic, dreamy, scifi, cinematic, studio, zen. Regula: UN pachet per clip, schimbat între clipuri. Se folosesc în `shots.json` cu `"name": "/cale/spre/fișier.mp3"`. **Verificat:** `mix.py` încarcă direct mp3-urile uisfx (stereo, vârf ~0.28, deci gain −4…−8 față de SFX-urile proprii). Folosire în `build_shots.py`: `from sfx_map import pick; P=pick('rubber'); s(t, P('pop'), -6)` (`tools/sfx_map.py`). `pitch` NU se aplică fișierelor (doar SFX-urilor sintetice). SFX din cod: `node tools/jsfxr_make.js <outdir> pickupCoin hitHurt …` apoi folosești WAV-urile ca `name`.

---

## 5. Animație: biblioteca de efecte (existente vs. propuse)
**Existente (le folosim):** pop cu overshoot (`outBack`), shake la impact, glow/burst, undă audio, grafice (bare, chat spike), ștampile, ico, cuvânt mare cu rotație, whip/flash/dip/fade/zoom, parallax `layer`, `blurLayer` (prim-plan estompat), praf `FX.dust`, rings, lensStreak, godRays, 3D (`three-kit`, rar, doar mediu).
**Propuse din uneltele noi (de aprobat înainte de folosire):**
- *Trasat apoi colorat* (handdraw-story-video): obiectul-cheie se desenează în linie, apoi se umple de culoare. O singură dată, la hook.
- *Linie care „fierbe"* (animate): wobble pe contururi la 2 s, pentru un clip creativ pe lună.
- *Aspect desenat de mână* (Archscribe/rough.js): scheme de flux.
- *Poze noi* (stickman-kino/stix): mers/alergat în 4 faze, brațe IK exacte spre obiect, mai multe emoții, mai multe props.
- *Easing/stagger din motion-design-skill*: overshoot mic, stagger 60–80 ms între elemente, tabele timing.
- *Contact sheet cu zona sigură Instagram* (claude-animation-skills) pentru QC.
- *Scor „PowerPoint animat"* + 4 cadre post-randare (idee OpenMontage, doar concept, AGPL).

---

## 6. Upgrade-uri (stare)
1. Aliniere reală a cuvintelor: **FĂCUT** (`align_words.py`, automat în `vo.py`).
2. `qc_video.py`: **FĂCUT** (§10).
3. uisfx + jsfxr în mixer: **FĂCUT** (`sfx_map.py`, `jsfxr_make.js`).
4. Analizor de referință: **FĂCUT** (`tools/analyze_reference.py`, din claude-stickman-shorts, MIT). Rulat la fiecare ReelMimic: `python3 tools/analyze_reference.py <video> <outdir>`.
5. `new_clip.sh N`: **FĂCUT** (scaffold de proiect).
6. Biblioteca de poze/props/IK extinsă din stickman-kino/stix: **IDEE**, de propus pe clip.
7. Eșantion de 20 s la clipurile noi ca stil: **IDEE**.

---

## 7. Fluxul ReelMimic (referință → clip nostru)
1. Primesc referința; rulez analizorul (cuts, paletă, loudness, cuvinte/s) + mă uit la cadre.
2. Păstrez: structura, ritmul, efectele mari, stilul „clipuri mari".
3. Schimb: voce (Kokoro EN), personaj (Stick-ul nostru 2D), formulare, paletă distinctă, 2–3 efecte mici, finalul nostru standard cu cuvânt de comentariu.
4. Nu promit nimic în voce; nume reale de unelte cu „not affiliated" în caption; afirmații verificabile (altfel le scot).
5. Cuvinte de comentariu folosite: CLIP, CHAT, REAL, MOMENT, STYLE, SPIKE, OPEN. Alege unul nou sau reciclează cu motiv. DM-urile pentru cuvinte le facem împreună prin Composio doar când zice el.

---

## 8. Metadate (la fiecare video)
Un bloc de copiat per platformă: titlu, rând gol, descriere, rând gol, hashtag-uri.
- **Instagram:** exact 5 hashtag-uri, `#reelsinstagram` în loc de `#reels`, fără etichete; caută trendurile curente (WebSearch).
- **YouTube Shorts:** 3 blocuri (titlu / descriere+hashtag-uri / tag-uri) + comentariu fixat separat.
- **TikTok:** titlu, descriere, 5 hashtag-uri. **Facebook:** titlu, descriere+hashtag-uri, comentariu fixat.
- Comentariu fixat în bloc separat. Totul și în `meta.json` (`caption`, `first_comment`, `publish_at`, `other_platforms`, `series`, `status`).

---

## 9. Programare Instagram (fluxul curent reelmimic)
Slot: primul liber între 02:00, 04:00, 06:00, 08:00, 10:00 (Europe/Bucharest, UTC+2 iarna), în ordinea terminării, două clipuri niciodată în același slot. Pași: urc `video.mp4`, `cover.jpg`, `meta.json` în `posts/<data>_clipN_<slug>/`; verific URL-urile raw (HTTP 200); `create_trigger` cu `run_once_at` în UTC (ora RO − 2 h), `requires_local_device:false`, `notifications:{push:true}`, prompt autonom: citește meta.json, oprește dacă status=posted sau există duplicat (INSTAGRAM_GET_IG_USER_MEDIA), verifică 200, INSTAGRAM_POST_IG_USER_MEDIA (REELS, share_to_feed true, cover_url), PUBLISH o singură dată (max_wait 300), postează first_comment, mesaj final în română cu link și reamintire că pinul e manual. Niciodată postare dublă.
Alte serii: `/santa`, `/ztm`, `/tn`, `/wi` au propriile reguli (el postează manual dacă nu cere altfel).

---

## 10. QC (obligatoriu înainte de trimitere)
Rulat pe videoul NOU, nu pe episoade vechi.
**Vizual:** 10–15 cadre-cheie la momentele cele mai încărcate; apoi contact sheet pe fișierul final (`ffmpeg -vf fps=1/3,scale=270:-1,tile=6x5`).
**Script `qc_video.py` (recreat și validat pe clipurile 1–7):**
`python3 toolbox/studio-kit/tools/qc_video.py --video out/X.mp4 --meta out/meta.json --cover out/cover.jpg --words projects/<p>/timeline/words.json --duration <s> --lines /home/claude/tts/clipN_lines.json [--series] [--vote] --out /tmp/qcN`
Verifică: format 1080×1920 h264, audio, durată (≤60 s pentru Short-uri tăiate), loudness (−16…−12 LUFS) și peak, liniște > 1.5 s, cadre negre, hook (contrast în primele 2 s), imagine statică > 2 s, **text suprapus** (OCR, 3 fps), **subtitrare + text mare simultan**, cuvânt mare repetat în subtitrare, cuvinte-număr în subtitrări, voce: „$” sau „dollars 29” (bani) și promisiuni de trimis/dat, final: card FOLLOW (OCR full-res pe ultimele 3 s; acceptă și „new stories every day”), carduri A/B la `--vote`, metadate (exact 5 hashtag-uri IG, `#reelsinstagram`, fără etichete, first_comment, YT titlu/descriere/tag-uri, TikTok 5 hashtag-uri, „Not affiliated” la nume de unelte), miniatură (1080×1920, text în banda y300–1640, zone sus/jos goale, badge EPISODE la `--series`). Produce `qc_report.md` + `qc_sheet.jpg`; cod de ieșire 1 la FAIL. Durează ~12 s.
Limite: OCR-ul poate rata text mic sau pe culori puternice (de aceea final-ul se verifică full-res și manual pe sheet). Rezultat 7 clipuri: 1–6 = 0 FAIL; clip 7 = 1 FAIL real (subtitrare sub cardul SupoClip) → reparat și re-randat.
**Checklist manual:** fără „MISSING SHOT"/cadre roșii de eroare; imaginea = replica; Stick lizibil, rim light, nu iese din cadru, nu acoperă text; variație de cadre; 9:16 cu subiecții la mijloc; voce clară, muzică duckată, fără ghemuiri de SFX, ~−14 LUFS.
Spun rezultatul QC într-o linie la livrare.

---

## 11. Livrare (după QC)
1. `SendUserFile`: mp4 + cover.jpg în chat (mereu).
2. Metadatele în chat (blocuri) + mesaj în română cu ziua și ora programării (dacă e programat).
3. Slack: UN singur mesaj în DM (`D0CCSUHT2FN`, sesiune „kids") cu miniatura + metadatele YT/TikTok; apoi UN `PushNotification` (proactive). Nu retrimit dacă primesc ok. Videoul nu merge pe Slack.
4. GitHub + trigger doar dacă fluxul cere (vezi 9). La final de lot: un mesaj Slack consolidat + un push.

---

## 12. Capcane cunoscute
- Containerul se poate reseta: ce nu e în repo se pierde (proiectele clipN, modelele TTS, `qc_video.py`). Folosesc `toolbox/install.sh` și `toolbox/studio-kit/` (modelele TTS se re-descarcă manual, vezi §1.5).
- `wd.sh` pare blocat dacă randez cadre de probă în paralel (CPU): așteaptă, termină.
- Ora de azi deja trecută → slotul se mută pe ziua următoare; spun asta clar utilizatorului.
- Claim-uri neverificabile despre unelte: le scot; spun doar ce e demonstrat (ex. „free software, not free to run").
- `analyze_reference.py` detectează doar tăieturi dure.
- Licențe: MIT/CC0/Unlicense = ok; AGPL/GPL = doar idei, nu cod; „other"/fără licență = nu copiez.

---

## 13. Playbook „performanță maximă” (aplic la fiecare video, fără să mai fiu rugat)
1. **Înainte de scris:** citesc acest MD, memoria și lista de clipuri deja făcute (paletă, pachet de sunet, cuvânt de comentariu, slot) ca să aleg ceva NOU pe fiecare: paletă, pachet uisfx, cuvânt, hook.
2. **Hook în 2 s:** primul cadru are deja un obiect/label mare + sunet; QC-ul verifică contrastul în primele 2 s.
3. **Densitate de pop-up-uri:** câte un obiect real pe cuvânt-cheie (nu cadre), cu sunet diferit/pitch diferit; elementele rămân pe ecran până se termină ideea.
4. **Sincron:** pop-urile pe `words` REALE; subtitrările se ascund pe tot intervalul cardurilor mari (de la începutul replicii, nu de la cuvânt).
5. **Sunet:** un pachet uisfx per clip + SFX proprii pentru impact/whoosh; liniște scurtă înainte de momentul mare; stinger la final de scenă; −14 LUFS.
6. **Cameră:** push-in lent pe fiecare shot, shake la impact, cel puțin un whip/flash/zoom motivat.
7. **Verificare în 3 pași:** cadre-cheie înainte de randare; QC automat după; sheet văzut cu ochii.
8. **Livrare completă** (§11) și, dacă e în flux, programare (§9).
9. **După livrare:** adaug în acest MD (secțiunea 14) ce am învățat (capcană nouă, unealtă nouă, setare bună).

## 14. Jurnal viu: cum adăugăm unelte noi
Când găsim o unealtă/skill/plugin nou: (1) verific licența (MIT/Apache/CC0/Unlicense = ok; GPL/AGPL = doar idei; fără licență = nu), (2) gratuit și rulează în cloud fără PC-ul lui, (3) o clonez în `toolbox/` și o adaug în `install.sh`, (4) o testez pe un exemplu mic, (5) o descriu în `TOOLBOX.md` + o rând în §1.5b și în §5 (ce efect/capacitate aduce), (6) efectele vizuale noi se propun pe clip și se aprobă.
Jurnal:
- 2026-11-17: toolbox creat (9 unelte); aliniere reală a cuvintelor; `qc_video.py` recreat și rulat pe clipurile 1–7 (descoperit: subtitrare sub card în clipul 7, reparat); uisfx/jsfxr integrate; analizor de referință; `new_clip.sh`.
- Căutare GitHub (2026-11-17): rămase de evaluat la nevoie: HyperFrames catalog (~450 blocuri, ex. `instagram-follow`), openmotion (format Motion.md), clippere open source pentru subiecte despre clipping (Anil-matcha, ClippedAI, ViralMint).
