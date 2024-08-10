import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AppLoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
