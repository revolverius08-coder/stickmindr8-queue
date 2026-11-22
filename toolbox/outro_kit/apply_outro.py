"""apply_outro.py — StickMindR8 phone outro, portable version (needs only Python 3 + ffmpeg).

    python apply_outro.py my_video.mp4 [--cut 0.6] [--out my_video_with_outro.mp4]

What it does
  1. Cuts the video --cut seconds before its end (skip a fade-out to black; default 0.6, use 0 if it has no fade).
  2. Freezes that last clean frame, dims it, and lets the red 3D phone (outro_flip_alpha.mov, transparent
     background) tumble out of it until it fills the screen.
  3. Continues with the POV Instagram profile (outro_pov.mp4: scroll down/up, Follow presses itself).
  4. Audio: the video's audio up to the cut, then outro_audio.wav ("Check out my latest videos, and follow StickMindR8").
Output: 1080x1920, 24 fps, H.264 + AAC. If the input is not 1080x1920 it is scaled/padded to it.
Files expected next to this script: outro_flip_alpha.mov, outro_pov.mp4, outro_audio.wav
"""
import argparse, json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
FLIP, POV, AUD = (os.path.join(HERE, f) for f in ("outro_flip_alpha.mov", "outro_pov.mp4", "outro_audio.wav"))

def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit("ffmpeg failed:\n" + r.stderr[-3000:])
    return r.stdout

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--cut", type=float, default=0.6); ap.add_argument("--out"); a = ap.parse_args()
    src = a.video; out = a.out or os.path.splitext(src)[0] + "_with_outro.mp4"
    info = json.loads(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", src]))
    dur = float(info["format"]["duration"]); has_audio = any(s.get("codec_type") == "audio" for s in info["streams"])
    flip_d = float(json.loads(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", FLIP]))["format"]["duration"])
    T = round(dur - a.cut, 3)
    norm = "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24,format=yuv420p"
    fc = (
        f"[0:v]trim=0:{T},setpts=PTS-STARTPTS,{norm}[main];"
        f"[0:v]trim=start={max(0, T - 0.06)}:duration=0.06,setpts=PTS-STARTPTS,{norm},trim=end_frame=1,loop=loop=-1:size=1:start=0,trim=duration={flip_d},setpts=PTS-STARTPTS,"
        f"scale=iw*1.0:ih*1.0[last];"
        f"color=c=black:s=1080x1920:r=24:d={flip_d},format=rgba,colorchannelmixer=aa=0.55,fade=t=in:st=0:d=1.2:alpha=1[dark];"
        f"[last][dark]overlay=format=auto[dim];"
        f"[1:v]fps=24,format=rgba,setpts=PTS-STARTPTS[flip];[dim][flip]overlay=format=auto,format=yuv420p[fl];"
        f"[2:v]{norm},setpts=PTS-STARTPTS[pov];"
        f"[main][fl][pov]concat=n=3:v=1:a=0[v];"
    )
    if has_audio: fc += f"[0:a]atrim=0:{T},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,afade=t=out:st={max(0, T - 0.25)}:d=0.25[a0];"
    else: fc += f"anullsrc=r=48000:cl=stereo,atrim=0:{T}[a0];"
    fc += "[3:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS[a1];[a0][a1]concat=n=2:v=0:a=1[a]"
    base = ["ffmpeg", "-v", "error", "-y", "-i", src, "-i", FLIP, "-i", POV, "-i", AUD, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart"]
    sh(base + ["-crf", "20", "-maxrate", "6M", "-bufsize", "12M", out])
    mb = os.path.getsize(out) / 1048576
    if mb > 30:   # keep the upload file under 30 MB (social media rule): re-encode at the bitrate that lands ~28 MB
        total = T + float(json.loads(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", POV]))["format"]["duration"]) + flip_d
        vk = int(28 * 8 * 1024 / total - 160)
        sh(base + ["-b:v", f"{vk}k", "-maxrate", f"{int(vk * 1.4)}k", "-bufsize", f"{vk * 2}k", out]); mb = os.path.getsize(out) / 1048576
    print(f"OK: {out}  ({mb:.1f} MB, cut at {T}s of {dur:.2f}s)")

if __name__ == "__main__": main()
