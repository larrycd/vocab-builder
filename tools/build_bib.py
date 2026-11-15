import json, re, unicodedata, collections
L = '/home/claude/bl/app/data/lex/'
g = json.load(open(L + 'grk.json')); h = json.load(open(L + 'heb.json'))
F = json.load(open('/home/claude/vb/build/freq.json'))
GT = {'N-M': 'noun, masculine', 'N-F': 'noun, feminine', 'N-N': 'noun, neuter', 'N': 'noun', 'V': 'verb', 'A': 'adjective', 'ADV': 'adverb', 'a': 'adjective', 'PREP': 'preposition',
      'CONJ': 'conjunction', 'PRT': 'particle', 'INJ': 'interjection', 'D': 'demonstrative', 'COND': 'conditional particle', 'A-NUI': 'number', 'N-LI': 'letter', 'P': 'pronoun',
      'R': 'pronoun', 'C': 'pronoun', 'K': 'pronoun', 'S': 'pronoun', 'I': 'pronoun', 'X': 'pronoun', 'Q': 'pronoun', 'F': 'pronoun', 'T': 'article', 'ARAM': 'Aramaic word', 'HEB': 'Hebrew word'}
HT = {'N-M': 'noun, masculine', 'N-F': 'noun, feminine', 'N': 'noun', 'N-M/F': 'noun, masculine or feminine', 'V': 'verb', 'A': 'adjective', 'A-M': 'adjective', 'A-F': 'adjective',
      'Adv': 'adverb', 'Intj': 'interjection', 'Prep': 'preposition', 'Conj': 'conjunction', 'Intg': 'interrogative', 'Cond': 'conditional particle', 'Pron': 'pronoun', 'Part': 'particle', 'Neg': 'negative particle', 'Art': 'article'}
def dtype(code, table):
    if not code or ':' not in code: return None
    lang, t = code.split(':', 1)
    if lang == 'N' and not t.endswith('-T'): return None          # names of people and places
    if lang == 'N': return 'title'
    if t.endswith('-PRI') or t.endswith('-P'): return None
    EXTRA = {'demp': 'demonstrative pronoun', 'relp': 'relative pronoun', 'indp': 'indefinite pronoun', 'perp': 'personal pronoun'}
    t0 = re.split(r'\s*[/+]\s*', t)[0].strip()
    base = table.get(t0) or table.get(t0.split('-')[0]) or EXTRA.get(t0.split('-')[0].lower()) or t0.lower()
    if t0.lower().startswith('perp'): base = 'personal pronoun'
    return base + (' (Aramaic)' if lang == 'A' else '')
# ---------- Greek: syllables and stress
GV = 'αεηιουωᾳῃῳ'
def strip(s): return ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c)).lower()
def g_accent_from_end(word):
    w = unicodedata.normalize('NFD', word.split(',')[0].strip()); groups = []; cur = None
    base = ''
    for c in w:
        if unicodedata.combining(c):
            if groups and c in '́̀͂': groups[-1][1] = True
            continue
        lc = c.lower()
        if lc in 'αεηιουω':
            if groups and groups[-1][2] and (groups[-1][0] + lc) in ('αι', 'ει', 'οι', 'υι', 'αυ', 'ευ', 'ου', 'ηυ'): groups[-1][0] += lc; groups[-1][2] = False; continue
            groups.append([lc, False, True])
        else:
            if groups: groups[-1][2] = False
    for i in range(len(groups) - 1, -1, -1):
        if groups[i][1]: return len(groups) - 1 - i
    return None
