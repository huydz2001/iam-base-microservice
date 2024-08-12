import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configs from 'building-blocks/configs/configs';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configs.rabbitmq.uri],
      queue: 'iam_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  app.startAllMicroservices();
  await app.listen(3003);
}
bootstrap();
