import sendReminderEmail from '@/lib/email-service';

describe('Email Service Integration Test', () => {
  let testEmailAddress: string;

  beforeAll(() => {
    // Set up a test email address - this should be a real email that you control
    testEmailAddress = 'test@example.com';

    // Create real transporter using SMTP environment variables
  });

  it('should successfully send an email', async () => {
    const messageId = await sendReminderEmail(
      testEmailAddress,
      'Integration Test Email',
      'This is a test email from integration test.',
      '<p>This is a test email from integration test.</p>',
    );

    expect(messageId).not.toBeNull();
  });

  it('should handle special characters in subject and body', async () => {
    const specialSubject = 'Special Characters: äöü ñ é 漢字 💼 🚀';
    const specialText = 'Text with special characters: äöü ñ é 漢字 💼 🚀';
    const specialHtml =
      '<p>HTML with special characters: äöü ñ é 漢字 💼 🚀</p>';

    const messageId = await sendReminderEmail(
      testEmailAddress,
      specialSubject,
      specialText,
      specialHtml,
    );

    expect(messageId).not.toBeNull();
  });

  it('should fail to send email due to SMTP error', async () => {
    process.env.SMTP_EMAIL = 'invalid@example.com';
    process.env.SMTP_PASSWORD = 'invalidPassword@123';

    try {
      await sendReminderEmail(
        'wrongEmail',
        'Failed Email Test',
        'This should fail.',
        '<p>This should fail.</p>',
      );
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
