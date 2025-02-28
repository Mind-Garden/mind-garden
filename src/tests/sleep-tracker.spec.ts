import { insertSleepEntry, sleepEntryExists } from "@/utils/supabase/dbfunctions";
import { getSupabaseClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client', () => ({
    getSupabaseClient: jest.fn(),
  }));
  
describe('Sleep Tracker Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('Save Sleep Entry', () => {
    it('should insert entry successfully', async () => {
      const mockData = { data: [{start: '2:00:00', end: '9:00:00', user_id: '1', entry_date: '2025-02-26'}] };
      const selectMock = jest
          .fn()
          .mockResolvedValue({ data: mockData['data'], error: null });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock })

      mockSupabaseClient.from.mockReturnValue({
          insert: insertMock
      });

      const result = await insertSleepEntry(mockData.data[0].start, mockData.data[0].end, mockData.data[0].user_id);
      expect(result).toEqual(mockData);
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      });

    it('should return error.message and log the error on failure', async () => {
      console.error = jest.fn();
      const mockData = { data: [{start: '2:00:00', end: '9:00:00', user_id: '1'}] };
      const mockReturnValue = {error: { message: 'Error' } }

      const selectMock = jest
        .fn()
        .mockResolvedValue(mockReturnValue);
      const insertMock = jest.fn().mockReturnValue({ select: selectMock })

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock
      });

      const result = await insertSleepEntry(mockData.data[0].start, mockData.data[0].end, mockData.data[0].user_id);
      expect(result).toEqual(mockReturnValue);
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        `Error inserting into sleep_entries:`,
        mockReturnValue.error.message);
    });

    it('should not proceed with empty entry text', async () => {
      const userId = '1';
      const emptyEntryText = '';

      const result = await insertSleepEntry(emptyEntryText, emptyEntryText, userId);

      expect(result).toBeUndefined();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('Check Sleep Entry', () => {
    it('should return true if entry exists', async () => {
      const mockData = { data: [{ user_id: '1', entry_date: '2025-02-26' }] };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData['data'], error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await sleepEntryExists(mockData.data[0].user_id, mockData.data[0].entry_date);
      expect(result).toEqual({ exists: true });
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return false if entry does not exist', async () => {
      const mockData = { data: [] };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData['data'], error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await sleepEntryExists('1', '2025-02-26');
      expect(result).toEqual({ exists: false });
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return error.message and log the error on failure', async () => {
      console.error = jest.fn();
      const mockData = { data: [{ user_id: '1', entry_date: '2025-02-26' }] };
      const mockReturnValue = {error: { message: 'Error' } }

      const matchMock = jest
        .fn()
        .mockResolvedValue(mockReturnValue);
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await sleepEntryExists(mockData.data[0].user_id, mockData.data[0].entry_date);
      expect(result).toEqual(mockReturnValue);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        `Error selecting from sleep_entries:`,
        mockReturnValue.error.message);
    });
  });

});