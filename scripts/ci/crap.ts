/**
 * CRAP (Change Risk Anti-Patterns) per function:
 *   CRAP = complexity² × (1 − coverage)³ + complexity
 * complexity — cyclomatic complexity from the ESLint `complexity` rule,
 * coverage   — share of the function's statements executed by unit tests (coverage/coverage-final.json).
 * A simple, fully tested function stays near its complexity; a complex untested one grows quadratically.
 *
 * Usage (run `pnpm test:cov` first):
 *   ts-node scripts/ci/crap.ts            # report: riskiest functions in the whole codebase
 *   ts-node scripts/ci/crap.ts --changed  # gate: fail if a function touched since the base branch is above the threshold
 *
 * Env: CRAP_THRESHOLD (default 30), CRAP_BASE — branch to compare with in --changed mode (default origin/dev),
 *      CRAP_REPORT_LIMIT — how many functions the report lists (default 15).
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import * as process from 'node:process';
import { ESLint } from 'eslint';
import { parser } from 'typescript-eslint';

const COVERAGE_FILE = 'coverage/coverage-final.json';
const THRESHOLD = Number(process.env['CRAP_THRESHOLD'] ?? 30);
const BASE = process.env['CRAP_BASE'] ?? 'origin/dev';
const REPORT_LIMIT = Number(process.env['CRAP_REPORT_LIMIT'] ?? 15);

type Position = { line: number; column: number | null };
type Range = { start: Position; end: Position };
type FileCoverage = {
  fnMap: Record<string, { decl: Range; loc: Range }>;
  statementMap: Record<string, Range>;
  s: Record<string, number>;
  f: Record<string, number>;
};
type FunctionRisk = {
  file: string;
  name: string;
  line: number;
  endLine: number;
  complexity: number;
  coverage: number;
  crap: number;
};

const crapScore = (complexity: number, coverage: number): number =>
  complexity ** 2 * (1 - coverage) ** 3 + complexity;

const before = (a: Position, b: Position): boolean =>
  a.line < b.line ||
  (a.line === b.line && (a.column ?? 0) <= (b.column ?? Infinity));

function loadCoverage(): Map<string, FileCoverage> {
  if (!existsSync(COVERAGE_FILE)) {
    console.error(`${COVERAGE_FILE} not found. Run "pnpm test:cov" first.`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(COVERAGE_FILE, 'utf8')) as Record<
    string,
    FileCoverage
  >;
  return new Map(
    Object.entries(raw).map(([path, data]) => [
      relative(process.cwd(), path),
      data,
    ]),
  );
}

/**
 * Istanbul function that matches the ESLint function head (head = from the function start to its "(").
 * 1) a declaration inside the head: for methods ESLint starts the head at the decorator or modifier
 *    (`@MessagePattern(...)`, `private`, `async`), istanbul starts the declaration at the method name;
 * 2) otherwise the innermost function whose span (declaration start → body end) contains the head
 *    (arrow functions: ESLint points at "=>", istanbul starts at the parameters).
 */
function findCoveredFunction(coverage: FileCoverage, head: Range) {
  const functions = Object.entries(coverage.fnMap);
  const insideHead = functions
    .filter(
      ([, fn]) =>
        before(head.start, fn.decl.start) && before(fn.decl.start, head.end),
    )
    .sort(([, a], [, b]) => (before(a.decl.start, b.decl.start) ? -1 : 1));
  if (insideHead.length > 0) return insideHead[0];
  return functions
    .filter(
      ([, fn]) =>
        before(fn.decl.start, head.start) && before(head.start, fn.loc.end),
    )
    .sort(([, a], [, b]) => (before(a.decl.start, b.decl.start) ? 1 : -1))[0];
}

function functionCoverage(coverage: FileCoverage, fnId: string): number {
  const body = coverage.fnMap[fnId].loc;
  const ids = Object.keys(coverage.statementMap).filter((id) => {
    const statement = coverage.statementMap[id];
    return (
      before(body.start, statement.start) && before(statement.start, body.end)
    );
  });
  // empty body (e.g. `constructor(private readonly repo: Repo) {}`): covered if it was called
  if (ids.length === 0) return coverage.f[fnId] > 0 ? 1 : 0;
  return ids.filter((id) => coverage.s[id] > 0).length / ids.length;
}

