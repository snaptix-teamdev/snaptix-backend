/**
 * Skills live in two places because each agent reads only its own folder:
 *   .agents/skills  — source of truth (read by Codex), edit skills here
 *   .claude/skills  — copy (read by Claude Code)
 *
 * Usage:
 *   ts-node scripts/ci/skills-sync.ts          # copy .agents/skills → .claude/skills
 *   ts-node scripts/ci/skills-sync.ts --check  # exit 1 if the copy differs from the source
 */
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as process from 'node:process';

const SOURCE = '.agents/skills';
const TARGET = '.claude/skills';

function listFiles(root: string, dir = root): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(root, path) : [relative(root, path)];
  });
}

function findDifferences(): string[] {
  const sourceFiles = new Set(listFiles(SOURCE));
  const targetFiles = new Set(listFiles(TARGET));
  const differences: string[] = [];

  for (const file of sourceFiles) {
    if (!targetFiles.has(file)) {
      differences.push(`missing in ${TARGET}: ${file}`);
    } else if (
      !readFileSync(join(SOURCE, file)).equals(readFileSync(join(TARGET, file)))
    ) {
      differences.push(`content differs: ${file}`);
    }
  }
  for (const file of targetFiles) {
    if (!sourceFiles.has(file))
      differences.push(`extra in ${TARGET} (not in ${SOURCE}): ${file}`);
  }
  return differences;
}

if (!existsSync(SOURCE)) {
  console.error(`Source folder ${SOURCE} not found`);
  process.exit(1);
}

if (process.argv.includes('--check')) {
  const differences = findDifferences();
  if (differences.length > 0) {
    console.error(`${TARGET} is out of sync with ${SOURCE}:`);
    differences.forEach((line) => console.error(`  - ${line}`));
    console.error(`Edit skills in ${SOURCE}, then run: pnpm skills:sync`);
    process.exit(1);
  }
  console.log(`${TARGET} is in sync with ${SOURCE}`);
} else {
  rmSync(TARGET, { recursive: true, force: true });
  cpSync(SOURCE, TARGET, { recursive: true });
  console.log(`Copied ${SOURCE} → ${TARGET}`);
}
