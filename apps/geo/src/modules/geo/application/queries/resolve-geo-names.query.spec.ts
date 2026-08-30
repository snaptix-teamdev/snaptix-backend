import { Test, TestingModule } from '@nestjs/testing';
import { GeoLang } from '@snaptix/contracts';
import {
  ResolveGeoNamesQuery,
  ResolveGeoNamesQueryHandler,
} from './resolve-geo-names.query';
import { GeoQueryRepository } from '../../infrastructure/geo.query-repository';

describe('ResolveGeoNamesQueryHandler', () => {
  let handler: ResolveGeoNamesQueryHandler;
  let findCountryTranslations: jest.Mock;
  let findRegionTranslations: jest.Mock;
  let findCityTranslations: jest.Mock;

  const ids = { countryId: 1, regionId: 2, cityId: 3 };

  const execute = (payload: {
    countryId: number | null;
    regionId: number | null;
    cityId: number | null;
    lang: GeoLang;
  }) => handler.execute(new ResolveGeoNamesQuery(payload));

  beforeEach(async () => {
    findCountryTranslations = jest.fn().mockResolvedValue([]);
    findRegionTranslations = jest.fn().mockResolvedValue([]);
    findCityTranslations = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolveGeoNamesQueryHandler,
        {
          provide: GeoQueryRepository,
          useValue: {
            findCountryTranslations,
            findRegionTranslations,
            findCityTranslations,
          },
        },
      ],
    }).compile();

    handler = module.get(ResolveGeoNamesQueryHandler);
  });

  it('запрашивает переводы на нужном языке и на языке фоллбэка', async () => {
    await execute({ ...ids, lang: GeoLang.RU });

    expect(findCountryTranslations).toHaveBeenCalledWith(1, [
      GeoLang.RU,
      GeoLang.EN,
    ]);
    expect(findRegionTranslations).toHaveBeenCalledWith(2, [
      GeoLang.RU,
      GeoLang.EN,
    ]);
    expect(findCityTranslations).toHaveBeenCalledWith(3, [
      GeoLang.RU,
      GeoLang.EN,
    ]);
  });

  it('не дублирует язык, когда запрошен язык фоллбэка', async () => {
    await execute({ ...ids, lang: GeoLang.EN });

    expect(findCountryTranslations).toHaveBeenCalledWith(1, [GeoLang.EN]);
  });

  it('возвращает перевод на запрошенном языке', async () => {
    findCountryTranslations.mockResolvedValue([
      { lang: GeoLang.EN, name: 'Belarus' },
      { lang: GeoLang.RU, name: 'Беларусь' },
    ]);

    const result = await execute({ ...ids, lang: GeoLang.RU });

    expect(result.country).toEqual({ id: 1, name: 'Беларусь' });
  });

  it('падает на en, когда перевода на запрошенный язык нет', async () => {
    findCountryTranslations.mockResolvedValue([
      { lang: GeoLang.EN, name: 'Belarus' },
    ]);

    const result = await execute({ ...ids, lang: GeoLang.RU });

    expect(result.country).toEqual({ id: 1, name: 'Belarus' });
  });

  it('возвращает null, когда записи нет ни на одном языке', async () => {
    await expect(execute({ ...ids, lang: GeoLang.RU })).resolves.toEqual({
      country: null,
      region: null,
      city: null,
    });
  });

  it('не ходит в репозиторий за не заданными id', async () => {
    await execute({
      countryId: 1,
      regionId: null,
      cityId: null,
      lang: GeoLang.RU,
    });

    expect(findCountryTranslations).toHaveBeenCalledTimes(1);
    expect(findRegionTranslations).not.toHaveBeenCalled();
    expect(findCityTranslations).not.toHaveBeenCalled();
  });
});
