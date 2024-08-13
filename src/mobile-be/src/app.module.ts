import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import configs from 'building-blocks/configs/configs';
import { HttpContextMiddleware } from 'building-blocks/context/context';
import { ErrorHandlersFilter } from 'building-blocks/filters/error-handlers.filter';
import { OpenTelemetryModule } from 'building-blocks/openTelemetry/open-telemetry.module';
import { AdminGuard } from 'building-blocks/passport/auth.guard';
import { JwtThirtyGuard } from 'building-blocks/passport/jwt-thirty.guard';
import { JwtStrategy } from 'building-blocks/passport/jwt.strategy';
import { RedisModule } from 'building-blocks/redis/redis.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { AdminThirtyGuard } from 'building-blocks/passport/auth-thirty.guard';
import { LoggerMiddleware } from 'building-blocks/loggers/logger.middleware';
import helmet from 'helmet';
import compression from 'compression';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PassportModule,
    JwtModule.register({
      secret: configs.jwt.secret,
      signOptions: { expiresIn: configs.jwt.refreshExpirationDays },
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: configs.rabbitmq.exchange,
          type: 'topic',
          options: { autoDelete: true },
        },
      ],
      uri: configs.rabbitmq.uri,
      connectionInitOptions: { wait: false },
    }),
    // RabbitModule,
    OpenTelemetryModule.forRoot(),
    RedisModule.forRoot(),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    JwtService,
    AdminGuard,
    JwtStrategy,
    JwtThirtyGuard,
    AdminThirtyGuard,
    {
      provide: APP_FILTER,
      useClass: ErrorHandlersFilter,
    },
  ],
  exports: [JwtModule],
})
export class AppModule implements OnApplicationBootstrap, NestModule {
  // constructor(private readonly dataSeeder: DataSeeder) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet()).forRoutes('*');
    consumer.apply(compression()).forRoutes('*');
    consumer.apply(HttpContextMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  async onApplicationBootstrap(): Promise<void> {
    // await this.dataSeeder.seedAsync();
  }
}
