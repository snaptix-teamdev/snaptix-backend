/**
 * Skills live in two places because each agent reads only its own folder:
 *   .agents/skills  — source of truth (read by Codex), edit skills here
 *   .claude/skills  — copy (read by Claude Code)
 *
 * Usage:
 *   ts-node scripts/ci/skills-sync.ts                   # copy .agents/skills → .claude/skills
 *   ts-node scripts/ci/skills-sync.ts --check           # exit 1 if the copy on disk differs from the source
 *   ts-node scripts/ci/skills-sync.ts --check --staged  # same, but compares what is staged for commit (pre-commit)
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as process from 'node:process';

const SOURCE = '.agents/skills';
const TARGET = '.claude/skills';

/** relative path inside the folder → content fingerprint */
type Snapshot = Map<string, string>;

function listFiles(root: string, dir = root): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(root, path) : [relative(root, path)];
  });
}

function diskSnapshot(root: string): Snapshot {
  return new Map(
    listFiles(root).map((file) => [
      file,
      createHash('sha1')
        .update(readFileSync(join(root, file)))
        .digest('hex'),
    ]),
  );
}

/** Files as they are in the git index (what the next commit will contain) */
function stagedSnapshot(root: string): Snapshot {
  const output = execSync(`git ls-files --stage -- "${root}"`, {
    encoding: 'utf8',
  });
  return new Map(
    output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        // "<mode> <blob hash> <stage>\t<path>"
        const [meta, path] = line.split('\t');
        return [relative(root, path), meta.split(' ')[1]];
      }),
  );
}

function findDifferences(source: Snapshot, target: Snapshot): string[] {
  const differences: string[] = [];
  for (const [file, fingerprint] of source) {
    if (!target.has(file)) {
      differences.push(`missing in ${TARGET}: ${file}`);
    } else if (target.get(file) !== fingerprint) {
      differences.push(`content differs: ${file}`);
    }
  }
  for (const file of target.keys()) {
    if (!source.has(file))
      differences.push(`extra in ${TARGET} (not in ${SOURCE}): ${file}`);
  }
  return differences;
}

if (!existsSync(SOURCE)) {
  console.error(`Source folder ${SOURCE} not found`);
  process.exit(1);
}

if (process.argv.includes('--check')) {
  const staged = process.argv.includes('--staged');
  const snapshot = staged ? stagedSnapshot : diskSnapshot;
  const differences = findDifferences(snapshot(SOURCE), snapshot(TARGET));
  const where = staged ? ' (staged for commit)' : '';
  if (differences.length > 0) {
    console.error(`${TARGET} is out of sync with ${SOURCE}${where}:`);
    differences.forEach((line) => console.error(`  - ${line}`));
    console.error(
      staged
        ? `Run: pnpm skills:sync && git add ${SOURCE} ${TARGET}`
        : `Edit skills in ${SOURCE}, then run: pnpm skills:sync`,
    );
    process.exit(1);
  }
  console.log(`${TARGET} is in sync with ${SOURCE}${where}`);
} else {
  rmSync(TARGET, { recursive: true, force: true });
  cpSync(SOURCE, TARGET, { recursive: true });
  console.log(`Copied ${SOURCE} → ${TARGET}`);
}
