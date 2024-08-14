import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import * as otpGenerator from 'otp-generator';
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_AUTH } from 'building-blocks/constants/event.constant';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EmailChangePassHandler {
  private logger = new Logger(EmailChangePassHandler.name);

  constructor(
    private mailService: MailerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.AUTH.CHANGE_PASS,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async changePass(payload: any) {
    try {
      this.logger.debug(payload);
      const resp = await this.handleEmailRequestOTP(payload);
      return {
        data: resp,
      };
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }

  async handleEmailRequestOTP(message: any): Promise<string> {
    try {
      const otp = otpGenerator.generate(6, {
        digits: true,
        specialChars: false,
      });

      this.eventEmitter.emit(EVENT_AUTH.SEND_MAIL_OTP_CHANGE_PASS, {
        message,
        otp,
      });

      return otp;
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  @OnEvent(EVENT_AUTH.SEND_MAIL_OTP_CHANGE_PASS)
  async sendMail(payload: any) {
    const { message, otp } = payload;
    await this.mailService.sendMail({
      to: message.email,
      subject: 'Change Password! Confirm your Email',
      template: 'email-verify-otp/body',
      context: {
        name: message.name.split(' ')[1],
        token: otp,
      },
    });
  }
}
