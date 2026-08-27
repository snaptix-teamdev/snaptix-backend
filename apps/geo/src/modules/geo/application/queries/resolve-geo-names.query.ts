import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  GeoLang,
  ResolveGeoNamesMsResponseDto,
  ResolveGeoNamesPayload,
} from '@snaptix/contracts';
import {
  GeoQueryRepository,
  GeoTranslation,
} from '../../infrastructure/geo.query-repository';

const FALLBACK_LANG = GeoLang.EN;

type GeoName = { id: number; name: string };

export class ResolveGeoNamesQuery extends Query<ResolveGeoNamesMsResponseDto> {
  constructor(public readonly payload: ResolveGeoNamesPayload) {
    super();
  }
}

@QueryHandler(ResolveGeoNamesQuery)
export class ResolveGeoNamesQueryHandler implements IQueryHandler<
  ResolveGeoNamesQuery,
  ResolveGeoNamesMsResponseDto
> {
  constructor(private readonly repo: GeoQueryRepository) {}

  async execute({
    payload,
  }: ResolveGeoNamesQuery): Promise<ResolveGeoNamesMsResponseDto> {
    const { countryId, regionId, cityId, lang } = payload;
    const langs = [...new Set([lang, FALLBACK_LANG])];

    const [countryTranslations, regionTranslations, cityTranslations] =
      await Promise.all([
        countryId ? this.repo.findCountryTranslations(countryId, langs) : [],
        regionId ? this.repo.findRegionTranslations(regionId, langs) : [],
        cityId ? this.repo.findCityTranslations(cityId, langs) : [],
      ]);

    return {
      country: this.toGeoName(countryId, countryTranslations, lang),
      region: this.toGeoName(regionId, regionTranslations, lang),
      city: this.toGeoName(cityId, cityTranslations, lang),
    };
  }

  /**
   * Берёт перевод на запрошенном языке, при его отсутствии — на языке по умолчанию.
   * Возвращает null, если записи нет ни на одном языке.
   */
  private toGeoName(
    id: number | null,
    translations: GeoTranslation[],
    lang: GeoLang,
  ): GeoName | null {
    if (!id) return null;

    const namesByLang = new Map(translations.map((t) => [t.lang, t.name]));
    const name = namesByLang.get(lang) ?? namesByLang.get(FALLBACK_LANG);

    if (!name) return null;

    return { id, name };
  }
}
