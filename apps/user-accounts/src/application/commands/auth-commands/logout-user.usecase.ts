import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensService } from '../../services/tokens.service';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';

class LogoutUserCommandRequest {
  refreshToken: string;
}

export class LogoutUserCommand extends Command<void> {
  constructor(public payload: LogoutUserCommandRequest) {
    super();
  }
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<
  LogoutUserCommand,
  void
> {
  constructor(
    private tokensService: TokensService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ payload }: LogoutUserCommand): Promise<void> {
    const session = await this.tokensService.validateRefreshTokenOrThrow(
      payload.refreshToken,
    );

    await this.sessionsRepository.deleteById(session.id);
  }
}
