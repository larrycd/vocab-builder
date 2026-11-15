/* Vocab Builder 1.2.0 - by Larry Dalton. Runs entirely on this computer. */
'use strict';
var VB = { version: '1.2.0' };
var DECKS = {
  en: { name: 'English', short: 'English', font: 'f-en', file: 'data/en.json', order: 'in the order of your cards' },
  grk: { name: 'Koine Greek', short: 'Greek', font: 'f-grk', file: 'data/grk.json', order: 'most frequent in the New Testament first' },
  heb: { name: 'Biblical Hebrew', short: 'Hebrew', font: 'f-heb', file: 'data/heb.json', order: 'most frequent in the Old Testament first' },
  la: { name: 'Latin Phrases & Quotes', short: 'Latin', font: 'f-en', file: 'data/la.json', order: 'in alphabetical order', pre: 'la', lang: 'la' },
  fr: { name: 'French in English', short: 'French', font: 'f-en', file: 'data/fr.json', order: 'in alphabetical order', pre: 'fr', lang: 'fr-FR' },
  th: { name: 'Theological Terms', short: 'Theology', font: 'f-en', file: 'data/th.json', order: 'in alphabetical order', pre: 'th' },
  ob: { name: 'Lost English Words', short: 'Lost English', font: 'f-en', file: 'data/ob.json', order: 'in alphabetical order', pre: 'ob', lang: 'en' },
  me: { name: 'Middle English', short: 'Middle English', font: 'f-en', file: 'data/me.json', order: 'in alphabetical order', pre: 'me' },
  oe: { name: 'Old English', short: 'Old English', font: 'f-en', file: 'data/oe.json', order: 'in alphabetical order', pre: 'oe' },
  id: { name: 'Idioms & Phrases', short: 'Idioms', font: 'f-en', file: 'data/id.json', order: 'in alphabetical order', pre: 'id', lang: 'en' },
  am: { name: 'Americanisms', short: 'Americanisms', font: 'f-en', file: 'data/am.json', order: 'in alphabetical order', pre: 'am', lang: 'en' },
  wk: { name: 'Woke Dictionary', short: 'Woke Dictionary', font: 'f-en', file: 'data/wk.json', order: 'in alphabetical order', pre: 'wk', lang: 'en' },
  kj: { name: 'KJV Words That Changed', short: 'KJV Words', font: 'f-en', file: 'data/kj.json', order: 'in alphabetical order', pre: 'kj', lang: 'en' },
  rh: { name: 'Rhetorical Figures', short: 'Rhetoric', font: 'f-en', file: 'data/rh.json', order: 'in alphabetical order', pre: 'rh', lang: 'en' },
  ww: { name: 'World Words in English', short: 'World Words', font: 'f-en', file: 'data/ww.json', order: 'in alphabetical order', pre: 'ww', lang: 'en' },
  rt: { name: 'Greek & Latin Roots', short: 'Roots', font: 'f-en', file: 'data/rt.json', order: 'in alphabetical order', pre: 'rt' },
  mh: { name: 'Modern Hebrew', short: 'Modern Hebrew', font: 'f-en', file: 'data/mh.json', order: 'everyday words first', pre: 'mh', lang: 'he-IL', sayAlt: 1 },
  es: { name: 'Spanish', short: 'Spanish', font: 'f-en', file: 'data/es.json', order: 'everyday words first', pre: 'es', lang: 'es-ES' },
  ru: { name: 'Russian', short: 'Russian', font: 'f-en', file: 'data/ru.json', order: 'everyday words first', pre: 'ru', lang: 'ru-RU', sayAlt: 1 },
  zh: { name: 'Mandarin Chinese', short: 'Mandarin', font: 'f-en', file: 'data/zh.json', order: 'everyday words first', pre: 'zh', lang: 'zh-CN', sayAlt: 1 },
  ja: { name: 'Japanese', short: 'Japanese', font: 'f-en', file: 'data/ja.json', order: 'everyday words first', pre: 'ja', lang: 'ja-JP', sayAlt: 1 }
};
var GROUPS = [['English', ['en', 'ob', 'me', 'oe', 'id', 'am', 'wk']], ['Bible & Theology', ['grk', 'heb', 'th', 'kj', 'rh']], ['Borrowed Words & Roots', ['la', 'fr', 'ww', 'rt']], ['Languages', ['mh', 'es', 'ru', 'zh', 'ja']]];
var DECK_IDS = Object.keys(DECKS);
var NOTES = {
  la: 'Latin words, phrases and quotations used in English writing, law, scholarship and the church. The pronunciation shown is the usual English way of saying them; the note gives the literal sense or the source of a quotation.',
  fr: 'French words and phrases used or quoted in English. The pronunciation is an English approximation of the French; the note gives the literal meaning.',
  th: 'Latin and Greek terms used in theology and church history, from the Fathers to the Reformation and after. The note gives the literal sense or where the term comes from.',
  ob: 'English words that have fallen out of use since early modern times (not Old or Middle English). The note says roughly when or where the word was used.',
  me: 'Words from Middle English (about 1100–1500), the English of Chaucer, that are now lost or have changed their meaning. The note gives the source or what the word became.',
  oe: 'Old English (Anglo-Saxon, about 450–1100) words in modernised spelling, with the original spelling in brackets (þ and ð are "th", æ is "a" as in "cat", a line over a vowel makes it long). The note shows the modern word it became.',
  id: 'English idioms and set phrases, with where each one comes from. Many come from the King James Bible, Shakespeare, sailing and old trades.',
  am: 'American words and expressions, with the Australian or British equivalent in the note where there is one.',
  wk: 'Current social and political terms, defined as they are used, with notes on where they came from. Terms marked "critical" are mainly used by opponents.',
  kj: 'Words in the King James Bible (1611) whose meaning has changed. The meaning shown is the KJV meaning; the note gives a verse and what the word means today. Because these words are tested on their old meaning, some also appear in other decks.',
  rh: 'Figures of speech from classical rhetoric and the Bible, each with an example. Figures already in your English deck have been left out.',
  ww: 'Words that English has borrowed from other languages (French and Latin have their own decks). The note names the language and the original meaning.',
  rt: 'Greek and Latin prefixes, roots and suffixes. Learn these and you can work out thousands of English words; the note gives examples. This deck is self-contained, so a root can share its spelling with a word in another deck.',
  mh: 'Everyday words and phrases of Modern Israeli Hebrew, in transliteration with the Hebrew in brackets (written without vowel points, as Israelis write). Where the form differs for a man or a woman, the card says so.',
  es: 'Everyday Spanish words and phrases, with a pronunciation guide.',
  ru: 'Everyday Russian words and phrases, in transliteration with the Cyrillic in brackets.',
  zh: 'Everyday Mandarin words and phrases in pinyin (the marks show the tone), with the Chinese characters in brackets.',
  ja: 'Everyday Japanese words and phrases in rōmaji, with the Japanese script in brackets.'
};
function altS(w) { return w.alt ? ' <span class="alt">(<bdi>' + esc(w.alt) + '</bdi>)</span>' : ''; }
function altD(w) { return w.alt ? '<div class="altw">(<bdi>' + esc(w.alt) + '</bdi>)</div>' : ''; }
function bib(d) { return d === 'grk' || d === 'heb'; }
var BATCH = 50, CHALLENGE_DAYS = 100;
var W = {}, BYID = {}; DECK_IDS.forEach(function (d) { W[d] = []; });
var P = null;
var UI = { tab: 'home', deck: 'en', teach: null, test: null, cfg: { scope: 'batch', batch: -1, pool: 'all', order: 'scr', dir: 'wm', len: 20 }, saveTimer: null, saving: false, lastSaved: '' };

/* ---------------- helpers */
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function today(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function addDays(iso, n) { var p = iso.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + n); return today(d); }
function daysBetween(a, b) { var pa = a.split('-'), pb = b.split('-'); return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 86400000); }
function fmt(iso) { if (!iso) return ''; var p = iso.slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
function fmtTime(d) { return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function fold(s) { return String(s || '').normalize('NFD').replace(/[̀-֑ͯ-ׇ]/g, '').toLowerCase(); }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function toast(t) { var el = $('toast'); el.textContent = t; el.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.add('hidden'); }, 2600); }

/* ---------------- words and progress */
function words(d) { return d === 'en' ? W.en.concat(P.added || []) : W[d]; }
function batchCount(d) { return Math.ceil(words(d).length / BATCH); }
function batchWords(d, b) { return words(d).slice(b * BATCH, b * BATCH + BATCH); }
function batchOf(d, id) { var ws = words(d); for (var i = 0; i < ws.length; i++) if (ws[i].id === id) return Math.floor(i / BATCH); return -1; }
function newProgress() { return { app: 'Vocab Builder', v: 1, created: today(), decks: {}, added: [], log: [], daily: {} }; }
function dk(d) { var x = P.decks[d] || (P.decks[d] = {}); x.w = x.w || {}; x.batches = x.batches || {}; return x; }
function rec(d, id, make) { var w = dk(d).w; if (!w[id] && make) w[id] = { s: 0, r: 0, x: 0, k: 0 }; return w[id]; }
/* level: n new, l learning, f familiar, m mastered, x missed */
function level(r) {
  if (!r) return 'n';
  if (r.m) return 'x';
  if (r.k >= 2) return 'm';
  if (r.g || r.k >= 1) return 'f';
  if (r.s || r.r || r.x) return 'l';
  return 'n';
}
var LEVELS = { n: 'New', l: 'Learning', f: 'Familiar', m: 'Mastered', x: 'Missed' };
function counts(d, list) {
  var c = { n: 0, l: 0, f: 0, m: 0, x: 0, got: 0, rec: 0 };
  (list || words(d)).forEach(function (w) { var r = rec(d, w.id); c[level(r)]++; if (r && r.g) c.got++; if (r && r.rec) c.rec++; });
  return c;
}
function wordDeck(id) { var c = id.charAt(0); if (c === 'G') return 'grk'; if (c === 'H') return 'heb'; var p = id.slice(0, 2); for (var i = 0; i < DECK_IDS.length; i++) if (DECKS[DECK_IDS[i]].pre === p) return DECK_IDS[i]; return 'en'; }

