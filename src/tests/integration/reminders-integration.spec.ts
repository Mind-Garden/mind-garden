import { getReminders, updateReminders } from '@/actions/reminders';
import dotenv from 'dotenv';
import supabase from '../../../jest.setup';

dotenv.config();

describe('Reminders Integration Test', () => {
  let testUserId: string = '';

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

  it('should fail to update reminder data', async () => {
    const error = await updateReminders(
      testUserId,
      '27:00:00',
      false,
      false,
      false,
    );
    const result = await getReminders(testUserId);

    expect(error).not.toBeNull;
    expect(error.error).toEqual(
      'date/time field value out of range: "27:00:00"',
    );
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
