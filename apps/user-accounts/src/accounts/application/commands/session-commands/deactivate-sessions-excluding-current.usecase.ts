import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensService } from '../../services/tokens.service';
import { SessionsRepository } from '../../../../infrastructure/sessions.repository';

class DeactivateSessionsExcludingCurrentCommandRequest {
  refreshToken: string;
}

export class DeactivateSessionsExcludingCurrentCommand extends Command<void> {
  constructor(
    public payload: DeactivateSessionsExcludingCurrentCommandRequest,
  ) {
    super();
  }
}

@CommandHandler(DeactivateSessionsExcludingCurrentCommand)
export class DeactivateSessionsExcludingCurrentUseCase implements ICommandHandler<
  DeactivateSessionsExcludingCurrentCommand,
  void
> {
  constructor(
    private tokensService: TokensService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({
    payload,
  }: DeactivateSessionsExcludingCurrentCommand): Promise<void> {
    const session = await this.tokensService.validateRefreshTokenOrThrow(
      payload.refreshToken,
    );

    await this.sessionsRepository.deleteAllExcludingCurrent(
      session.userId,
      session.deviceId,
    );
  }
}
