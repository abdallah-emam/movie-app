import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { AppLoggerMiddleware } from './middlewares/logger.middleware';
import { MovieModule } from './modules/movie/movie.module';
import { RolesGuard } from './modules/users/guard/roles.guard';
import { JwtAuthGuard } from './modules/users/guard/user.guard';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get('REDIS_HOST'),
            port: Number(config.get('REDIS_PORT')),
          },
        }),
      }),
    }),

    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URI'),
        dbName: 'movieAPIs',
      }),
    }),
    UsersModule,
    MovieModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