LV = 'aeiouyēōāīū'
def t_syll(tr):
    t = tr.lower(); s = []; i = 0; cur = ''
    # vowel groups
    toks = re.findall(r'(ai|ei|oi|ui|au|eu|ou|ēu|[aeiouyēōāīū]|ch|th|ph|ps|rh|[^aeiouyēōāīū])', t)
    syl = []; buf = ''
    vidx = [k for k, x in enumerate(toks) if x[0] in LV]
    if not vidx: return [tr]
    out = []; start = 0
    for n, k in enumerate(vidx):
        if n + 1 < len(vidx):
            nxt = vidx[n + 1]; cons = toks[k + 1:nxt]
            cut = k + 1 + (len(cons) - 1 if len(cons) >= 1 else 0)
            if len(cons) >= 2 and (cons[-2] + cons[-1]) in ('pr', 'tr', 'kr', 'gr', 'br', 'dr', 'pl', 'kl', 'gl', 'bl', 'thr', 'phr', 'chr', 'pn', 'kn', 'gn', 'mn', 'sk', 'st', 'sp'): cut = nxt - 2
            out.append(''.join(toks[start:cut])); start = cut
        else: out.append(''.join(toks[start:]))
    return [x for x in out if x]
def g_say(word, tr):
    sy = t_syll(tr); k = g_accent_from_end(word)
    if k is None or k >= len(sy): k = 0 if len(sy) < 2 else 1
    i = len(sy) - 1 - k
    return '-'.join(x.upper() if j == i else x for j, x in enumerate(sy))
def g_root(html):
    t = re.sub(r'<[^>]+>', '', html); t = t.split('[in LXX')[0][:200]
    m = re.search(r'\(([^()]*[Ͱ-Ͽἀ-῿][^()]*)\)', t)
    if not m: return ''
    r = re.sub(r'\s+', ' ', m.group(1)).strip(' ,;')
    r = re.sub(r'^(<|cf\.|fr\.|from|see)\s*', '', r)
    if len(r) > 40 or re.search(r'[a-z]{3,}\.', r) or not re.search(r'[\u0370-\u03ff\u1f00-\u1fff]{3,}', r): return ''
    return r
def g_def(html):
    t = re.sub(r'<[^>]+>', '', html); t = re.sub(r'\s+', ' ', t)
    m = re.search(r'\[in LXX[^\]]*\]\s*(?:__\s*\d\.\s*)?([a-z][a-z ,;\'-]{2,90}?)[.;:(]', t)
    return m.group(1).strip(' ,') if m else ''
gout = []
for k, v in g.items():
    n = F['nt'].get(k, 0)
    if n < 1: continue
    ty = dtype(v[2], GT)
    if not ty: continue
    if re.match(r'^[A-Z]', v[3]) and ty.startswith('noun') and v[3] not in ('God', 'Lord', 'Christ', 'Messiah', 'Spirit', 'Sabbath', 'Pentecost', 'Passover', 'Gentile', 'Jew'): continue
    gl = v[3]
    if ':' in gl and gl.split(':', 1)[1].strip().lower() in gl.split(':', 1)[0].lower(): gl = gl.split(':', 1)[0].strip()
    m = [gl]; d = g_def(v[4])
    if d and d.lower() != v[3].lower() and len(d) > len(v[3]) + 3: m.append(d)
    gout.append({'id': k, 'w': v[0].split(',')[0].strip(), 'tr': v[1], 'say': g_say(v[0], v[1]), 'type': ty, 'root': g_root(v[4]), 'm': m, 'n': n})
gout.sort(key=lambda x: (-x['n'], x['tr']))
# ---------- Hebrew
BDB = {}
for i in range(13): BDB.update(json.load(open(L + 'bdb_%02d.json' % i)))
bidx = json.load(open(L + 'bdb_index.json'))['byStrong']
order = sorted(BDB, key=lambda k: int(k[3:]))
NIQ = re.compile('[֑-ׇ]')
FIN = str.maketrans('ךםןףץ', 'כמנפצ')
def cons(x): return re.sub(r'[^\u05d0-\u05ea]', '', x).translate(FIN)
HW = {}
for k in order:
    m = re.search(r'<span class="h">(?:<span class="h">)?([^<]+)', BDB[k]); hw = m.group(1).strip() if m else ''
    hw = hw.split(',')[0].strip()
    plain = re.sub(r'<[^>]+>', '', BDB[k])
    after = plain[plain.find(hw) + len(hw): plain.find(hw) + len(hw) + 40] if hw else ''
    isroot = bool(hw) and not NIQ.search(hw) and 2 <= len(cons(hw)) <= 4
    isverb = bool(re.match(r'^\]?\s*\d*\s*verb\b', after.strip()))
    HW[k] = (cons(hw), isroot, isverb, 'proper name' in after)
