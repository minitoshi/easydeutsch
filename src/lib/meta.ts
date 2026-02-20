// Client-safe: imports the lightweight meta index only (no sentence/vocab content)
import type { StoryMeta, CEFRLevel, StoryCategory } from './types';
import storiesMeta from '@/data/stories-meta.json';

export const ALL_STORIES_META: StoryMeta[] = storiesMeta as StoryMeta[];

export function filterMeta(
  level: CEFRLevel | 'all',
  category: StoryCategory | 'all'
): StoryMeta[] {
  return ALL_STORIES_META.filter(
    (s) =>
      (level === 'all' || s.level === level) &&
      (category === 'all' || s.category === category)
  );
}

export const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CATEGORIES: { value: StoryCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'story', label: 'Story' },
  { value: 'poem', label: 'Poem' },
  { value: 'blog', label: 'Blog' },
  { value: 'journal', label: 'Journal' },
  { value: 'science', label: 'Science' },
  { value: 'culture', label: 'Culture' },
];
