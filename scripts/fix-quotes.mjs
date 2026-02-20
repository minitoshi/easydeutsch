/**
 * Fixes broken JSON story files where German open quote „ (U+201E) was introduced
 * but the closing " was left as ASCII (U+0022), prematurely ending the JSON string.
 *
 * Pattern to fix: „text" → \"text\"  (escaped ASCII quotes, valid in JSON)
 * Also fixes: \\„ (stray backslash before German quote) → \"
 */
import { readFileSync, writeFileSync } from 'fs';

const broken = [
  'buch-fuer-alle-kinder.json',
  'das-kaffeehausgesprach.json',
  'der-neue-nachbar.json',
  'deutscher-expressionismus.json',
  'heideggers-dasein.json',
  'introversion-in-einer-extrovertieren-welt.json',
  'konstruktiver-journalismus.json',
  'neue-baeckerei-in-der-stadt.json',
  'quantenverschraenkung.json',
  'recycling-in-deutschland.json',
  'sprache-als-macht.json',
  'stille-post.json',
  'zwischen-zwei-kulturen.json',
];

for (const f of broken) {
  const p = 'src/data/stories/' + f;
  let raw = readFileSync(p, 'utf-8');

  // Fix stray backslash before German open quote: \„ → \"
  raw = raw.replace(/\\„/g, '\\"');

  // Fix: German open quote + content (no " or \) + ASCII close quote
  // „text" → \"text\"
  // The closing " here is the ASCII U+0022 that's breaking JSON
  // We match: „ followed by non-quote chars, followed by "
  raw = raw.replace(/„([^"\\]*(?:\\.[^"\\]*)*?)"/g, '\\"$1\\"');

  // Also fix German close quote U+201D if any remain
  raw = raw.replace(/\u201d/g, '\\"');

  try {
    JSON.parse(raw);
    writeFileSync(p, raw);
    console.log('✓ fixed: ' + f);
  } catch (e) {
    console.error('✗ still broken: ' + f, e.message);
    const m = e.message.match(/position (\d+)/);
    if (m) {
      const pos = parseInt(m[1], 10);
      console.error('  context:', JSON.stringify(raw.slice(Math.max(0, pos - 30), pos + 50)));
    }
  }
}
