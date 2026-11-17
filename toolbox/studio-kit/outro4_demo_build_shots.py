import json,os,sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
sys.path.insert(0,'/home/claude/stickmindr8-queue/toolbox/studio-kit/tools')
from sfx_map import uis
T={'q':[0,4.2],'c':[4.2,12.5]}; D=12.5
open('scenes/times.js','w').write('export const TM = '+json.dumps(T)+';\nexport const CUES = [];\nexport const WORDS = [];\nexport const DUR = %s;\n'%D)
json.dump([],open('timeline/words.json','w'))
S={}
def s(t,name,gain=-8,**k):
    sid=[k2 for k2,(a,b) in T.items() if a<=t<b][0]
    d={"at":round(t-T[sid][0],3),"name":name,"gain":gain}; d.update(k); S.setdefault(sid,[]).append(d)
q0=0; O0=q0+0.45; OG=q0+1.9
s(O0-0.05,'whoosh',-8); s(O0,'pop',-7); s(O0+0.02,'shimmer',-14); s(O0+0.43,'tick',-8,pitch=1.5)
s(OG-0.04,'pop',-7,pitch=1.1); s(OG,'ding',-9,pitch=1.2)
c0=4.2; tC=c0+0.4; tSend=c0+1.65; tTg=c0+2.5; tTagP=c0+3.1; tF=c0+3.65; tFP=c0+4.2
s(tC-0.06,'whoosh',-9); s(tC,'pop',-7)
for i in range(4): s(tC+0.3+i*0.125,'keys',-10,pitch=1.0+0.05*i)
s(tSend-0.05,'tick',-6,pitch=1.3); s(tSend,'blip',-5,pitch=1.4); s(tSend+0.02,uis('mechanical','snap'),-8); s(tSend+0.04,'ding',-9,pitch=1.3)
s(tSend+0.28,'swish',-10,pitch=0.9)
s(tTg-0.06,'whoosh',-9); s(tTg,'pop',-7); s(tTg,'blip',-11,pitch=1.3); s(tTg+0.2,'blip',-11,pitch=1.5)
s(tTagP-0.05,'tick',-6,pitch=1.3); s(tTagP,'blip',-5,pitch=1.2); s(tTagP+0.02,'ding',-8,pitch=1.2); s(tTagP+0.03,'shimmer',-12); s(tTagP+0.05,uis('arcade','level-up'),-14)
s(tTagP+0.33,'swish',-10,pitch=0.9)
s(tF-0.06,'whoosh',-9); s(tF,'pop',-7); s(tF+0.3,'tick',-8,pitch=1.5)
s(tFP-0.05,'tick',-6,pitch=1.2); s(tFP,'blip',-4,pitch=1.4); s(tFP+0.02,'ding',-6,pitch=1.2); s(tFP+0.03,'shimmer',-9); s(tFP+0.04,'impact',-14,pitch=1.4); s(tFP+0.05,uis('arcade','level-up'),-11)
shots=[{"id":sid,"start":a_,"end":b_,"line":"","scene":sid,"set":"clip","in":{"type":"cut"},"sfx":sorted(S.get(sid,[]),key=lambda d:d['at']),"amb":{"name":"roomtone","gain":-36}} for sid,(a_,b_) in T.items()]
json.dump({"title":"Outro v4","duration":D,"shots":shots,"music":[{"start":0,"end":D,"mood":"playful","intensity":0.4}],"music_gaps":[],"sfx":[]},open('story/shots.json','w'),indent=1)
cfg=json.load(open('config.json')); cfg['title']='Outro v4'; cfg['duration']=D; cfg['captions']=False; cfg['music']={"enabled":True,"gainDb":-19}
json.dump(cfg,open('config.json','w'),indent=1)
print('ok')
