'use client';

import { useState, useEffect } from 'react';
import { StreakData } from '@/lib/types';

const STORAGE_KEY = 'easydeutsch_streak';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStreak(): StreakData {
  if (typeof window === 'undefined') return { lastVisit: todayISO(), count: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lastVisit: todayISO(), count: 1 };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { lastVisit: todayISO(), count: 1 };
  }
}

function computeStreak(stored: StreakData): StreakData {
  const today = todayISO();
  if (stored.lastVisit === today) {
    // Same day — no change
    return stored;
  } else if (stored.lastVisit === yesterdayISO()) {
    // Visited yesterday — increment
    return { lastVisit: today, count: stored.count + 1 };
  } else {
    // Missed a day — reset
    return { lastVisit: today, count: 1 };
  }
}

export function useStreak() {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const stored = loadStreak();
    const updated = computeStreak(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setStreak(updated.count);
  }, []);

  return { streak };
}
