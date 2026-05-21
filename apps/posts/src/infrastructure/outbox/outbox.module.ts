import { Global, Module } from '@nestjs/common';
import { OutboxEventRepository } from './outbox-event.repository';
import { OutboxRelayService } from './outbox-relay.service';

@Global()
@Module({
  providers: [OutboxEventRepository, OutboxRelayService],
  exports: [OutboxEventRepository],
})
export class OutboxModule {}
