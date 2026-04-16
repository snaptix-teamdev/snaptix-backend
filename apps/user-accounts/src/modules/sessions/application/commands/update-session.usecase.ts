import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionEntity } from '../../domain/session.entity';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';

class UpdateSessionCommandRequest {
  userId: string;
  deviceId: string;
  ip: string | null;
  deviceName: string;
  issuedAt: Date;
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
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: UpdateSessionCommand): Promise<void> {
    const session = await this.sessionsRepository.findByUserIdAndDeviceId(
      dto.userId,
      dto.deviceId,
    );

    if (!session) {
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    if (session.isExpired()) {
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    const updatedSession = SessionEntity.restore({
      ...session,
      ip: dto.ip,
      deviceName: dto.deviceName,
      issuedAt: dto.issuedAt,
      expiresAt: dto.expiresAt,
    });

    await this.sessionsRepository.update(updatedSession);
  }
}
