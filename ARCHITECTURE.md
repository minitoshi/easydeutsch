# EasyDeutsch — Architecture

## What we're building and why

A German reading app where learners can read short articles and stories (1–2 paragraphs), click any sentence to reveal its English translation, then view key vocabulary for the story with CEFR levels, word types, and English meanings. Inspired by Readle.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | SSG for vocab pages, client components for interactive reader |
| Language | TypeScript (strict) | Single `types.ts` source of truth, no `any` |
| Styling | Tailwind CSS v4 | Utility-first, fast, minimal CSS footprint |
| Data | JSON files in `src/data/stories/` | Zero infrastructure, instant, easy to add more |
| Progress | localStorage | No backend required, works offline |

## Alternatives considered and rejected

- **Database (Supabase/Postgres)**: Rejected for MVP — adds infra complexity. JSON files are simpler and sufficient for 100+ stories.
- **Word-level translation (LingQ model)**: Rejected in favour of sentence-level — simpler UX, better for comprehension at beginner level.
- **AI-generated on demand**: Rejected for MVP — adds API cost + latency at runtime. Pre-generated JSON is faster and more reliable.

## Data model (single source: `src/lib/types.ts`)

```
Story { id, slug, title, level: CEFRLevel, category, sentences[], vocabulary[] }
Sentence { de: string, en: string }
VocabWord { word, article?, type: WordType, level: CEFRLevel, meaning }
```

## Route structure

```
/                              → Browse page (SSG + client filters)
/story/[slug]                  → Reader page (dynamic, client component)
/story/[slug]/vocabulary       → Vocab list (SSG via generateStaticParams)
```

## Adding more stories

1. Create `src/data/stories/your-slug.json` following the Story schema
2. Import it in `src/lib/stories.ts` and add it to `ALL_STORIES`
3. Run `npm run build` — the new vocabulary page is automatically generated
