import { ISession } from '@snaptix/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { TokensService } from '../services/tokens.service';
import { SessionsQueryRepository } from '../../../infrastructure/query/sessions.query-repository';

class GetActiveDevicesQueryPayload {
  refreshToken: string;
}

class GetActiveDevicesQueryResponse implements Pick<
  ISession,
  'ip' | 'deviceId'
> {
  ip: string | null;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  isCurrent: boolean;
}

export class GetActiveDevicesQuery extends Query<
  GetActiveDevicesQueryResponse[]
> {
  constructor(public payload: GetActiveDevicesQueryPayload) {
    super();
  }
}

@QueryHandler(GetActiveDevicesQuery)
export class GetActiveDevicesQueryHandler implements IQueryHandler<
  GetActiveDevicesQuery,
  GetActiveDevicesQueryResponse
> {
  constructor(
    private sessionsQueryRepository: SessionsQueryRepository,
    private tokensService: TokensService,
  ) {}

  async execute({
    payload,
  }: GetActiveDevicesQuery): Promise<GetActiveDevicesQueryResponse[]> {
    const session = await this.tokensService.validateRefreshTokenOrThrow(
      payload.refreshToken,
    );

    const sessions = await this.sessionsQueryRepository.findByUserId(
      session.userId,
    );

    return sessions
      .map((s) => {
        return {
          ip: s.ip,
          title: s.deviceName,
          lastActiveDate: s.issuedAt.toISOString(),
          deviceId: s.deviceId,
          isCurrent: s.deviceId === session.deviceId,
        };
      })
      .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  }
}
