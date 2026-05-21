import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../infrastructure/query/users.query-repository';
import { GetRegisteredUsersCountMsResponseDto } from '@snaptix/contracts/user-accounts/get-registered-users-count/get-registered-users-count.ms-response-dto';

export class GetRegisteredUsersCountQuery extends Query<GetRegisteredUsersCountMsResponseDto> {}

@QueryHandler(GetRegisteredUsersCountQuery)
export class GetRegisteredUsersCountQueryHandler implements IQueryHandler<
  GetRegisteredUsersCountQuery,
  GetRegisteredUsersCountMsResponseDto
> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute(): Promise<GetRegisteredUsersCountMsResponseDto> {
    const count = await this.usersQueryRepository.getRegisteredUsersCount();

    return { registeredUsersCount: count };
  }
}
