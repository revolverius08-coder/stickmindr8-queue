# StickMindR8 rules for the painted watercolor miniseries

Engine: p5.js + p5.brush rendered frame by frame in headless Chrome (cloud, no GPU, no desktop app), ffmpeg encode. Source: JohnHeibel/ClaudeAnimationBase (MIT), see LICENSE.

## Hard rules
- Never an orange haze/mist around a character. Clean, correct colours; the character must be clearly separated from the background (lighter or darker value, ink outline).
- No Stick and no Clawd: the miniseries uses its own original painted characters (see series bible).
- Script is written together with the user and approved BEFORE any voice, scene or render.
- Voice: Kokoro v1.0 (sherpa-onnx kokoro-multi-lang-v1_0), speaker id 19 = am_santa for Santa; free, no account, no key.
- Reels: 9:16 1080x1920 (the template is 1920x1080: set the config to 1080x1920 and compose for vertical), 24 fps, 30 s.
- Hook in the first 2 s, a pop/event about every 5 s, ending with comment / tag / follow cards (see ANIMATION_BRAIN.md).
- Render as a session-tied background task; restart automatically if it dies; keep good renders.
- QC with several still sheets per shot before the final render; full-video QC after.
