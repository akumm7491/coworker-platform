import nodemailer, { Transporter } from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { renderFile } from 'ejs';
import { resolve } from 'path';
import logger from '../../../utils/logger.js';
import { queueService } from '../queue/QueueService.js';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter;
  private sesClient: SESClient;
  private readonly templateDir: string;
  private readonly queueName = 'email';

  private constructor() {
    this.initializeTransporter();
    this.initializeSESClient();
    this.templateDir = resolve(process.cwd(), 'src/templates/email');
    this.setupEmailQueue();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private initializeSESClient(): void {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  private async setupEmailQueue(): Promise<void> {
    await queueService.createQueue({
      name: this.queueName,
      concurrency: 5,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    const queue = await queueService.getQueue(this.queueName);
    queue.process(async job => {
      const { type, data } = job.data;
      switch (type) {
        case 'regular':
          return this.sendEmail(data);
        case 'ses':
          return this.sendSESEmail(data);
        default:
          throw new Error(`Unknown email type: ${type}`);
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const emailContent = await this.prepareEmailContent(options);
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        text: emailContent.text,
        html: emailContent.html,
        attachments: options.attachments,
      });
      logger.info('Email sent successfully', { to: options.to, subject: options.subject });
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendSESEmail(options: EmailOptions): Promise<void> {
    try {
      const emailContent = await this.prepareEmailContent(options);
      const command = new SendEmailCommand({
        Source: process.env.EMAIL_FROM,
        Destination: {
          ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
        },
        Message: {
          Subject: { Data: options.subject },
          Body: {
            Text: { Data: emailContent.text },
            Html: { Data: emailContent.html },
          },
        },
      });

      await this.sesClient.send(command);
      logger.info('SES email sent successfully', { to: options.to, subject: options.subject });
    } catch (error) {
      logger.error('Error sending SES email:', error);
      throw error;
    }
  }

  async queueEmail(options: EmailOptions, type: 'regular' | 'ses' = 'regular'): Promise<void> {
    await queueService.addJob(this.queueName, {
      type,
      data: options,
    });
    logger.info('Email queued successfully', { to: options.to, subject: options.subject });
  }

  private async prepareEmailContent(
    options: EmailOptions,
  ): Promise<{ text: string; html: string }> {
    if (options.template) {
      const templatePath = resolve(this.templateDir, `${options.template}.ejs`);
      const html = await renderFile(templatePath, options.context || {});
      return {
        text: this.htmlToText(html),
        html,
      };
    }

    return {
      text: options.text || '',
      html: options.html || options.text || '',
    };
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const emailService = EmailService.getInstance();
