import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { TokensService } from '../../services/tokens.service';
import { SessionsRepository } from '../../../../infrastructure/sessions.repository';

class DeactivateSessionByIdCommandRequest {
  refreshToken: string;
  deviceId: string;
}

class DeactivateSessionByIdCommandResponse {
  isCurrentSession: boolean;
}

export class DeactivateSessionByIdCommand extends Command<DeactivateSessionByIdCommandResponse> {
  constructor(public payload: DeactivateSessionByIdCommandRequest) {
    super();
  }
}

@CommandHandler(DeactivateSessionByIdCommand)
export class DeactivateSessionByIdUseCase implements ICommandHandler<
  DeactivateSessionByIdCommand,
  DeactivateSessionByIdCommandResponse
> {
  constructor(
    private tokensService: TokensService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({
    payload,
  }: DeactivateSessionByIdCommand): Promise<DeactivateSessionByIdCommandResponse> {
    const currentSession = await this.tokensService.validateRefreshTokenOrThrow(
      payload.refreshToken,
    );

    const targetSession = await this.sessionsRepository.findByUserIdAndDeviceId(
      currentSession.userId,
      payload.deviceId,
    );

    if (!targetSession) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.SESSION_NOT_FOUND);
    }

    await this.sessionsRepository.deleteById(targetSession.id);

    return {
      isCurrentSession: targetSession.deviceId === currentSession.deviceId,
    };
  }
}
