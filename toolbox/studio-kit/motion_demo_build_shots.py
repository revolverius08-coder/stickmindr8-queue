import json,os,subprocess
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
import sys; sys.path.insert(0,'/home/claude/stickmindr8-queue/toolbox/studio-kit/tools')
from sfx_map import uis
T={'f1':[0,6.0],'f2':[6.0,12.5],'f3':[12.5,20.0],'q':[20.0,24.0],'c':[24.0,31.5]}; D=31.5
open('scenes/times.js','w').write('export const TM = '+json.dumps(T)+';\nexport const CUES = [];\nexport const WORDS = [];\nexport const DUR = %s;\n'%D)
json.dump([],open('timeline/words.json','w'))
S={}
def s(t,name,gain=-8,**k):
    sid=[k2 for k2,(a,b) in T.items() if a<=t<b][0]
    d={"at":round(t-T[sid][0],3),"name":name,"gain":gain}; d.update(k); S.setdefault(sid,[]).append(d)
pop=lambda t,p=1.0,g=-8: s(t,'pop',g,pitch=p)
# ---- shot 1: footsteps at the real heel strikes of the NEW walk (node math = same as the render)
js="import {strikes} from './scenes/walkmath.js'; console.log(JSON.stringify(strikes(0.5,4.0,940,2.3)))"
st=json.loads(subprocess.check_output(['node','--input-type=module','-e',js]).decode())
for i,q in enumerate(st): s(T['f1'][0]+q['t'],'footstep',-11 if q['leg']=='F' else -13,pitch=1.0+0.04*(i%3))
s(0.1,'whoosh',-12); s(0.14,'pop',-9)
for t,p in [(1.7,1.0),(2.5,1.1),(3.3,1.2),(4.7,0.9)]: pop(T['f1'][0]+t,p,-9)
s(T['f1'][0]+4.0,'impact',-18,pitch=1.6)
# ---- shot 2: pointing (both) + tap clicks
a=T['f2'][0]; s(a+0.1,'whoosh',-12); s(a+0.14,'pop',-9)
for t,p in [(1.1,1.0),(1.8,1.1),(2.4,1.2),(4.1,1.1)]: pop(a+t,p,-9)
for t in (1.4,3.6): s(a+t,'pop',-6,pitch=0.9); s(a+t+0.02,'shimmer',-14)       # card pops
s(a+1.4+0.45,'tick',-8,pitch=1.5); s(a+3.6+0.45,'tick',-8,pitch=1.5); s(a+3.6+0.8,'tick',-8,pitch=1.7)  # new tap clicks
s(a+1.4-0.38,'swish',-14,pitch=1.2); s(a+3.6-0.38,'swish',-14,pitch=1.2)          # new arm swing
# ---- shot 3: reach, grip, lift, show
b=T['f3'][0]
for q in [json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {strikes} from './scenes/walkmath.js'; console.log(JSON.stringify(strikes(0.3,2.9,770,2.25)))"]).decode())][0]:
    s(b+q['t'],'footstep',-11 if q['leg']=='F' else -13)
s(b+0.1,'whoosh',-12); s(b+0.14,'pop',-9)
s(b+3.2-0.05,'swish',-10)
s(b+4.0,uis('mechanical','snap'),-7); s(b+4.25,'hit',-10,pitch=0.8); s(b+4.27,'impact',-17,pitch=1.5)
for t,p in [(3.5,1.0),(4.15,1.1),(4.7,0.9),(6.0,1.3)]: pop(b+t,p,-9)
s(b+5.6,'whoosh',-10); s(b+5.62,'ding',-8,pitch=1.2); s(b+5.65,uis('arcade','level-up'),-12); s(b+5.65,'shimmer',-12)
# ---- shot 4: outro v2
q0=T['q'][0]; O0=q0+0.45; OG=q0+2.0
s(O0-0.05,'whoosh',-8); s(O0,'pop',-7); s(O0+0.02,'shimmer',-14); s(O0+0.43,'tick',-8,pitch=1.5)
s(OG-0.04,'pop',-7,pitch=1.1); s(OG,'ding',-9,pitch=1.2)
c0=T['c'][0]; tC=c0+0.5; tTg=c0+1.8; tF=c0+3.0; tTap=c0+4.9
s(tC-0.06,'whoosh',-9); s(tC,'pop',-7); s(tC+0.35,'tick',-8,pitch=1.5)
for i in range(4): s(tC+0.28+i*0.125,uis('mechanical','typing') if False else 'keys',-10,pitch=1.0+0.05*i)
s(tTg-0.06,'whoosh',-9); s(tTg,'pop',-7); s(tTg,'ding',-10,pitch=1.1); s(tTg+0.3,'tick',-8,pitch=1.5); s(tTg+0.2,'blip',-11,pitch=1.3); s(tTg+0.32,'blip',-11,pitch=1.5)
s(tF-0.06,'whoosh',-9); s(tF,'pop',-7); s(tF+0.3,'tick',-8,pitch=1.5)
s(tTap-0.1,'tick',-9,pitch=1.2); s(tTap,'blip',-4,pitch=1.4); s(tTap+0.02,'ding',-6,pitch=1.2); s(tTap+0.03,'shimmer',-9); s(tTap+0.05,uis('arcade','level-up'),-11)
shots=[{"id":sid,"start":a_,"end":b_,"line":"","scene":sid,"set":"clip","in":{"type":"cut"},"sfx":sorted(S.get(sid,[]),key=lambda d:d['at']),"amb":{"name":"roomtone","gain":-36}} for sid,(a_,b_) in T.items()]
music=[{"start":0,"end":D,"mood":"playful","intensity":0.45}]
json.dump({"title":"Stick motion v2 demo","duration":D,"shots":shots,"music":music,"music_gaps":[],"sfx":[]},open('story/shots.json','w'),indent=1)
cfg=json.load(open('config.json')); cfg['title']='Stick motion v2 demo'; cfg['duration']=D; cfg['captions']=False; cfg['music']={"enabled":True,"gainDb":-19}
json.dump(cfg,open('config.json','w'),indent=1)
print('ok',len(st),'steps')
