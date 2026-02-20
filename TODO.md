# EasyDeutsch — Build TODO

## Current Status
- **Stories written:** 293 valid + 2 broken = 295 files
- **Target:** 500 stories
- **Remaining:** ~207 more stories needed

---

## ✅ Done

- [x] Next.js 15 app scaffolded (App Router, TypeScript, Tailwind)
- [x] Types defined in `src/lib/types.ts`
- [x] Server-only story loader (`src/lib/stories.ts` using `fs`)
- [x] Client-safe meta index (`src/lib/meta.ts` + `src/data/stories-meta.json`)
- [x] Progress tracking with localStorage (`src/hooks/useProgress.ts`)
- [x] Browse page with level + category filters (`src/app/page.tsx`)
- [x] Story reader page with click-to-reveal translations (`src/app/story/[slug]/page.tsx`)
- [x] Vocabulary page (`src/app/story/[slug]/vocabulary/page.tsx`)
- [x] Components: `StoryCard`, `SentenceBlock`, `VocabCard`, `LevelBadge`, `StoryReader`
- [x] 295 story JSON files written (IDs 1–295)
- [x] `stories-meta.json` rebuilt (293 valid entries)
- [x] `npm run build` passes

---

## 🔧 Fix First (Quick Wins)

- [ ] Fix `src/data/stories/neue-baeckerei-in-der-stadt.json` — has curly quote chars (`„`) in JSON, fails to parse
- [ ] Fix `src/data/stories/buch-fuer-alle-kinder.json` — same issue with curly quotes in JSON
- [ ] Fix `src/data/stories/sprache-lernen-tipps.json` (ID 206) — sentence 4 has `"word":` key instead of `"de":`, will show empty German text

---

## 📝 Continue Writing Stories

### Goal: 500 total valid stories

Continue from **ID 296** with filename pattern `slug-name.json`.

After writing each batch, rebuild the meta:
```bash
node -e "const fs=require('fs'),path=require('path'),dir='src/data/stories'; const meta=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>{try{const s=JSON.parse(fs.readFileSync(path.join(dir,f),'utf-8'));return{id:s.id,slug:s.slug,title:s.title,level:s.level,category:s.category,sentenceCount:s.sentences.length,vocabCount:s.vocabulary.length}}catch(e){return null}}).filter(Boolean).sort((a,b)=>Number(a.id)-Number(b.id)); fs.writeFileSync('src/data/stories-meta.json',JSON.stringify(meta,null,2)); console.log('Total:',meta.length)"
```

### Level distribution target (rough guide)
| Level | Current | Target |
|-------|---------|--------|
| A1    | ~15     | 50     |
| A2    | ~100    | 150    |
| B1    | ~120    | 180    |
| B2    | ~40     | 70     |
| C1    | 0       | 30     |
| C2    | 0       | 20     |

### Category distribution target
| Category | Notes |
|----------|-------|
| blog     | Personal experience, first-person |
| journal  | Diary entries, travel logs |
| story    | Short fiction, character-driven |
| poem     | Short, evocative German poems |
| news     | News-style factual pieces |
| science  | Accessible science topics |
| culture  | German culture, history, customs |

### Story JSON template
```json
{
  "id": "296",
  "slug": "slug-here",
  "title": "Title in English",
  "level": "B1",
  "category": "blog",
  "sentences": [
    {"de": "German sentence.", "en": "English translation."},
    {"de": "German sentence.", "en": "English translation."},
    {"de": "German sentence.", "en": "English translation."},
    {"de": "German sentence.", "en": "English translation."},
    {"de": "German sentence.", "en": "English translation."},
    {"de": "German sentence.", "en": "English translation."}
  ],
  "vocabulary": [
    {"word": "das Wort", "article": "das", "type": "noun", "level": "A2", "meaning": "word"},
    {"word": "wichtig", "type": "adjective", "level": "A2", "meaning": "important"},
    {"word": "verstehen", "type": "verb", "level": "A2", "meaning": "to understand"}
  ]
}
```

### Rules for good stories
- 6–8 sentences per story (not more, not less)
- 4–6 vocabulary words per story
- Vocabulary `level` can differ from story `level`
- Nouns always have `"article": "der/die/das"`
- Verbs/adjectives/adverbs have no `article` field
- No curly quotes (`„` `"`) in JSON strings — use straight quotes only
- Slugs: lowercase, hyphens only, no umlauts (ä→ae, ö→oe, ü→ue)

---

## 🚀 Optional Future Features

- [ ] Search bar on browse page
- [ ] "Mark as favourite" feature
- [ ] Daily story recommendation
- [ ] Flashcard mode for vocabulary
- [ ] Export vocabulary as Anki deck
- [ ] Dark mode toggle
- [ ] Reading streak tracker

---

## 🛠 Dev Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run generate   # Run story generation script (needs ANTHROPIC_API_KEY)
```
