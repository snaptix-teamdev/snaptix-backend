import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import {
  GEO_PATTERNS,
  GeoLang,
  MICROSERVICE_NAME,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { ProfileSettingsAggregationService } from './profile-settings-aggregation.service';

describe('ProfileSettingsAggregationService.getProfileSettings', () => {
  let service: ProfileSettingsAggregationService;
  let userAccountsSend: jest.Mock;
  let geoSend: jest.Mock;

  const userId = '0199b0e8-0000-7000-8000-000000000001';

  const profile = {
    userId,
    username: 'some-username',
    firstName: 'Ivan',
    lastName: 'Ivanov',
    birthDate: '1990-03-15',
    aboutMe: 'Пара слов о себе',
    countryId: 1,
    regionId: 2,
    cityId: 3,
  };

  const geoLocation = {
    country: { id: 1, name: 'Беларусь' },
    region: { id: 2, name: 'Минская область' },
    city: { id: 3, name: 'Минск' },
  };

  beforeEach(async () => {
    userAccountsSend = jest.fn().mockReturnValue(of(profile));
    geoSend = jest.fn().mockReturnValue(of(geoLocation));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileSettingsAggregationService,
        {
          provide: MICROSERVICE_NAME.USER_ACCOUNTS,
          useValue: { send: userAccountsSend } as unknown as ClientProxy,
        },
        {
          provide: MICROSERVICE_NAME.GEO,
          useValue: { send: geoSend } as unknown as ClientProxy,
        },
      ],
    }).compile();

    service = module.get(ProfileSettingsAggregationService);
  });

  it('запрашивает профиль в user-accounts, а названия геолокации — в geo', async () => {
    await service.getProfileSettings({ userId, lang: GeoLang.RU });

    expect(userAccountsSend).toHaveBeenCalledWith(
      USER_ACCOUNTS_PATTERNS.PROFILE.GET_PROFILE_SETTINGS,
      { userId },
    );
    expect(geoSend).toHaveBeenCalledWith(GEO_PATTERNS.RESOLVE_GEO_NAMES, {
      countryId: 1,
      regionId: 2,
      cityId: 3,
      lang: GeoLang.RU,
    });
  });

  it('склеивает профиль и локализованную геолокацию', async () => {
    await expect(
      service.getProfileSettings({ userId, lang: GeoLang.RU }),
    ).resolves.toEqual({
      userId,
      username: 'some-username',
      firstName: 'Ivan',
      lastName: 'Ivanov',
      birthDate: '1990-03-15',
      aboutMe: 'Пара слов о себе',
      country: { id: 1, name: 'Беларусь' },
      region: { id: 2, name: 'Минская область' },
      city: { id: 3, name: 'Минск' },
    });
  });

  it('не ходит в geo, когда геолокация в профиле не заполнена', async () => {
    userAccountsSend.mockReturnValue(
      of({ ...profile, countryId: null, regionId: null, cityId: null }),
    );

    const result = await service.getProfileSettings({
      userId,
      lang: GeoLang.RU,
    });

    expect(geoSend).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      country: null,
      region: null,
      city: null,
    });
  });
});
