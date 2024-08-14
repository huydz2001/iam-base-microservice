import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { join } from 'path';
import { EmailChangePassHandler } from './feature/v1/mail-otp-change-pass/mail-otp-change-pass';
import { EmailRegisterHandler } from './feature/v1/mail-otp-register/mail-otp-register';

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
  providers: [EmailChangePassHandler, EmailRegisterHandler],
  exports: [EmailChangePassHandler, EmailRegisterHandler],
})
export class MailModule {}
