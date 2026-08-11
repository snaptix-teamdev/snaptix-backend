import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  CheckGeoExistsMsResponseDto,
  CheckGeoExistsPayload,
} from '@snaptix/contracts';
import { GeoQueryRepository } from '../../infrastructure/geo.query-repository';

export class CheckGeoExistsQuery extends Query<CheckGeoExistsMsResponseDto> {
  constructor(public readonly payload: CheckGeoExistsPayload) {
    super();
  }
}

@QueryHandler(CheckGeoExistsQuery)
export class CheckGeoExistsQueryHandler implements IQueryHandler<
  CheckGeoExistsQuery,
  CheckGeoExistsMsResponseDto
> {
  constructor(private readonly geoQueryRepository: GeoQueryRepository) {}

  async execute({
    payload,
  }: CheckGeoExistsQuery): Promise<CheckGeoExistsMsResponseDto> {
    const exists = await this.geoQueryRepository.checkGeoExists({
      countryId: payload.countryId,
      regionId: payload.regionId,
      cityId: payload.cityId,
    });

    return { exists };
  }
}
