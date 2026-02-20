'use client';

import { useState } from 'react';
import { Sentence } from '@/lib/types';

interface SentenceBlockProps {
  sentence: Sentence;
  index: number;
  fontSizeClass?: string;
}

export function SentenceBlock({ sentence, index, fontSizeClass = 'text-[17px]' }: SentenceBlockProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="py-3">
      <button
        onClick={() => setRevealed((prev) => !prev)}
        className="w-full text-left group"
        aria-label={revealed ? 'Hide translation' : 'Show translation'}
      >
        <p className={`${fontSizeClass} leading-relaxed text-black font-normal group-hover:opacity-70 transition-opacity cursor-pointer select-text`}>
          {sentence.de}
        </p>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          revealed ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-[15px] leading-relaxed text-gray-500 italic font-normal">
          {sentence.en}
        </p>
      </div>
    </div>
  );
}
