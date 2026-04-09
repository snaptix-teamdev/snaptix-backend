import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './config/core.config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { USER_ACCOUNTS_EXCHANGE } from '@snaptix/contracts';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        uri: coreConfig.rabbitmqUri,
        exchanges: [
          {
            name: USER_ACCOUNTS_EXCHANGE,
            type: 'topic',
          },
        ],
      }),
    }),
  ],
  providers: [CoreConfig],
  exports: [CoreConfig, RabbitMQModule],
})
export class CoreModule {}
