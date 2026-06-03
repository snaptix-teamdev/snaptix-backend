import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class GeoQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCountries() {
    const countries = await this.prisma.country.findMany({
      include: { translations: true },
      orderBy: { iso2: 'asc' },
    });

    return countries.map((c) => ({
      value: String(c.id),
      en: c.translations.find((t) => t.lang === 'en')?.name ?? '',
      ru: c.translations.find((t) => t.lang === 'ru')?.name ?? '',
    }));
  }

  async findRegionsByCountry(countryId: number) {
    const regions = await this.prisma.region.findMany({
      where: { countryId },
      include: { translations: true },
      orderBy: { id: 'asc' },
    });

    return regions.map((r) => ({
      value: String(r.id),
      en: r.translations.find((t) => t.lang === 'en')?.name ?? '',
      ru: r.translations.find((t) => t.lang === 'ru')?.name ?? '',
    }));
  }

  async findCitiesByRegion(countryId: number, regionId: number) {
    const cities = await this.prisma.city.findMany({
      where: { regionId, region: { countryId } },
      include: { translations: true },
      orderBy: { id: 'asc' },
    });

    return cities.map((c) => ({
      value: String(c.id),
      en: c.translations.find((t) => t.lang === 'en')?.name ?? '',
      ru: c.translations.find((t) => t.lang === 'ru')?.name ?? '',
    }));
  }

  async findGeo(payload: {
    countryId: number;
    regionId: number;
    cityId: number;
  }) {
    return this.prisma.country.findFirst({
      where: {
        id: payload.countryId,
      },
      include: {
        translations: true,
        regions: {
          where: {
            id: payload.regionId,
          },
          include: {
            translations: true,
            cities: {
              where: {
                id: payload.cityId,
              },
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });
  }
}
