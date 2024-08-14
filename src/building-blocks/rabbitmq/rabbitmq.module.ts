import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';
import configs from '../configs/configs';

@Global()
@Module({
  controllers: [],
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: configs.rabbitmq.exchange,
          type: 'topic'
        }
      ],
      uri: configs.rabbitmq.uri,
      connectionInitOptions: { wait: false },
      enableControllerDiscovery: true
    }),
    RabbitModule
  ],
  providers: [],
  exports: [RabbitMQModule]
})
export class RabbitModule {}
