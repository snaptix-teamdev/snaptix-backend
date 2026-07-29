import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueryBus } from '@nestjs/cqrs';
import {
  FindGeoMsResponseDto,
  FindGeoPayload,
  GEO_PATTERNS,
  GetGeoMsResponseDto,
  GetGeoPayload,
} from '@snaptix/contracts';
import { GetGeoQuery } from '../application/queries/get-geo.query';
import { FindGeoQuery } from '../application/queries/find-geo.query';

@Controller()
export class GeoController {
  constructor(private readonly queryBus: QueryBus) {}

  @MessagePattern(GEO_PATTERNS.GET_GEO)
  getGeo(@Payload() payload: GetGeoPayload): Promise<GetGeoMsResponseDto> {
    return this.queryBus.execute(new GetGeoQuery(payload));
  }

  @MessagePattern(GEO_PATTERNS.FIND_GEO)
  findGeo(@Payload() payload: FindGeoPayload): Promise<FindGeoMsResponseDto> {
    return this.queryBus.execute(new FindGeoQuery(payload));
  }
}
