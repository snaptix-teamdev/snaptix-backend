import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './config/core.config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { FILES_EXCHANGE, POSTS_EXCHANGE } from '@snaptix/contracts';
import { FILES_DEAD_LETTER_EXCHANGE } from './rabbitmq.constants';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        uri: coreConfig.rabbitmqUri,
        exchanges: [
          { name: FILES_EXCHANGE, type: 'topic' },
          { name: POSTS_EXCHANGE, type: 'topic' },
          { name: FILES_DEAD_LETTER_EXCHANGE, type: 'topic' },
        ],
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [CoreConfig],
  exports: [CoreConfig, RabbitMQModule],
})
export class CoreModule {}
