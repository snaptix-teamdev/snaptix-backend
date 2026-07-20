import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GetGeoMsResponseDto, GetGeoPayload } from '@snaptix/contracts';
import { GeoQueryRepository } from '../../infrastructure/geo.query-repository';

export class GetGeoQuery extends Query<GetGeoMsResponseDto> {
  constructor(public readonly payload: GetGeoPayload) {
    super();
  }
}

@QueryHandler(GetGeoQuery)
export class GetGeoQueryHandler implements IQueryHandler<
  GetGeoQuery,
  GetGeoMsResponseDto
> {
  constructor(private readonly repo: GeoQueryRepository) {}

  async execute({ payload }: GetGeoQuery): Promise<GetGeoMsResponseDto> {
    const { countryId, regionId, lang } = payload;

    if (regionId && !countryId) return { result: [] };

    if (!countryId) {
      const result = await this.repo.findCountries(lang);
      return { result };
    }

    if (!regionId) {
      const result = await this.repo.findRegionsByCountry(countryId, lang);
      return { result };
    }

    const result = await this.repo.findCitiesByRegion(
      countryId,
      regionId,
      lang,
    );

    return { result };
  }
}
