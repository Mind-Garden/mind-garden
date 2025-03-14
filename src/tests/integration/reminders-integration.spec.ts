import { getReminders, updateReminders } from '@/actions/reminders';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import supabase from '../../../jest.setup';

dotenv.config();

describe('Reminders Integration Test', () => {
  let testUserId: string = '';
  let smtpTransporter: any;

  beforeAll(async () => {
    const formData = {
      email: 'testuser123@example.com',
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
        },
      },
    };

    const { data, error } = await supabase.auth.signUp(formData);

    if (error || !data.user) {
      throw new Error('Failed to create test user');
    }

    if (data) {
      testUserId = data.user?.id;
    }

    // Set up SMTP transport with real credentials
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false, // Change to `true` if using SSL
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  });

  afterAll(async () => {
    await supabase.auth.admin.deleteUser(testUserId);
  });

  it('should update reminder data correctly', async () => {
    await updateReminders(testUserId, '10:00:00', false, true, true);
    const result = await getReminders(testUserId);

    expect(result).toEqual(
      expect.objectContaining({
        reminder_time: '10:00:00',
        journal_reminders: false,
        data_intake_reminders: true,
        activity_reminders: true,
      }),
    );
  });
});
