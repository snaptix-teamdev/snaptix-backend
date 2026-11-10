import { GeoQueryRepository } from './geo.query-repository';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { GeoLang } from '@snaptix/contracts';

describe('GeoQueryRepository — выборка переводов', () => {
  let repository: GeoQueryRepository;
  let countryFindMany: jest.Mock;
  let regionFindMany: jest.Mock;
  let cityFindMany: jest.Mock;

  const langs = [GeoLang.RU, GeoLang.EN];
  const select = { lang: true, name: true };

  beforeEach(() => {
    countryFindMany = jest.fn().mockResolvedValue([]);
    regionFindMany = jest.fn().mockResolvedValue([]);
    cityFindMany = jest.fn().mockResolvedValue([]);

    const prisma = {
      countryTranslation: { findMany: countryFindMany },
      regionTranslation: { findMany: regionFindMany },
      cityTranslation: { findMany: cityFindMany },
    } as unknown as PrismaService;

    repository = new GeoQueryRepository(prisma);
  });

  it('findCountryTranslations фильтрует по стране и списку языков', async () => {
    await repository.findCountryTranslations(1, langs);

    expect(countryFindMany).toHaveBeenCalledWith({
      where: { countryId: 1, lang: { in: langs } },
      select,
    });
  });

  it('findRegionTranslations фильтрует по региону и списку языков', async () => {
    await repository.findRegionTranslations(2, langs);

    expect(regionFindMany).toHaveBeenCalledWith({
      where: { regionId: 2, lang: { in: langs } },
      select,
    });
  });

  it('findCityTranslations фильтрует по городу и списку языков', async () => {
    await repository.findCityTranslations(3, langs);

    expect(cityFindMany).toHaveBeenCalledWith({
      where: { cityId: 3, lang: { in: langs } },
      select,
    });
  });
});
