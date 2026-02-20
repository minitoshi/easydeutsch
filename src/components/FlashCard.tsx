'use client';

import { SavedWord } from '@/lib/types';
import { speakGerman } from '@/lib/tts';

const ARTICLE_COLORS: Record<string, string> = {
  der: '#ef4444',
  die: '#eab308',
  das: '#3b82f6',
};

interface FlashCardProps {
  word: SavedWord;
  flipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ word, flipped, onFlip }: FlashCardProps) {
  const articleColor = word.article ? ARTICLE_COLORS[word.article] : '#6b7280';
  const bareWord = word.article
    ? word.word.replace(new RegExp(`^${word.article}\\s+`, 'i'), '')
    : word.word;

  return (
    <div
      className="w-full cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '260px',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-3xl border border-gray-100 bg-white flex flex-col items-center justify-center p-6 sm:p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {word.article && (
            <span
              className="text-sm font-semibold mb-2"
              style={{ color: articleColor }}
            >
              {word.article}
            </span>
          )}
          <span className="text-3xl sm:text-4xl font-bold text-black text-center leading-tight break-words w-full text-center">
            {bareWord}
          </span>
          <span className="mt-3 text-sm text-gray-400">{word.type}</span>
          <button
            onClick={(e) => { e.stopPropagation(); speakGerman(word.word); }}
            aria-label="Pronounce word"
            className="mt-6 p-2 rounded-full text-gray-300 hover:text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
            </svg>
          </button>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center p-6 sm:p-8"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: word.article ? articleColor : '#e5e7eb',
            backgroundColor: 'white',
          }}
        >
          {word.article && (
            <span
              className="text-sm font-semibold mb-2"
              style={{ color: articleColor }}
            >
              {word.article} {bareWord}
            </span>
          )}
          <p className="text-xl sm:text-2xl font-semibold text-black text-center leading-snug">
            {word.meaning}
          </p>
          <span className="mt-6 text-xs text-gray-300">tap to go back</span>
        </div>
      </div>
    </div>
  );
}
