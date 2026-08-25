import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CheckGeoExistsMsResponseDto,
  CheckGeoExistsPayload,
  GEO_PATTERNS,
  MICROSERVICE_NAME,
  USER_ACCOUNTS_ERRORS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { DomainException } from '@snaptix/common';
import { UsersRepository } from '../../../../infrastructure/users.repository';
import { UserEntity } from '../../../domain/user/user.entity';
import { parse } from 'date-fns';
import { TransactionManager } from '../../../../infrastructure/prisma/transaction.manager';
import { firstValueFrom } from 'rxjs';

class EditProfileCommandRequest {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  aboutMe: string | null;
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
}

export class EditProfileCommand extends Command<void> {
  constructor(public dto: EditProfileCommandRequest) {
    super();
  }
}

@CommandHandler(EditProfileCommand)
export class EditProfileUseCase implements ICommandHandler<
  EditProfileCommand,
  void
> {
  constructor(
    @Inject(MICROSERVICE_NAME.GEO) private geo: ClientProxy,
    private usersRepository: UsersRepository,
    private transactionManager: TransactionManager,
  ) {}

  private parseBirthDate(raw: string): Date {
    const parsed = parse(raw, 'dd.MM.yyyy', new Date());

    return new Date(
      Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()),
    );
  }

  private async validateGeoLocation(
    countryId: number | null,
    regionId: number | null,
    cityId: number | null,
  ): Promise<void> {
    const allEmpty = !countryId && !regionId && !cityId;
    const allFilled = countryId && regionId && cityId;

    if (allEmpty) {
      return;
    }

    if (!allFilled) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.INVALID_GEO_LOCATION);
    }

    const result = await firstValueFrom(
      this.geo.send<CheckGeoExistsMsResponseDto, CheckGeoExistsPayload>(
        GEO_PATTERNS.CHECK_GEO_EXISTS,
        {
          countryId,
          regionId,
          cityId,
        },
      ),
    );

    if (!result.exists) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.INVALID_GEO_LOCATION);
    }
  }

  async execute({ dto }: EditProfileCommand): Promise<void> {
    const {
      userId,
      username,
      firstName,
      lastName,
      birthDate,
      aboutMe,
      countryId,
      regionId,
      cityId,
    } = dto;

    await this.validateGeoLocation(countryId, regionId, cityId);

    await this.transactionManager.run(async (tx) => {
      const existsUser =
        await this.usersRepository.checkUserByUsernameExcludingCurrent(
          userId,
          username,
          tx,
        );

      if (existsUser) {
        throw new DomainException(
          USER_ACCOUNTS_ERRORS.USER_USERNAME_ALREADY_EXISTS,
        );
      }

      const user: UserEntity | null = await this.usersRepository.findById(
        userId,
        tx,
      );

      if (!user) {
        throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);
      }

      user.changeUsername(username);
      user.updateProfile({
        firstName,
        lastName,
        birthDate: birthDate ? this.parseBirthDate(birthDate) : null,
        aboutMe: aboutMe ? aboutMe : null,
        countryId,
        regionId,
        cityId,
      });

      await this.usersRepository.update(user);
    });
  }
}
