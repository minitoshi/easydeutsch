import { getStoryBySlug, getAllStorySlugs } from '@/lib/stories';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VocabCard } from '@/components/VocabCard';
import { LevelBadge } from '@/components/LevelBadge';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllStorySlugs().map((slug) => ({ slug }));
}

export default async function VocabularyPage({ params }: PageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/story/${story.slug}`}
            className="text-gray-400 hover:text-black transition-colors p-1 -ml-1 rounded-lg"
            aria-label="Back to story"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-medium text-gray-500 truncate">Keywords</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-2">
          <LevelBadge level={story.level} size="md" />
        </div>
        <h1 className="text-xl font-bold text-black mb-1">{story.title}</h1>
        <p className="text-sm text-gray-400 mb-8">
          {story.vocabulary.length} key words from this story
        </p>

        <div className="flex flex-col gap-3">
          {story.vocabulary.map((word, i) => (
            <VocabCard key={i} word={word} storySlug={story.slug} />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={`/story/${story.slug}`}
            className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-gray-900 text-gray-600 hover:text-black font-medium py-3 px-6 rounded-2xl transition-colors text-[15px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to story
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-black transition-colors">
            Browse all stories
          </Link>
        </div>
      </main>
    </div>
  );
}
