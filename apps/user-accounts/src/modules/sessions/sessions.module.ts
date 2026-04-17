import { Module } from '@nestjs/common';
import { SessionConverter } from './converter/session.converter';
import { CreateSessionUseCase } from './application/commands/create-session.usecase';
import { UpdateSessionUseCase } from './application/commands/update-session.usecase';
import { SessionsRepository } from './infrastructure/sessions.repository';

@Module({
  providers: [
    SessionConverter,
    SessionsRepository,
    CreateSessionUseCase,
    UpdateSessionUseCase,
  ],
})
export class SessionsModule {}
