import sendReminderEmail from '@/lib/email-service';
import nodemailer from 'nodemailer';

describe('Email Service Integration Test', () => {
  let transporter: any;

  beforeAll(() => {
    // Create real transporter using SMTP environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  });

  it('should successfully send an email', async () => {
    const messageId = await sendReminderEmail(
      'test@example.com', // Use a real test email
      'Integration Test Email',
      'This is a test email from integration test.',
      '<p>This is a test email from integration test.</p>',
    );

    expect(messageId).not.toBeNull();
    console.log('Email sent successfully with Message ID:', messageId);
  });
});
