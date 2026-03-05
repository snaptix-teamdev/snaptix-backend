import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAccountsService {
  getHello(): string {
    return 'Hello World!';
  }
}
