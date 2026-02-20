import 'server-only';
import fs from 'fs';
import path from 'path';
import { Story, CEFRLevel, StoryCategory } from './types';

const STORIES_DIR = path.join(process.cwd(), 'src/data/stories');

export function getStoryBySlug(slug: string): Story | null {
  const filePath = path.join(STORIES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Story;
}

export function getAllStorySlugs(): string[] {
  return fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'stories-meta.json')
    .map((f) => f.replace('.json', ''));
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
