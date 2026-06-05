import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GetRegisteredUsersCountMsResponseDto,
  GetRegisteredUsersCountResponseDto,
  MICROSERVICE_NAME,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { GatewayConfig } from '../gateway.config';

@Injectable()
export class HomeService {
  constructor(
    @Inject(MICROSERVICE_NAME.POSTS) private posts: ClientProxy,
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
    private gatewayConfig: GatewayConfig,
  ) {}

  async getRegisteredUsersCount(): Promise<GetRegisteredUsersCountResponseDto> {
    return firstValueFrom(
      this.userAccounts.send<GetRegisteredUsersCountMsResponseDto, object>(
        USER_ACCOUNTS_PATTERNS.USERS.GET_REGISTERED_USERS_COUNT,
        {},
      ),
    );
  }
}
