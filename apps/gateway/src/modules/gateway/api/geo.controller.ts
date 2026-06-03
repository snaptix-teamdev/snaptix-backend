import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GEO_PATTERNS,
  GetGeoMsResponseDto,
  GetGeoPayload,
  GetGeoQueryRequestDto,
  GetGeoResponseDto,
  MICROSERVICE_NAME,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'geo', version: '1' })
export class GeoController {
  constructor(@Inject(MICROSERVICE_NAME.GEO) private geo: ClientProxy) {}

  /**
   * Справочник геолокаций
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: `Справочник геолокаций.
\n- Без параметров → страны
\n- \`?countryId\` → регионы страны
\n- \`?countryId&regionId\` → города региона`,
  })
  getGeo(@Query() query: GetGeoQueryRequestDto): Promise<GetGeoResponseDto> {
    return firstValueFrom(
      this.geo.send<GetGeoMsResponseDto, GetGeoPayload>(GEO_PATTERNS.GET_GEO, {
        countryId: query.countryId,
        regionId: query.regionId,
      }),
    );
  }
}
