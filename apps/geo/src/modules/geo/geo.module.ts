import { Module } from '@nestjs/common';
import { GeoController } from './api/geo.controller';
import { GetGeoQueryHandler } from './application/queries/get-geo.query';
import { CheckGeoExistsQueryHandler } from './application/queries/check-geo-exists.query';
import { GeoQueryRepository } from './infrastructure/geo.query-repository';

@Module({
  controllers: [GeoController],
  providers: [
    GetGeoQueryHandler,
    CheckGeoExistsQueryHandler,
    GeoQueryRepository,
  ],
})
export class GeoModule {}
