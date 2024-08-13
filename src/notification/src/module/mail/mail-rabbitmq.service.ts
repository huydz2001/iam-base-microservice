import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { UserCreated } from 'building-blocks/constracts/identity-constract';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import * as otpGenerator from 'otp-generator';

@Injectable()
export class EmailRpcService {
  private logger = new Logger(EmailRpcService.name);

  constructor(private mailService: MailerService) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.AUTH.REGISTER,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async register(payload: any) {
    try {
      const resp = await this.handleEmailRequestOTP(payload);
      return {
        data: resp,
      };
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }

  async handleEmailRequestOTP(message: UserCreated): Promise<string> {
    try {
      const otp = otpGenerator.generate(6, {
        digits: true,
        specialChars: false,
      });

      await this.mailService.sendMail({
        to: message.email,
        subject: 'Welcome to IAM App! Confirm your Email',
        template: 'email-verify-otp/body',
        context: {
          name: message.name.split(' ')[1],
          token: otp,
        },
      });

      return otp;
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }
}