/* ---------------- saving: Documents\vocab-builder\progress.json through the local server */
function scheduleSave() {
  snapshot();
  try { localStorage.setItem('vb-progress', JSON.stringify(P)); } catch (e) { }
  clearTimeout(UI.saveTimer); UI.saveTimer = setTimeout(saveNow, 1200); setStatus('Saving…');
}
function saveNow(keepalive) {
  clearTimeout(UI.saveTimer); UI.saveTimer = null;
  P.savedAt = new Date().toISOString();
  var body = JSON.stringify(P);
  return fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-VB-Save': '1' }, body: body, keepalive: !!keepalive && body.length < 60000 })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); UI.lastSaved = fmtTime(new Date()); setStatus('Saved ' + UI.lastSaved); })
    .catch(function () { setStatus('Not saved to Documents yet (kept in this browser); will retry'); UI.saveTimer = setTimeout(saveNow, 15000); });
}
function setStatus(t) { var el = $('savestatus'); if (el) el.textContent = t; }
function snapshot() {
  var t = today(); P.daily = P.daily || {}; var s = P.daily[t] || (P.daily[t] = {});
  Object.keys(DECKS).forEach(function (d) { var c = counts(d); s[d] = [c.m, c.f, c.x]; });
}
window.addEventListener('beforeunload', function () { if (UI.saveTimer) saveNow(true); });

/* ---------------- recording */
function markSeen(d, id) { var r = rec(d, id, true); r.s++; if (!r.fs) r.fs = today(); var b = batchOf(d, id), B = dk(d).batches[b] || (dk(d).batches[b] = {}); if (!B.st) B.st = today(); B.last = today(); }
function setGot(d, id, on) {
  var r = rec(d, id, true);
  if (on) { r.g = 1; r.ga = today(); } else { delete r.g; delete r.ga; }
  challengeTick(d);
  scheduleSave();
}
function answer(d, id, ok) {
  var r = rec(d, id, true);
  if (ok) {
    r.r++; r.k++;
    if (r.k >= 2 && !r.lm) r.lm = today();
    if (r.m && r.k >= 2) { r.m = 0; r.rec = today(); r.recTries = r.x; }
  } else {
    r.x++; r.k = 0; r.m = 1; r.me = 1; delete r.lm;
  }
  r.la = today();
}

/* ---------------- 100-Day Challenge (one per deck) */
function chal(d) { return dk(d).challenge || null; }
function chalInfo(d) {
  var c = chal(d); if (!c || !c.on) return null;
  var t = today(), day = Math.min(CHALLENGE_DAYS, daysBetween(c.start, t) + 1), left = Math.max(1, CHALLENGE_DAYS - day + 1);
  var ws = words(d), remaining = 0, doneToday = 0;
  ws.forEach(function (w) { var r = rec(d, w.id); if (!r || !r.g) remaining++; if (r && r.ga === t) doneToday++; });
  var quota = c.days && c.days[t] && c.days[t].q != null ? c.days[t].q : Math.ceil((remaining + doneToday) / left);
  var streak = 0, k = (doneToday >= quota && quota > 0) ? 0 : 1;
  for (; k < 400; k++) { var dd = addDays(t, -k), e = c.days && c.days[dd]; if (e && e.n >= e.q && e.q > 0) streak++; else break; }
  return { day: day, left: left, quota: quota, done: doneToday, remaining: remaining, streak: streak, finish: addDays(c.start, CHALLENGE_DAYS - 1), start: c.start, complete: remaining === 0 };
}
function challengeTick(d) {
  var c = chal(d); if (!c || !c.on) return;
  var t = today(); c.days = c.days || {};
  var info = chalInfo(d); var e = c.days[t] || (c.days[t] = { q: info.quota, n: 0 });
  e.n = info.done;
}
function startChallenge(d) {
  var x = dk(d); x.challenge = { on: true, start: today(), days: {} };
  var info = chalInfo(d); x.challenge.days[today()] = { q: info.quota, n: info.done };
  scheduleSave(); render();
}
function stopChallenge(d) { if (!confirm('Stop the 100-Day Challenge for ' + DECKS[d].name + '? Your word progress is kept.')) return; dk(d).challenge.on = false; scheduleSave(); render(); }

