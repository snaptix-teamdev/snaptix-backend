import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import { GEO_PATTERNS } from '@snaptix/contracts';
import { GeoController } from './geo.controller';
import { CheckGeoExistsQuery } from '../application/queries/check-geo-exists.query';

describe('GeoController.checkGeoExists', () => {
  let controller: GeoController;
  let execute: jest.Mock;

  const payload = { countryId: 1, regionId: 2, cityId: 3 };

  beforeEach(async () => {
    execute = jest.fn().mockResolvedValue({ exists: true });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoController],
      providers: [{ provide: QueryBus, useValue: { execute } }],
    }).compile();

    controller = module.get(GeoController);
  });

  it('слушает паттерн geo.check-geo-exists', () => {
    const method = Object.getOwnPropertyDescriptor(
      GeoController.prototype,
      'checkGeoExists',
    )?.value as object;

    const pattern = Reflect.getMetadata(PATTERN_METADATA, method) as unknown;

    expect(pattern).toEqual([GEO_PATTERNS.CHECK_GEO_EXISTS]);
    expect(GEO_PATTERNS.CHECK_GEO_EXISTS).toBe('geo.check-geo-exists');
  });

  it('делегирует payload в CheckGeoExistsQuery', async () => {
    await controller.checkGeoExists(payload);

    expect(execute).toHaveBeenCalledWith(new CheckGeoExistsQuery(payload));
  });

  it('возвращает ответ шины без изменений', async () => {
    execute.mockResolvedValue({ exists: false });

    await expect(controller.checkGeoExists(payload)).resolves.toEqual({
      exists: false,
    });
  });
});
