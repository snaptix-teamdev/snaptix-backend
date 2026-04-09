import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailConfig } from '../email.config';

interface SendEmailPayload {
  email: string | string[];
  subject: string;
  templateName: string;
  context?: object;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

// names of template files in the "templates" folder
enum TemplateName {
  ConfirmEmailRegistration = 'confirm-email-registration',
}

@Injectable()
export class EmailService {
  private logger = new Logger(this.constructor.name);

  constructor(
    private mailerService: MailerService,
    private emailConfig: EmailConfig,
  ) {}

  async confirmEmailRegistration(payload: {
    email: string;
    emailConfirmationCode: string;
  }): Promise<void> {
    await this.sendEmail({
      email: payload.email,
      subject: 'Подтверждение почты',
      templateName: TemplateName.ConfirmEmailRegistration,
      context: { confirmationCode: payload.emailConfirmationCode },
    });
  }

  private async sendEmail(dto: SendEmailPayload): Promise<void> {
    try {
      const result = (await this.mailerService.sendMail({
        from: `Snaptix ${this.emailConfig.mailUser}`,
        to: dto.email,
        subject: dto.subject,
        template: dto.templateName,
        context: dto.context,
        attachments: dto.attachments,
      })) as unknown;

      this.logger.debug(result);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
