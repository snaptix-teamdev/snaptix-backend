import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  RefreshTokenPayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeactivateSessionsExcludingCurrentCommand } from '../application/commands/session-commands/deactivate-sessions-excluding-current.usecase';
import { GetActiveDevicesResponseDto } from '@snaptix/contracts/user-accounts/get-active-devices/get-active-devices.response-dto';
import { GetActiveDevicesQuery } from '../application/queries/get-active-devices.query';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @MessagePattern(USER_ACCOUNTS_PATTERNS.SECURITY_DEVICES.GET_ACTIVE_DEVICES)
  async getActiveDevices(
    @Payload() payload: RefreshTokenPayload,
  ): Promise<GetActiveDevicesResponseDto[]> {
    return this.queryBus.execute(new GetActiveDevicesQuery(payload));
  }

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
