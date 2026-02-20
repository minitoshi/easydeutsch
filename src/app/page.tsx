'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StoryCard } from '@/components/StoryCard';
import { StreakBadge } from '@/components/StreakBadge';
import { filterMeta, CATEGORIES, LEVEL_ORDER, ALL_STORIES_META } from '@/lib/meta';
import { useProgress } from '@/hooks/useProgress';
import { CEFRLevel, StoryCategory } from '@/lib/types';

const ALL_LEVELS: (CEFRLevel | 'all')[] = ['all', ...LEVEL_ORDER];

export default function HomePage() {
  const [level, setLevel] = useState<CEFRLevel | 'all'>('all');
  const [category, setCategory] = useState<StoryCategory | 'all'>('all');
  const { isRead, totalRead } = useProgress();

  const stories = filterMeta(level, category);
  const totalStories = ALL_STORIES_META.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇩🇪</span>
            <span className="font-bold text-black text-lg tracking-tight">EasyDeutsch</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <StreakBadge />
            <Link
              href="/saved"
              className="p-2 text-gray-500 hover:text-black transition-colors"
              aria-label="Saved words"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Link>
            <Link
              href="/review"
              className="p-2 text-gray-500 hover:text-black transition-colors"
              aria-label="Flashcard review"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Link>
            <Link
              href="/bubbles"
              className="p-2 text-gray-500 hover:text-black transition-colors"
              aria-label="Bubble Pop game"
            >
              <span className="text-lg leading-none">🫧</span>
            </Link>
            <span className="text-xs sm:text-sm whitespace-nowrap">
              <span className="font-semibold text-black">{totalRead}</span>
              <span className="text-gray-400">/{totalStories}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Learn German Through Reading
          </h1>
          <p className="text-gray-500 text-[15px]">
            Short stories in German — click any sentence to reveal the English translation.
          </p>
        </div>

        {/* Progress bar */}
        {totalRead > 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Your progress</span>
              <span className="text-black font-semibold">
                {Math.round((totalRead / totalStories) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${(totalRead / totalStories) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Level filter */}
        <div className="flex gap-2 flex-wrap mb-3">
          {ALL_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                level === l
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
              }`}
            >
              {l === 'all' ? 'All levels' : l}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-4">
          {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </p>

        {/* Story grid */}
        {stories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>No stories found for this filter.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {stories.map((story) => (
              <StoryCard key={story.slug} story={story} isRead={isRead(story.slug)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
