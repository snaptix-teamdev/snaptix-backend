import { GeoQueryRepository } from './geo.query-repository';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

describe('GeoQueryRepository.checkGeoExists', () => {
  let repository: GeoQueryRepository;
  let findFirst: jest.Mock;

  const payload = { countryId: 1, regionId: 2, cityId: 3 };

  beforeEach(() => {
    findFirst = jest.fn();

    const prisma = { city: { findFirst } } as unknown as PrismaService;

    repository = new GeoQueryRepository(prisma);
  });

  it('проверяет всю иерархию: город → регион → страна', async () => {
    findFirst.mockResolvedValue({ id: 3 });

    await repository.checkGeoExists(payload);

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: payload.cityId,
        regionId: payload.regionId,
        region: { countryId: payload.countryId },
      },
      select: { id: true },
    });
  });

  it('возвращает true, когда связка найдена', async () => {
    findFirst.mockResolvedValue({ id: 3 });

    await expect(repository.checkGeoExists(payload)).resolves.toBe(true);
  });

  it('возвращает false, когда связка не найдена', async () => {
    findFirst.mockResolvedValue(null);

    await expect(repository.checkGeoExists(payload)).resolves.toBe(false);
  });

  it('делает ровно один запрос к БД', async () => {
    findFirst.mockResolvedValue(null);

    await repository.checkGeoExists(payload);

    expect(findFirst).toHaveBeenCalledTimes(1);
  });
});
