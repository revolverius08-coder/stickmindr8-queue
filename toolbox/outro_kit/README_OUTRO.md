# StickMindR8 outro kit — instructions for Claude

Every StickMindR8 video must end with this outro. It is already rendered; do NOT recreate or redesign it.

**What it is (≈5.8 s):** the video's last frame freezes and dims, a red 3D phone tumbles out of the middle of the
frame (two flips + a spin) and grows until it fills the whole screen. The phone shows the @stickmindr8 Instagram
profile in English; it scrolls down through the videos and back up, then the **Follow** button presses itself
(→ "Following ✓", 373 → 374 followers, "+1"). Voiceover (Kokoro am_michael): *"Check out my latest videos, and follow
StickMindR8."* — **no subtitles** during the outro.

## Files
| file | what |
|---|---|
| `apply_outro.py` | attaches the outro to any video (needs only Python 3 + ffmpeg) |
| `outro_flip_alpha.mov` | the tumbling phone, 1.71 s, PNG codec **with transparent background** |
| `outro_pov.mp4` | the profile POV: scroll + Follow, 4.08 s |
| `outro_audio.wav` | voiceover + SFX + music for the whole outro (5.78 s) |

## If `ffmpeg` is missing
`pip install imageio-ffmpeg`, then put its binary on PATH, e.g. in Python:
`import imageio_ffmpeg, os, shutil; b = imageio_ffmpeg.get_ffmpeg_exe(); os.makedirs("bin", exist_ok=True); shutil.copy(b, "bin/ffmpeg")`
and run with `PATH=$PWD/bin:$PATH` (ffprobe: use `ffmpeg -i` if ffprobe is not available, or install the static ffmpeg build).

## How to use
1. Finish the story video as usual (1080x1920, 24 fps). It may end with a short fade-out.
2. Run:
   ```
   python apply_outro.py my_video.mp4 --cut 0.6
   ```
   `--cut` = seconds removed from the end before the outro starts (skip the fade-out to black). Use the video's
   fade-out length + ~0.05 s (0 if there is no fade). The frame at the cut point is the one the phone comes out of,
   so it must be a clean, visible frame (not black).
3. Output: `my_video_with_outro.mp4` (1080x1920, 24 fps, H.264/AAC, kept under 30 MB automatically).
4. Check the result: grab frames around the join (`ffmpeg -ss <cut-1> -i out.mp4 -vf fps=5,scale=180:-1,tile=8x3 -frames:v 1 join.jpg`)
   and confirm the phone appears out of the last frame and the Follow tap happens near the end.
5. Post / deliver the `_with_outro.mp4` file, not the original.

## Rules
- Use the kit files exactly as they are. Do not add another end card, follow card, captions or CTA lines.
- Don't put subtitles over the outro.
- If the input is not 1080x1920 the script scales/pads it; better to render the story at 1080x1920.
