import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DomainException, IUser } from '@snaptix/common';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { UsersQueryRepository } from '../../../infrastructure/query/users.query-repository';

class GetMeQueryPayload {
  id: string;
}

class GetMeQueryResponse implements Pick<
  IUser,
  'id' | 'username' | 'email' | 'createdAt'
> {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export class GetMeQuery extends Query<GetMeQueryResponse> {
  constructor(public payload: GetMeQueryPayload) {
    super();
  }
}

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler implements IQueryHandler<
  GetMeQuery,
  GetMeQueryResponse
> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute({ payload }: GetMeQuery): Promise<GetMeQueryResponse> {
    const user = await this.usersQueryRepository.findById(payload.id);

    if (!user) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
