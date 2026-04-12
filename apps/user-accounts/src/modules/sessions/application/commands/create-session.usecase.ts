import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionEntity } from '../../domain/session.entity';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

class CreateSessionCommandRequest {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  issuedAt: Date;
  expiresAt: Date;
}

export class CreateSessionCommand extends Command<void> {
  constructor(public dto: CreateSessionCommandRequest) {
    super();
  }
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase implements ICommandHandler<
  CreateSessionCommand,
  void
> {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: CreateSessionCommand): Promise<void> {
    const session: SessionEntity = SessionEntity.create({
      userId: dto.userId,
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
      ip: dto.ip,
      issuedAt: dto.issuedAt,
      expiresAt: dto.expiresAt,
    });

    await this.sessionsRepository.create(session);
  }
}
