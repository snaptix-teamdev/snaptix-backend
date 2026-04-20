import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './config/core.config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { POSTS_EXCHANGE } from '@snaptix/contracts';

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
            name: POSTS_EXCHANGE,
            type: 'topic',
          },
        ],
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [CoreConfig],
  exports: [CoreConfig, RabbitMQModule],
})
export class CoreModule {}
