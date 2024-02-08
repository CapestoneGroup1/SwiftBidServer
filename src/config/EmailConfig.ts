import { MailService } from "@sendgrid/mail";
import sgMail from "@sendgrid/mail";

export class EmailConfig {
  private static twilioEmailClient: MailService;

  private constructor() {}

  static initialize() {
    if (!EmailConfig.twilioEmailClient) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
      EmailConfig.twilioEmailClient = sgMail;
    }
  }

  private static getEmailClient(): MailService {
    if (!EmailConfig.twilioEmailClient) {
      EmailConfig.initialize();
    }
    return EmailConfig.twilioEmailClient;
  }

  static async sendEmail(
    mail: string,
    subject: string,
    text: string
  ): Promise<any> {
    const msg = {
      to: mail,
      from: process.env.SENDGRID_FROM_MAIL || "",
      subject,
      text,
    };
    const response = await EmailConfig.getEmailClient().send(msg);
    return response;
  }
}
