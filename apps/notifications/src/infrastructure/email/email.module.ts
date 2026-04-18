import { Global, Module } from '@nestjs/common';
import { EmailConfig } from './email.config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './application/email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [EmailModule],
      inject: [EmailConfig],
      useFactory: (emailConfig: EmailConfig) => ({
        transport: {
          host: emailConfig.mailHost,
          port: emailConfig.mailPort,
          secure: emailConfig.mailUseSecure,
          ignoreTLS: emailConfig.mailIgnoreTLS,
          auth: {
            user: emailConfig.mailUser,
            pass: emailConfig.mailPass,
          },
        },
        template: {
          dir: __dirname + '/infrastructure/email/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [EmailConfig, EmailService],
  exports: [EmailConfig, EmailService],
})
export class EmailModule {}
