import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import { config } from 'dotenv';
import * as countries from 'i18n-iso-countries';
import { PrismaClient } from '../../apps/geo/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

config({ path: path.join(__dirname, '../../apps/geo/.env.development') });

// eslint-disable-next-line @typescript-eslint/no-require-imports
countries.registerLocale(require('i18n-iso-countries/langs/ru.json'));

const DATA_DIR = path.join(__dirname, 'data');
const BATCH_SIZE = 500;

const adapter = new PrismaPg({
  connectionString: process.env['POSTGRES_GEO_URL']!,
});
const prisma = new PrismaClient({ adapter });

async function readFileLines(filePath: string): Promise<string[]> {
  const lines: string[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    lines.push(line);
  }
  return lines;
}

async function buildRuNamesMap(): Promise<Map<number, string>> {
  const filePath = path.join(DATA_DIR, 'alternateNamesV2.txt');
  console.log('Building Russian names map from alternateNamesV2.txt...');

  const ruMap = new Map<number, string>();
  const preferred = new Set<number>();

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line) continue;
    const cols = line.split('\t');
    if (cols.length < 4) continue;

    const geonameid = parseInt(cols[1]);
    const lang = cols[2];
    const name = cols[3];
    const isPreferred = cols[4] === '1';

    if (lang !== 'ru' || !geonameid || !name) continue;

    if (!ruMap.has(geonameid)) {
      ruMap.set(geonameid, name);
      if (isPreferred) preferred.add(geonameid);
    } else if (isPreferred && !preferred.has(geonameid)) {
      ruMap.set(geonameid, name);
      preferred.add(geonameid);
    }
  }

  console.log(`  Built map with ${ruMap.size} Russian names`);
  return ruMap;
}

async function importCountries(
  ruMap: Map<number, string>,
): Promise<Map<string, number>> {
  console.log('Importing countries...');
  const filePath = path.join(DATA_DIR, 'countryInfo.txt');
  const lines = await readFileLines(filePath);

  const countryMap = new Map<string, number>();
  const countryData: { id: number; iso2: string; iso3: string }[] = [];
  const translations: { countryId: number; lang: string; name: string }[] = [];

  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;
    const cols = line.split('\t');
    if (cols.length < 17) continue;

    const iso2 = cols[0];
    const iso3 = cols[1];
    const nameEn = cols[4];
    const geonameid = parseInt(cols[16]);

    if (!iso2 || !geonameid) continue;

    const nameRu =
      countries.getName(iso2, 'ru') ?? ruMap.get(geonameid) ?? nameEn;

    countryData.push({ id: geonameid, iso2, iso3 });
    translations.push({ countryId: geonameid, lang: 'en', name: nameEn });
    translations.push({ countryId: geonameid, lang: 'ru', name: nameRu });
    countryMap.set(iso2, geonameid);
  }

  await prisma.country.createMany({ data: countryData, skipDuplicates: true });
  await prisma.countryTranslation.createMany({
    data: translations,
    skipDuplicates: true,
  });

  console.log(`  Imported ${countryData.length} countries`);
  return countryMap;
}

async function importRegions(
  countryMap: Map<string, number>,
  ruMap: Map<number, string>,
): Promise<Map<string, number>> {
  console.log('Importing regions...');
  const filePath = path.join(DATA_DIR, 'admin1CodesASCII.txt');
  const lines = await readFileLines(filePath);

  const regionMap = new Map<string, number>();
  const regionData: { id: number; countryId: number }[] = [];
  const translations: { regionId: number; lang: string; name: string }[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    if (cols.length < 4) continue;

    const key = cols[0]; // e.g. "RU.48"
    const nameEn = cols[1];
    const geonameid = parseInt(cols[3]);

    if (!key || !geonameid) continue;

    const countryISO2 = key.split('.')[0];
    const countryId = countryMap.get(countryISO2);
    if (!countryId) continue;

    const nameRu = ruMap.get(geonameid) ?? nameEn;

    regionData.push({ id: geonameid, countryId });
    translations.push({ regionId: geonameid, lang: 'en', name: nameEn });
    translations.push({ regionId: geonameid, lang: 'ru', name: nameRu });
    regionMap.set(key, geonameid);
  }

  await prisma.region.createMany({ data: regionData, skipDuplicates: true });
  await prisma.regionTranslation.createMany({
    data: translations,
    skipDuplicates: true,
  });

  console.log(`  Imported ${regionData.length} regions`);
  return regionMap;
}

async function importCities(
  regionMap: Map<string, number>,
  ruMap: Map<number, string>,
): Promise<void> {
  console.log('Importing cities (batched)...');
  const filePath = path.join(DATA_DIR, 'cities500.txt');

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  let cityBatch: { id: number; regionId: number }[] = [];
  let translationBatch: { cityId: number; lang: string; name: string }[] = [];
  let totalCities = 0;
  let skippedCities = 0;

  const flush = async () => {
    if (cityBatch.length === 0) return;
    await prisma.city.createMany({ data: cityBatch, skipDuplicates: true });
    await prisma.cityTranslation.createMany({
      data: translationBatch,
      skipDuplicates: true,
    });
    totalCities += cityBatch.length;
    cityBatch = [];
    translationBatch = [];
  };

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    if (cols.length < 11) continue;

    const geonameid = parseInt(cols[0]);
    const nameEn = cols[1];
    const countryCode = cols[8];
    const admin1Code = cols[10];

    if (!geonameid || !nameEn) continue;

    const regionKey = `${countryCode}.${admin1Code}`;
    const regionId = regionMap.get(regionKey);

    if (!regionId) {
      skippedCities++;
      continue;
    }

    const nameRu = ruMap.get(geonameid) ?? nameEn;

    cityBatch.push({ id: geonameid, regionId });
    translationBatch.push({ cityId: geonameid, lang: 'en', name: nameEn });
    translationBatch.push({ cityId: geonameid, lang: 'ru', name: nameRu });

    if (cityBatch.length >= BATCH_SIZE) {
      await flush();
      process.stdout.write(`\r  Imported ${totalCities} cities...`);
    }
  }

  await flush();
  console.log(
    `\n  Imported ${totalCities} cities, skipped ${skippedCities} (no region)`,
  );
}

async function main() {
  console.log('=== GeoNames Import ===\n');

  const required = [
    'alternateNamesV2.txt',
    'countryInfo.txt',
    'admin1CodesASCII.txt',
    'cities500.txt',
  ];

  for (const file of required) {
    if (!fs.existsSync(path.join(DATA_DIR, file))) {
      console.error(`Missing file: scripts/geo/data/${file}`);
      console.error('Download from https://download.geonames.org/export/dump/');
      process.exit(1);
    }
  }

  try {
    const ruMap = await buildRuNamesMap();
    const countryMap = await importCountries(ruMap);
    const regionMap = await importRegions(countryMap, ruMap);
    await importCities(regionMap, ruMap);

    console.log('\n=== Import complete ===');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
