import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  RefreshTokenPayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { CommandBus } from '@nestjs/cqrs';
import { DeactivateSessionsExcludingCurrentCommand } from '../application/commands/session-commands/deactivate-sessions-excluding-current.usecase';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(private commandBus: CommandBus) {}

  @MessagePattern(
    USER_ACCOUNTS_PATTERNS.SECURITY_DEVICES.DEACTIVATE_ALL_EXCLUDING_CURRENT,
  )
  async deactivateAllExcludingCurrent(
    @Payload() payload: RefreshTokenPayload,
  ): Promise<object> {
    await this.commandBus.execute(
      new DeactivateSessionsExcludingCurrentCommand({
        refreshToken: payload.refreshToken,
      }),
    );

    return {};
  }
}
