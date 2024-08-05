import { RabbitmqOptions } from 'rabbitmq/rabbitmq-connection';
import * as amqp from 'amqplib';

export interface IRabbitmqConnection {
  createConnection(options?: RabbitmqOptions): Promise<amqp.Connection>;

  getChannel(): Promise<amqp.Channel>;

  closeChanel(): Promise<void>;

  closeConnection(): Promise<void>;
}
