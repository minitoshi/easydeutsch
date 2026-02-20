import Link from 'next/link';
import { StoryMeta } from '@/lib/types';
import { LevelBadge } from './LevelBadge';

const CATEGORY_ICONS: Record<string, string> = {
  news: '📰',
  story: '📖',
  poem: '🌸',
  blog: '✍️',
  journal: '📓',
  science: '🔬',
  culture: '🏛️',
};

interface StoryCardProps {
  story: StoryMeta;
  isRead: boolean;
}

export function StoryCard({ story, isRead }: StoryCardProps) {
  return (
    <Link href={`/story/${story.slug}`} className="block group">
      <div className="relative bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-900 transition-all duration-200">
        {isRead && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 text-xs text-gray-900 font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Read
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{CATEGORY_ICONS[story.category] ?? '📄'}</span>
          <LevelBadge level={story.level} />
          <span className="text-xs text-gray-400 capitalize">{story.category}</span>
        </div>

        <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-black transition-colors pr-8">
          {story.title}
        </h3>

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{story.sentenceCount} sentences</span>
          <span>·</span>
          <span>{story.vocabCount} words</span>
        </div>
      </div>
    </Link>
  );
}
