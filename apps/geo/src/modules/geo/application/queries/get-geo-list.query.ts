import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GetGeoListMsResponseDto, GetGeoListPayload } from '@snaptix/contracts';
import { GeoQueryRepository } from '../../infrastructure/geo.query-repository';

export class GetGeoListQuery extends Query<GetGeoListMsResponseDto> {
  constructor(public readonly payload: GetGeoListPayload) {
    super();
  }
}

@QueryHandler(GetGeoListQuery)
export class GetGeoListQueryHandler implements IQueryHandler<
  GetGeoListQuery,
  GetGeoListMsResponseDto
> {
  constructor(private readonly repo: GeoQueryRepository) {}

  async execute({
    payload,
  }: GetGeoListQuery): Promise<GetGeoListMsResponseDto> {
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
