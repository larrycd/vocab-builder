import json,re,unicodedata
en=json.load(open('../app/data/en.json'))
def key(w):
    w=unicodedata.normalize('NFKD',w.lower()); w=''.join(c for c in w if not unicodedata.combining(c))
    return re.sub(r'[^a-z]','',w)
seen={key(e['w']) for e in en}
DROP={'tabularasaalafrancaise','sottovoce','asseity','fartlek','squirrelly','snottynosed','erf','rantallion'}
def load(files):
    out=[]
    for f in files:
        for l in open(f,encoding='utf8'):
            p=[x.strip() for x in l.rstrip('\n').split('|')]
            if len(p)<4 or p[3] in ('','—') or p[1]=='—': continue
            out.append(p)
    return out
order=[('th',['new_th.txt']),('la',['new_la1.txt','new_la2.txt']),('fr',['new_fr.txt']),('ob',['new_ob1.txt','new_ob2.txt'])]
rep={}
for d,files in order:
    res=[];skip=[]
    for p in load(files):
        k=key(p[0])
        if k in DROP or k in seen: skip.append(p[0]); continue
        seen.add(k)
        m=[x.strip() for x in p[3].split(';') if x.strip()]
        e={'id':f'{d}{len(res)+1:04d}','w':p[0],'say':p[1],'type':p[2] or 'phrase','m':m,'x':[p[4]] if len(p)>4 and p[4] else []}
        res.append(e)
    import unicodedata as U
    res.sort(key=lambda e:''.join(c for c in U.normalize('NFKD',e['w'].lower()) if c.isalnum()))
    for i,e in enumerate(res): e['id']=f'{d}{i+1:04d}'
    json.dump(res,open(f'../app/data/{d}.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    rep[d]=(len(res),skip)
for d,(n,s) in rep.items(): print(d,n,'skipped',len(s),s)
