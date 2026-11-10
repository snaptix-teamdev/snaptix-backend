import { Test, TestingModule } from '@nestjs/testing';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS, USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import {
  DeactivateSessionByIdCommand,
  DeactivateSessionByIdUseCase,
} from './deactivate-session-by-id.usecase';
import { TokensService } from '../../services/tokens.service';
import { SessionsRepository } from '../../../../infrastructure/sessions.repository';

describe('DeactivateSessionByIdUseCase', () => {
  let useCase: DeactivateSessionByIdUseCase;
  let validateRefreshTokenOrThrow: jest.Mock;
  let findByUserIdAndDeviceId: jest.Mock;
  let deleteById: jest.Mock;

  const currentSession = {
    id: 'session-1',
    userId: 'user-1',
    deviceId: 'device-1',
  };
  const otherSession = {
    id: 'session-2',
    userId: 'user-1',
    deviceId: 'device-2',
  };

  const command = (deviceId: string) =>
    new DeactivateSessionByIdCommand({
      refreshToken: 'refresh-token',
      deviceId,
    });

  beforeEach(async () => {
    validateRefreshTokenOrThrow = jest.fn().mockResolvedValue(currentSession);
    findByUserIdAndDeviceId = jest.fn();
    deleteById = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateSessionByIdUseCase,
        { provide: TokensService, useValue: { validateRefreshTokenOrThrow } },
        {
          provide: SessionsRepository,
          useValue: { findByUserIdAndDeviceId, deleteById },
        },
      ],
    }).compile();

    useCase = module.get(DeactivateSessionByIdUseCase);
  });

  it('удаляет другое устройство юзера и возвращает { isCurrentSession: false }', async () => {
    findByUserIdAndDeviceId.mockResolvedValue(otherSession);

    await expect(
      useCase.execute(command(otherSession.deviceId)),
    ).resolves.toEqual({ isCurrentSession: false });
    expect(deleteById).toHaveBeenCalledWith(otherSession.id);
  });

  it('удаляет текущее устройство и возвращает { isCurrentSession: true }', async () => {
    findByUserIdAndDeviceId.mockResolvedValue(currentSession);

    await expect(
      useCase.execute(command(currentSession.deviceId)),
    ).resolves.toEqual({ isCurrentSession: true });
    expect(deleteById).toHaveBeenCalledWith(currentSession.id);
  });

  it('ищет сессию по userId из провалидированного токена', async () => {
    findByUserIdAndDeviceId.mockResolvedValue(otherSession);

    await useCase.execute(command(otherSession.deviceId));

    expect(findByUserIdAndDeviceId).toHaveBeenCalledWith(
      currentSession.userId,
      otherSession.deviceId,
    );
  });

  it('бросает SESSION_NOT_FOUND, когда устройства у юзера нет', async () => {
    findByUserIdAndDeviceId.mockResolvedValue(null);

    const error: unknown = await useCase
      .execute(command('device-of-another-user'))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DomainException);
    expect((error as DomainException).getError()).toEqual(
      USER_ACCOUNTS_ERRORS.SESSION_NOT_FOUND,
    );
    expect(deleteById).not.toHaveBeenCalled();
  });

  it('пробрасывает ошибку валидации refresh токена и не трогает репозиторий', async () => {
    validateRefreshTokenOrThrow.mockRejectedValue(
      new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR),
    );

    await expect(
      useCase.execute(command(otherSession.deviceId)),
    ).rejects.toThrow(DomainException);
    expect(findByUserIdAndDeviceId).not.toHaveBeenCalled();
    expect(deleteById).not.toHaveBeenCalled();
  });
});
