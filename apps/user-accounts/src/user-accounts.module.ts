import { Module } from '@nestjs/common';
import { configModule } from './core/config/dynamic-config-module';
import { CoreModule } from './core/config/core-config.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    configModule,
    CoreModule,
    UsersModule,
    PrismaModule,
    CqrsModule.forRoot(),
  ],
  providers: [],
})
export class UserAccountsModule {}
