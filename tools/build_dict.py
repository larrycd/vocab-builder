import json,re,os,collections
S='src/'; OUT='/home/claude/vb/app/dict/'
os.makedirs(OUT,exist_ok=True)
POS={'n':'noun','v':'verb','a':'adjective','s':'adjective','r':'adverb'}
FILES={'noun':'noun','verb':'verb','adj':'adjective','adv':'adverb'}
# synset glosses
gl={}; cap={}; low={}
for f,p in FILES.items():
    for l in open(S+'wordnet/data.'+f,encoding='latin-1'):
        if l.startswith('  '): continue
        off=l[:8]; g=l.split(' | ',1)[1].strip() if ' | ' in l else ''
        gl[(p,off)]=g
        t=l.split(); nw=int(t[3],16)
        for i in range(nw):
            lem=t[4+2*i]; k=re.sub(r'\(.*\)$','',lem).lower()
            if lem[0].isupper(): cap[k]=cap.get(k,0)+1
            else: low[k]=low.get(k,0)+1
wn=collections.OrderedDict(); wtag={}
for f,p in FILES.items():
    for l in open(S+'wordnet/index.'+f,encoding='latin-1'):
        if l.startswith('  '): continue
        t=l.split(); lemma=t[0]; nsyn=int(t[2]); pc=int(t[3]); offs=t[-nsyn:]; tag=int(t[-nsyn-1])
        if re.search(r'\d',lemma) or lemma.count('_')>3: continue
        if cap.get(lemma) and not low.get(lemma): continue
        wtag.setdefault(lemma,{})[p]=tag
        for o in offs[:3]:
            g=gl.get((p,o),'')
            d,_,ex=g.partition('; "')
            d=d.strip().rstrip(';').strip()
            ex=ex.split('"')[0].strip() if ex else ''
            if d: wn.setdefault(lemma,[]).append([p,d,ex])
# webster
wb=json.load(open(S+'dictionary.json',encoding='utf8'))
def wsenses(t):
    parts=re.split(r'(?:^|\s)\d+\.\s',t)
    parts=[x for x in parts if x.strip()] or [t]
    out=[]
    LBL={'Obs':'obsolete','R':'rare','Archaic':'archaic','Colloq':'colloquial','Prov. Eng':'dialect','Scot':'Scottish'}
    for x in parts[:4]:
        x=re.sub(r'\s+',' ',x).strip()
        tags=[]
        def tg(k):
            tags.append(LBL.get(k.group(1),k.group(1))); return '. '
        x=re.sub(r'\s*\[(Obs|R|Archaic|Colloq|Prov\. Eng|Scot)\.?[^\]]*\]\s*',tg,x)
        m=re.match(r'(.+?)[.;]?\.(\s+[A-Z"(]|\s*$)',x)
        d=(m.group(1) if m else x).rstrip(';. ').strip()
        if tags: d+=' ('+tags[0]+')'
        if len(d)>220: d=d[:217].rsplit(' ',1)[0]+'…'
        if len(d)>3: out.append(d)
    return out
# cmu
cmu={}
for l in open(S+'cmudict.dict',encoding='latin-1'):
    t=l.split('#')[0].split()
    if not t: continue
    w=t[0]
    if '(' in w: continue
    cmu[w]=t[1:]
V={'AA':'ah','AE':'a','AH':'uh','AO':'aw','AW':'ow','AY':'y','EH':'eh','ER':'er','EY':'ay','IH':'ih','IY':'ee','OW':'oh','OY':'oy','UH':'u','UW':'oo'}
C={'B':'b','CH':'ch','D':'d','DH':'th','F':'f','G':'g','HH':'h','JH':'j','K':'k','L':'l','M':'m','N':'n','NG':'ng','P':'p','R':'r','S':'s','SH':'sh','T':'t','TH':'th','V':'v','W':'w','Y':'y','Z':'z','ZH':'zh'}
def respell(ph):
    syl=[];cur=[];pend=[]
    nuclei=[i for i,p in enumerate(ph) if p[-1].isdigit()]
    if not nuclei: return ''
    # assign consonants: between nuclei, last consonant goes to next syllable (two if cluster like st,pl,tr)
    bounds=[0]
    for a,b in zip(nuclei,nuclei[1:]):
        cons=list(range(a+1,b))
        if len(cons)<=1: bounds.append(a+1)
        else:
            pair=(ph[cons[-2]],ph[cons[-1]])
            onset2 = pair[1] in ('R','L','W','Y') and pair[0] in ('P','B','T','D','K','G','F','TH','SH') or (pair[0]=='S' and pair[1] in ('T','P','K'))
            bounds.append(cons[-2] if onset2 else cons[-1])
    bounds.append(len(ph))
    out=[]
    for i in range(len(bounds)-1):
        seg=ph[bounds[i]:bounds[i+1]]; s='';stress=False
        for p in seg:
            if p[-1].isdigit():
                base=p[:-1]; stress=p[-1]=='1'
                v=V[base]
                if base=='AH' and stress: v='u'
                if base=='AY' and s=='' : v='eye'
                if base=='ER' and not stress and s: v='er'
                s+=v
            else: s+=C.get(p,p.lower())
        out.append(s.upper() if stress and len(nuclei)>1 else s)
    return '-'.join(out)
# merge
allw=set(wn)|{k for k in wb if re.fullmatch(r"[a-z][a-z' -]*",k) and len(k)<40}
data=collections.defaultdict(list)
n=0
for lemma in sorted(allw):
    key=lemma.replace('_',' ')
    raw=wn.get(lemma,[])
    order=sorted(wtag.get(lemma,{}),key=lambda p:-wtag[lemma][p])
    senses=[]
    for i,p in enumerate(order): senses+= [x for x in raw if x[0]==p][:3 if i==0 else 2]
    w1913=(wsenses(wb[key]) if key in wb else [])[:(2 if senses else 3)]
    if not senses and not w1913: continue
    typ=senses[0][0] if senses else ''
    say=respell(cmu[key]) if key in cmu else ''
    m=[[s[0],s[1]] + ([s[2]] if s[2] else []) for s in senses[:5]]
    ent=[key,say,typ,m,w1913]
    c=key[0] if key[0].isalpha() else '_'
    data[c].append(ent); n+=1
tot=0
for c,arr in data.items():
    s=json.dumps(arr,ensure_ascii=False,separators=(',',':'))
    open(OUT+c+'.json','w',encoding='utf8').write(s); tot+=len(s)
json.dump({'letters':sorted(data),'counts':{c:len(a) for c,a in data.items()},'total':n},open(OUT+'index.json','w'),separators=(',',':'))
print(n,'entries',tot//1024,'KB')
for k in ['pericope','addled','abate','gallimaufry','snollygoster','threnody','run','bite the bullet']:
    c=k[0]; e=[x for x in data[c] if x[0]==k]; print(json.dumps(e[0] if e else None)[:400])
