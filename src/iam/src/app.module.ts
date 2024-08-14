import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import configs from 'building-blocks/configs/configs';
import { HttpContextMiddleware } from 'building-blocks/context/context';
import { ErrorHandlersFilter } from 'building-blocks/filters/error-handlers.filter';
import { LoggerMiddleware } from 'building-blocks/loggers/logger.middleware';
import { OpenTelemetryModule } from 'building-blocks/openTelemetry/open-telemetry.module';
import { AdminGuard } from 'building-blocks/passport/auth.guard';
import { JwtStrategy } from 'building-blocks/passport/jwt.strategy';
import { RedisModule } from 'building-blocks/redis/redis.module';
import compression from 'compression';
import helmet from 'helmet';
import { postgresOptions } from './data/data-source';
import { AuthModule } from './module/auth/auth.module';
import { GroupModule } from './module/group/group.module';
import { MenuModule } from './module/menu/menu.module';
import { PermissionModule } from './module/permission/permission.module';
import { UserModule } from './module/user/user.module';

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
    OpenTelemetryModule.forRoot(),
    EventEmitterModule.forRoot(),
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
