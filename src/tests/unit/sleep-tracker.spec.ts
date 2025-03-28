import {
  insertSleepEntry,
  selectSleepEntryByDate,
  updateSleepEntry,
} from '@/actions/data-intake';
import { getSupabaseClient } from '@/supabase/client';

jest.mock('@/supabase/client', () => ({
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
      const mockData = {
        data: [
          {
            start: '2:00:00',
            end: '9:00:00',
            user_id: '1',
            entry_date: '2025-02-26',
            quality: 3,
          },
        ],
      };
      const selectMock = jest
        .fn()
        .mockResolvedValue({ data: mockData['data'], error: null });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock,
      });

      const result = await insertSleepEntry(
        mockData.data[0].start,
        mockData.data[0].end,
        mockData.data[0].user_id,
        mockData.data[0].quality,
      );
      expect(result).toEqual(mockData);
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
    });

    it('should return error.message and log the error on failure', async () => {
      console.error = jest.fn();
      const mockData = {
        data: [{ start: '2:00:00', end: '9:00:00', user_id: '1', quality: 3 }],
      };
      const mockReturnValue = { error: { message: 'Error' } };

      const selectMock = jest.fn().mockResolvedValue(mockReturnValue);
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock,
      });

      const result = await insertSleepEntry(
        mockData.data[0].start,
        mockData.data[0].end,
        mockData.data[0].user_id,
        mockData.data[0].quality,
      );
      expect(result).toEqual(mockReturnValue);
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Error inserting into sleep_entries:',
        mockReturnValue.error.message,
      );
    });

    it('should not proceed with empty entry text', async () => {
      const userId = '1';
      const emptyEntryText = '';

      const result = await insertSleepEntry(
        emptyEntryText,
        emptyEntryText,
        userId,
        3,
      );

      expect(result).toBeUndefined();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('Get Sleep Entry', () => {
    it('should return sleep entry when select is successful', async () => {
      const mockData = {
        data: [
          {
            user_id: '1',
            entry_date: '2025-02-26',
            start: '2:00:00',
            end: '9:00:00',
            quality: 3,
          },
        ],
        error: null,
      };

      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData['data'], error: null });

      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectSleepEntryByDate(
        mockData.data[0].user_id,
        mockData.data[0].entry_date,
      );

      // Check that the result matches the expected structure
      expect(result).toEqual({
        data: mockData.data[0], // Return first entry if data exists
        error: null,
      });
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return null if entry does not exist for the date', async () => {
      const mockData = { data: [], error: null };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData.data, error: mockData.error });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectSleepEntryByDate('1', '2025-02-26');
      expect(result).toEqual({
        data: null,
        error: mockData.error,
      });
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return null datat and the error message if selectData encounters an error', async () => {
      const mockError = {
        data: null,
        error: { message: 'Database connection error' },
      };

      const matchMock = jest.fn().mockResolvedValue(mockError);
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectSleepEntryByDate('1', '2025-02-26');

      expect(result).toEqual({
        data: null,
        error: 'Database connection error',
      });

      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });

  describe('Update Sleep Entry', () => {
    it('should update the sleep entry successfully', async () => {
      const id = '1';
      const start = '2:00:00';
      const end = '9:00:00';
      const sleepQuality = 3;
      const mockData = {
        data: [
          {
            user_id: id,
            entry_date: '2025-02-26',
            start: start,
            end: end,
            quality: sleepQuality,
          },
        ],
        error: null,
      };

      const selectMock = jest.fn().mockResolvedValue(mockData);

      const matchMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const updateMock = jest.fn().mockReturnValue({
        match: matchMock,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
      });

      const result = await updateSleepEntry(id, start, end, sleepQuality);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sleep_entries');
      expect(updateMock).toHaveBeenCalledWith({
        end: end,
        start: start,
        quality: sleepQuality,
      });
      expect(matchMock).toHaveBeenCalledWith({ id: id });
      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual({ data: mockData.data });
    });

    it('should return error when it fails', async () => {
      console.error = jest.fn();
      const id = '1';
      const start = '2:00:00';
      const end = '9:00:00';
      const sleepQuality = 3;
      const mockError = { message: 'Update error' };

      const selectMock = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const matchMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const updateMock = jest.fn().mockReturnValue({
        match: matchMock,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
      });

      const result = await updateSleepEntry(id, start, end, sleepQuality);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sleep_entries');
      expect(updateMock).toHaveBeenCalledWith({
        end: end,
        start: start,
        quality: sleepQuality,
      });
      expect(matchMock).toHaveBeenCalledWith({ id: id });
      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual({ error: mockError.message });
      expect(console.error).toHaveBeenCalledWith(
        'Error updating sleep_entries:',
        mockError.message,
      );
    });

    it('should not proceed with empty start and end times', async () => {
      const id = '1';
      const emptyStart = ' ';
      const emptyEnd = ' ';
      const sleepQuality = 3;

      const result = await updateSleepEntry(
        id,
        emptyStart,
        emptyEnd,
        sleepQuality,
      );

      expect(result).toBeUndefined();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });
});
