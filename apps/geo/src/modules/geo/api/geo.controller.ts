import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueryBus } from '@nestjs/cqrs';
import {
  CheckGeoExistsMsResponseDto,
  CheckGeoExistsPayload,
  GEO_PATTERNS,
  GetGeoMsResponseDto,
  GetGeoPayload,
} from '@snaptix/contracts';
import { GetGeoQuery } from '../application/queries/get-geo.query';
import { CheckGeoExistsQuery } from '../application/queries/check-geo-exists.query';

@Controller()
export class GeoController {
  constructor(private readonly queryBus: QueryBus) {}

  @MessagePattern(GEO_PATTERNS.GET_GEO)
  getGeo(@Payload() payload: GetGeoPayload): Promise<GetGeoMsResponseDto> {
    return this.queryBus.execute(new GetGeoQuery(payload));
  }

  @MessagePattern(GEO_PATTERNS.CHECK_GEO_EXISTS)
  checkGeoExists(
    @Payload() payload: CheckGeoExistsPayload,
  ): Promise<CheckGeoExistsMsResponseDto> {
    return this.queryBus.execute(new CheckGeoExistsQuery(payload));
  }
}
