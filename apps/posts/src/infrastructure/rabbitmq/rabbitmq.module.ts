import { Global, Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { POSTS_EXCHANGE } from '@snaptix/contracts';
import { CoreModule } from '../../core/core.module';
import { CoreConfig } from '../../core/config/core.config';
import { PostsEventPublisher } from './posts-event.publisher';

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
  providers: [PostsEventPublisher],
  exports: [RabbitMQModule, PostsEventPublisher],
})
export class RabbitmqModule {}
