import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { UsersRepository } from '../../../../infrastructure/users.repository';
import { UserEntity } from '../../../domain/user/user.entity';

export class ConfirmRegistrationCommand extends Command<void> {
  constructor(public dto: { code: string }) {
    super();
  }
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase implements ICommandHandler<ConfirmRegistrationCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ dto }: ConfirmRegistrationCommand): Promise<void> {
    const user: UserEntity | null = await this.usersRepository.findByEmailCode(
      dto.code,
    );

    if (!user)
      throw new DomainException(
        USER_ACCOUNTS_ERRORS.EMAIL_CONFIRMATION_CODE_NOT_FOUND,
      );

    if (user.isEmailConfirmationCodeExpired())
      throw new DomainException(
        USER_ACCOUNTS_ERRORS.EMAIL_CONFIRMATION_CODE_EXPIRED,
      );

    if (user.isEmailVerified())
      throw new DomainException(USER_ACCOUNTS_ERRORS.EMAIL_ALREADY_CONFIRMED);

    user.confirmEmail(dto.code);

    await this.usersRepository.update(user);
  }
}
