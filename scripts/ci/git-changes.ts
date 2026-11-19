/**
 * What changed since the base branch: shared by the checks that look only at changed code (CRAP, mutation).
 * Includes committed, uncommitted and untracked files.
 *
 * Env: CHANGES_BASE — branch to compare with (default origin/dev; CI sets the PR target branch).
 */
import { execSync } from 'node:child_process';
import * as process from 'node:process';

export const CHANGES_BASE = process.env['CHANGES_BASE'] ?? 'origin/dev';

/** Changed line numbers per file; 'all' for a new untracked file. */
export type ChangedLines = Map<string, Set<number> | 'all'>;

export function changedLines(pathspec = '*.ts'): ChangedLines {
  try {
    execSync(`git rev-parse --verify --quiet ${CHANGES_BASE}`, {
      stdio: 'ignore',
    });
  } catch {
    console.error(
      `Base branch "${CHANGES_BASE}" not found. Run "git fetch origin" or set CHANGES_BASE.`,
    );
    process.exit(1);
  }
  const mergeBase = execSync(`git merge-base ${CHANGES_BASE} HEAD`, {
    encoding: 'utf8',
  }).trim();
  const diff = execSync(
    `git diff -U0 --no-color ${mergeBase} -- '${pathspec}'`,
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  const changes: ChangedLines = new Map();
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
  execSync(`git ls-files --others --exclude-standard -- '${pathspec}'`, {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .forEach((file) => changes.set(file, 'all'));
  // files that only lost lines have nothing left to check
  for (const [file, lines] of changes) {
    if (lines !== 'all' && lines.size === 0) changes.delete(file);
  }
  return changes;
}
