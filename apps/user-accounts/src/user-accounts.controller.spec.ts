import { Test, TestingModule } from '@nestjs/testing';
import { UserAccountsController } from './user-accounts.controller';
import { UserAccountsService } from './user-accounts.service';

describe('UserAccountsController', () => {
  let userAccountsController: UserAccountsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserAccountsController],
      providers: [UserAccountsService],
    }).compile();

    userAccountsController = app.get<UserAccountsController>(UserAccountsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(userAccountsController.getHello()).toBe('Hello World!');
    });
  });
});
