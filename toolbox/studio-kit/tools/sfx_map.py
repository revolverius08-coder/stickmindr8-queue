"""sfx_map.py: nume semantice -> fișiere uisfx (CC0) pentru shots.json ("name": uis('rubber','add-to-cart')).
In build_shots.py:  from sfx_map import uis, PACKS, pick ;  s(t, uis('arcade','level-up'), -8)
Un pachet per clip: pick('rubber')('pop') etc. Căile sunt absolute (mix.py le acceptă)."""
import os, glob
ROOTS = ['/home/claude/stickmindr8-queue/toolbox/sfx/uisfx-sounds', '/home/claude/toolbox/uisfx/packages/uisfx/sounds']
def _root():
    for r in ROOTS:
        if os.path.isdir(r): return r
    raise FileNotFoundError('uisfx lipsește: bash toolbox/install.sh sau git pull în stickmindr8-queue')
def uis(pack, cue):
    p = os.path.join(_root(), pack, cue + '.mp3')
    if not os.path.exists(p): raise FileNotFoundError(p)
    return p
PACKS = ['arcade', 'rubber', 'glass', 'mechanical', 'minimal', 'soft', 'organic', 'dreamy', 'scifi', 'cinematic', 'studio', 'zen']
# rol -> cue uisfx
ROLE = {'pop': 'add-to-cart', 'react': 'reaction', 'badge': 'badge', 'bonus': 'bonus', 'win': 'level-up', 'streak': 'streak', 'reward': 'reward',
        'achieve': 'achievement', 'buy': 'purchase', 'refund': 'refund', 'error': 'error', 'blocked': 'blocked', 'warn': 'warning', 'ok': 'success',
        'check': 'check', 'type': 'typing', 'swipe': 'swipe', 'drop': 'drop', 'snap': 'snap', 'press': 'press', 'on': 'toggle-on', 'off': 'toggle-off',
        'scan': 'scanning', 'rec': 'recording', 'sleep': 'sleep', 'wake': 'wake', 'ping': 'notification', 'send': 'send', 'recv': 'receive',
        'undo': 'undo', 'unlock': 'unlock', 'lock': 'lock', 'start': 'start', 'stop': 'stop', 'open': 'open', 'close': 'close', 'copy': 'copy'}
def pick(pack):
    """pick('rubber')('pop') -> cale; pick('rubber')('win')"""
    return lambda role: uis(pack, ROLE.get(role, role))
