/**
 * check-german.ts
 *
 * Checks every story's German sentences against the LanguageTool public API.
 * No API key required. Free tier: ~20 requests/minute.
 *
 * Usage:
 *   npx tsx scripts/check-german.ts              # check all stories
 *   npx tsx scripts/check-german.ts --file slug  # check one story by slug
 *   npx tsx scripts/check-german.ts --limit 20   # check first 20 stories
 *   npx tsx scripts/check-german.ts --report     # write report to check-report.json
 *
 * Output: prints any grammar/style issues found, then a summary.
 */

import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Sentence {
  de: string;
  en: string;
}

interface Story {
  id: string;
  slug: string;
  title: string;
  level: string;
  sentences: Sentence[];
}

interface LTMatch {
  message: string;
  shortMessage: string;
  replacements: { value: string }[];
  offset: number;
  length: number;
  context: { text: string; offset: number; length: number };
  rule: { id: string; description: string; issueType: string };
}

interface LTResponse {
  matches: LTMatch[];
}

interface StoryReport {
  id: string;
  slug: string;
  title: string;
  level: string;
  issues: IssueReport[];
}

interface IssueReport {
  sentence: string;
  message: string;
  context: string;
  suggestion: string;
  ruleId: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const STORIES_DIR = path.join(process.cwd(), "src/data/stories");
const LT_API = "https://api.languagetool.org/v2/check";
const DELAY_MS = 3500; // stay well under 20 req/min on free tier

// Rules that fire constantly on learner content and add noise
// (e.g. OXFORD_COMMA equivalent rules, style-only suggestions we don't need)
const IGNORED_RULE_IDS = new Set([
  "GERMAN_SPELLER_RULE",          // spell checker — catches proper nouns / loanwords
  "CONSECUTIVE_SPACES",
  "WHITESPACE_RULE",
  "UNPAIRED_BRACKETS",
  "EN_QUOTES",                    // fires on English words inside German text
  "PUNCTUATION_PARAGRAPH_END",
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { file: "", limit: 0, report: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file") result.file = args[i + 1] ?? "";
    if (args[i] === "--limit") result.limit = parseInt(args[i + 1] ?? "0", 10);
    if (args[i] === "--report") result.report = true;
  }
  return result;
}

function loadStories(opts: ReturnType<typeof parseArgs>): Story[] {
  const files = fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith(".json"));

  let stories: Story[] = files.flatMap((f) => {
    try {
      return [JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), "utf-8")) as Story];
    } catch {
      console.error(`  ⚠ Could not parse ${f}`);
      return [];
    }
  });

  // Sort by numeric id
  stories.sort((a, b) => Number(a.id) - Number(b.id));

  if (opts.file) {
    stories = stories.filter((s) => s.slug === opts.file);
    if (!stories.length) {
      console.error(`No story found with slug "${opts.file}"`);
      process.exit(1);
    }
  }

  if (opts.limit > 0) stories = stories.slice(0, opts.limit);

  return stories;
}

async function checkText(text: string): Promise<LTMatch[]> {
  const body = new URLSearchParams({
    text,
    language: "de-DE",
    enabledOnly: "false",
    level: "picky", // catches more naturalness issues
  });

  const res = await fetch(LT_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`LanguageTool API error ${res.status}: ${msg}`);
  }

  const data = (await res.json()) as LTResponse;
  return data.matches.filter((m) => !IGNORED_RULE_IDS.has(m.rule.id));
}

function highlight(context: LTMatch["context"]): string {
  const { text, offset, length } = context;
  const before = text.slice(0, offset);
  const problem = text.slice(offset, offset + length);
  const after = text.slice(offset + length);
  return `${before}[${problem}]${after}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();
  const stories = loadStories(opts);

  console.log(`\nChecking ${stories.length} stor${stories.length === 1 ? "y" : "ies"} with LanguageTool...\n`);

  let totalIssues = 0;
  let cleanStories = 0;
  const reports: StoryReport[] = [];

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    const text = story.sentences.map((s) => s.de).join("\n");

    process.stdout.write(
      `[${String(i + 1).padStart(3)}/${stories.length}] #${story.id} ${story.slug} (${story.level}) ... `
    );

    let matches: LTMatch[];
    try {
      matches = await checkText(text);
    } catch (err) {
      console.error(`\n  ✗ API error: ${(err as Error).message}`);
      // Back off and retry once
      await sleep(10_000);
      try {
        matches = await checkText(text);
      } catch {
        console.error("  ✗ Retry failed, skipping.");
        await sleep(DELAY_MS);
        continue;
      }
    }

    if (matches.length === 0) {
      console.log("✓ clean");
      cleanStories++;
    } else {
      console.log(`${matches.length} issue${matches.length > 1 ? "s" : ""}`);
      totalIssues += matches.length;

      const issueReports: IssueReport[] = [];

      for (const m of matches) {
        const suggestion = m.replacements.slice(0, 3).map((r) => r.value).join(" / ") || "—";
        console.log(`    ⚠ ${m.message}`);
        console.log(`      Context : ${highlight(m.context)}`);
        console.log(`      Suggest : ${suggestion}`);
        console.log(`      Rule    : ${m.rule.id}`);
        issueReports.push({
          sentence: story.sentences.find((s) =>
            s.de.includes(m.context.text.slice(m.context.offset, m.context.offset + m.context.length))
          )?.de ?? m.context.text,
          message: m.message,
          context: highlight(m.context),
          suggestion,
          ruleId: m.rule.id,
        });
      }

      reports.push({
        id: story.id,
        slug: story.slug,
        title: story.title,
        level: story.level,
        issues: issueReports,
      });
    }

    // Rate-limit: don't hammer the free API
    if (i < stories.length - 1) await sleep(DELAY_MS);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────");
  console.log(`Stories checked : ${stories.length}`);
  console.log(`Clean           : ${cleanStories}`);
  console.log(`With issues     : ${stories.length - cleanStories}`);
  console.log(`Total issues    : ${totalIssues}`);
  console.log("─────────────────────────────────────────────\n");

  if (opts.report && reports.length > 0) {
    const reportPath = path.join(process.cwd(), "check-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
    console.log(`Report saved to ${reportPath}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
