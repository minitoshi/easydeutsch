const READ_KEY = 'easydeutsch_read';

export function getReadSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAsRead(slug: string): void {
  if (typeof window === 'undefined') return;
  const current = getReadSlugs();
  if (!current.includes(slug)) {
    localStorage.setItem(READ_KEY, JSON.stringify([...current, slug]));
  }
}

export function isRead(slug: string): boolean {
  return getReadSlugs().includes(slug);
}

export function getTotalRead(): number {
  return getReadSlugs().length;
}
