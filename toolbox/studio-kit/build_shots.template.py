import json,re,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
I=json.load(open('/home/claude/tts/clip7/info.json')); C=I['cues']; D=I['duration']; W=I['words']
norm=lambda w:re.sub(r'[.,?!:"“”\']','',w).lower()
def wd(word,after=0.0):
    for w in W:
        if norm(w['word'])==norm(word) and w['start']>=after: return w['start']
    raise KeyError(word)
B=lambda i,d=0.1: round(C[i]['start']-d,3)
ST=[('g0',0),('g1',B(1)),('g2',B(2)),('g3',B(4)),('g4',B(6)),('q',B(7)),('c',round(wd('Comment')-0.08,3))]
T={}
for i,(k,a) in enumerate(ST):
    b=ST[i+1][1] if i+1<len(ST) else D
    T[k]=[round(a,3),round(b,3)]
open('scenes/times.js','w').write('export const TM = '+json.dumps(T)+';\nexport const CUES = '+json.dumps([[c['start'],c['end']] for c in C])+';\nexport const WORDS = '+json.dumps([[w['word'],w['start'],w['end']] for w in W])+';\nexport const DUR = %s;\n'%D)
PH=[(('twenty','nine','dollars'),'$29')]
CW=[]; i=0
while i<len(W):
    hit=None
    for ph,rep in PH:
        n=len(ph)
        if i+n<=len(W) and tuple(norm(W[i+k]['word']) for k in range(n))==ph: hit=(n,rep); break
    if hit:
        n,rep=hit; trail=re.search(r'[.,?!]+$',W[i+n-1]['word'])
        CW.append({"word":rep+(trail.group(0) if trail else ''),"start":W[i]['start'],"end":W[i+n-1]['end']}); i+=n
    else: CW.append({"word":W[i]['word'],"start":W[i]['start'],"end":W[i]['end']}); i+=1
os.makedirs('timeline',exist_ok=True); json.dump(CW,open('timeline/words.json','w'),indent=1)
S={}
def s(t,name,gain=-8,**k):
    sid=[k2 for k2,(a,b) in T.items() if a<=t<b][0]
    d={"at":round(t-T[sid][0],3),"name":name,"gain":gain}; d.update(k); S.setdefault(sid,[]).append(d)
def pp(t,pitch=1.0,g=-7): s(t-0.03,'pop',g,pitch=pitch)
x=wd('twenty'); pp(x,1.0); s(x,'kaching',-7); s(x,'impact',-7,pitch=0.8)
x=wd('SupoClip'); pp(x,1.1); s(x,'shimmer',-9); s(x,'ding',-8,pitch=1.2); x=wd('open'); pp(x,1.0); s(x,'blip',-8,pitch=1.1); x=wd('alternative'); pp(x,1.0); s(x,'swish',-8)
x=wd('Paste'); pp(x,1.0); s(x,'keys',-9); x=wd('YouTube'); pp(x,1.0); s(x,'blip',-8); x=wd('Twitch'); pp(x,1.0); s(x,'blip',-8,pitch=1.1); x=wd('Kick'); pp(x,1.0); s(x,'blip',-8,pitch=1.2)
x=wd('moments'); pp(x,1.0); s(x,'ding',-8,pitch=1.2); s(x+0.2,'ding',-9,pitch=1.4); x=wd('vertical'); pp(x,1.1); s(x,'swish',-8); x=wd('face'); pp(x,1.0); s(x,'blip',-9,pitch=1.2); x=wd('captions'); pp(x,1.0); s(x,'keys',-9)
x=wd('catch'); pp(x,0.9); s(x,'impact',-6,pitch=0.8); x=wd('keys'); pp(x,1.0); s(x,'hit',-9); s(x+0.25,'hit',-9,pitch=1.1); x=wd('free',x); pp(x,1.0); s(x,'ding',-8,pitch=1.2); x=wd('run'); pp(x,0.9); s(x,'scratch',-9)
x=wd('allow'); pp(x,1.2); s(x,'ding',-8,pitch=1.3); x=wd('credit'); pp(x,1.1); s(x,'blip',-9,pitch=1.2)
q0=C[7]['start']; s(q0-0.04,'whoosh',-8); s(q0,'pop',-7); x=wd('host',q0); s(x-0.05,'pop',-7)
tCm=wd('Comment'); s(tCm-0.06,'pop',-7); s(tCm,'keys',-8); s(tCm+0.35,'keys',-9,pitch=1.1)
s(wd('tag')-0.06,'pop',-7); s(wd('tag'),'ding',-9,pitch=1.1)
s(wd('follow')-0.06,'whoosh',-8); s(wd('follow'),'pop',-7); s(wd('StickMindR8')+0.15,'blip',-5,pitch=1.4); s(wd('StickMindR8')+0.18,'ding',-7,pitch=1.2); s(wd('StickMindR8')+0.19,'shimmer',-9)
shots=[{"id":sid,"start":a,"end":b,"line":"","scene":sid,"set":"clip","in":{"type":"cut"},"sfx":sorted(S.get(sid,[]),key=lambda d:d['at']),"amb":{"name":"roomtone","gain":-34}} for sid,(a,b) in T.items()]
st=lambda k:T[k][0]
music=[{"start":0,"end":st('g2'),"mood":"playful","intensity":0.6},{"start":st('g2'),"end":st('q'),"mood":"playful","intensity":0.75},{"start":st('q'),"end":D,"mood":"playful","intensity":0.45}]
json.dump({"title":"SupoClip vs OpusClip","duration":D,"shots":shots,"music":music,"music_gaps":[],"sfx":[]},open('story/shots.json','w'),indent=1)
HID=[[round(wd('twenty')-0.1,2),round(wd('dollars')+0.9,2)],[round(wd('open')-0.1,2),round(wd('alternative')+1.4,2)],[round(wd('YouTube')-0.1,2),round(wd('Kick')+0.9,2)],[round(wd('moments')-0.1,2),round(wd('moments')+1.2,2)],[round(wd('catch')-0.1,2),round(wd('catch')+1.0,2)],[round(wd('keys')-0.1,2),round(wd('run')+1.4,2)],[round(wd('allow')-0.1,2),round(wd('credit')+1.2,2)],[round(q0-0.1,2),round(D,2)]]
cfg=json.load(open('config.json')); cfg['title']='SupoClip vs OpusClip'
cfg['duration']=D; cfg['hide']=HID; cfg['captionStyle']['hide']=HID
cfg['captionStyle']['keywords']=['opusclip','supoclip','$29','open','source','youtube','twitch','kick','vertical','captions','catch','api','keys','free','allow','credit','comment','tag','follow']
json.dump(cfg,open('config.json','w'),indent=1)
print(json.dumps(T))
