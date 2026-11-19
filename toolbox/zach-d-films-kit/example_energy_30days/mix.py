import numpy as np, wave, subprocess, json
SR=44100; DUR=31.6; N=int(SR*DUR)
rng=np.random.default_rng(7)
def add(buf,x,t,g=1.0):
    i=int(t*SR); 
    if i>=len(buf): return
    x=x[:len(buf)-i]; buf[i:i+len(x)]+=x*g
def S(*a):
    n=max(len(x) for x in a); o=np.zeros(n)
    for x in a: o[:len(x)]+=x
    return o
def env(n,a=0.005,d=0.2):
    t=np.arange(n)/SR; return np.minimum(t/a,1)*np.exp(-t/d)
def tone(f,dur,wave_='sin',d=0.15,a=0.003):
    n=int(dur*SR); t=np.arange(n)/SR
    f=np.broadcast_to(f,(n,)) if np.isscalar(f) else np.interp(t,np.linspace(0,dur,len(f)),f)
    ph=2*np.pi*np.cumsum(f)/SR
    y=np.sin(ph) if wave_=='sin' else np.sign(np.sin(ph))*0.5+np.sin(ph)*0.5
    return y*env(n,a,d)
def noise(dur,d=0.1,lp=None):
    n=int(dur*SR); y=rng.standard_normal(n)
    if lp: 
        k=np.ones(lp)/lp; y=np.convolve(y,k,'same')
    return y*env(n,0.002,d)
def pop(): return S(tone(np.linspace(900,350,2000),0.12,d=0.04)*0.8,noise(0.03,0.01,3)*0.3)
def hit(): return S(tone(np.linspace(110,40,8000),0.5,d=0.22)*1.2,noise(0.15,0.05,20)*0.5)
def fizz(): return noise(0.9,0.5,2)*0.4
def crush(): return S(noise(0.35,0.08,6)*0.8,tone(np.linspace(300,100,3000),0.2,d=0.06)*0.3)
def click(): return S(noise(0.02,0.006,2)*1.0,tone(2600,0.02,d=0.006)*0.3)
def zap(): 
    return S(noise(0.6,0.2,2)*0.4,tone(np.linspace(2200,300,10000),0.5,'sq',d=0.2)*0.4)
def beat(): return tone(np.linspace(70,40,4000),0.18,d=0.07)*1.4
def crunch(): return noise(0.25,0.06,4)*1.0
def siren(dur):
    n=int(dur*SR); t=np.arange(n)/SR; f=700+300*np.sin(2*np.pi*1.4*t); return np.sin(2*np.pi*np.cumsum(f)/SR)*0.35*np.minimum(t/0.2,1)*np.minimum((dur-t)/0.2,1)
def ding(): return S(tone(1568,0.5,d=0.2),tone(2093,0.5,d=0.25)*0.7)*0.7
def whoosh(): 
    n=int(0.5*SR); t=np.arange(n)/SR; y=rng.standard_normal(n); y=np.convolve(y,np.ones(30)/30,'same'); return y*np.sin(np.pi*t/0.5)**2*0.6
s=np.zeros(N)
for i,t in enumerate([1.0,1.14,1.28]): add(s,pop(),t,0.6)
add(s,pop(),2.06,0.7); add(s,whoosh(),0.0,0.3)
for i in range(10): add(s,pop(),3.18+0.1*i,0.45)
add(s,fizz(),1.8,0.5); add(s,fizz(),3.45,0.5); add(s,crush(),5.45,0.9)
for t in [5.38,6.92,8.59,10.94,14.2,16.19,18.97]: add(s,hit(),t,0.9)
add(s,zap(),8.65,0.7)
lt=0
tt=11.1
while tt<14.1:
    r=1.6+(4.2-1.6)*min(1,max(0,(tt-10.9-0.8)/2.3)); add(s,beat(),tt,0.8); add(s,beat(),tt+0.17,0.5); tt+=1/r
for i in range(40): add(s,click(),16.2+i*0.035+rng.random()*0.02,0.35)
add(s,crunch(),17.9,0.8); add(s,crunch(),18.2,0.8)
add(s,pop(),20.0,0.7); add(s,pop(),20.5,0.7); add(s,hit(),21.0,0.6)
add(s,siren(1.45),23.3,0.5)
add(s,pop(),24.75,0.8); add(s,pop(),27.2,0.8); add(s,pop(),29.0,0.8)
for i in range(14): add(s,click(),26.45+i*0.05+rng.random()*0.02,0.7)
add(s,click(),30.65,1.0); add(s,ding(),30.7,0.8)
# music: dark pulse
m=np.zeros(N); t=np.arange(N)/SR
bpm=100; step=60/bpm/2
root=[55,55,65.4,49]
for k in range(int(DUR/step)):
    f=root[(k//8)%4]*(2 if k%4==3 else 1)
    add(m,tone(f,step*0.9,'sq',d=0.18)*0.5,k*step,0.5)
pad=np.sin(2*np.pi*110*t)*0.12+np.sin(2*np.pi*164.8*t)*0.08
m+=pad*np.minimum(t/2,1)
# silence-before-hit dips handled by ducking
# voice
w=wave.open('/tmp/zdf/vo3/voice.wav'); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; sr=w.getframerate(); w.close()
v=np.interp(np.arange(N)/SR*sr,np.arange(len(v)),v,right=0)
# duck music under voice
e=np.convolve(np.abs(v),np.ones(int(0.15*SR))/int(0.15*SR),'same'); duck=1-0.65*np.clip(e*12,0,1)
mix=v*1.0+s*0.55+m*0.16*duck
mix=np.tanh(mix*1.1)
y=(np.clip(mix,-1,1)*32767).astype(np.int16)
w=wave.open('/tmp/zdf/snd/mix.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes()); w.close()
print('ok')
