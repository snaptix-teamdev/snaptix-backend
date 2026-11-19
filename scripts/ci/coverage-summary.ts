/**
 * Builds a Markdown summary of the total test coverage.
 * Reads coverage/coverage-summary.json (jest "json-summary" reporter).
 *
 * Output:
 *   - coverage/summary.md — always (CI posts it as a PR comment)
 *   - GitHub Actions run summary — when GITHUB_STEP_SUMMARY is set, otherwise stdout
 *
 * Optional env (set by CI): ARTIFACT_URL — download link of the HTML report,
 * RUN_URL — link to the workflow run, COMMIT_SHA — commit the coverage belongs to.
 *
 * Usage: ts-node scripts/ci/coverage-summary.ts
 */
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import * as process from 'node:process';

const SUMMARY_FILE = 'coverage/coverage-summary.json';
const OUTPUT_FILE = 'coverage/summary.md';
// Hidden marker: lets CI find and update its own comment instead of adding a new one on every push
export const COMMENT_MARKER = '<!-- coverage-report -->';
const METRICS = [
  ['lines', 'Lines'],
  ['statements', 'Statements'],
  ['branches', 'Branches'],
  ['functions', 'Functions'],
] as const;

type Metric = { total: number; covered: number; pct: number };
type Summary = { total: Record<(typeof METRICS)[number][0], Metric> };

function env(name: string): string | undefined {
  return process.env[name] || undefined;
}

function buildTable(): string[] {
  if (!existsSync(SUMMARY_FILE)) {
    return ['No coverage report: tests did not reach the coverage step.'];
  }
  const { total } = JSON.parse(readFileSync(SUMMARY_FILE, 'utf8')) as Summary;
  return [
    '| Metric | Coverage | Covered / Total |',
    '| --- | --- | --- |',
    ...METRICS.map(
      ([key, label]) =>
        `| ${label} | ${total[key].pct}% | ${total[key].covered} / ${total[key].total} |`,
    ),
  ];
}

function buildLinks(): string[] {
  const artifactUrl = env('ARTIFACT_URL');
  const runUrl = env('RUN_URL');
  const links: string[] = [];
  if (artifactUrl) {
    links.push(
      `📦 [Download HTML report](${artifactUrl}) (zip, kept 5 days): unzip and open \`index.html\`.`,
    );
  }
  if (runUrl) links.push(`🔗 [Workflow run](${runUrl})`);
  return links;
}

function buildMarkdown(): string {
  const sha = env('COMMIT_SHA');
  return [
    COMMENT_MARKER,
    '## Test coverage',
    '',
    ...(sha ? [`Commit: \`${sha.slice(0, 7)}\``, ''] : []),
    ...buildTable(),
    '',
    ...buildLinks(),
    '',
  ].join('\n');
}

const markdown = buildMarkdown();
mkdirSync('coverage', { recursive: true });
writeFileSync(OUTPUT_FILE, markdown);

const stepSummary = env('GITHUB_STEP_SUMMARY');
if (stepSummary) {
  appendFileSync(stepSummary, markdown);
} else {
  console.log(markdown);
}
