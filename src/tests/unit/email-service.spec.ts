import sendReminderEmail from '@/lib/email-service';
import nodemailer from 'nodemailer';

// Mock nodemailer transporter
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
  }),
}));

describe('Email Service', () => {
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter = nodemailer.createTransport();
  });

  it('should call sendMail with correct parameters', async () => {
    await sendReminderEmail(
      'test@example.com',
      'Test Subject',
      'Test Text',
      '<p>Test HTML</p>',
    );

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: `"Mind Garden" <${process.env.SMTP_EMAIL}>`,
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>',
    });
  });

  it('should handle email sending failures gracefully', async () => {
    mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP Error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await sendReminderEmail(
      'test@example.com',
      'Test Subject',
      'Test Text',
      '<p>Test HTML</p>',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send email to'),
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
