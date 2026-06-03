import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  COMMON_ERRORS,
  FindGeoMsResponseDto,
  FindGeoPayload,
} from '@snaptix/contracts';
import { GeoQueryRepository } from '../../infrastructure/geo.query-repository';
import { DomainException } from '@snaptix/common';

export class FindGeoQuery extends Query<FindGeoMsResponseDto> {
  constructor(public readonly payload: FindGeoPayload) {
    super();
  }
}

@QueryHandler(FindGeoQuery)
export class GetGeoQueryHandler implements IQueryHandler<
  FindGeoQuery,
  FindGeoMsResponseDto
> {
  constructor(private readonly geoQueryRepository: GeoQueryRepository) {}

  async execute({ payload }: FindGeoQuery): Promise<FindGeoMsResponseDto> {
    const result = await this.geoQueryRepository.findGeo({
      countryId: payload.countryId,
      regionId: payload.regionId,
      cityId: payload.cityId,
    });

    if (!result || !result.regions.length || !result.regions[0].cities.length) {
      throw new DomainException(COMMON_ERRORS.CONFLICT_ERROR);
    }

    const countryLang = result.translations.find(
      (t) => t.lang === payload.locale,
    )?.name;

    const regionLang = result.regions[0].translations.find(
      (t) => t.lang === payload.locale,
    )?.name;

    const cityLang = result.regions[0].cities[0].translations.find(
      (t) => t.lang === payload.locale,
    )?.name;

    if (!countryLang || !regionLang || !cityLang) {
      throw new DomainException(COMMON_ERRORS.CONFLICT_ERROR);
    }

    return {
      country: {
        id: result.id,
        name: countryLang,
      },
      region: {
        id: result.regions[0].id,
        name: regionLang,
      },
      city: {
        id: result.regions[0].cities[0].id,
        name: cityLang,
      },
    };
  }
}
