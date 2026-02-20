'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavedWord } from '@/lib/types';

const STORAGE_KEY = 'easydeutsch_saved';

function getSavedWords(): SavedWord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSavedWords(words: SavedWord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function useSavedWords() {
  const [savedWords, setSavedWordsState] = useState<SavedWord[]>([]);

  useEffect(() => {
    setSavedWordsState(getSavedWords());
  }, []);

  const saveWord = useCallback((word: SavedWord) => {
    const current = getSavedWords();
    const key = `${word.slug}__${word.word}`;
    if (current.some((w) => `${w.slug}__${w.word}` === key)) return;
    const updated = [...current, word];
    setSavedWords(updated);
    setSavedWordsState(updated);
  }, []);

  const unsaveWord = useCallback((slug: string, word: string) => {
    const current = getSavedWords();
    const updated = current.filter((w) => !(w.slug === slug && w.word === word));
    setSavedWords(updated);
    setSavedWordsState(updated);
  }, []);

  const isSaved = useCallback(
    (slug: string, word: string) =>
      savedWords.some((w) => w.slug === slug && w.word === word),
    [savedWords]
  );

  return { savedWords, saveWord, unsaveWord, isSaved };
}
