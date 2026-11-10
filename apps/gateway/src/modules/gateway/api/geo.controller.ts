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
  GetGeoListMsResponseDto,
  GetGeoListPayload,
  GetGeoListQueryRequestDto,
  GetGeoListResponseDto,
  GeoLang,
  MICROSERVICE_NAME,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { ApiOperation } from '@nestjs/swagger';
import { ExtractLangFromCookie } from '../../../core/decorators/extract-lang-from-cookie.decorator';

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
\n- \`?countryId&regionId\` → города региона
\n\nЯзык названий берётся из cookie \`locale\` (значения: \`en\`, \`ru\`).`,
  })
  getGeoList(
    @Query() query: GetGeoListQueryRequestDto,
    @ExtractLangFromCookie() lang: GeoLang,
  ): Promise<GetGeoListResponseDto> {
    return firstValueFrom(
      this.geo.send<GetGeoListMsResponseDto, GetGeoListPayload>(
        GEO_PATTERNS.GET_GEO_LIST,
        {
          countryId: query.countryId,
          regionId: query.regionId,
          lang,
        },
      ),
    );
  }
}
