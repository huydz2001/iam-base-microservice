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
        service: 'gmail',
        host: configs.mail.mailHost,
        secure: false,
        auth: {
          user: configs.mail.user,
          pass: configs.mail.pass,
        },
      },
      defaults: {
        from: `"IAM" <${configs.mail.from}>`,
      },
      template: {
        dir: join(__dirname, '/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailRpcService],
  exports: [EmailRpcService],
})
export class MailModule {}
