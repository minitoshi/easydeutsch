# Changelog

## v0.1.0 — 2026-02-19

### Built

- **Browse page** (`/`): Story grid with dual filters (CEFR level + category), progress bar showing read/total count
- **Reader page** (`/story/[slug]`): German text with per-sentence click-to-reveal English translation, auto-marks story as read on visit
- **Vocabulary page** (`/story/[slug]/vocabulary`): All key words for the story with CEFR badge, word type, English meaning
- **Progress tracking**: localStorage-backed, persists across sessions, shown as read checkmark on cards and progress bar on homepage
- **20 seed stories** across all CEFR levels (A1–B2) and all 7 categories (news, story, poem, blog, journal, science, culture)

### Decisions

- Chose pre-generated JSON files over runtime AI generation (simpler, no API cost at runtime)
- Sentence-level translation over word-level (better comprehension UX for beginners)
- localStorage for progress (no backend required)
- Story reader stays as client component to support interactive sentence reveal + progress hooks

### Problems solved

- Node modules corrupted during initial scaffold copy — fixed by `rm -rf node_modules && npm install`
- Dynamic route `useParams()` used for client-component reader page, async params used for SSG vocabulary page
