import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresOptions } from './data/data-source';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import configs from 'building-blocks/configs/configs';
import { OpenTelemetryModule } from 'building-blocks/openTelemetry/open-telemetry.module';
import { HttpContextMiddleware } from 'building-blocks/context/context';
import { PermissionModule } from './module/permission/permission.module';
import { ErrorHandlersFilter } from 'building-blocks/filters/error-handlers.filter';
import { MenuModule } from './module/menu/menu.module';
import { GroupModule } from './module/group/group.module';
import { RedisModule } from 'building-blocks/redis/redis.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { JwtStrategy } from 'building-blocks/passport/jwt.strategy';
import { AdminGuard } from 'building-blocks/passport/auth.guard';
import { RabbitMQModule, AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development'],
    }),
    TypeOrmModule.forRoot(postgresOptions),
    PassportModule,
    JwtModule.register({
      secret: configs.jwt.secret,
      signOptions: { expiresIn: configs.jwt.refreshExpirationDays },
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        { name: 'iam', type: 'topic', options: { autoDelete: true } },
      ],
      uri: configs.rabbitmq.uri,
      connectionInitOptions: { wait: false },
    }),
    OpenTelemetryModule.forRoot(),
    RedisModule.forRoot(),
    PermissionModule,
    UserModule,
    AuthModule,
    MenuModule,
    GroupModule,
  ],
  controllers: [],
  providers: [
    JwtService,
    AdminGuard,
    JwtStrategy,
    {
      provide: APP_FILTER,
      useClass: ErrorHandlersFilter,
    },
  ],
  exports: [JwtModule, RabbitMQModule],
})
export class AppModule implements OnApplicationBootstrap, NestModule {
  // constructor(private readonly dataSeeder: DataSeeder) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpContextMiddleware).forRoutes('*');
  }

  async onApplicationBootstrap(): Promise<void> {
    // await this.dataSeeder.seedAsync();
  }
}
