'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSavedWords } from '@/hooks/useSavedWords';
import { FlashCard } from '@/components/FlashCard';
import { SavedWord } from '@/lib/types';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function ReviewPage() {
  const { savedWords } = useSavedWords();
  const [deck, setDeck] = useState<SavedWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setDeck(savedWords);
  }, [savedWords]);

  const currentWord = deck[index] ?? null;

  const goNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(i + 1, deck.length - 1)), 150);
  }, [deck.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150);
  }, []);

  const handleShuffle = useCallback(() => {
    setDeck((d) => shuffleArray(d));
    setIndex(0);
    setFlipped(false);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  if (deck.length === 0 && savedWords.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-400 hover:text-black transition-colors p-1 -ml-1 rounded-lg"
              aria-label="Back to home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-medium text-gray-500">Flashcard Review</span>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-xl font-bold text-black mb-2">No saved words yet</p>
          <p className="text-gray-500 text-sm mb-8 max-w-xs">
            Save words while reading stories — then come back here to review them as flashcards.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Browse stories
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/saved"
            className="text-gray-400 hover:text-black transition-colors p-1 -ml-1 rounded-lg"
            aria-label="Back to saved words"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-medium text-gray-500 flex-1">Flashcard Review</span>
          <button
            onClick={handleShuffle}
            className="text-xs font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1 border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-900"
            aria-label="Shuffle cards"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Shuffle
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-400">
            Card <span className="font-semibold text-black">{index + 1}</span> of{' '}
            <span className="font-semibold text-black">{deck.length}</span>
          </span>
          <div className="flex-1 mx-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / deck.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        {currentWord && (
          <div className="flex-1 flex flex-col justify-center">
            <FlashCard word={currentWord} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 gap-2 sm:gap-4">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-900 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={() => setFlipped((f) => !f)}
            className="flex-1 sm:flex-none px-5 py-3 sm:py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {flipped ? 'Hide' : 'Reveal'}
          </button>

          <button
            onClick={goNext}
            disabled={index === deck.length - 1}
            className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-900 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="hidden sm:block text-center text-xs text-gray-300 mt-4">
          Space / Enter to flip · Arrow keys to navigate
        </p>
      </main>
    </div>
  );
}
