import { Module } from '@nestjs/common';
import { GeoController } from './api/geo.controller';
import { GetGeoListQueryHandler } from './application/queries/get-geo-list.query';
import { CheckGeoExistsQueryHandler } from './application/queries/check-geo-exists.query';
import { ResolveGeoNamesQueryHandler } from './application/queries/resolve-geo-names.query';
import { GeoQueryRepository } from './infrastructure/geo.query-repository';

@Module({
  controllers: [GeoController],
  providers: [
    GetGeoListQueryHandler,
    ResolveGeoNamesQueryHandler,
    CheckGeoExistsQueryHandler,
    GeoQueryRepository,
  ],
})
export class GeoModule {}
