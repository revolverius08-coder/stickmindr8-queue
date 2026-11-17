import json,os,subprocess
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
import sys; sys.path.insert(0,'/home/claude/stickmindr8-queue/toolbox/studio-kit/tools')
from sfx_map import uis
T={'f1':[0,9.5],'f2':[9.5,17.0],'f3':[17.0,27.5],'q':[27.5,32.0],'c':[32.0,41.0]}; D=41.0
open('scenes/times.js','w').write('export const TM = '+json.dumps(T)+';\nexport const CUES = [];\nexport const WORDS = [];\nexport const DUR = %s;\n'%D)
json.dump([],open('timeline/words.json','w'))
S={}
def s(t,name,gain=-8,**k):
    sid=[k2 for k2,(a,b) in T.items() if a<=t<b][0]
    d={"at":round(t-T[sid][0],3),"name":name,"gain":gain}; d.update(k); S.setdefault(sid,[]).append(d)
def node(expr): return json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {strikes} from './scenes/walkmath.js'; console.log(JSON.stringify("+expr+"))"]).decode())
def steps(base,expr,g=-11):
    for i,q in enumerate(node(expr)): s(base+q['t'],'footstep',g if q['leg']=='F' else g-2,pitch=1.0+0.04*(i%3))
pop=lambda t,p=1.0,g=-9: s(t,'pop',g,pitch=p)
# ---- f1: walk, turn, wave
a=T['f1'][0]; s(a+0.05,'whoosh',-12); pop(a+0.1)
steps(a,"strikes(0.4,3.6,890,2.3)"); steps(a,"strikes(4.7,6.9,420,2.3)")
s(a+3.95,'swish',-12,pitch=0.9); s(a+4.3,'tick',-12,pitch=0.8)
s(a+7.0-0.22,'swish',-12,pitch=1.2); s(a+7.15,'shimmer',-14); s(a+7.2,'ding',-12,pitch=1.3)
for t,p in [(1.2,1.0),(2.4,1.1),(4.0,1.2),(7.4,1.3)]: pop(a+t,p)
# ---- f2: run, jump, land
b=T['f2'][0]; s(b+0.05,'whoosh',-12); pop(b+0.1)
steps(b,"strikes(0.3,2.1,610,2.3,42,0.35,0.3,0.38)",-9)
s(b+2.12,'tick',-10,pitch=0.7); s(b+2.25,'whoosh',-8,pitch=1.1); s(b+2.27,'swish',-12)
tl=b+2.25+0.8; s(tl,'impact',-9,pitch=1.0); s(tl+0.01,'hit',-10,pitch=0.8); s(tl+0.03,'footstep',-8,pitch=0.7)
s(b+4.0,'ding',-10,pitch=1.2); s(b+4.0,'shimmer',-14)
for t,p in [(0.9,1.0),(2.05,1.1),(2.6,1.2),(3.2,0.9)]: pop(b+t,p)
# ---- f3: reach, grip, wind-up, throw, basket
c=T['f3'][0]; s(c+0.05,'whoosh',-12); pop(c+0.1)
steps(c,"strikes(0.3,2.0,450,2.25)")
s(c+2.45,'swish',-12,pitch=1.2); s(c+3.1,uis('mechanical','snap'),-7); s(c+3.3,'hit',-11,pitch=0.8)
s(c+4.1,'swish',-14,pitch=0.8); s(c+4.5,'whoosh',-8,pitch=1.2); s(c+4.67,'pop',-8,pitch=0.8)
tH=c+4.67+0.95; s(tH,'shimmer',-9); s(tH,'ding',-9,pitch=1.2); s(tH+0.02,'impact',-14,pitch=1.6); s(tH+0.05,uis('arcade','level-up'),-11)
for t,p in [(2.7,1.0),(3.3,1.1),(4.1,1.2),(4.8,0.9),(5.72,1.3)]: pop(c+t,p)
# ---- q: question card
q0=T['q'][0]; O0=q0+0.45; OG=q0+2.0
s(O0-0.05,'whoosh',-8); s(O0,'pop',-7); s(O0+0.02,'shimmer',-14); s(O0+0.43,'tick',-8,pitch=1.5)
s(OG-0.04,'pop',-7,pitch=1.1); s(OG,'ding',-9,pitch=1.2)
# ---- c: CTA with sliding cards
c0=T['c'][0]; tC=c0+0.5; tTg=c0+1.9; tF=c0+3.4; tTap=c0+5.6
s(tC-0.06,'whoosh',-9); s(tC,'pop',-7); s(tC+0.35,'tick',-8,pitch=1.5)
for i in range(4): s(tC+0.28+i*0.125,'keys',-10,pitch=1.0+0.05*i)
s(tTg-0.1,'swish',-10,pitch=0.9); s(tTg-0.06,'whoosh',-10); s(tTg,'pop',-7); s(tTg,'ding',-10,pitch=1.1); s(tTg+0.3,'tick',-8,pitch=1.5); s(tTg+0.2,'blip',-11,pitch=1.3); s(tTg+0.32,'blip',-11,pitch=1.5)
s(tF-0.1,'swish',-10,pitch=0.9); s(tF-0.06,'whoosh',-9); s(tF,'pop',-7); s(tF+0.3,'tick',-8,pitch=1.5)
s(tTap-0.35,'whoosh',-12,pitch=0.7); s(tTap-0.05,'tick',-6,pitch=1.2); s(tTap,'blip',-4,pitch=1.4); s(tTap+0.02,'ding',-6,pitch=1.2); s(tTap+0.03,'shimmer',-9); s(tTap+0.04,'impact',-14,pitch=1.4); s(tTap+0.05,uis('arcade','level-up'),-11)
shots=[{"id":sid,"start":a_,"end":b_,"line":"","scene":sid,"set":"clip","in":{"type":"cut"},"sfx":sorted(S.get(sid,[]),key=lambda d:d['at']),"amb":{"name":"roomtone","gain":-36}} for sid,(a_,b_) in T.items()]
music=[{"start":0,"end":D,"mood":"playful","intensity":0.45}]
json.dump({"title":"Stick motion v3 demo","duration":D,"shots":shots,"music":music,"music_gaps":[],"sfx":[]},open('story/shots.json','w'),indent=1)
cfg=json.load(open('config.json')); cfg['title']='Stick motion v3 demo'; cfg['duration']=D; cfg['captions']=False; cfg['music']={"enabled":True,"gainDb":-19}
json.dump(cfg,open('config.json','w'),indent=1)
ffm=None
print('ok')
