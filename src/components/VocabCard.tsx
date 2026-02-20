'use client';

import { VocabWord } from '@/lib/types';
import { LevelBadge } from './LevelBadge';
import { useSavedWords } from '@/hooks/useSavedWords';
import { speakGerman } from '@/lib/tts';

const ARTICLE_COLORS: Record<string, string> = {
  der: '#ef4444',
  die: '#eab308',
  das: '#3b82f6',
};

interface VocabCardProps {
  word: VocabWord;
  storySlug: string;
}

export function VocabCard({ word, storySlug }: VocabCardProps) {
  const { saveWord, unsaveWord, isSaved } = useSavedWords();
  const saved = isSaved(storySlug, word.word);

  const articleColor = word.article ? ARTICLE_COLORS[word.article] : undefined;

  function handleToggle() {
    if (saved) {
      unsaveWord(storySlug, word.word);
    } else {
      saveWord({
        slug: storySlug,
        word: word.word,
        article: word.article,
        type: word.type,
        level: word.level,
        meaning: word.meaning,
      });
    }
  }

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={word.level} />
            {word.article && (
              <span className="text-sm font-semibold" style={{ color: articleColor }}>
                {word.article}
              </span>
            )}
            <span className="font-semibold text-black text-[16px]">
              {word.article ? word.word.replace(new RegExp(`^${word.article}\\s+`, 'i'), '') : word.word}
            </span>
            <span className="text-sm text-gray-400">— {word.type}</span>
          </div>
          <p className="mt-1.5 text-gray-600 text-[15px]">{word.meaning}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => speakGerman(word.word)}
            aria-label="Pronounce word"
            className="p-1 rounded-lg text-gray-400 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9.172 9.172a4 4 0 000 5.656" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
          </button>
          <button
            onClick={handleToggle}
            aria-label={saved ? 'Remove from saved words' : 'Save word'}
            className="p-1 rounded-lg text-gray-400 hover:text-black transition-colors"
          >
          <svg
            className="w-5 h-5"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
