'use client';

import Link from 'next/link';
import { useSavedWords } from '@/hooks/useSavedWords';
import { LevelBadge } from '@/components/LevelBadge';
import { CEFRLevel, SavedWord } from '@/lib/types';

const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const ARTICLE_COLORS: Record<string, { bg: string; text: string }> = {
  der: { bg: '#fef2f2', text: '#ef4444' },
  die: { bg: '#fefce8', text: '#eab308' },
  das: { bg: '#eff6ff', text: '#3b82f6' },
};

function ArticleBadge({ article }: { article: 'der' | 'die' | 'das' }) {
  const colors = ARTICLE_COLORS[article];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {article}
    </span>
  );
}

function SavedWordRow({ word, onUnsave }: { word: SavedWord; onUnsave: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border border-gray-100 rounded-2xl p-4 bg-white">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {word.article && <ArticleBadge article={word.article} />}
          <span className="font-semibold text-black text-[16px]">{word.word}</span>
          <span className="text-sm text-gray-400">— {word.type}</span>
        </div>
        <p className="mt-1.5 text-gray-600 text-[15px]">{word.meaning}</p>
        <p className="mt-1 text-xs text-gray-400">
          from{' '}
          <Link href={`/story/${word.slug}/vocabulary`} className="underline hover:text-black transition-colors">
            {word.slug.replace(/-/g, ' ')}
          </Link>
        </p>
      </div>
      <button
        onClick={onUnsave}
        aria-label="Remove from saved words"
        className="shrink-0 p-1 rounded-lg text-black hover:text-gray-400 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    </div>
  );
}

export default function SavedPage() {
  const { savedWords, unsaveWord } = useSavedWords();

  const groupedByLevel = LEVEL_ORDER.reduce<Record<CEFRLevel, SavedWord[]>>(
    (acc, level) => {
      acc[level] = savedWords.filter((w) => w.level === level);
      return acc;
    },
    {} as Record<CEFRLevel, SavedWord[]>
  );

  const hasWords = savedWords.length > 0;

  return (
    <div className="min-h-screen bg-white">
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
          <span className="text-sm font-medium text-gray-500 flex-1">Saved Words</span>
          {hasWords && (
            <Link
              href="/review"
              className="text-xs font-medium bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
            >
              Review cards →
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {!hasWords ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔖</p>
            <p className="text-lg font-medium text-gray-700 mb-2">No saved words yet</p>
            <p className="text-sm mb-6">
              While reading stories, tap the bookmark on any word to save it here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
            >
              Browse stories
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-black">
                {savedWords.length} saved {savedWords.length === 1 ? 'word' : 'words'}
              </h1>
            </div>

            {LEVEL_ORDER.map((level) => {
              const words = groupedByLevel[level];
              if (words.length === 0) return null;
              return (
                <div key={level} className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <LevelBadge level={level} size="md" />
                    <span className="text-sm text-gray-400">{words.length} {words.length === 1 ? 'word' : 'words'}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {words.map((word, i) => (
                      <SavedWordRow
                        key={i}
                        word={word}
                        onUnsave={() => unsaveWord(word.slug, word.word)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
