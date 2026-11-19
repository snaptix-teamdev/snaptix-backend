/**
 * Builds a Markdown summary of unit test results and total test coverage.
 * Reads coverage/test-results.json (jest --json) and coverage/coverage-summary.json (jest "json-summary" reporter).
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
const TEST_RESULTS_FILE = 'coverage/test-results.json';
const OUTPUT_FILE = 'coverage/summary.md';
const MAX_LISTED_FAILURES = 10;
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
type TestResults = {
  success: boolean;
  startTime: number;
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numPendingTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  snapshot: { total: number };
  testResults: {
    name: string;
    status: string;
    message: string;
    endTime: number;
    assertionResults: { status: string; fullName: string }[];
  }[];
};

function env(name: string): string | undefined {
  return process.env[name] || undefined;
}

const relativePath = (path: string): string =>
  path.replace(`${process.cwd()}/`, '');
// Terminal color codes in jest messages; ESC is built with fromCharCode to keep a control character out of the regex literal
const ANSI_COLOR = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const stripAnsi = (text: string): string => text.replace(ANSI_COLOR, '');

/** Failed tests, plus suites that failed to run at all (e.g. a TypeScript error) */
function listFailures(results: TestResults): string[] {
  const failures = results.testResults.flatMap((suite) => {
    const failedTests = suite.assertionResults.filter(
      (test) => test.status === 'failed',
    );
    if (failedTests.length > 0) {
      return failedTests.map(
        (test) => `- \`${relativePath(suite.name)}\` › ${test.fullName}`,
      );
    }
    if (suite.status !== 'failed') return [];
    const reason = stripAnsi(suite.message)
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('●'));
    return [
      `- \`${relativePath(suite.name)}\`: test suite failed to run${reason ? ` — ${reason}` : ''}`,
    ];
  });
  const hidden = failures.length - MAX_LISTED_FAILURES;
  return [
    ...failures.slice(0, MAX_LISTED_FAILURES),
    ...(hidden > 0 ? [`- …and ${hidden} more (see the workflow run log)`] : []),
  ];
}

function buildTests(): string[] {
  if (!existsSync(TEST_RESULTS_FILE)) {
    return [
      '### Tests',
      '',
      'No test results: verify failed before the unit tests ran.',
    ];
  }
  const results = JSON.parse(
    readFileSync(TEST_RESULTS_FILE, 'utf8'),
  ) as TestResults;
  const endTime = Math.max(
    results.startTime,
    ...results.testResults.map((suite) => suite.endTime),
  );
  const seconds = ((endTime - results.startTime) / 1000).toFixed(1);
  const failures = listFailures(results);
  return [
    `### Tests ${results.success ? '✅ passed' : '❌ failed'}`,
    '',
    '| | Passed | Failed | Skipped | Total |',
    '| --- | --- | --- | --- | --- |',
    `| Test suites | ${results.numPassedTestSuites} | ${results.numFailedTestSuites} | ${results.numPendingTestSuites} | ${results.numTotalTestSuites} |`,
    `| Tests | ${results.numPassedTests} | ${results.numFailedTests} | ${results.numPendingTests + results.numTodoTests} | ${results.numTotalTests} |`,
    '',
    `Snapshots: ${results.snapshot.total} total · Test run time: ${seconds} s (without coverage collection)`,
    ...(failures.length > 0 ? ['', '**Failed:**', '', ...failures] : []),
  ];
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
    '## Unit tests and coverage',
    '',
    ...(sha ? [`Commit: \`${sha.slice(0, 7)}\``, ''] : []),
    ...buildTests(),
    '',
    '### Coverage',
    '',
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
