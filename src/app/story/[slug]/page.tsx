import { getStoryBySlug, getAllStorySlugs } from '@/lib/stories';
import { notFound } from 'next/navigation';
import { StoryReader } from '@/components/StoryReader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllStorySlugs().map((slug) => ({ slug }));
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();
  return <StoryReader story={story} />;
}
