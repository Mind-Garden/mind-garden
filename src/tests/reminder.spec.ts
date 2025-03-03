import {
  getReminderTime,
  updateReminderTime,
  insertReminderTime,
} from '@/utils/supabase/dbfunctions';
import { getSupabaseClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('Reminder Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('Insert Reminder Time', () => {
    it('should insert a new reminders time when successful', async () => {
      const userId = '1';
      const email = 'test@example.com';
      const mockInsertData = [{ id: userId, email, reminder_time: '09:00' }];
    
      // The function seems to use selectData first, so we need to mock that chain
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'reminders') {
          return {
            select: jest.fn().mockReturnValue({
              match: jest.fn().mockResolvedValue({ data: null, error: null }) // No existing record
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: mockInsertData, error: null })
            })
          };
        }
        return null;
      });
    
      const result = await insertReminderTime(userId, email);
      
      expect(result).toEqual({ data: mockInsertData });
    });

    it('should return error when insert fails', async () => {
      console.error = jest.fn();
      const userId = '1';
      const email = 'test@example.com';
      const mockError = { message: 'Insert error' };
    
      // Mock the select first, then insert
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'reminders') {
          return {
            select: jest.fn().mockReturnValue({
              match: jest.fn().mockResolvedValue({ data: null, error: null }) // No existing record
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: null, error: mockError })
            })
          };
        }
        return null;
      });
    
      const result = await insertReminderTime(userId, email);
    
      expect(result.error?.message).toEqual(mockError.message);
      expect(console.error).toHaveBeenCalledWith('Error inserting into reminders:', mockError.message);
    });
  });

  describe('Fetch Reminder Time', () => {
    it('should return the reminders time when select is successful', async () => {
      const userId = '1';
      const mockReminderTime = [{ reminder_time: '08:30' }];

      // This one is passing, but let's ensure it's properly set up
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          match: jest.fn().mockResolvedValue({ data: mockReminderTime, error: null })
        })
      });

      const result = await getReminderTime(userId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reminders');
      expect(result).toEqual(mockReminderTime);
    });

    it('should return error when select fails', async () => {
      console.error = jest.fn();
      const userId = '1';
      const mockError = { message: 'Database error' };

      // Fix the error handling - the function throws an error, so we need to catch it
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          match: jest.fn().mockResolvedValue({ data: null, error: mockError })
        })
      });

      // Using try/catch because the function throws an error based on the error message
      try {
        await getReminderTime(userId);
        // If we reach here, the test should fail
        expect(true).toBe(false); // This will fail if no error is thrown
      } catch (error: any) {
        expect(error.message).toBe(mockError.message);
      }
    });
  });

  describe('Update Reminder Time', () => {
    it('should update the reminders time successfully', async () => {
      const userId = '1';
      const newTime = '10:15';
      const mockUpdatedData = { id: userId, reminder_time: newTime };

      // The function returns true on success, not the data
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          match: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [mockUpdatedData], error: null })
          })
        })
      });

      const result = await updateReminderTime(userId, newTime);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reminders');
      // The result should be true based on the implementation, not the data
      expect(result.data).toEqual([{"id": "1", "reminder_time": "10:15"}]);
    });

    it('should return error when update fails', async () => {
      console.error = jest.fn();
      const userId = '1';
      const newTime = '10:15';
      const mockError = { message: 'Update error' };

      // The function returns false on failure, not the error object
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          match: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      });

      const result = await updateReminderTime(userId, newTime);

      // The result should be false based on the implementation
      expect(result.error).toEqual("Update error");
      expect(console.error).toHaveBeenCalledWith('Error updating reminders:', mockError.message);
    });
  });
});