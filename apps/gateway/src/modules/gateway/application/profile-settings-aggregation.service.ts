import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AddAvatarMsResponseDto,
  AddAvatarPayload,
  AddAvatarResponseDto,
  GEO_PATTERNS,
  GeoLang,
  GetProfileSettingsMsResponseDto,
  GetProfileSettingsPayload,
  GetProfileSettingsResponseDto,
  MICROSERVICE_NAME,
  ResolveGeoNamesMsResponseDto,
  ResolveGeoNamesPayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { GatewayConfig } from '../gateway.config';

const EMPTY_GEO_NAMES: ResolveGeoNamesMsResponseDto = {
  country: null,
  region: null,
  city: null,
};

@Injectable()
export class ProfileSettingsAggregationService {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
    @Inject(MICROSERVICE_NAME.GEO) private geo: ClientProxy,
    private gatewayConfig: GatewayConfig,
  ) {}

  async getProfileSettings(payload: {
    userId: string;
    lang: GeoLang;
  }): Promise<GetProfileSettingsResponseDto> {
    const profile = await firstValueFrom(
      this.userAccounts.send<
        GetProfileSettingsMsResponseDto,
        GetProfileSettingsPayload
      >(USER_ACCOUNTS_PATTERNS.PROFILE.GET_PROFILE_SETTINGS, {
        userId: payload.userId,
      }),
    );

    const geoNames = await this.resolveGeoNames({
      countryId: profile.countryId,
      regionId: profile.regionId,
      cityId: profile.cityId,
      lang: payload.lang,
    });

    // TODO: Вынести в отдельный mapper по аналогии с постами
    return {
      userId: profile.userId,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.storageKey
        ? this.buildFileUrl(profile.storageKey)
        : null,
      birthDate: profile.birthDate,
      aboutMe: profile.aboutMe,
      country: geoNames.country,
      region: geoNames.region,
      city: geoNames.city,
    };
  }

  async addAvatar(payload: {
    userId: string;
    fileId: string;
  }): Promise<AddAvatarResponseDto> {
    const { storageKey } = await firstValueFrom(
      this.userAccounts.send<AddAvatarMsResponseDto, AddAvatarPayload>(
        USER_ACCOUNTS_PATTERNS.PROFILE.ADD_AVATAR,
        {
          userId: payload.userId,
          fileId: payload.fileId,
        },
      ),
    );

    return { avatarUrl: this.buildFileUrl(storageKey) };
  }

  private resolveGeoNames(
    payload: ResolveGeoNamesPayload,
  ): Promise<ResolveGeoNamesMsResponseDto> {
    const { countryId, regionId, cityId } = payload;

    if (!countryId && !regionId && !cityId) {
      return Promise.resolve(EMPTY_GEO_NAMES);
    }

    return firstValueFrom(
      this.geo.send<ResolveGeoNamesMsResponseDto, ResolveGeoNamesPayload>(
        GEO_PATTERNS.RESOLVE_GEO_NAMES,
        payload,
      ),
    );
  }

  private buildFileUrl(storageKey: string): string {
    return `${this.gatewayConfig.filesStorageBaseUrl}/${storageKey}`;
  }
}
