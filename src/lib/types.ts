export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type WordType =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'conjunction'
  | 'preposition'
  | 'pronoun'
  | 'expression';

export type StoryCategory =
  | 'news'
  | 'story'
  | 'poem'
  | 'blog'
  | 'journal'
  | 'science'
  | 'culture';

export interface Sentence {
  de: string;
  en: string;
}

export interface VocabWord {
  word: string;
  article?: 'der' | 'die' | 'das';
  type: WordType;
  level: CEFRLevel;
  meaning: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  level: CEFRLevel;
  category: StoryCategory;
  sentences: Sentence[];
  vocabulary: VocabWord[];
}

export interface StoryMeta {
  id: string;
  slug: string;
  title: string;
  level: CEFRLevel;
  category: StoryCategory;
  sentenceCount: number;
  vocabCount: number;
}

export interface ReadProgress {
  readSlugs: string[];
  lastVisited?: string;
}

export interface SavedWord {
  slug: string;
  word: string;
  article?: 'der' | 'die' | 'das';
  type: WordType;
  level: CEFRLevel;
  meaning: string;
}

export interface StreakData {
  lastVisit: string; // ISO date string (YYYY-MM-DD)
  count: number;
}
