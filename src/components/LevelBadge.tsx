import { CEFRLevel } from '@/lib/types';

interface LevelBadgeProps {
  level: CEFRLevel;
  size?: 'sm' | 'md';
}

export function LevelBadge({ level, size = 'sm' }: LevelBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border border-gray-300 text-gray-600 bg-white ${sizeClass}`}
    >
      {level}
    </span>
  );
}
