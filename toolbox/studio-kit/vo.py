# usage: python3 vo.py <outdir> <lines.json>   (lines: [[text, min_start, gap_before, inner_pause], ...])
import sys, json, re, wave, os, subprocess
import numpy as np
B='/home/claude/tts'; M=B+'/kokoro-en-v0_19'; O=sys.argv[1]; LINES=json.load(open(sys.argv[2])); os.makedirs(O,exist_ok=True)
SH=B+'/sherpa-onnx-v1.13.8-linux-x64-shared'; env=dict(os.environ, LD_LIBRARY_PATH=SH+'/lib'); SR=24000; _n=[0]
def gen(txt):
    f=f'{O}/t{_n[0]:02d}.wav'; _n[0]+=1
    subprocess.run([SH+'/bin/sherpa-onnx-offline-tts',f'--kokoro-model={M}/model.onnx',f'--kokoro-voices={M}/voices.bin',f'--kokoro-tokens={M}/tokens.txt',f'--kokoro-data-dir={M}/espeak-ng-data','--num-threads=2','--sid=6',f'--output-filename={f}',txt],env=env,check=True,capture_output=True)
    w=wave.open(f); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; w.close(); return x
def trim(x,th=0.004):
    idx=np.where(np.abs(x)>th)[0]; return x[max(idx[0]-int(.02*SR),0):idx[-1]+1+int(.03*SR)]
def fade(x,i=0.006,o=0.045):
    x=x.copy(); a=int(i*SR); b=int(o*SR); x[:a]*=np.linspace(0,1,a); x[-b:]*=np.linspace(1,0,b); return x
def wt(w):
    d=re.sub(r'[^0-9]','',w); l=re.sub(r'[^A-Za-z]','',w); x=len(l)+(2.2*len(d)+1.5 if d else 0)
    if w.endswith((',',':')): x+=1.2
    if w.endswith(('.','?')): x+=1.0
    return max(x,1.5)
out=[np.zeros(int(.12*SR),dtype=np.float32)]; t=0.12; cues=[]; words=[]
for li,(txt,mins,gap,inner) in enumerate(LINES):
    sents=re.split(r'(?<=[.?!])\s+',txt.strip()); chunks=[(s_,fade(trim(gen(s_)))) for s_ in sents]
    if li>0 or mins>0:
        pl=max(gap,mins-t); out.append(np.zeros(int(pl*SR),dtype=np.float32)); t+=pl
    for si,(s_,x) in enumerate(chunks):
        d=len(x)/SR; last=si==len(chunks)-1; p=0 if last else inner
        cues.append(dict(i=len(cues),text=s_,start=round(t,3),end=round(t+d,3)))
        ws=s_.split(); tw=sum(wt(w) for w in ws); a_=t
        for w in ws:
            b_=a_+d*wt(w)/tw; words.append(dict(word=w,start=round(a_,3),end=round(b_,3))); a_=b_
        out+=[x,np.zeros(int(p*SR),dtype=np.float32)]; t+=d+p
out.append(np.zeros(int(0.6*SR),dtype=np.float32)); y=np.concatenate(out)
w=wave.open(O+'/voice.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes()); w.close()
json.dump(dict(duration=round(len(y)/SR,3),cues=cues,words=words),open(O+'/info.json','w'),indent=1)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',O+'/voice.wav','-b:a','192k',O+'/voice.mp3'],check=True)
print('duration',round(len(y)/SR,2)); [print(c['i'],c['start'],c['end'],c['text']) for c in cues]
