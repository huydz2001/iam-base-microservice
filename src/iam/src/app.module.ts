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
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import configs from 'building-blocks/configs/configs';
import { OpenTelemetryModule } from 'building-blocks/openTelemetry/open-telemetry.module';
import { HttpContextMiddleware } from 'building-blocks/context/context';
import { PermissionModule } from './module/permission/permission.module';
import { ErrorHandlersFilter } from 'building-blocks/filters/error-handlers.filter';

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
    PermissionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorHandlersFilter,
    },
  ],
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
