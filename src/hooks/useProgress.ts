'use client';

import { useState, useEffect, useCallback } from 'react';
import { getReadSlugs, markAsRead, getTotalRead } from '@/lib/progress';

export function useProgress() {
  const [readSlugs, setReadSlugs] = useState<string[]>([]);

  useEffect(() => {
    setReadSlugs(getReadSlugs());
  }, []);

  const markRead = useCallback((slug: string) => {
    markAsRead(slug);
    setReadSlugs(getReadSlugs());
  }, []);

  return {
    readSlugs,
    isRead: (slug: string) => readSlugs.includes(slug),
    markRead,
    totalRead: readSlugs.length,
    totalStories: 20,
  };
}
