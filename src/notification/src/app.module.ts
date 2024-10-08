import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from 'building-blocks/configs/configs';
import { MailModule } from './module/mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot(),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        { name: 'iam', type: 'topic', options: { autoDelete: true } },
      ],
      uri: configs.rabbitmq.uri,
      connectionInitOptions: { wait: false },
    }),
    MailModule,
    // RabbitmqModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
