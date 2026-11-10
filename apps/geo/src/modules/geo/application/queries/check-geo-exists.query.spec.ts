import { Test, TestingModule } from '@nestjs/testing';
import {
  CheckGeoExistsQuery,
  CheckGeoExistsQueryHandler,
} from './check-geo-exists.query';
import { GeoQueryRepository } from '../../infrastructure/geo.query-repository';

describe('CheckGeoExistsQueryHandler', () => {
  let handler: CheckGeoExistsQueryHandler;
  let checkGeoExists: jest.Mock;

  const payload = { countryId: 1, regionId: 2, cityId: 3 };

  beforeEach(async () => {
    checkGeoExists = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckGeoExistsQueryHandler,
        { provide: GeoQueryRepository, useValue: { checkGeoExists } },
      ],
    }).compile();

    handler = module.get(CheckGeoExistsQueryHandler);
  });

  it('возвращает { exists: true }, когда связка существует', async () => {
    checkGeoExists.mockResolvedValue(true);

    await expect(
      handler.execute(new CheckGeoExistsQuery(payload)),
    ).resolves.toEqual({ exists: true });
  });

  it('возвращает { exists: false }, когда связки нет', async () => {
    checkGeoExists.mockResolvedValue(false);

    await expect(
      handler.execute(new CheckGeoExistsQuery(payload)),
    ).resolves.toEqual({ exists: false });
  });

  it('не бросает исключение, когда связки нет', async () => {
    checkGeoExists.mockResolvedValue(false);

    await expect(
      handler.execute(new CheckGeoExistsQuery(payload)),
    ).resolves.not.toThrow();
  });

  it('передаёт в репозиторий все три ID', async () => {
    checkGeoExists.mockResolvedValue(true);

    await handler.execute(new CheckGeoExistsQuery(payload));

    expect(checkGeoExists).toHaveBeenCalledWith({
      countryId: payload.countryId,
      regionId: payload.regionId,
      cityId: payload.cityId,
    });
  });

  it('пробрасывает ошибку репозитория', async () => {
    checkGeoExists.mockRejectedValue(new Error('db is down'));

    await expect(
      handler.execute(new CheckGeoExistsQuery(payload)),
    ).rejects.toThrow('db is down');
  });
});
