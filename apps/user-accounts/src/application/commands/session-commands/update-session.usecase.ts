import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { Logger } from '@nestjs/common';

class UpdateSessionCommandRequest {
  userId: string;
  deviceId: string;
  ip: string | null;
  oldIssuedAt: Date;
  newIssuedAt: Date;
  expiresAt: Date;
}

export class UpdateSessionCommand extends Command<void> {
  constructor(public dto: UpdateSessionCommandRequest) {
    super();
  }
}

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionUseCase implements ICommandHandler<
  UpdateSessionCommand,
  void
> {
  private logger = new Logger(UpdateSessionUseCase.name);

  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: UpdateSessionCommand): Promise<void> {
    const session = await this.sessionsRepository.findByUserIdAndDeviceId(
      dto.userId,
      dto.deviceId,
    );

    if (!session) {
      this.logger.debug('session not found by user id and device id');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    if (session.isExpired()) {
      this.logger.debug('session is expired');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    if (!session.isIssuedAtEqual(dto.oldIssuedAt)) {
      this.logger.debug('session issued at is not equal to old issued at');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    session.update({
      ip: dto.ip,
      issuedAt: dto.newIssuedAt,
      expiresAt: dto.expiresAt,
    });

    await this.sessionsRepository.update(session);
  }
}
