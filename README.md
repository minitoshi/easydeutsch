# EasyDeutsch

**Learn German through short stories and interactive games.**

🌐 **Live site → [easydeutsch.vercel.app](https://easydeutsch.vercel.app)**

---

## What is it?

EasyDeutsch is a free, no-account-needed German learning app built around two ideas:

1. **Reading is the best way to absorb a language** — every story is written in natural German, levelled from A1 to C2, and tapping any sentence instantly reveals its English translation.
2. **Vocabulary sticks when it's fun** — the Bubble Pop mini-game floats German words across an underwater scene; click a bubble to pop it and see the meaning.

---

## Features

### Stories
- **500 short stories** across six CEFR levels (A1 → C2)
- **7 categories** — journal entries, news, science, culture, blog posts, poems, and short fiction
- Tap any sentence to reveal the English translation; tap again to hide it
- Save words you want to review later
- Track your reading streak and progress

### Flashcard Review
- Spaced-repetition–style review of every word you've saved across all stories
- Flip cards to test yourself; mark as known or keep reviewing

### 🫧 Bubble Pop
- 718-word German dictionary covering animals, food, family, travel, weather, colours, verbs, adjectives, and more
- Bubbles float upward through an underwater scene with natural left-right sway
- Colour-coded by grammatical gender — **red** = *der*, **yellow** = *die*, **blue** = *das*, **grey** = no article
- Click a bubble to freeze it, reveal the English meaning for 15 seconds, then watch it fade

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Rendering | Static-site generation — all 1 000+ pages pre-rendered at build time |
| Hosting | Vercel |
| State | React `useState` / `useEffect` — no external state library |
| Storage | `localStorage` for saved words and reading progress |

No database. No backend. No sign-up. Everything runs in the browser.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx          # Homepage — story browser with level/category filters
│   ├── bubbles/          # Bubble Pop game
│   ├── review/           # Flashcard review
│   ├── saved/            # Saved word list
│   └── story/[slug]/     # Individual story reader + vocabulary page
├── components/           # StoryCard, StreakBadge, …
├── data/
│   ├── stories-meta.json # Metadata for all 500 stories
│   ├── stories/          # Individual story JSON files
│   └── dictionary.json   # 718-word standalone vocabulary for Bubble Pop
├── hooks/                # useProgress, useSavedWords, …
└── lib/                  # Types, meta helpers, filters
```

---

## Running locally

```bash
git clone https://github.com/minitoshi/easydeutsch.git
cd easydeutsch
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Screenshots

| Stories | Story reader | Bubble Pop |
|---|---|---|
| Filter by level and category | Tap sentences for translation | Pop bubbles to learn vocabulary |

---

## Licence

MIT — do whatever you like with it.
