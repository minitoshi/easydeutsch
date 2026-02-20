'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DICT from '@/data/dictionary.json';

// ── Types ────────────────────────────────────────────────

interface DictEntry {
  w: string;
  a?: string;
  m: string;
}

interface Bubble {
  id: number;
  entry: DictEntry;
  /** bubble centre in px from left */
  x: number;
  /** bubble centre in px from top */
  y: number;
  /** px to move upward per tick */
  vy: number;
  /** base x for sway */
  swayBase: number;
  /** sway amplitude in px */
  swayAmp: number;
  /** sway frequency in rad/ms */
  swayFreq: number;
  /** creation timestamp for sway phase */
  startMs: number;
  size: number;
  state: 'floating' | 'popped';
  poppedX?: number;
  poppedY?: number;
}

// ── Constants ─────────────────────────────────────────────

const ARTICLE_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  der:  { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  die:  { bg: '#fef9c3', border: '#eab308', text: '#713f12' },
  das:  { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
  none: { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
};

const TICK_MS = 33; // ~30 fps

// ── Helpers ───────────────────────────────────────────────

function bubbleSize(word: string): number {
  const len = word.length;
  if (len <= 4)  return 75;
  if (len <= 7)  return 85;
  if (len <= 10) return 95;
  return Math.min(105, 95 + (len - 10) * 1.5);
}

let nextId = 1;

function newBubble(vw: number, vh: number, startY?: number): Bubble {
  const entry = (DICT as DictEntry[])[Math.floor(Math.random() * DICT.length)];
  const size  = bubbleSize(entry.w);
  const durationMs = 9000 + Math.random() * 7000;
  const totalDist  = vh + size * 2;
  const vy         = -(totalDist / durationMs) * TICK_MS;
  const swayBase   = size * 0.6 + Math.random() * (vw - size * 1.2);
  const swayAmp    = 12 + Math.random() * 18;
  const swayFreq   = (0.3 + Math.random() * 0.5) * (2 * Math.PI) / 1000;
  return {
    id: nextId++,
    entry,
    x: swayBase,
    y: startY ?? (vh + size),
    vy,
    swayBase,
    swayAmp,
    swayFreq,
    startMs: Date.now(),
    size,
    state: 'floating',
  };
}

// ── Component ─────────────────────────────────────────────

export default function BubblesPage() {
  const [bubbles, setBubbles]   = useState<Bubble[]>([]);
  const [popCount, setPopCount] = useState(0);

  // Bootstrap bubbles and start timers
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Spread 6 initial bubbles across the visible screen
    setBubbles(
      Array.from({ length: 6 }, (_, i) =>
        newBubble(vw, vh, vh * (0.1 + (i / 5) * 0.85))
      )
    );

    // Spawn a new bubble every 2.5 s (cap at 20)
    const spawnTimer = setInterval(() => {
      setBubbles(prev => {
        if (prev.length >= 20) return prev;
        return [...prev, newBubble(window.innerWidth, window.innerHeight)];
      });
    }, 2500);

    // Animation tick: update positions, remove off-screen bubbles
    const tick = setInterval(() => {
      const now = Date.now();
      setBubbles(prev =>
        prev
          .map(b => {
            if (b.state !== 'floating') return b;
            const t = now - b.startMs;
            return {
              ...b,
              y: b.y + b.vy,
              x: b.swayBase + Math.sin(t * b.swayFreq) * b.swayAmp,
            };
          })
          .filter(b => b.state !== 'floating' || b.y > -b.size * 2)
      );
    }, TICK_MS);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(tick);
    };
  }, []);

  // Pop handler
  const popBubble = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    setBubbles(prev =>
      prev.map(b =>
        b.id === id && b.state === 'floating'
          ? { ...b, state: 'popped', poppedX: cx, poppedY: cy }
          : b
      )
    );
    setPopCount(c => c + 1);
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 15000);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a1a2e',
        backgroundImage: 'url(https://media1.tenor.com/m/hNhO4RHmDC8AAAAC/underwater.gif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Inline keyframes for pop animations, with high-specificity !important
          to override Tailwind's prefers-reduced-motion reset */}
      <style>{`
        @keyframes bubble-expand {
          0%   { transform: scale(1); }
          60%  { transform: scale(1.4); }
          100% { transform: scale(1.35); }
        }
        @keyframes bubble-fade {
          0%   { opacity: 1; }
          80%  { opacity: 0.95; }
          100% { opacity: 0; }
        }
        [data-bubble-pop] {
          animation: bubble-expand 0.3s ease-out forwards, bubble-fade 15s ease-in forwards !important;
          animation-duration: 0.3s, 15s !important;
        }
      `}</style>

      {/* ── Header ── */}
      <header
        style={{
          position: 'relative',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#374151',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <span style={{ fontWeight: 700, fontSize: 18 }}>🫧 Bubble Pop</span>

        <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
          {popCount} popped
        </span>
      </header>

      {/* ── Bubbles ── */}
      {bubbles.map(bubble => {
        const colors   = ARTICLE_STYLE[bubble.entry.a ?? 'none'] ?? ARTICLE_STYLE.none;
        const { size } = bubble;
        const fontSize = size < 80 ? 11 : size < 90 ? 12 : size < 100 ? 13 : 14;
        const label    = bubble.entry.a
          ? `${bubble.entry.a} ${bubble.entry.w}`
          : bubble.entry.w;

        if (bubble.state === 'floating') {
          return (
            <button
              key={bubble.id}
              onClick={e => popBubble(bubble.id, e)}
              style={{
                position: 'fixed',
                left: Math.round(bubble.x - size / 2),
                top:  Math.round(bubble.y - size / 2),
                width: size,
                height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.75), ${colors.bg} 65%)`,
                border: `2px solid ${colors.border}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1), inset 0 -3px 8px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 6,
                fontWeight: 600,
                fontSize,
                color: colors.text,
                fontFamily: 'inherit',
                lineHeight: 1.25,
                zIndex: 10,
              }}
              aria-label={`Pop bubble: ${label}`}
            >
              {label}
            </button>
          );
        }

        // ── Popped state ──
        const poppedLeft = (bubble.poppedX ?? 0) - size / 2;
        const poppedTop  = (bubble.poppedY ?? 0) - size / 2;
        return (
          <div
            key={bubble.id}
            data-bubble-pop
            style={{
              position: 'fixed',
              left: poppedLeft,
              top:  poppedTop,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), ${colors.bg} 65%)`,
              border: `2px solid ${colors.border}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 8,
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: fontSize + 1, color: colors.text, lineHeight: 1.2 }}>
              {label}
            </span>
            <span
              style={{
                display: 'block',
                width: '60%',
                height: 1,
                background: colors.border,
                margin: '4px auto',
                opacity: 0.5,
              }}
            />
            <span style={{ fontSize: fontSize - 1, color: '#4b5563', lineHeight: 1.2 }}>
              {bubble.entry.m}
            </span>
          </div>
        );
      })}

      {/* Hint */}
      <p
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 13,
          color: 'rgba(0,0,0,0.35)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Tap a bubble to pop it!
      </p>
    </div>
  );
}
