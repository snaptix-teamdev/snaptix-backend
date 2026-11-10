import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { GeoLang } from '@snaptix/contracts';

export type GeoTranslation = { lang: string; name: string };

@Injectable()
export class GeoQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCountries(lang: GeoLang) {
    const translations = await this.prisma.countryTranslation.findMany({
      where: { lang },
      orderBy: { name: 'asc' },
    });

    return translations.map((t) => ({
      id: t.countryId,
      name: t.name,
    }));
  }

  async findRegionsByCountry(countryId: number, lang: GeoLang) {
    const translations = await this.prisma.regionTranslation.findMany({
      where: { lang, region: { countryId } },
      orderBy: { name: 'asc' },
    });

    return translations.map((t) => ({
      id: t.regionId,
      name: t.name,
    }));
  }

  async findCitiesByRegion(countryId: number, regionId: number, lang: GeoLang) {
    const translations = await this.prisma.cityTranslation.findMany({
      where: { lang, city: { regionId, region: { countryId } } },
      orderBy: { name: 'asc' },
    });

    return translations.map((t) => ({
      id: t.cityId,
      name: t.name,
    }));
  }

  findCountryTranslations(
    countryId: number,
    langs: GeoLang[],
  ): Promise<GeoTranslation[]> {
    return this.prisma.countryTranslation.findMany({
      where: { countryId, lang: { in: langs } },
      select: { lang: true, name: true },
    });
  }

  findRegionTranslations(
    regionId: number,
    langs: GeoLang[],
  ): Promise<GeoTranslation[]> {
    return this.prisma.regionTranslation.findMany({
      where: { regionId, lang: { in: langs } },
      select: { lang: true, name: true },
    });
  }

  findCityTranslations(
    cityId: number,
    langs: GeoLang[],
  ): Promise<GeoTranslation[]> {
    return this.prisma.cityTranslation.findMany({
      where: { cityId, lang: { in: langs } },
      select: { lang: true, name: true },
    });
  }

  async checkGeoExists(payload: {
    countryId: number;
    regionId: number;
    cityId: number;
  }): Promise<boolean> {
    const city = await this.prisma.city.findFirst({
      where: {
        id: payload.cityId,
        regionId: payload.regionId,
        region: { countryId: payload.countryId },
      },
      select: { id: true },
    });

    return city !== null;
  }
}
