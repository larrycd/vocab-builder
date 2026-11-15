# Vocab Builder

**by Larry Dalton**

A vocabulary trainer for Windows that runs entirely on your own computer. Teaching cards come in batches of 50 and are followed by multiple-choice tests. You can take a 100-Day Challenge for any deck, and your missed words come back until you master them.

## Download

Get **VocabBuilder-Setup-1.2.0.exe** from the [Releases](../../releases) page and run it.

- It installs for your Windows account only, with no administrator rights needed.
- It runs at <http://localhost:8773/> and starts when you sign in.
- Your progress is saved in `Documents\vocab-builder` and is never touched by installing, reinstalling or uninstalling.

## 21 decks

| Group | Decks |
|---|---|
| English | English (1,229), Lost English (302), Middle English (300), Old English (300), Idioms & Phrases (282), Americanisms (231), Woke Dictionary (147) |
| Bible & Theology | Koine Greek (4,909), Biblical Hebrew (6,350), Theological Terms (230), KJV Words That Changed (195), Rhetorical Figures (152) |
| Borrowed Words & Roots | Latin Phrases & Quotes (306), French in English (198), World Words in English (292), Greek & Latin Roots (330) |
| Languages | Modern Hebrew (380), Spanish (198), Russian (196), Mandarin (152), Japanese (151) |

Every word has a pronunciation guide. Words in the language decks are shown in transliteration with the original script in brackets, e.g. *spasibo (спасибо)*.

## Features

- **Teach:** batches of 50 cards. Turn each card over and mark it *Got it*; every other card stays in Review.
- **Test:** multiple choice, either word → meaning or meaning → word. Choose all words or only the ones you missed, in alphabetical or scrambled order.
- **Missed words:** these glow red on the Gilded Wall until you recover them with two right answers in a row.
- **Progress history:** shown per batch and overall, including words that were missed and later mastered.
- **100-Day Challenge:** a daily quota for any deck, which adjusts as you go.
- **Dictionary:** about 177,000 English words.
  - Look up a word to fill in the Add-a-word form.
  - Browse A–Z and tick words to add them in bulk. Words already in a deck are marked ✓ so nothing is duplicated.
- **Listen:** reads words aloud using the voices installed on your computer.

## Sources and licences

- **Dictionary definitions:**
  - [WordNet 3.0](https://wordnet.princeton.edu/), © 2006 Princeton University, used under the WordNet licence (`app/dict/LICENSE-WordNet.txt`).
  - Webster's Revised Unabridged Dictionary (1913), public domain.
- **Pronunciations:** generated from the [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict), © Carnegie Mellon University, BSD-style licence (`app/dict/LICENSE-CMUdict.txt`).
- **Greek and Hebrew decks:** built from public-domain lexicons (Abbott-Smith; Brown-Driver-Briggs) and New and Old Testament word frequencies.
- **Other decks:** written for this project. The source text files are in `tools/content`.

## Repository layout

```
server.ps1        local web server (Windows PowerShell 5.1)
app/              the app: index.html, app.js, data/ (decks), dict/ (dictionary), fonts/
setup/            installer scripts (Install.ps1, Uninstall.ps1, NSIS script)
tools/            scripts used to build the decks and the dictionary
```

To run without installing, use `powershell -ExecutionPolicy Bypass -File server.ps1 -Open`.
