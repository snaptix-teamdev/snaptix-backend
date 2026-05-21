import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { USER_ACCOUNTS_PATTERNS } from '@snaptix/contracts';
import { QueryBus } from '@nestjs/cqrs';
import { GetRegisteredUsersCountQuery } from '../application/queries/get-registered-users-count.query';
import { GetRegisteredUsersCountMsResponseDto } from '@snaptix/contracts/user-accounts/get-registered-users-count/get-registered-users-count.ms-response-dto';

@Controller()
export class UserController {
  constructor(private queryBus: QueryBus) {}

  @MessagePattern(USER_ACCOUNTS_PATTERNS.USERS.GET_REGISTERED_USERS_COUNT)
  async getRegisteredUsersCount(): Promise<GetRegisteredUsersCountMsResponseDto> {
    return this.queryBus.execute(new GetRegisteredUsersCountQuery());
  }
}
