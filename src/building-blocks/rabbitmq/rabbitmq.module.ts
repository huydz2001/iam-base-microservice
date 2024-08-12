import { Global, Module } from '@nestjs/common';
import { OpenTelemetryModule } from '../openTelemetry/open-telemetry.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from '../configs/configs';

@Global()
@Module({
  imports: [
    OpenTelemetryModule.forRoot(),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [{ name: 'test', type: 'topic', options: { autoDelete: true } }],
      uri: configs.rabbitmq.uri,
      connectionInitOptions: { wait: false }
    })
  ],
  providers: [],
  exports: [RabbitMQModule]
})
export class RabbitmqModule {}
