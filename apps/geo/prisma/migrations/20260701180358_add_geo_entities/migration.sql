-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('en', 'ru');

-- CreateTable
CREATE TABLE "countries" (
    "id" INTEGER NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_translations" (
    "country_id" INTEGER NOT NULL,
    "lang" "Lang" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "country_translations_pkey" PRIMARY KEY ("country_id","lang")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region_translations" (
    "region_id" INTEGER NOT NULL,
    "lang" "Lang" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "region_translations_pkey" PRIMARY KEY ("region_id","lang")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_translations" (
    "city_id" INTEGER NOT NULL,
    "lang" "Lang" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "city_translations_pkey" PRIMARY KEY ("city_id","lang")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso2_key" ON "countries"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso3_key" ON "countries"("iso3");

-- CreateIndex
CREATE INDEX "regions_country_id_idx" ON "regions"("country_id");

-- CreateIndex
CREATE INDEX "cities_region_id_idx" ON "cities"("region_id");

-- AddForeignKey
ALTER TABLE "country_translations" ADD CONSTRAINT "country_translations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region_translations" ADD CONSTRAINT "region_translations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_translations" ADD CONSTRAINT "city_translations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
