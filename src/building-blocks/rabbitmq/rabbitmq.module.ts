import { DynamicModule, Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { OpenTelemetryModule } from '../openTelemetry/open-telemetry.module';
import { RabbitmqConnection, RabbitmqOptions } from './rabbitmq-connection';
import { RabbitmqPublisher } from './rabbitmq-publisher';
import { RabbitmqConsumer } from './rabitmq-subscriber';

@Global()
@Module({
  imports: [OpenTelemetryModule.forRoot()],
  providers: [
    RabbitmqPublisher,
    {
      provide: 'IRabbitmqConnection',
      useClass: RabbitmqConnection
    },
    {
      provide: 'IRabbitmqPublisher',
      useClass: RabbitmqPublisher
    },
    {
      provide: 'IRabbitmqConsumer',
      useClass: RabbitmqConsumer
    }
  ],
  exports: ['IRabbitmqConnection', 'IRabbitmqPublisher', 'IRabbitmqConsumer']
})
export class RabbitmqModule implements OnApplicationShutdown {
  constructor(private readonly rabbitmqConnection: RabbitmqConnection) {}
  async onApplicationShutdown() {
    await this.rabbitmqConnection.closeConnection();
  }

  static forRoot(options?: RabbitmqOptions): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [RabbitmqConnection, { provide: RabbitmqOptions, useValue: options }]
    };
  }
}
