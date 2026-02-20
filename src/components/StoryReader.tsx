'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Story } from '@/lib/types';
import { SentenceBlock } from './SentenceBlock';
import { LevelBadge } from './LevelBadge';
import { FontSizeToggle, FontSize, loadFontSize, saveFontSize, FONT_SIZE_CLASSES } from './FontSizeToggle';
import { useProgress } from '@/hooks/useProgress';

const CATEGORY_ICONS: Record<string, string> = {
  news: '📰',
  story: '📖',
  poem: '🌸',
  blog: '✍️',
  journal: '📓',
  science: '🔬',
  culture: '🏛️',
};

interface StoryReaderProps {
  story: Story;
}

export function StoryReader({ story }: StoryReaderProps) {
  const { markRead, isRead } = useProgress();
  const [fontSize, setFontSize] = useState<FontSize>('md');

  useEffect(() => {
    setFontSize(loadFontSize());
  }, []);

  useEffect(() => {
    markRead(story.slug);
  }, [story.slug, markRead]);

  function handleFontSizeChange(size: FontSize) {
    setFontSize(size);
    saveFontSize(size);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-black transition-colors p-1 -ml-1 rounded-lg"
            aria-label="Back to stories"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-medium text-gray-500 flex-1 truncate">{story.title}</span>
          <FontSizeToggle current={fontSize} onChange={handleFontSizeChange} />
          {isRead(story.slug) && (
            <span className="text-xs text-black font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Read
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <LevelBadge level={story.level} size="md" />
          <span className="text-sm text-gray-400 capitalize">
            {CATEGORY_ICONS[story.category]} {story.category}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-black mb-6 leading-snug">{story.title}</h1>

        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tap any sentence to reveal its English translation
        </p>

        <div className="divide-y divide-gray-100">
          {story.sentences.map((sentence, i) => (
            <SentenceBlock key={i} sentence={sentence} index={i} fontSizeClass={FONT_SIZE_CLASSES[fontSize]} />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={`/story/${story.slug}/vocabulary`}
            className="flex items-center justify-center gap-3 w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-2xl transition-colors text-[15px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Memorize keywords
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-black transition-colors">
            ← Back to all stories
          </Link>
        </div>
      </main>
    </div>
  );
}