/* ---------------- a card */
function wordFont(d) { return DECKS[d].font; }
function listenBtn(d, w) { return (d === 'en' || DECKS[d].lang) && window.speechSynthesis ? '<button class="btn" data-say="' + esc(DECKS[d].sayAlt && w.alt ? w.alt : w.w) + '" data-lang="' + (DECKS[d].lang || 'en') + '" type="button">Listen</button>' : ''; }
function speak(t, lang) { try { lang = lang || 'en'; var u = new SpeechSynthesisUtterance(t); var vs = speechSynthesis.getVoices(), v; if (lang === 'en') v = vs.filter(function (x) { return /en-(AU|GB)/i.test(x.lang); })[0]; else { v = vs.filter(function (x) { return x.lang.toLowerCase().indexOf(lang.slice(0, 2).toLowerCase()) === 0; })[0]; if (!v && lang === 'la') v = vs.filter(function (x) { return /^it/i.test(x.lang); })[0]; u.lang = lang === 'la' ? 'it-IT' : lang; } if (v) u.voice = v; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { } }
function sayLine(d, w) { return !bib(d) ? esc(w.say) : esc(w.tr) + ' · ' + esc(w.say); }
function typeLine(d, w) { return esc(w.type) + (w.root ? ' · root <span class="' + wordFont(d) + '">' + esc(w.root) + '</span>' : ''); }
function extraLine(d, w) {
  var bits = [];
  if (bib(d) && w.n) bits.push('Occurs ' + w.n.toLocaleString('en-AU') + ' times in the ' + (d === 'grk' ? 'New Testament' : 'Old Testament'));
  if (w.x && w.x.length) bits.push(w.x.map(esc).join(' · '));
  if (w.added) bits.push('Added by you');
  return bits.join('<br>');
}
function badge(d, w) {
  var r = rec(d, w.id), lv = level(r);
  var col = { n: '#e8dcc0;color:#5a4728', l: '#d9c7a0;color:#3b2a12', f: '#c9a85a;color:#2a1f12', m: '#b8862c;color:#fff7e0', x: '#c9634f;color:#fff' }[lv];
  return '<span class="badge" style="background:' + col + '">' + LEVELS[lv] + (r && r.x ? ' · missed ' + plural(r.x, 'time') : '') + '</span>';
}
function cardFront(d, w) {
  return '<div class="big ' + wordFont(d) + '">' + esc(w.w) + '</div>' + altD(w) +
    '<div class="say">' + esc(w.say) + '</div>' + (bib(d) ? '<div class="tr">' + esc(w.tr) + '</div>' : '') +
    '<div class="type">' + typeLine(d, w) + '</div>';
}
function cardBack(d, w) {
  return '<div class="backhead"><span class="' + wordFont(d) + '" style="font-weight:' + (!bib(d) ? 700 : 400) + '">' + esc(w.w) + '</span>' + altS(w) + ' <span class="s">' + sayLine(d, w) + '</span></div>' +
    '<div class="type" style="margin-top:2px">' + typeLine(d, w) + '</div>' +
    '<ol>' + w.m.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ol>' +
    '<div class="extra">' + extraLine(d, w) + '</div>' + badge(d, w);
}

/* ---------------- frame */
var TABS = [['home', 'Home'], ['teach', 'Teach'], ['test', 'Test'], ['progress', 'Progress'], ['dict', 'Dictionary']];
function renderFrame() {
  $('tabs').innerHTML = TABS.map(function (t) { return '<button class="pill' + (UI.tab === t[0] ? ' on' : '') + '" data-tab="' + t[0] + '"' + (UI.tab === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + '</button>'; }).join('');
  var cur = DECKS[UI.deck];
  $('decks').innerHTML = '<details class="deckmenu"><summary class="pill on" aria-label="Choose a deck">' + esc(cur.short) + '<span class="c">' + words(UI.deck).length.toLocaleString('en-AU') + '</span> <span aria-hidden="true">▾</span></summary><div class="dm">' +
    GROUPS.map(function (g) { return '<div class="dg"><div class="dh">' + g[0] + '</div><div class="pills">' + g[1].map(function (d) { return '<button class="pill' + (UI.deck === d ? ' on' : '') + '" data-deck="' + d + '">' + DECKS[d].short + '<span class="c">' + words(d).length.toLocaleString('en-AU') + '</span></button>'; }).join('') + '</div></div>'; }).join('') + '</div></details>';
}
function render() {
  renderFrame();
  var m = $('main');
  if (UI.tab === 'home') m.innerHTML = viewHome();
  else if (UI.tab === 'teach') m.innerHTML = UI.teach && UI.teach.d === UI.deck ? viewCard() : viewTeachStart();
  else if (UI.tab === 'test') m.innerHTML = UI.test && UI.test.d === UI.deck ? viewQuestion() : viewTestStart();
  else if (UI.tab === 'dict') m.innerHTML = viewDict();
  else m.innerHTML = viewProgress();
  m.insertAdjacentHTML('beforeend', '<p class="status" id="savestatus" style="margin-top:28px">' + (UI.lastSaved ? 'Saved ' + UI.lastSaved : 'Your progress is saved in Documents\\vocab-builder') + '</p>');
}

/* ---------------- Home */
function viewHome() {
  var d = UI.deck, ws = words(d), c = counts(d);
  var tiles = ws.map(function (w) { var lv = level(rec(d, w.id)); return '<button class="tile' + (lv === 'l' ? ' l1' : lv === 'f' ? ' l2' : lv === 'm' ? ' l3' : lv === 'x' ? ' mx' : '') + '" data-word="' + esc(w.id) + '" title="' + esc(w.w + ' · ' + LEVELS[lv]) + '" aria-label="' + esc(w.w + ', ' + LEVELS[lv]) + '"></button>'; }).join('');
  var leg = [['Mastered', 'linear-gradient(135deg,#f3d27a,#b8862c)', c.m], ['Familiar', '#9a7b3c', c.f], ['Learning', '#5a4a2c', c.l], ['Missed', '#a8483a', c.x], ['New', '#2a2116;border:1px solid #5a4728', c.n]]
    .map(function (l) { return '<span><span class="sw" style="background:' + l[1] + '"></span>' + l[0] + ' <b style="color:#efe6d2">' + l[2].toLocaleString('en-AU') + '</b></span>'; }).join('');
  var nb = nextBatch(d);
  return '<div class="row"><section class="grow panel">' +
    '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px"><h2>The Gilded Wall</h2><span class="hint">' + DECKS[d].name + ' · ' + ws.length.toLocaleString('en-AU') + ' words · one row is one batch of 50, ' + DECKS[d].order + '</span></div>' +
    '<p class="muted" style="margin:6px 0 14px;font-size:14px">Each tile is a word. Tiles gild as you master them (two right answers in a row); missed words glow red until you recover them. Click a tile to see the word.</p>' +
    '<div class="wall">' + tiles + '</div><div class="legend">' + leg + '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:20px">' +
    '<button class="btn gold" data-act="teachbatch" data-b="' + nb + '">Teach batch ' + (nb + 1) + '</button>' +
    '<button class="btn outline" data-act="gotest">Take a test</button>' +
    (c.x ? '<button class="btn redline" data-act="testmissed">Retest my ' + plural(c.x, 'missed word') + '</button>' : '') +
    '</div></section><aside class="side">' + challengePanel(d) + wordOfDay(d) + (d === 'en' ? addPanel() : bibleNote(d)) + '</aside></div>';
}
function nextBatch(d) {
  var n = batchCount(d);
  for (var b = 0; b < n; b++) { var ws = batchWords(d, b); if (ws.some(function (w) { var r = rec(d, w.id); return !(r && (r.g || r.k >= 2)); })) return b; }
  return 0;
}
function ring(day) {
  var C = 2 * Math.PI * 46, f = Math.max(0, Math.min(1, day / CHALLENGE_DAYS));
  return '<svg class="ring" width="110" height="110" viewBox="0 0 112 112" role="img" aria-label="Day ' + day + ' of ' + CHALLENGE_DAYS + '"><circle cx="56" cy="56" r="46" fill="none" stroke="#3a2f20" stroke-width="10"/><circle cx="56" cy="56" r="46" fill="none" stroke="#e2bd62" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (C * f).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 56 56)"/><text x="56" y="56" text-anchor="middle" font-size="30" font-weight="700" fill="#f3e5c0">' + day + '</text><text x="56" y="75" text-anchor="middle" font-family="Segoe UI,sans-serif" font-size="11" fill="#b8a888">of ' + CHALLENGE_DAYS + ' days</text></svg>';
}
function challengePanel(d) {
  var i = chalInfo(d);
  if (!i) return '<section class="panel"><h3>100-Day Challenge</h3><p class="muted" style="font-size:14px;margin:8px 0 12px">Master all ' + words(d).length.toLocaleString('en-AU') + ' ' + DECKS[d].short + ' words in 100 days. Each day you get a quota of new words to learn; the quota adjusts if you get ahead or fall behind.</p><button class="btn gold" style="width:100%" data-act="chalstart">Start the challenge today</button></section>';
  var need = Math.max(0, i.quota - i.done);
  return '<section class="panel"><div style="display:flex;justify-content:space-between;align-items:center"><h3>100-Day Challenge</h3><span style="font-size:12px;background:var(--gold);color:#1b1408;border-radius:999px;padding:2px 10px;font-weight:600">On</span></div>' +
    '<div style="display:flex;align-items:center;gap:16px;margin-top:10px">' + ring(i.day) + '<div style="font-size:14px;color:var(--soft);display:flex;flex-direction:column;gap:3px">' +
    '<div><b style="color:var(--text)">' + i.quota + '</b> words today</div><div>Done today: <b style="color:var(--text)">' + i.done + '</b>' + (need ? '' : ' ✓') + '</div>' +
    '<div><b style="color:var(--text)">' + plural(i.streak, 'day') + '</b> streak</div><div>Finish by ' + fmt(i.finish) + '</div></div></div>' +
    (i.complete ? '<p class="muted">Every word is marked. Keep testing until the wall is gold.</p>' : '<button class="btn" style="width:100%;margin-top:12px" data-act="today"' + (need ? '' : ' disabled') + '>' + (need ? 'Learn today\'s ' + plural(need, 'word') : 'Today\'s words are done') + '</button>') +
    '<button class="btn" style="width:100%;margin-top:8px;min-height:36px;padding:6px;font-weight:400;font-size:13px;background:transparent" data-act="chalstop">Stop the challenge</button></section>';
}
function wordOfDay(d) {
  var ws = words(d); if (!ws.length) return '';
  var cand = ws.filter(function (w) { var lv = level(rec(d, w.id)); return lv === 'x'; });
  if (!cand.length) cand = ws.filter(function (w) { var lv = level(rec(d, w.id)); return lv === 'l' || lv === 'f'; });
  if (!cand.length) cand = ws.slice(0, Math.min(ws.length, 500));
  var t = today(), h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 100003;
  var w = cand[h % cand.length];
  return '<section class="panel"><h3 style="margin-bottom:6px">Word of the day</h3><button class="bcell" style="width:100%;background:transparent;border:0;padding:0" data-word="' + esc(w.id) + '">' +
    '<div class="' + wordFont(d) + '" style="font-size:' + (!bib(d) ? 34 : 40) + 'px;color:#f3e5c0;line-height:1.2">' + esc(w.w) + '</div>' + altD(w) +
    '<div style="color:var(--gold);font-size:14px">' + sayLine(d, w) + '</div><div class="hint" style="font-style:italic">' + esc(w.type) + '</div>' +
    '<div style="margin-top:6px;color:var(--soft);font-size:14px">' + esc(w.m[0]) + '</div></button></section>';
}
function bibleNote(d) {
  if (NOTES[d]) return '<section class="panel"><h3 style="margin-bottom:6px">About this deck</h3><p class="muted" style="font-size:14px;margin:0">' + NOTES[d] + (/^(la|fr|th|ob|me|oe|id|am|wk|ww)$/.test(d) ? ' Anything already in your other decks has been left out, so nothing is duplicated.' : '') + '</p></section>';
  return '<section class="panel"><h3 style="margin-bottom:6px">About this deck</h3><p class="muted" style="font-size:14px;margin:0">Every ' + (d === 'grk' ? 'word of the Greek New Testament' : 'word of the Hebrew and Aramaic Old Testament') + ' except names of people and places, with its transliteration, pronunciation (capitals mark the stressed syllable), type, ' + (d === 'heb' ? 'root (from Brown-Driver-Briggs), ' : 'derivation where Abbott-Smith gives one, ') + 'meaning and how often it occurs. Batch 1 holds the 50 most common words.</p></section>';
}
function addPanel() {
  return '<section class="panel"><h3 style="margin-bottom:8px">Add a word</h3>' +
    '<form id="addform" autocomplete="off">' +
    '<label class="lbl" for="aw">Word</label><div style="display:flex;gap:6px;margin-bottom:4px"><input id="aw" type="text" required style="flex:1;min-width:0"><button class="btn" type="button" data-act="lookup" style="min-height:38px;padding:6px 12px">Look up</button></div>' +
    '<p class="hint" id="lookuphint" style="margin:0 0 8px">Type a word and press Look up to fill in the rest from the dictionary.</p>' +
    '<label class="lbl" for="as">Pronunciation <span style="text-transform:none;letter-spacing:0">(e.g. puh-RIK-uh-pee)</span></label><input id="as" type="text" style="width:100%;margin-bottom:8px">' +
    '<label class="lbl" for="at">Type</label><select id="at" style="width:100%;margin-bottom:8px">' + ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'interjection', 'preposition', 'conjunction'].map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select>' +
    '<label class="lbl" for="am">Meanings <span style="text-transform:none;letter-spacing:0">(one per line)</span></label><textarea id="am" rows="3" required style="width:100%;margin-bottom:8px"></textarea>' +
    '<label class="lbl" for="ax">Notes <span style="text-transform:none;letter-spacing:0">(optional: origin, related forms)</span></label><input id="ax" type="text" style="width:100%;margin-bottom:10px">' +
    '<button class="btn gold" type="submit" style="width:100%">Add to my English words</button></form>' +
    '<p class="hint" style="margin:8px 0 0">New words join the end of the deck, in the last batch. Or <button class="linkbtn" data-tab="dict">browse the dictionary</button> and add several at once.</p></section>';
}

/* ---------------- Teach */
function viewTeachStart() {
  var d = UI.deck, n = batchCount(d), nb = nextBatch(d);
  var cells = '';
  for (var b = 0; b < n; b++) {
    var ws = batchWords(d, b), c = counts(d, ws), done = c.got + 0, B = dk(d).batches[b];
    var pct = Math.round(100 * ws.filter(function (w) { var r = rec(d, w.id); return r && r.g; }).length / ws.length);
    cells += '<button class="bcell' + (b === nb ? ' next' : '') + '" data-act="teachbatch" data-b="' + b + '"><div class="h">Batch ' + (b + 1) + (b === nb ? ' · next' : '') + '</div>' +
      '<div class="d ' + (!bib(d) ? '' : wordFont(d)) + '">' + esc(ws[0].w) + ' … ' + esc(ws[ws.length - 1].w) + '</div>' +
      '<div class="progressbar"><div style="width:' + pct + '%"></div></div><div class="d" style="margin:4px 0 0">' + (B && B.st ? 'Got it ' + c.got + '/' + ws.length + (c.x ? ' · ' + c.x + ' missed' : '') : 'Not started') + '</div></button>';
  }
  return '<section class="panel"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:baseline"><h2>Teach · ' + DECKS[d].name + '</h2><span class="hint">' + plural(n, 'batch') + ' of 50 · ' + DECKS[d].order + '</span></div>' +
    '<p class="muted" style="font-size:14px;margin:6px 0 16px">Turn each card to see its meaning. Mark the ones you know as <b>Got it</b>; every other card stays in Review and comes round again at the end of the 50.</p>' +
    '<div class="batchgrid">' + cells + '</div></section>';
}
function startTeach(d, ids, label, b) {
  UI.teach = { d: d, ids: ids, i: 0, flipped: false, label: label, b: b, pass: 1, seen: {} };
  UI.tab = 'teach'; render(); window.scrollTo(0, 0);
}
function teachBatch(d, b) { startTeach(d, batchWords(d, b).map(function (w) { return w.id; }), 'Batch ' + (b + 1), b); }
function teachToday(d) {
  var i = chalInfo(d); if (!i) return;
  var need = Math.max(0, i.quota - i.done), ids = [];
  words(d).some(function (w) { var r = rec(d, w.id); if (!r || !r.g) ids.push(w.id); return ids.length >= need; });
  if (ids.length) startTeach(d, ids, 'Today\'s words (100-Day Challenge)', -1);
}
function viewCard() {
  var T = UI.teach, d = T.d;
  if (T.i >= T.ids.length) return viewTeachEnd();
  var id = T.ids[T.i], w = BYID[id], r = rec(d, id), got = !!(r && r.g);
  if (!T.seen[id]) { T.seen[id] = 1; markSeen(d, id); scheduleSave(); }
  var gotN = T.ids.filter(function (x) { var q = rec(d, x); return q && q.g; }).length;
  var list = T.ids.map(function (x, k) { var q = rec(d, x), g = q && q.g; return '<button class="bcell" style="display:flex;justify-content:space-between;gap:8px;padding:6px 10px;' + (k === T.i ? 'border-color:var(--gold);background:#2f2517' : '') + '" data-act="jump" data-i="' + k + '"><span class="' + (!bib(d) ? '' : wordFont(d)) + '" style="' + (g ? 'color:var(--gold)' : '') + '">' + esc(BYID[x].w) + '</span><span class="hint">' + (g ? 'Got it' : 'Review') + '</span></button>'; }).join('');
  return '<div class="row"><section class="grow">' +
    '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px"><h2>' + esc(DECKS[d].name + ' · ' + T.label) + (T.pass > 1 ? ' · review' : '') + '</h2>' +
    '<span class="muted">Card <b style="color:var(--text)">' + (T.i + 1) + '</b> of ' + T.ids.length + ' · <b style="color:var(--gold)">' + gotN + '</b> marked Got it</span></div>' +
    '<div class="progressbar" style="margin-bottom:18px"><div style="width:' + Math.round(100 * (T.i + 1) / T.ids.length) + '%"></div></div>' +
    '<button class="card" data-act="flip" aria-label="Turn the card"><span class="corner l">' + (T.flipped ? 'Meaning' : 'Word') + '</span><span class="corner r">click or press Space to turn</span>' +
    (T.flipped ? cardBack(d, w) : cardFront(d, w)) + '</button>' +
    '<div class="ctrl"><button class="btn" data-act="prev"' + (T.i ? '' : ' disabled') + '>Previous</button>' +
    '<button class="gotbtn' + (got ? ' on' : '') + '" data-act="got">' + (got ? '✓ Got it' : 'Mark as Got it') + '</button>' +
    '<button class="btn" data-act="next">' + (T.i + 1 < T.ids.length ? 'Next' : 'Finish') + '</button>' + listenBtn(d, w) + '</div>' +
    '<p class="hint" style="text-align:center;margin-top:10px">Keys: Space turns · → next · ← previous · G marks Got it</p></section>' +
    '<aside class="side"><section class="panel"><h3 style="margin-bottom:8px">This session</h3><div style="display:flex;flex-direction:column;gap:5px;max-height:560px;overflow-y:auto">' + list + '</div>' +
    '<button class="btn" style="margin-top:12px;width:100%" data-act="endteach">End session</button></section></aside></div>';
}
function viewTeachEnd() {
  var T = UI.teach, d = T.d;
  var review = T.ids.filter(function (x) { var q = rec(d, x); return !(q && q.g); });
  return '<section class="panel" style="max-width:760px;margin:0 auto;text-align:center"><h2>' + esc(T.label) + ' done</h2>' +
    '<p class="muted" style="font-size:16px">' + (T.ids.length - review.length) + ' of ' + T.ids.length + ' marked Got it. ' + (review.length ? plural(review.length, 'card') + ' still in Review.' : 'Every card is marked.') + '</p>' +
    '<div class="ctrl">' + (review.length ? '<button class="btn gold" data-act="reviewrest">Go through the ' + plural(review.length, 'Review card') + ' again</button>' : '') +
    (T.b >= 0 ? '<button class="btn outline" data-act="testthis" data-b="' + T.b + '">Test this batch</button>' : '<button class="btn outline" data-act="gotest">Take a test</button>') +
    '<button class="btn" data-act="endteach">Back to batches</button></div></section>';
}

/* ---------------- Test */
function studiedBatches(d) { var o = []; for (var b = 0; b < batchCount(d); b++) if (batchWords(d, b).some(function (w) { var r = rec(d, w.id); return r && (r.s || r.g || r.r || r.x); })) o.push(b); return o; }
function testPool(d, cfg) {
  var ws;
  if (cfg.scope === 'batch') ws = batchWords(d, cfg.batch < 0 ? 0 : cfg.batch);
  else if (cfg.scope === 'studied') ws = words(d).filter(function (w) { var r = rec(d, w.id); return r && (r.s || r.g || r.r || r.x); });
  else ws = words(d);
  if (cfg.pool === 'missed') ws = ws.filter(function (w) { return level(rec(d, w.id)) === 'x'; });
  return ws;
}
function viewTestStart() {
  var d = UI.deck, c = UI.cfg, sb = studiedBatches(d);
  if (c.batch < 0 || c.batch >= batchCount(d)) c.batch = sb.length ? sb[sb.length - 1] : 0;
  var pool = testPool(d, c), n = c.len ? Math.min(c.len, pool.length) : pool.length, missedAll = words(d).filter(function (w) { return level(rec(d, w.id)) === 'x'; }).length;
  function seg(key, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button class="' + (c[key] === o[0] ? 'on' : '') + '" data-cfg="' + key + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  var bopts = ''; for (var b = 0; b < batchCount(d); b++) bopts += '<option value="' + b + '"' + (b === c.batch ? ' selected' : '') + '>Batch ' + (b + 1) + (sb.indexOf(b) >= 0 ? ' · studied' : '') + '</option>';
  return '<div class="row"><section class="grow panel"><h2>Test · ' + DECKS[d].name + '</h2>' +
    '<p class="muted" style="font-size:14px;margin:6px 0 18px">Four choices for each question. A word is <b>mastered</b> after two right answers in a row. A wrong answer puts it on your missed list until you get it right twice in a row again.</p>' +
    '<div class="lbl">Direction</div>' + seg('dir', [['wm', 'Word → meaning'], ['mw', 'Meaning → word']]) +
    '<div class="lbl">Which words</div>' + seg('scope', [['batch', 'One batch'], ['studied', 'Everything I have studied'], ['deck', 'The whole deck']]) +
    (c.scope === 'batch' ? '<div style="margin:-6px 0 14px"><label class="hidden" for="tb">Batch</label><select id="tb" data-cfg="batch">' + bopts + '</select></div>' : '') +
    seg('pool', [['all', 'All of them'], ['missed', 'Only ones I have missed']]) +
    '<div class="lbl">Order</div>' + seg('order', [['alpha', 'Alphabetical'], ['scr', 'Scrambled']]) +
    '<div class="lbl">How many questions</div>' + seg('len', [[10, '10'], [20, '20'], [50, '50'], [0, 'All']]) +
    '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:6px"><button class="btn gold" data-act="starttest"' + (n ? '' : ' disabled') + '>Start ' + (n ? plural(n, 'question') : '') + '</button>' +
    '<span class="hint">' + (n ? pool.length.toLocaleString('en-AU') + ' words to choose from' : (c.pool === 'missed' ? 'No missed words here. ' : 'No words here yet. ') + (c.scope === 'studied' ? 'Study a batch first.' : '')) + '</span></div></section>' +
    '<aside class="side"><section class="panel"><h3>Your missed words</h3><p class="muted" style="font-size:14px">' + (missedAll ? plural(missedAll, 'word') + ' in ' + DECKS[d].name + ' are on your missed list.' : 'None at the moment.') + '</p>' +
    (missedAll ? '<button class="btn redline" style="width:100%" data-act="testmissed">Retest them now</button>' : '') + '</section></aside></div>';
}
function pickDistractors(d, w, dir) {
  var ws = words(d), same = [], other = [], key = dir === 'wm' ? fold(w.m[0]) : fold(w.w);
  for (var t = 0; t < 400 && (same.length < 3 || other.length < 3); t++) {
    var x = ws[Math.floor(Math.random() * ws.length)]; if (x.id === w.id) continue;
    var k = dir === 'wm' ? fold(x.m[0]) : fold(x.w); if (!k || k === key || fold(x.m[0]) === fold(w.m[0]) || fold(x.w) === fold(w.w)) continue;
    if (same.concat(other).some(function (y) { return fold(y.m[0]) === fold(x.m[0]) || fold(y.w) === fold(x.w); })) continue;
    (x.type === w.type ? same : other).push(x);
  }
  return same.concat(other).slice(0, 3);
}
function startTest(d, cfg, label, b) {
  var pool = testPool(d, cfg);
  pool = cfg.order === 'alpha' ? pool.slice().sort(function (a, b2) { return fold(a.w).localeCompare(fold(b2.w), 'en'); }) : shuffle(pool);
  if (cfg.len) pool = cfg.order === 'alpha' ? pool.slice(0, cfg.len) : pool.slice(0, cfg.len);
  var items = pool.map(function (w) { var ds = pickDistractors(d, w, cfg.dir), all = shuffle(ds.concat([w])); return { id: w.id, opts: all.map(function (x) { return x.id; }), ans: all.indexOf(w) }; });
  UI.test = { d: d, items: items, i: 0, picked: null, score: 0, missed: [], dir: cfg.dir, label: label || testLabel(d, cfg), b: cfg.scope === 'batch' ? cfg.batch : -1, cfg: JSON.parse(JSON.stringify(cfg)) };
  UI.tab = 'test'; render(); window.scrollTo(0, 0);
}
function testLabel(d, c) { return (c.scope === 'batch' ? 'Batch ' + (c.batch + 1) : c.scope === 'studied' ? 'Everything studied' : 'Whole deck') + (c.pool === 'missed' ? ' · missed words' : ''); }
function viewQuestion() {
  var T = UI.test, d = T.d;
  if (T.i >= T.items.length) return viewTestEnd();
  var it = T.items[T.i], w = BYID[it.id], wm = T.dir === 'wm', done = T.picked !== null;
  var q = wm ? '<div class="p">What does this mean?</div><div class="q ' + wordFont(d) + '">' + esc(w.w) + '</div>' + altD(w) + '<div style="font-size:17px;color:#8a5a12;margin-top:6px">' + sayLine(d, w) + '</div>'
    : '<div class="p">Which ' + (!bib(d) ? 'word' : DECKS[d].short + ' word') + ' means…</div><div class="q meaning">' + esc(w.m[0]) + '</div><div style="font-size:14px;color:#6b5636;margin-top:6px;font-style:italic">' + esc(w.type) + '</div>';
  var opts = it.opts.map(function (oid, k) {
    var o = BYID[oid], cls = 'opt' + (done && k === it.ans ? ' right' : done && k === T.picked ? ' wrong' : '');
    var label = wm ? esc(o.m[0]) : '<span class="w2 ' + wordFont(d) + '">' + esc(o.w) + '</span>' + altS(o) + (bib(d) ? '<span class="hint" style="margin-left:6px">' + esc(o.tr) + '</span>' : '');
    return '<button class="' + cls + '" data-act="pick" data-k="' + k + '"' + (done ? ' disabled' : '') + '><span class="k">' + 'ABCD'[k] + '</span><span>' + label + '</span></button>';
  }).join('');
  var fb = '';
  if (done) {
    var ok = T.picked === it.ans, r = rec(d, it.id);
    fb = '<div class="fb ' + (ok ? 'ok' : 'no') + '">' + (ok ? 'Right. ' + (r.k >= 2 ? (r.rec === today() && r.recTries ? 'Recovered and mastered.' : 'Mastered.') : 'One more right answer in a row masters it.')
      : 'Not this time. <b>' + esc(w.w) + '</b>' + altS(w) + ' (' + sayLine(d, w) + ') means “' + esc(w.m[0]) + '”. It is on your missed list and will come back.') + '</div>';
  }
  return '<div style="max-width:880px;margin:0 auto"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:12px"><h2>' + esc(T.label) + ' · question ' + (T.i + 1) + ' of ' + T.items.length + '</h2>' +
    '<span class="muted">Score <b style="color:var(--gold)">' + T.score + '</b> / ' + (T.i + (done ? 1 : 0)) + '</span></div>' +
    '<div class="progressbar" style="margin-bottom:16px"><div style="width:' + Math.round(100 * T.i / T.items.length) + '%"></div></div>' +
    '<div class="qcard">' + q + '</div><div class="opts">' + opts + '</div>' + fb +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:10px"><button class="btn" data-act="quittest">End test</button>' +
    '<span class="hint">Keys: 1–4 or A–D to answer · Enter for the next question</span>' +
    '<button class="btn gold" data-act="nextq"' + (done ? '' : ' disabled') + '>' + (T.i + 1 < T.items.length ? 'Next question' : 'See results') + '</button></div></div>';
}
function pick(k) {
  var T = UI.test; if (!T || T.picked !== null || T.i >= T.items.length) return;
  var it = T.items[T.i], ok = k === it.ans;
  T.picked = k; if (ok) T.score++; else T.missed.push(it.id);
  answer(T.d, it.id, ok); scheduleSave(); render();
}
function nextQ() {
  var T = UI.test; if (!T || T.picked === null) return;
  T.i++; T.picked = null;
  if (T.i >= T.items.length) finishTest();
  render();
}
function finishTest() {
  var T = UI.test; if (T.logged) return; T.logged = true;
  var n = T.items.length;
  P.log = P.log || [];
  P.log.push({ at: new Date().toISOString(), d: T.d, label: T.label, b: T.b, dir: T.dir, score: T.score, total: n, missed: T.missed });
  if (P.log.length > 2000) P.log = P.log.slice(-2000);
  if (T.b >= 0) { var B = dk(T.d).batches[T.b] || (dk(T.d).batches[T.b] = {}); B.tests = B.tests || []; B.tests.push([today(), T.score, n]); }
  scheduleSave();
}
function viewTestEnd() {
  var T = UI.test, d = T.d, n = T.items.length, pct = n ? Math.round(100 * T.score / n) : 0;
  var miss = T.missed.map(function (id) { var w = BYID[id]; return '<div class="it"><span><b class="' + (!bib(d) ? '' : wordFont(d)) + '" style="font-size:' + (!bib(d) ? 15 : 20) + 'px">' + esc(w.w) + '</b> <span class="hint">' + sayLine(d, w) + '</span></span><span style="text-align:right">' + esc(w.m[0]) + '</span></div>'; }).join('');
  return '<section class="panel" style="max-width:820px;margin:0 auto"><h2>' + esc(T.label) + ' · results</h2>' +
    '<div style="font-family:var(--serif);font-size:56px;font-weight:700;color:#f3e5c0;line-height:1.1;margin-top:8px">' + T.score + ' / ' + n + ' <span style="font-size:24px;color:var(--gold)">' + pct + '%</span></div>' +
    (T.missed.length ? '<h3 style="margin-top:16px">Missed in this test</h3><div class="list">' + miss + '</div>' : '<p class="muted">No mistakes.</p>') +
    '<div class="ctrl" style="justify-content:flex-start">' + (T.missed.length ? '<button class="btn gold" data-act="retestthese">Retest the ' + plural(T.missed.length, 'word') + ' I missed</button>' : '') +
    '<button class="btn outline" data-act="againtest">Same test again</button><button class="btn" data-act="quittest">New test</button></div></section>';
}

/* ---------------- Progress */
function viewProgress() {
  var d = UI.deck, ws = words(d), c = counts(d), tests = (P.log || []).filter(function (l) { return l.d === d; });
  var wk = addDays(today(), -6), recent = tests.filter(function (l) { return l.at.slice(0, 10) >= wk; });
  var acc = recent.length ? Math.round(100 * recent.reduce(function (a, l) { return a + l.score; }, 0) / Math.max(1, recent.reduce(function (a, l) { return a + l.total; }, 0))) + '%' : '—';
  var nB = batchCount(d), doneB = 0, rows = '';
  for (var b = 0; b < nB; b++) {
    var bw = batchWords(d, b), bc = counts(d, bw), B = dk(d).batches[b];
    var complete = bw.every(function (w) { var r = rec(d, w.id); return r && r.g; }); if (complete) doneB++;
    if (!B || !B.st) continue;
    var ts = B.tests || [], best = ts.length ? ts.reduce(function (a, t) { return t[1] / t[2] > a[1] / a[2] ? t : a; }) : null, last = ts[ts.length - 1];
    var mp = Math.round(100 * bc.m / bw.length);
    rows += '<tr><td><b>Batch ' + (b + 1) + '</b></td><td>' + fmt(B.st) + '</td><td>' + bc.got + ' / ' + bw.length + '</td><td>' + (best ? best[1] + ' / ' + best[2] : '—') + '</td><td>' + (last ? last[1] + ' / ' + last[2] + ' <span class="hint">' + fmt(last[0]) + '</span>' : '—') + '</td><td>' + (bc.x || '') + '</td>' +
      '<td style="width:26%"><div style="display:flex;align-items:center;gap:8px"><div class="progressbar" style="flex:1"><div style="width:' + mp + '%"></div></div><span class="hint" style="width:34px">' + mp + '%</span></div></td></tr>';
  }
  // words mastered over time (last 30 days with a snapshot)
  var days = Object.keys(P.daily || {}).sort().slice(-30), mx = 1;
  days.forEach(function (t) { var s = P.daily[t][d]; if (s && s[0] > mx) mx = s[0]; });
  var bars = days.map(function (t) { var v = (P.daily[t][d] || [0])[0]; return '<div class="c"><span>' + v + '</span><div style="height:' + Math.max(2, Math.round(130 * v / mx)) + 'px"></div></div>'; }).join('');
  var axis = days.map(function (t) { return '<span>' + t.slice(8) + '/' + t.slice(5, 7) + '</span>'; }).join('');
  var recov = ws.filter(function (w) { var r = rec(d, w.id); return r && r.rec; }).sort(function (a, b2) { return rec(d, b2.id).rec.localeCompare(rec(d, a.id).rec); });
  var trouble = ws.filter(function (w) { var r = rec(d, w.id); return r && r.x; }).sort(function (a, b2) { return rec(d, b2.id).x - rec(d, a.id).x; }).slice(0, 15);
  function item(w, right) { return '<button class="it bcell" style="width:100%;border-radius:0;border-width:1px 0 0;background:transparent;padding:7px 0" data-word="' + esc(w.id) + '"><span><b class="' + (!bib(d) ? '' : wordFont(d)) + '" style="font-size:' + (!bib(d) ? 14 : 19) + 'px">' + esc(w.w) + '</b> <span class="hint">' + (d === 'en' ? esc(w.say) : esc(w.tr)) + '</span></span><span class="hint" style="white-space:nowrap">' + right + '</span></button>'; }
  var hist = tests.slice(-15).reverse().map(function (l) { return '<tr><td>' + fmt(l.at) + '</td><td><b>' + esc(l.label) + '</b></td><td>' + (l.dir === 'wm' ? 'word → meaning' : 'meaning → word') + '</td><td>' + l.score + ' / ' + l.total + '</td><td>' + Math.round(100 * l.score / Math.max(1, l.total)) + '%</td></tr>'; }).join('');
  var kp = [['Mastered', c.m.toLocaleString('en-AU'), 'of ' + ws.length.toLocaleString('en-AU') + ' words'], ['Got it', c.got.toLocaleString('en-AU'), 'marked while learning'], ['Missed now', c.x, 'waiting to be recovered'], ['Recovered', c.rec, 'missed, then mastered'], ['Test accuracy', acc, 'last 7 days'], ['Batches complete', doneB, 'of ' + nB + ' (every card Got it)']];
  return '<h2 style="margin-bottom:14px">Progress · ' + DECKS[d].name + '</h2><div class="kpis" style="margin-bottom:22px">' + kp.map(function (k) { return '<div class="kpi"><div class="l">' + k[0] + '</div><div class="v">' + k[1] + '</div><div class="n">' + k[2] + '</div></div>'; }).join('') + '</div>' +
    '<div class="row"><section class="grow panel"><h3>Batches of 50</h3>' + (rows ? '<div class="scroll"><table style="min-width:620px"><thead><tr><th>Batch</th><th>Started</th><th>Got it</th><th>Best test</th><th>Last test</th><th>Missed</th><th>Mastered</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<p class="muted">No batches studied yet.</p>') +
    '<h3 style="margin-top:24px">Words mastered over time</h3>' + (days.length ? '<div class="chart" style="margin-top:10px">' + bars + '</div><div class="axis">' + axis + '</div>' : '<p class="muted">Your history starts with your first session.</p>') +
    '<h3 style="margin-top:24px">Recent tests</h3>' + (hist ? '<div class="scroll"><table style="min-width:520px"><thead><tr><th>Date</th><th>Test</th><th>Direction</th><th>Score</th><th></th></tr></thead><tbody>' + hist + '</tbody></table></div>' : '<p class="muted">No tests yet.</p>') + '</section>' +
    '<aside class="side"><section class="panel"><h3>Recovered</h3><p class="hint" style="margin:2px 0 8px">Missed in a test, then mastered</p><div class="list">' + (recov.length ? recov.slice(0, 40).map(function (w) { var r = rec(d, w.id); return item(w, 'missed ' + plural(r.recTries || r.x, 'time') + ' · ' + fmt(r.rec)); }).join('') : '<p class="muted">None yet.</p>') + '</div></section>' +
    '<section class="panel"><h3 style="color:#f3b3a5">Most often missed</h3><div class="list" style="margin-top:8px">' + (trouble.length ? trouble.map(function (w) { var r = rec(d, w.id); return item(w, plural(r.x, 'miss') .replace('misss', 'misses') + (level(r) === 'x' ? '' : ' · now ' + LEVELS[level(r)].toLowerCase())); }).join('') : '<p class="muted">None yet.</p>') + '</div></section></aside></div>';
}

/* ---------------- word pop-up */
function openWord(id) {
  var w = BYID[id]; if (!w) return; var d = wordDeck(id), r = rec(d, id) || {}, b = batchOf(d, id);
  $('modal').innerHTML = '<div class="box"><div class="card" style="cursor:default;min-height:0">' + cardFront(d, w) + '<hr style="border:0;border-top:1px solid #d6c39a;margin:22px 0">' + cardBack(d, w) +
    '<div class="extra">Batch ' + (b + 1) + ' · seen ' + plural(r.s || 0, 'time') + ' · right ' + (r.r || 0) + ' · wrong ' + (r.x || 0) + (r.rec ? ' · recovered ' + fmt(r.rec) : '') + '</div></div>' +
    '<div class="ctrl"><button class="btn gold" data-act="teachbatch" data-b="' + b + '" data-d="' + d + '">Teach batch ' + (b + 1) + '</button>' + listenBtn(d, w) +
    (w.added ? '<button class="btn redline" data-act="removeword" data-id="' + esc(id) + '">Remove this word</button>' : '') + '<button class="btn" data-act="close">Close</button></div></div>';
  $('modal').classList.remove('hidden'); $('modal').querySelector('[data-act=close]').focus();
}
function closeModal() { $('modal').classList.add('hidden'); $('modal').innerHTML = ''; }

/* ---------------- search */
function runSearch(q) {
  var box = $('results'); q = fold(q.trim());
  if (q.length < 2) { box.classList.add('hidden'); return; }
  var hits = [];
  DECK_IDS.forEach(function (d) {
    words(d).forEach(function (w) {
      var a = fold(w.w), t = fold((w.tr || '') + (w.alt ? ' ' + w.alt : '')), m = fold(w.m.join(' '));
      var score = a === q || t === q ? 0 : a.indexOf(q) === 0 || t.indexOf(q) === 0 ? 1 : (a.indexOf(q) >= 0 || t.indexOf(q) >= 0) ? 2 : m.indexOf(q) >= 0 ? 3 : -1;
      if (score >= 0) hits.push([score, d, w]);
    });
  });
  hits.sort(function (x, y) { return x[0] - y[0] || (x[1] === UI.deck ? -1 : 0) - (y[1] === UI.deck ? -1 : 0); });
  box.innerHTML = hits.length ? hits.slice(0, 30).map(function (h) { var d = h[1], w = h[2]; return '<button data-word="' + esc(w.id) + '"><span><span class="' + (!bib(d) ? '' : wordFont(d)) + '" style="font-size:' + (!bib(d) ? 15 : 19) + 'px">' + esc(w.w) + '</span> <span class="hint">' + esc(w.m[0]).slice(0, 60) + '</span></span><span class="hint">' + DECKS[d].short + '</span></button>'; }).join('') : '<div class="hint" style="padding:10px 12px">No match</div>';
  box.classList.remove('hidden');
}

/* ---------------- events */
document.addEventListener('click', function (e) {
  var t = e.target;
  var dm = document.querySelector('.deckmenu[open]'); if (dm && !t.closest('.deckmenu')) dm.removeAttribute('open');
  var say = t.closest('[data-say]'); if (say) { e.stopPropagation(); speak(say.dataset.say, say.dataset.lang); return; }
  var tab = t.closest('[data-tab]'); if (tab) { UI.tab = tab.dataset.tab; if (UI.tab === 'test' && UI.test && UI.test.i >= UI.test.items.length) UI.test = null; render(); return; }
  var dd = t.closest('[data-deck]'); if (dd) { UI.deck = dd.dataset.deck; UI.cfg.batch = -1; try { localStorage.setItem('vb-deck', UI.deck); } catch (x) { } render(); return; }
  var wd = t.closest('[data-word]'); if (wd) { $('results').classList.add('hidden'); openWord(wd.dataset.word); return; }
  var cf = t.closest('[data-cfg]'); if (cf && cf.tagName === 'BUTTON') { var v = cf.dataset.v; UI.cfg[cf.dataset.cfg] = /^\d+$/.test(v) ? +v : v; render(); return; }
  if (t === $('modal')) { closeModal(); return; }
  if (!t.closest('.search')) $('results').classList.add('hidden');
  var dop = t.closest('[data-dopen]'); if (dop) { DICT.open = DICT.open === dop.dataset.dopen ? null : dop.dataset.dopen; dictRefresh(); return; }
  var a = t.closest('[data-act]'); if (!a) return;
  var act = a.dataset.act, d = UI.deck;
  switch (act) {
    case 'close': closeModal(); break;
    case 'teachbatch': if (a.dataset.d) { UI.deck = a.dataset.d; d = UI.deck; } closeModal(); teachBatch(d, +a.dataset.b); break;
    case 'today': teachToday(d); break;
    case 'chalstart': startChallenge(d); break;
    case 'chalstop': stopChallenge(d); break;
    case 'gotest': UI.test = null; UI.tab = 'test'; render(); break;
    case 'testmissed': startTest(d, { scope: 'deck', batch: -1, pool: 'missed', order: 'scr', dir: UI.cfg.dir, len: 0 }, 'My missed words'); break;
    case 'flip': UI.teach.flipped = !UI.teach.flipped; render(); break;
    case 'got': { var T = UI.teach, id = T.ids[T.i], r = rec(T.d, id); setGot(T.d, id, !(r && r.g)); render(); break; }
    case 'next': UI.teach.i++; UI.teach.flipped = false; render(); break;
    case 'prev': if (UI.teach.i > 0) { UI.teach.i--; UI.teach.flipped = false; render(); } break;
    case 'jump': UI.teach.i = +a.dataset.i; UI.teach.flipped = false; render(); break;
    case 'endteach': UI.teach = null; render(); break;
    case 'reviewrest': { var T2 = UI.teach, rest = T2.ids.filter(function (x) { var q = rec(T2.d, x); return !(q && q.g); }); UI.teach = { d: T2.d, ids: rest, i: 0, flipped: false, label: T2.label, b: T2.b, pass: T2.pass + 1, seen: {} }; render(); break; }
    case 'testthis': UI.cfg.scope = 'batch'; UI.cfg.batch = +a.dataset.b; UI.cfg.pool = 'all'; UI.teach = null; startTest(d, UI.cfg); break;
    case 'starttest': startTest(d, UI.cfg); break;
    case 'pick': pick(+a.dataset.k); break;
    case 'nextq': nextQ(); break;
    case 'quittest': if (UI.test && UI.test.i < UI.test.items.length && UI.test.i > 0 && !UI.test.logged) { UI.test.items = UI.test.items.slice(0, UI.test.i); finishTest(); } UI.test = null; render(); break;
    case 'retestthese': { var T3 = UI.test, ids = T3.missed.slice(); var items = shuffle(ids).map(function (id2) { var w = BYID[id2], ds = pickDistractors(T3.d, w, T3.dir), all = shuffle(ds.concat([w])); return { id: id2, opts: all.map(function (x) { return x.id; }), ans: all.indexOf(w) }; });
      UI.test = { d: T3.d, items: items, i: 0, picked: null, score: 0, missed: [], dir: T3.dir, label: 'Retest of missed words', b: -1, cfg: T3.cfg }; render(); break; }
    case 'againtest': { var T4 = UI.test, ids4 = T4.items.map(function (x) { return x.id; }); ids4 = T4.cfg && T4.cfg.order === 'alpha' && T4.label.indexOf('Retest') < 0 ? ids4 : shuffle(ids4);
      UI.test = { d: T4.d, items: ids4.map(function (id4) { var w = BYID[id4], ds = pickDistractors(T4.d, w, T4.dir), all = shuffle(ds.concat([w])); return { id: id4, opts: all.map(function (x) { return x.id; }), ans: all.indexOf(w) }; }), i: 0, picked: null, score: 0, missed: [], dir: T4.dir, label: T4.label, b: T4.b, cfg: T4.cfg }; render(); break; }
    case 'lookup': lookupWord(); break;
    case 'dletter': DICT.letter = a.dataset.c; DICT.q = ''; DICT.shown = 150; DICT.open = null; render(); break;
    case 'dmore': DICT.shown += 300; dictRefresh(); break;
    case 'dclear': DICT.sel = {}; dictRefresh(); break;
    case 'dadd': {
      var idx2 = deckIndex(), list = [], skipped = 0;
      Object.keys(DICT.sel).forEach(function (k) { var e = (DICT.L[dictLetter(k)] || []).filter(function (x) { return x[0] === k; })[0]; if (!e || idx2[k]) { skipped++; return; } list.push(dictToWord(e)); });
      var ids = addFromDict(list); DICT.sel = {};
      dictRefresh(); toast(plural(ids.length, 'word') + ' added to your English deck' + (ids.length ? ' (batch ' + (batchOf('en', ids[0]) + 1) + (batchOf('en', ids[ids.length - 1]) !== batchOf('en', ids[0]) ? '–' + (batchOf('en', ids[ids.length - 1]) + 1) : '') + ')' : '') + (skipped ? '; ' + skipped + ' skipped (already in a deck)' : ''));
      renderFrame(); break; }
    case 'removeword': { var rid = a.dataset.id; if (!confirm('Remove “' + BYID[rid].w + '” from your English words?')) break; P.added = P.added.filter(function (w) { return w.id !== rid; }); delete BYID[rid]; delete dk('en').w[rid]; closeModal(); scheduleSave(); render(); toast('Removed'); break; }
  }
});
document.addEventListener('change', function (e) { var cb = e.target.closest('[data-dsel]'); if (cb) { if (cb.checked) DICT.sel[cb.dataset.dsel] = 1; else delete DICT.sel[cb.dataset.dsel]; cb.closest('.drow').classList.toggle('sel', cb.checked); $('dbar').innerHTML = dictBar(); return; } var s = e.target.closest('select[data-cfg]'); if (s) { UI.cfg[s.dataset.cfg] = +s.value; render(); } });
document.addEventListener('submit', function (e) {
  if (e.target.id !== 'addform') return; e.preventDefault();
  var w = $('aw').value.trim(), m = $('am').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
  if (!w || !m.length) return;
  var dup = null; DECK_IDS.forEach(function (d2) { if (!dup && !bib(d2)) dup = words(d2).filter(function (x) { return fold(x.w) === fold(w); })[0]; });
  if (dup && wordDeck(dup.id) !== 'en') { toast('“' + dup.w + '” is already in ' + DECKS[wordDeck(dup.id)].name); openWord(dup.id); return; }
  if (dup) { toast('“' + dup.w + '” is already in your deck'); openWord(dup.id); return; }
  var n = (P.added || []).reduce(function (a, x) { return Math.max(a, +x.id.slice(1)); }, 0) + 1;
  var nw = { id: 'u' + ('000' + n).slice(-4), w: w.charAt(0).toUpperCase() + w.slice(1), say: $('as').value.trim(), type: $('at').value, m: m, x: $('ax').value.trim() ? [$('ax').value.trim()] : [], added: true, addedAt: today() };
  P.added = P.added || []; P.added.push(nw); BYID[nw.id] = nw;
  scheduleSave(); render(); toast('“' + nw.w + '” added to batch ' + (batchOf('en', nw.id) + 1));
});
document.addEventListener('input', function (e) { if (e.target.id === 'find') runSearch(e.target.value); if (e.target.id === 'dq') { DICT.q = e.target.value; DICT.shown = 150; DICT.open = null; if (DICT.q.trim()) DICT.letter = dictLetter(DICT.q.trim()); var l = $('dlist'); if (l) l.innerHTML = dictList(); document.querySelectorAll('.lt').forEach(function (b) { b.classList.toggle('on', !DICT.q.trim() && b.dataset.c === DICT.letter); }); } });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { var dm2 = document.querySelector('.deckmenu[open]'); if (dm2) dm2.removeAttribute('open'); if (!$('modal').classList.contains('hidden')) closeModal(); $('results').classList.add('hidden'); return; }
  if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') || !$('modal').classList.contains('hidden') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (UI.tab === 'teach' && UI.teach && UI.teach.d === UI.deck && UI.teach.i < UI.teach.ids.length) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); UI.teach.flipped = !UI.teach.flipped; render(); }
    else if (e.key === 'ArrowRight') { UI.teach.i++; UI.teach.flipped = false; render(); }
    else if (e.key === 'ArrowLeft' && UI.teach.i > 0) { UI.teach.i--; UI.teach.flipped = false; render(); }
    else if (e.key === 'g' || e.key === 'G') { var T = UI.teach, id = T.ids[T.i], r = rec(T.d, id); setGot(T.d, id, !(r && r.g)); render(); }
  } else if (UI.tab === 'test' && UI.test && UI.test.d === UI.deck && UI.test.i < UI.test.items.length) {
    var k = '1234'.indexOf(e.key); if (k < 0) k = 'abcd'.indexOf(e.key.toLowerCase());
    if (k >= 0 && UI.test.picked === null) { e.preventDefault(); pick(k); }
    else if (e.key === 'Enter' && UI.test.picked !== null) { e.preventDefault(); nextQ(); }
  }
});

