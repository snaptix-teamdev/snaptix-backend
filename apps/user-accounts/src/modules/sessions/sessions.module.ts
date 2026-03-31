import { Module } from '@nestjs/common';
import { SessionConverter } from './converter/session.converter';
import { CreateSessionUseCase } from './application/commands/create-session.usecase';
import { SessionsRepository } from './infrastructure/sessions.repository';

@Module({
  providers: [SessionConverter, CreateSessionUseCase, SessionsRepository],
})
export class SessionsModule {}
