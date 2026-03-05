import { Controller, Get } from '@nestjs/common';
import { UserAccountsService } from './user-accounts.service';

@Controller()
export class UserAccountsController {
  constructor(private readonly userAccountsService: UserAccountsService) {}

  @Get()
  getHello(): string {
    return this.userAccountsService.getHello();
  }
}
