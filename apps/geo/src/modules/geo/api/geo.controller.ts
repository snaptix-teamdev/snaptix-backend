import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueryBus } from '@nestjs/cqrs';
import {
  CheckGeoExistsMsResponseDto,
  CheckGeoExistsPayload,
  GEO_PATTERNS,
  ResolveGeoNamesMsResponseDto,
  ResolveGeoNamesPayload,
  GetGeoListMsResponseDto,
  GetGeoListPayload,
} from '@snaptix/contracts';
import { GetGeoListQuery } from '../application/queries/get-geo-list.query';
import { CheckGeoExistsQuery } from '../application/queries/check-geo-exists.query';
import { ResolveGeoNamesQuery } from '../application/queries/resolve-geo-names.query';

@Controller()
export class GeoController {
  constructor(private readonly queryBus: QueryBus) {}

  @MessagePattern(GEO_PATTERNS.GET_GEO_LIST)
  getGeoList(
    @Payload() payload: GetGeoListPayload,
  ): Promise<GetGeoListMsResponseDto> {
    return this.queryBus.execute(new GetGeoListQuery(payload));
  }

  @MessagePattern(GEO_PATTERNS.RESOLVE_GEO_NAMES)
  resolveGeoNames(
    @Payload() payload: ResolveGeoNamesPayload,
  ): Promise<ResolveGeoNamesMsResponseDto> {
    return this.queryBus.execute(new ResolveGeoNamesQuery(payload));
  }

  @MessagePattern(GEO_PATTERNS.CHECK_GEO_EXISTS)
  checkGeoExists(
    @Payload() payload: CheckGeoExistsPayload,
  ): Promise<CheckGeoExistsMsResponseDto> {
    return this.queryBus.execute(new CheckGeoExistsQuery(payload));
  }
}
