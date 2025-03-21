import { getReminders, updateReminders } from '@/actions/reminders';
import { getSupabaseClient } from '@/supabase/client';
// eslint-disable-next-line
import { selectData, updateData } from '@/supabase/dbfunctions';

jest.mock('@/supabase/dbfunctions');
jest.mock('@/lib/email-service');
jest.mock('@/lib/time');
jest.mock('@/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('Reminders Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
      rpc: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('getReminders function', () => {
    it('should return reminder data for a valid user ID', async () => {
      const mockReminderData = {
        user_id: 'user123',
        reminder_time: '08:00:00',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: false,
      };

      const mockSelectData = jest.fn().mockResolvedValueOnce({
        data: [mockReminderData],
        error: null,
      });
      (selectData as jest.Mock) = mockSelectData;

      const result = await getReminders('user123');

      expect(mockSelectData).toHaveBeenCalledWith('reminders', {
        user_id: 'user123',
      });
      expect(result).toEqual(mockReminderData);
    });

    it('should return null when there is an error fetching reminders', async () => {
      const mockSelectData = jest.fn().mockResolvedValueOnce({
        data: [],
        error: { message: 'Database error' },
      });
      (selectData as jest.Mock) = mockSelectData;

      const result = await getReminders('user123');

      expect(mockSelectData).toHaveBeenCalledWith('reminders', {
        user_id: 'user123',
      });
      expect(result).toBeNull();
    });
  });

  describe('updateReminders function', () => {
    it('should call updateData with correct parameters', async () => {
      const mockUpdateData = jest.fn().mockResolvedValueOnce({
        data: { user_id: 'user123' },
        error: null,
      });
      (updateData as jest.Mock) = mockUpdateData;

      await updateReminders('user123', '09:00:00', true, false, true);

      expect(mockUpdateData).toHaveBeenCalledWith(
        'reminders',
        { user_id: 'user123' },
        {
          reminder_time: '09:00:00',
          journal_reminders: true,
          data_intake_reminders: false,
          activity_reminders: true,
        },
      );
    });
  });
});
