'use client';

export type FontSize = 'sm' | 'md' | 'lg';

const STORAGE_KEY = 'easydeutsch_fontsize';

export function loadFontSize(): FontSize {
  if (typeof window === 'undefined') return 'md';
  return (localStorage.getItem(STORAGE_KEY) as FontSize) ?? 'md';
}

export function saveFontSize(size: FontSize): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, size);
}

export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-[15px]',
  md: 'text-[17px]',
  lg: 'text-[20px]',
};

const SIZES: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'A' },
  { value: 'md', label: 'A' },
  { value: 'lg', label: 'A' },
];

interface FontSizeToggleProps {
  current: FontSize;
  onChange: (size: FontSize) => void;
}

export function FontSizeToggle({ current, onChange }: FontSizeToggleProps) {
  return (
    <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
      {SIZES.map(({ value, label }, i) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          aria-label={`Font size ${value}`}
          className={`px-2.5 py-2 transition-colors ${
            current === value ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
          } ${i === 0 ? 'text-xs' : i === 1 ? 'text-sm' : 'text-base'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