async function measure(
  coverageByFile: Map<string, FileCoverage>,
): Promise<FunctionRisk[]> {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.ts'],
        languageOptions: { parser },
        rules: { complexity: ['warn', 0] },
      },
    ],
  });
  const results = await eslint.lintFiles([...coverageByFile.keys()]);
  const risks: FunctionRisk[] = [];

  for (const result of results) {
    const file = relative(process.cwd(), result.filePath);
    const coverage = coverageByFile.get(file);
    if (!coverage) continue;
    for (const message of result.messages) {
      const match = /^(.*) has a complexity of (\d+)/.exec(message.message);
      if (message.ruleId !== 'complexity' || !match) continue;
      const head: Range = {
        start: { line: message.line, column: message.column - 1 },
        end: {
          line: message.endLine ?? message.line,
          column: (message.endColumn ?? message.column) - 1,
        },
      };
      const found = findCoveredFunction(coverage, head);
      const span: Range = found
        ? { start: found[1].decl.start, end: found[1].loc.end }
        : { start: head.start, end: { line: head.end.line, column: null } };
      const complexity = Number(match[2]);
      // only the body: parameter decorators (`@Payload()`) run at class load and would look "covered"
      const share = found ? functionCoverage(coverage, found[0]) : 0;
      risks.push({
        file,
        name: match[1],
        // from the head start, so that a change in a decorator also counts as a change of the function
        line: Math.min(head.start.line, span.start.line),
        endLine: span.end.line,
        complexity,
        coverage: share,
        crap: crapScore(complexity, share),
      });
    }
  }
  return risks.sort((a, b) => b.crap - a.crap);
}

/** Changed line numbers per file since the merge base with BASE (committed + uncommitted + untracked). */
function changedLines(): Map<string, Set<number> | 'all'> {
  try {
    execSync(`git rev-parse --verify --quiet ${BASE}`, { stdio: 'ignore' });
  } catch {
    console.error(
      `Base branch "${BASE}" not found. Run "git fetch origin" or set CRAP_BASE.`,
    );
    process.exit(1);
  }
  const mergeBase = execSync(`git merge-base ${BASE} HEAD`, {
    encoding: 'utf8',
  }).trim();
  const diff = execSync(`git diff -U0 --no-color ${mergeBase} -- '*.ts'`, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const changes = new Map<string, Set<number> | 'all'>();
  let current: Set<number> | undefined;
  for (const line of diff.split('\n')) {
    const file = /^\+\+\+ b\/(.+)$/.exec(line);
    if (file) {
      current = new Set();
      changes.set(file[1], current);
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk && current) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      for (let i = 0; i < count; i++) current.add(start + i);
    }
  }
  const untracked = execSync(
    `git ls-files --others --exclude-standard -- '*.ts'`,
    {
      encoding: 'utf8',
    },
  );
  untracked
    .split('\n')
    .filter(Boolean)
    .forEach((file) => changes.set(file, 'all'));
  return changes;
}

const touched = (
  risk: FunctionRisk,
  changes: Map<string, Set<number> | 'all'>,
): boolean => {
  const lines = changes.get(risk.file);
  if (!lines) return false;
  if (lines === 'all') return true;
  for (let line = risk.line; line <= risk.endLine; line++)
    if (lines.has(line)) return true;
  return false;
};

const format = (risk: FunctionRisk): string =>
  `${risk.crap.toFixed(1).padStart(6)}  complexity ${String(risk.complexity).padStart(2)}  ` +
  `coverage ${(risk.coverage * 100).toFixed(0).padStart(3)}%  ${risk.file}:${risk.line}  ${risk.name}`;

async function main(): Promise<void> {
  const risks = await measure(loadCoverage());
  const above = risks.filter((risk) => risk.crap > THRESHOLD);

  if (!process.argv.includes('--changed')) {
    console.log(
      `CRAP report: ${risks.length} functions, ${above.length} above ${THRESHOLD}.`,
    );
    console.log(`Top ${REPORT_LIMIT}:`);
    risks.slice(0, REPORT_LIMIT).forEach((risk) => console.log(format(risk)));
    return;
  }

  const changes = changedLines();
  const changed = risks.filter((risk) => touched(risk, changes));
  const failing = changed.filter((risk) => risk.crap > THRESHOLD);
  console.log(
    `CRAP check against ${BASE}: ${changed.length} changed functions, ${failing.length} above ${THRESHOLD}.`,
  );
  if (failing.length > 0) {
    failing.forEach((risk) => console.error(format(risk)));
    console.error(
      'Reduce complexity or add tests for these functions (CRAP = complexity² × (1 − coverage)³ + complexity).',
    );
    process.exit(1);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