POS = {k: i for i, k in enumerate(order)}
def find_root(base, word):
    wc = cons(word); ids = bidx.get(base, [])
    if not ids: return ''
    best = next((b for b in ids if b in HW and HW[b][0] == wc), ids[0])
    if best not in POS: return ''
    i = POS[best]
    for j in range(i, max(-1, i - 30), -1):
        c, isroot, isverb, pn = HW[order[j]]
        if isroot or isverb:
            # the root must share at least two letters with the word, in order
            it = iter(wc); shared = sum(1 for ch in c if ch in wc)
            if shared >= min(2, len(c)): return c
            return ''
    return ''
groups = collections.OrderedDict()
for k, v in h.items():
    base = re.sub(r'[A-Z]$', '', k); n = F['ot'].get(k, 0)
    ty = dtype(v[2], HT)
    if not ty or n < 1: continue
    suf = k[len(base):]
    key = (base + (suf if suf in 'ABCDEF' else ''), strip(v[0]))
    gl = v[3].strip()
    if key not in groups: groups[key] = {'id': k, 'w': v[0], 'tr': v[1], 'type': ty, 'm': [], 'n': 0, 'base': base}
    G = groups[key]; G['n'] += n
    sense = gl.split(':', 1)[1].strip() if ':' in gl and not G['m'] == [] else gl
    if ':' in gl and G['m'] and gl.split(':')[0].strip().lower() == G['m'][0].lower(): sense = gl.split(':', 1)[1].strip()
    if G['m'] and re.match(r'^[A-Z(`]', sense): continue
    if sense and sense not in G['m']: G['m'].append(sense)
def h_say(word, tr):
    sy = [s for s in re.split(r'\.', tr.replace("'", '').replace('`', '').replace('ʼ', '')) if s]
    if not sy: return tr
    pen = '֫' in word or 'ֽ' in word and False
    i = len(sy) - 2 if ('֫' in word and len(sy) > 1) else len(sy) - 1
    return '-'.join(x.upper() if j == i else x for j, x in enumerate(sy))
hout = []
for G in groups.values():
    rt = ''
    rt = find_root(G['base'], G['w'])
    if rt: rt = rt[:-1] + rt[-1].translate(str.maketrans('כמנפצ', 'ךםןףץ'))
    m0 = G['m']
    if m0 and ':' in m0[0]: a, b = m0[0].split(':', 1); m0 = [a.strip(), b.strip()] + m0[1:]
    first = m0[0] if m0 else ''
    if G['n'] < 10 and re.match(r'^[`(]|^[A-Z]', first) and first not in ('God', 'LORD', 'Lord'): continue
    if G['type'] == 'title' and first not in ('LORD', 'Lord', 'God'): continue
    G['m'] = [re.sub(r'`', '', x) for x in m0 if x]
    w = re.sub('[֑-֯]', '', G['w'])  # drop cantillation/stress marks from display
    hout.append({'id': G['id'], 'w': w, 'tr': G['tr'].replace('.', ''), 'say': h_say(G['w'], G['tr']), 'type': G['type'], 'root': rt, 'm': G['m'][:6], 'n': G['n']})
hout.sort(key=lambda x: (-x['n'], x['tr']))
json.dump(gout, open('/home/claude/vb/build/grk.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(hout, open('/home/claude/vb/build/heb.json', 'w'), ensure_ascii=False, separators=(',', ':'))
for name, D in (('Greek', gout), ('Hebrew', hout)):
    print(name, len(D), 'words;', {t: sum(1 for x in D if x['n'] >= t) for t in (500, 100, 50, 10)}, 'with root', sum(1 for x in D if x['root']))
    for x in D[:3] + D[40:43] + D[300:302]: print('  ', x)
