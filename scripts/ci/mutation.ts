/**
 * Mutation testing of changed code only (Stryker, config in stryker.config.json).
 * Stryker mutates the lines changed since the base branch (see git-changes.ts) and runs the unit tests
 * against each mutant. A mutant is "killed" when a test fails — the tests noticed the change in behaviour.
 *
 *   mutation score = (killed + timeout) / (killed + timeout + survived + no coverage)
 *
 * Fails when the score of the changed lines is below the threshold, and lists the mutants the tests missed.
 * Full codebase report (slow): `pnpm mutation` → reports/mutation/index.html.
 *
 * Usage: ts-node scripts/ci/mutation.ts
 * Env: MUTATION_THRESHOLD (default 70), CHANGES_BASE (default origin/dev).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import * as process from 'node:process';
import { CHANGES_BASE, changedLines } from './git-changes';

const THRESHOLD = Number(process.env['MUTATION_THRESHOLD'] ?? 70);
const REPORT_FILE = 'reports/mutation/mutation.json';
const MAX_LISTED = 20;

type Mutant = {
  status: string;
  mutatorName: string;
  replacement?: string;
  location: { start: { line: number } };
};
type Report = { files: Record<string, { mutants: Mutant[] }> };

/** Same set of files as "mutate" in stryker.config.json */
const isMutable = (file: string): boolean =>
  /^(apps|libs)\/.+\.ts$/.test(file) &&
  !/\.(spec|e2e-spec)\.ts$/.test(file) &&
  !/\.module\.ts$/.test(file) &&
  !/(^|\/)main\.ts$/.test(file) &&
  !/\/(generated|test)\//.test(file);

/** [1, 2, 3, 7, 8] → ["1-3", "7-8"] */
function toRanges(lines: Set<number>): string[] {
  const sorted = [...lines].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];
  for (const line of sorted.slice(1).concat(Number.NaN)) {
    if (line === previous + 1) {
      previous = line;
      continue;
    }
    ranges.push(`${start}-${previous}`);
    start = line;
    previous = line;
  }
  return ranges;
}

function mutateTargets(): string[] {
  return [...changedLines()]
    .filter(([file]) => isMutable(file) && existsSync(file))
    .flatMap(([file, lines]) =>
      lines === 'all'
        ? [file]
        : toRanges(lines).map((range) => `${file}:${range}`),
    );
}

const DETECTED = ['Killed', 'Timeout'];
const UNDETECTED = ['Survived', 'NoCoverage'];

function main(): void {
  const targets = mutateTargets();
  if (targets.length === 0) {
    console.log(
      `Mutation check against ${CHANGES_BASE}: no changed source lines to mutate.`,
    );
    return;
  }
  console.log(
    `Mutation check against ${CHANGES_BASE}: ${targets.length} changed range(s).`,
  );
  rmSync(REPORT_FILE, { force: true });
  const run = spawnSync(
    'npx',
    ['stryker', 'run', '--mutate', targets.join(',')],
    {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    },
  );
  if (run.status !== 0 || !existsSync(REPORT_FILE)) {
    console.error('Stryker run failed, see the output above.');
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT_FILE, 'utf8')) as Report;
  const mutants = Object.entries(report.files).flatMap(([file, data]) =>
    data.mutants.map((mutant) => ({ file, ...mutant })),
  );
  const detected = mutants.filter((m) => DETECTED.includes(m.status)).length;
  const missed = mutants.filter((m) => UNDETECTED.includes(m.status));
  const counted = detected + missed.length;
  if (counted === 0) {
    console.log('No mutants were generated for the changed lines.');
    return;
  }
  const score = (100 * detected) / counted;
  console.log(
    `Mutation score of changed lines: ${score.toFixed(1)}% (${detected} of ${counted} mutants detected), threshold ${THRESHOLD}%.`,
  );
  if (score >= THRESHOLD) return;

  console.error('Mutants the tests did not detect:');
  missed.slice(0, MAX_LISTED).forEach((m) => {
    const what =
      m.status === 'NoCoverage' ? 'no test runs this line' : 'survived';
    console.error(
      `  ${m.file}:${m.location.start.line}  ${m.mutatorName} → ${JSON.stringify(m.replacement ?? '')}  (${what})`,
    );
  });
  if (missed.length > MAX_LISTED) {
    console.error(
      `  …and ${missed.length - MAX_LISTED} more: reports/mutation/index.html`,
    );
  }
  console.error(
    'Add or strengthen unit tests so that they fail when this code changes.',
  );
  process.exit(1);
}

main();