/* ---------------- Dictionary (WordNet 3.0 + Webster 1913 + CMU pronunciations) */
var DICT = { L: {}, letter: 'a', q: '', shown: 150, sel: {}, open: null, total: 0 };
var DPOS = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'interjection', 'preposition', 'conjunction'];
function dictLetter(w) { var c = fold(w).charAt(0); return /[a-z]/.test(c) ? c : '_'; }
function dictLoad(c) {
  if (DICT.L[c]) return Promise.resolve(DICT.L[c]);
  return loadJSON('dict/' + c + '.json').then(function (a) { DICT.L[c] = a; return a; });
}
function dictFind(w) {
  var k = fold(w.trim()), c = dictLetter(k);
  return dictLoad(c).then(function (a) {
    var hit = null, i;
    for (i = 0; i < a.length && !hit; i++) if (a[i][0] === k) hit = a[i];
    if (!hit) { var tries = [k.replace(/ies$/, 'y'), k.replace(/es$/, ''), k.replace(/s$/, ''), k.replace(/ed$/, ''), k.replace(/ed$/, 'e'), k.replace(/ing$/, ''), k.replace(/ing$/, 'e')];
      for (i = 0; i < a.length && !hit; i++) if (tries.indexOf(a[i][0]) >= 0 && a[i][0] !== k) hit = a[i]; }
    return hit;
  });
}
function deckIndex() {
  var m = {};
  DECK_IDS.forEach(function (d) { if (bib(d) || d === 'rt' || /^(mh|es|ru|zh|ja)$/.test(d)) return; words(d).forEach(function (w) { var k = fold(w.w).trim(); if (!m[k]) m[k] = d; }); });
  return m;
}
function dictSenses(e) {
  var out = [], seen = {};
  e[3].forEach(function (s) { var k = s[1].toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push({ pos: s[0], t: s[1], ex: s[2] || '', src: 'WordNet' }); } });
  e[4].forEach(function (t) { out.push({ pos: '', t: t, ex: '', src: 'Webster 1913' }); });
  return out;
}
function dictToWord(e) {
  var ss = dictSenses(e), wn = ss.filter(function (x) { return x.src === 'WordNet'; }), use = (wn.length ? wn : ss).slice(0, 3);
  var ex = use.filter(function (x) { return x.ex; })[0];
  var type = e[2] || (e[0].indexOf(' ') > 0 ? 'phrase' : '');
  return { w: e[0].charAt(0).toUpperCase() + e[0].slice(1), say: e[1] || '', type: type, m: use.map(function (x) { return x.t; }),
    x: [(ex ? 'e.g. "' + ex.ex + '" · ' : '') + 'From ' + (wn.length ? 'WordNet' : 'Webster 1913')] };
}
function addFromDict(list) {
  P.added = P.added || [];
  var n = P.added.reduce(function (a, x) { return Math.max(a, +x.id.slice(1)); }, 0), ids = [];
  list.forEach(function (o) { n++; var nw = { id: 'u' + ('000' + n).slice(-4), w: o.w, say: o.say, type: o.type, m: o.m, x: o.x, added: true, addedAt: today(), src: 'dict' }; P.added.push(nw); BYID[nw.id] = nw; ids.push(nw.id); });
  scheduleSave(); return ids;
}
function viewDict() {
  var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return '<section class="panel"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px"><h2>Dictionary</h2><span class="hint">About 177,000 English words and phrases · tick words to add them to your English deck</span></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0"><input id="dq" type="text" placeholder="Find in the dictionary…" autocomplete="off" value="' + esc(DICT.q) + '" style="flex:1;min-width:200px;max-width:360px">' +
    '<div class="letters">' + letters.map(function (c) { return '<button class="lt' + (DICT.letter === c && !DICT.q ? ' on' : '') + '" data-act="dletter" data-c="' + c + '">' + c.toUpperCase() + '</button>'; }).join('') + '</div></div>' +
    '<div id="dlist">' + dictList() + '</div>' +
    '<div id="dbar">' + dictBar() + '</div>' +
    '<p class="hint" style="margin-top:16px">Definitions from WordNet 3.0 (© 2006 Princeton University, used under its licence) and Webster\'s Revised Unabridged Dictionary (1913, public domain). Pronunciations are generated from the CMU Pronouncing Dictionary (© Carnegie Mellon University); words it does not cover have no pronunciation, which you can type yourself. Licences are in the app\'s dict folder.</p></section>';
}
function dictRows() {
  var q = fold(DICT.q.trim()), c = q ? dictLetter(q) : DICT.letter, a = DICT.L[c];
  if (!a) return null;
  return q ? a.filter(function (e) { return e[0].indexOf(q) === 0; }) : a;
}
function dictList() {
  var q = fold(DICT.q.trim()), c = q ? dictLetter(q) : DICT.letter;
  var rows = dictRows();
  if (!rows) { dictLoad(c).then(function () { var el = $('dlist'); if (el && UI.tab === 'dict') el.innerHTML = dictList(); }).catch(function (er) { var el = $('dlist'); if (el) el.innerHTML = '<p class="muted">The dictionary could not be loaded: ' + esc(er.message) + '</p>'; }); return '<p class="hint">Loading ' + (c === '_' ? 'entries' : c.toUpperCase()) + '…</p>'; }
  if (!rows.length) return '<p class="muted">No entries start with “' + esc(DICT.q) + '”. You can still add it yourself on the Home page of your English deck.</p>';
  var idx = deckIndex();
  var html = rows.slice(0, DICT.shown).map(function (e) {
    var inD = idx[e[0]], sel = !!DICT.sel[e[0]], ss = dictSenses(e), first = ss[0] ? ss[0].t : '';
    var row = '<div class="drow' + (inD ? ' have' : '') + (sel ? ' sel' : '') + '">' +
      '<input type="checkbox" data-dsel="' + esc(e[0]) + '"' + (sel ? ' checked' : '') + (inD ? ' disabled title="Already in ' + esc(DECKS[inD].name) + '"' : '') + ' aria-label="Select ' + esc(e[0]) + '">' +
      '<button class="dw" data-dopen="' + esc(e[0]) + '"><b>' + esc(e[0]) + '</b>' + (e[1] ? ' <span class="ds">' + esc(e[1]) + '</span>' : '') + (e[2] ? ' <i class="dt">' + esc(e[2]) + '</i>' : '') + '<span class="dm1">' + esc(first) + '</span></button>' +
      (inD ? '<span class="dhave">✓ ' + esc(DECKS[inD].short) + '</span>' : '') + '</div>';
    if (DICT.open === e[0]) row += '<div class="dfull"><ol>' + ss.map(function (x) { return '<li>' + (x.pos ? '<i>' + x.pos + '</i> ' : '') + esc(x.t) + (x.ex ? ' <span class="hint">e.g. “' + esc(x.ex) + '”</span>' : '') + ' <span class="dsrc">' + x.src + '</span></li>'; }).join('') + '</ol><div style="margin-top:6px">' + oxLink(e[0]) + '</div></div>';
    return row;
  }).join('');
  return '<p class="hint" style="margin:0 0 6px">' + rows.length.toLocaleString('en-AU') + ' entries' + (DICT.q ? ' starting with “' + esc(DICT.q) + '”' : ' under ' + c.toUpperCase()) + ' · showing ' + Math.min(DICT.shown, rows.length).toLocaleString('en-AU') + ' · ✓ means it is already in one of your decks</p>' +
    '<div class="dlist">' + html + '</div>' + (rows.length > DICT.shown ? '<button class="btn" style="margin-top:10px" data-act="dmore">Show more</button>' : '');
}
function dictBar() {
  var n = Object.keys(DICT.sel).length;
  return n ? '<div class="dbar"><span><b>' + n + '</b> selected</span><button class="btn gold" data-act="dadd">Add ' + plural(n, 'word') + ' to my English deck</button><button class="btn" data-act="dclear">Clear</button></div>' : '';
}
function dictRefresh() { var l = $('dlist'), b = $('dbar'); if (l) l.innerHTML = dictList(); if (b) b.innerHTML = dictBar(); }
function oxLink(w) { return '<a href="https://www.oxfordlearnersdictionaries.com/definition/english/' + encodeURIComponent(w.trim().toLowerCase().replace(/\s+/g, '-')) + '" target="_blank" rel="noopener" style="color:var(--gold)">Open in Oxford Learner\'s ↗</a>'; }
function lookupWord() {
  var w = $('aw').value.trim(), h = $('lookuphint');
  if (!w) { h.textContent = 'Type a word first.'; return; }
  h.textContent = 'Looking up “' + w + '”…';
  dictFind(w).then(function (e) {
    var have = deckIndex()[fold(w)];
    if (!e) { $('as').value = ''; $('am').value = ''; $('ax').value = ''; h.innerHTML = '“' + esc(w) + '” is not in the dictionary. Fill in the details yourself' + (have ? ' (note: it is already in ' + esc(DECKS[have].name) + ')' : '') + '. ' + oxLink(w); return; }
    var o = dictToWord(e), have2 = deckIndex()[e[0]];
    if (fold(o.w) !== fold(w)) $('aw').value = o.w;
    if (o.say) $('as').value = o.say;
    if (DPOS.indexOf(o.type) >= 0) $('at').value = o.type;
    $('am').value = o.m.join('\n'); $('ax').value = o.x.join(' ');
    if (!o.say) $('as').value = '';
    h.innerHTML = (have2 ? '<b style="color:#f3b3a5">Already in ' + esc(DECKS[have2].name) + '.</b> ' : '') + 'Filled in from ' + (e[3].length ? 'WordNet' : 'Webster 1913') + (o.say ? '' : ' (no pronunciation found; type one if you like)') + '. Edit anything, then add it. ' + oxLink(e[0]);
  }).catch(function (er) { h.textContent = 'The dictionary could not be loaded: ' + er.message; });
}

