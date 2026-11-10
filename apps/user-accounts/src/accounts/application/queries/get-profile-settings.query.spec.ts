import { Test, TestingModule } from '@nestjs/testing';
import { DomainException } from '@snaptix/common';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import {
  GetProfileSettingsQuery,
  GetProfileSettingsQueryHandler,
} from './get-profile-settings.query';
import { UsersQueryRepository } from '../../../infrastructure/query/users.query-repository';

describe('GetProfileSettingsQueryHandler', () => {
  let handler: GetProfileSettingsQueryHandler;
  let findByIdWithProfile: jest.Mock;

  const userId = '0199b0e8-0000-7000-8000-000000000001';

  const user = {
    id: userId,
    username: 'some-username',
    profile: {
      firstName: 'Ivan',
      lastName: 'Ivanov',
      birthDate: new Date(Date.UTC(1990, 2, 15)),
      aboutMe: 'Пара слов о себе',
      countryId: 1,
      regionId: 2,
      cityId: 3,
    },
  };

  beforeEach(async () => {
    findByIdWithProfile = jest.fn().mockResolvedValue(user);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileSettingsQueryHandler,
        { provide: UsersQueryRepository, useValue: { findByIdWithProfile } },
      ],
    }).compile();

    handler = module.get(GetProfileSettingsQueryHandler);
  });

  it('возвращает профиль с id геолокации и датой в формате YYYY-MM-DD', async () => {
    await expect(
      handler.execute(new GetProfileSettingsQuery({ userId })),
    ).resolves.toEqual({
      userId,
      username: 'some-username',
      firstName: 'Ivan',
      lastName: 'Ivanov',
      birthDate: '1990-03-15',
      aboutMe: 'Пара слов о себе',
      countryId: 1,
      regionId: 2,
      cityId: 3,
    });
  });

  it('отдаёт null в незаполненных полях профиля', async () => {
    findByIdWithProfile.mockResolvedValue({
      id: userId,
      username: 'some-username',
      profile: {
        firstName: null,
        lastName: null,
        birthDate: null,
        aboutMe: null,
        countryId: null,
        regionId: null,
        cityId: null,
      },
    });

    await expect(
      handler.execute(new GetProfileSettingsQuery({ userId })),
    ).resolves.toEqual({
      userId,
      username: 'some-username',
      firstName: null,
      lastName: null,
      birthDate: null,
      aboutMe: null,
      countryId: null,
      regionId: null,
      cityId: null,
    });
  });

  it('бросает USER_NOT_FOUND, когда юзера нет', async () => {
    findByIdWithProfile.mockResolvedValue(null);

    await expect(
      handler.execute(new GetProfileSettingsQuery({ userId })),
    ).rejects.toThrow(new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND));
  });
});
