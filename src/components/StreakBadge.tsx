'use client';

import { useStreak } from '@/hooks/useStreak';

export function StreakBadge() {
  const { streak } = useStreak();

  if (streak === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
      🔥 <span>{streak}</span>
      <span className="hidden sm:inline text-xs font-normal text-gray-400">{streak === 1 ? 'day' : 'days'}</span>
    </span>
  );
}
