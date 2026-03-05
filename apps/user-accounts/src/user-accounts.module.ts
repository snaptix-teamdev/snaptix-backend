import { Module } from '@nestjs/common';
import { UserAccountsController } from './user-accounts.controller';
import { UserAccountsService } from './user-accounts.service';

@Module({
  imports: [],
  controllers: [UserAccountsController],
  providers: [UserAccountsService],
})
export class UserAccountsModule {}