/* ---------------- start */
function loadJSON(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(u + ': HTTP ' + r.status); return r.json(); }); }
Promise.all(DECK_IDS.map(function (d) { return loadJSON(DECKS[d].file); }).concat([
  fetch('/api/progress', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })]))
  .then(function (res) {
    DECK_IDS.forEach(function (d, i) { W[d] = res[i]; });
    var saved = res[DECK_IDS.length];
    if (!saved || saved.app !== 'Vocab Builder') { try { var ls = JSON.parse(localStorage.getItem('vb-progress') || 'null'); if (ls && ls.app === 'Vocab Builder') saved = ls; } catch (e) { } }
    P = saved && saved.app === 'Vocab Builder' ? saved : newProgress();
    P.decks = P.decks || {}; DECK_IDS.forEach(function (d) { dk(d); });
    P.added = P.added || []; P.log = P.log || []; P.daily = P.daily || {};
    DECK_IDS.map(function (d) { return W[d]; }).concat([P.added]).forEach(function (list) { list.forEach(function (w) { BYID[w.id] = w; }); });
    try { var dl = localStorage.getItem('vb-deck'); if (DECKS[dl]) UI.deck = dl; } catch (e) { }
    Object.keys(DECKS).forEach(challengeTick);
    render();
  })
  .catch(function (e) { $('main').innerHTML = '<div class="panel"><h2>Vocab Builder could not load its words</h2><p class="muted">' + esc(e.message) + '</p></div>'; });
