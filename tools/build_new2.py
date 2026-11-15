import json,re,unicodedata as U
D='../app/data/'
def key(w):
    w=U.normalize('NFKD',w.lower()); w=''.join(c for c in w if not U.combining(c))
    return re.sub(r'[^a-z]','',w)
seen=set()
for f in ['en','la','fr','th','ob']:
    for e in json.load(open(D+f+'.json',encoding='utf8')): seen.add(key(e['w']))
# deck, files, six-field?, cross-deck dedupe?, sort?
spec=[('oe',['new_oe1.txt','new_oe2.txt'],1,1,1),('me',['new_me1.txt','new_me2.txt'],1,1,1),
('kj',['new_kjv.txt'],0,0,1),('rh',['new_rh.txt'],0,1,1),('rt',['new_rt1.txt','new_rt2.txt'],0,0,1),
('ww',['new_ww1.txt','new_ww2.txt'],0,1,1),('id',['new_id1.txt','new_id2.txt'],0,1,1),('am',['new_am.txt'],0,1,1),
('wk',['new_wk.txt'],0,1,1),('zh',['new_zh.txt'],1,0,0),('ja',['new_ja.txt'],1,0,0),('es',['new_es.txt'],0,0,0),
('ru',['new_ru.txt'],1,0,0),('mh',['new_mh1.txt','new_mh2.txt'],1,0,0)]
for d,files,six,cross,srt in spec:
    res=[];skip=[];local=set()
    for f in files:
        for l in open(f,encoding='utf8'):
            p=[x.strip() for x in l.rstrip('\n').split('|')]
            n=6 if six else 5
            if len(p)<n-1: continue
            if six: w,alt,say,typ,m=p[:5]; note=p[5] if len(p)>5 else ''
            else: w,say,typ,m=p[:4]; alt=''; note=p[4] if len(p)>4 else ''
            if not m or m=='—' or say=='—' or not w: continue
            k=(w.lower()+'|'+alt) if not cross else key(w)
            if not key(w) and not alt: continue
            if k in local or (cross and k in seen): skip.append(w); continue
            local.add(k)
            e={'id':'','w':w,'say':say,'type':typ or 'phrase','m':[x.strip() for x in m.split(';') if x.strip()],'x':[note] if note else []}
            if alt and alt!=w: e['alt']=alt
            res.append(e)
    if cross: seen.update(key(e['w']) for e in res)
    if srt: res.sort(key=lambda e:''.join(c for c in U.normalize('NFKD',e['w'].lower()) if c.isalnum()))
    for i,e in enumerate(res): e['id']=f'{d}{i+1:04d}'
    json.dump(res,open(D+d+'.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    print(d,len(res),'skipped',len(skip),skip[:25])
