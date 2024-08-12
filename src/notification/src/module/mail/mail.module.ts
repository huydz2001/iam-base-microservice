import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { join } from 'path';
import { EmailRpcService } from './mail-rabbitmq.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: configs.mail.mailHost,
        secure: false,
        auth: {
          user: configs.mail.user,
          pass: configs.mail.pass,
        },
      },
      defaults: {
        from: `"No Reply" <${configs.mail.from}>`,
      },
      template: {
        dir: join(__dirname, 'mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailRpcService],
  exports: [EmailRpcService, MailerModule],
})
export class MailModule {}
