import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    InfrastructureModule,
    PostsModule,
    CqrsModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
