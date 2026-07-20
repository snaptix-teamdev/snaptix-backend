import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Скачивает полные дампы GeoNames из GitHub Release и распаковывает их
 * в scripts/geo/data. Файлы намеренно не хранятся в git (см. .gitignore) —
 * это ~780 МБ данных. После загрузки запускай:
 *   pnpm geo:prisma:reset:dev && pnpm geo:import:dev
 *
 * Репозиторий приватный, поэтому качаем через `gh release download` — он
 * использует авторизацию GitHub CLI (прямой https-URL ассета для приватного
 * репо отдаёт 404 без токена).
 *
 * Чтобы обновить сами данные — пересобери архив и залей новый ассет в Release
 * (инструкция в scripts/geo/README.md).
 */

const REPO = 'snaptix-teamdev/snaptix-backend';
const TAG = 'geo-data-v1';
const ASSET = 'geo-data.tar.gz';

const DATA_DIR = path.join(__dirname, 'data');
const ARCHIVE = path.join(__dirname, ASSET);

const REQUIRED = [
  'admin1CodesASCII.txt',
  'alternateNamesV2.txt',
  'cities500.txt',
  'countryInfo.txt',
];

function assertGhReady(): void {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Нужен авторизованный GitHub CLI (репозиторий приватный).\n' +
        '  1. Установить: https://cli.github.com/\n' +
        '  2. Войти:      gh auth login',
    );
  }
}

function main(): void {
  console.log('=== GeoNames data download ===\n');
  assertGhReady();
  fs.mkdirSync(DATA_DIR, { recursive: true });

  console.log(`Downloading ${ASSET} from ${TAG} (${REPO})...`);
  fs.rmSync(ARCHIVE, { force: true });
  execSync(
    `gh release download ${TAG} --repo ${REPO} --pattern ${ASSET} --dir "${__dirname}" --clobber`,
    { stdio: 'inherit' },
  );

  console.log('Extracting into scripts/geo/data...');
  // Относительные пути + cwd, чтобы в аргументы tar не попала буква диска
  // (GNU tar трактует "D:\..." как удалённый host:path из-за двоеточия).
  execSync(`tar -xzf "${ASSET}" -C data`, { cwd: __dirname, stdio: 'inherit' });
  fs.rmSync(ARCHIVE, { force: true });

  const missing = REQUIRED.filter(
    (f) => !fs.existsSync(path.join(DATA_DIR, f)),
  );
  if (missing.length) {
    throw new Error(`Missing files after extract: ${missing.join(', ')}`);
  }

  console.log('\n=== Done ===');
  for (const f of REQUIRED) console.log('  -', f);
  console.log('\nNext: pnpm geo:prisma:reset:dev && pnpm geo:import:dev');
}

try {
  main();
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
