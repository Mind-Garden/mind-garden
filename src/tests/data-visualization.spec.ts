import { getSupabaseClient } from '@/supabase/client';
import {
  getPersonalizedCategories,
  addUserHabit,
  getAddedCategories,
  insertAddedResp,
  getAddedResp,
  addResp,
  getAllAddedRespCategory,
} from '@/actions/data-intake';
import { selectSleepDataByDateRange } from '@/actions/data-visualization';
import {
  convertTo24Hour,
  formatHour,
  getSleepDuration,
  getBarColour,
  getTimeAMPM,
} from '@/lib/utils';

jest.mock('@/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));


describe('Data Visualization', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('getPersonalizedCategories', () => {
    it('should return personalized categories when successful', async () => {
      const mockData = [{ id: '1', name: 'Fitness' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getPersonalizedCategories();
      expect(result).toEqual(mockData);
    });

    it('should return null and log an error if query fails', async () => {
      console.error = jest.fn();
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      });

      const result = await getPersonalizedCategories();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error selecting personalized categories:',
        'DB error',
      );
    });
  });

  describe('addUserHabit', () => {
    it('should insert new habit if it does not exist', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [] }),
      });
      const insertMock = jest.fn().mockResolvedValue({});
      mockSupabaseClient.from.mockReturnValue({ insert: insertMock });

      const result = await addUserHabit('user1', 'habit1', 'breakfast');
      expect(result).toBe('success');
      expect(insertMock).toHaveBeenCalled();
    });

    it('should update habit if it already exists', async () => {
      const mockData = [{ tracking_method: ['lunch'] }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });
      const updateMock = jest.fn().mockResolvedValue({});
      mockSupabaseClient.from.mockReturnValue({ update: updateMock });

      const result = await addUserHabit('user1', 'habit1', 'breakfast');
      expect(result).toBe('success');
      expect(updateMock).toHaveBeenCalled();
    });

    it('should return "duplicate" if habit already exists with same tracking method', async () => {
      const mockData = [{ tracking_method: ['breakfast'] }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await addUserHabit('user1', 'habit1', 'breakfast');
      expect(result).toBe('duplicate');
    });
  });

  describe('getAddedCategories', () => {
    it('should return added categories', async () => {
      const mockData = [{ id: '1', name: 'Running' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getAddedCategories('user1');
      expect(result).toEqual(mockData);
    });

    it('should return null and log an error if query fails', async () => {
      console.error = jest.fn();
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      });

      const result = await getAddedCategories('user1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error selecting added categories:',
        'DB error',
      );
    });
  });

  describe('insertAddedResp', () => {
    it('should insert response successfully', async () => {
      const insertMock = jest.fn().mockResolvedValue({});
      mockSupabaseClient.from.mockReturnValue({ insert: insertMock });

      await insertAddedResp('user1', 'habit1', { value: 'yes' });
      expect(insertMock).toHaveBeenCalled();
    });

    it('should log an error if insertion fails', async () => {
      console.error = jest.fn();
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      });

      await insertAddedResp('user1', 'habit1', { value: 'yes' });
      expect(console.error).toHaveBeenCalledWith('Error inserting response:', {
        message: 'DB error',
      });
    });
  });

  describe('getAddedResp', () => {
    it('should return added responses', async () => {
      const mockData = [{ user_id: '1', habit: 'Running' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getAddedResp('user1', '2025-02-20');
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllAddedRespCategory', () => {
    it('should return responses for a category', async () => {
      const mockData = [{ habit: 'Running', user_id: '1' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getAllAddedRespCategory('user1', 'Running');
      expect(result).toEqual(mockData);
  describe('Sleep Chart Actions', () => {
    describe('Select Sleep Data by Date Range', () => {
      it('should return sleep data when successful', async () => {
        const userId = '1';
        const startDate = '2025-02-20';
        const endDate = '2025-02-21';
        const mockData = [
          { entry_date: startDate, start: '22:00:00', end: '06:00:00' },
          { entry_date: endDate, start: '23:00:00', end: '07:00:00' },
        ];

        const matchMock = jest.fn().mockResolvedValue({ data: mockData });

        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });

        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });

        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });
        const result = await selectSleepDataByDateRange(
          userId,
          startDate,
          endDate,
        );

        expect(result).toEqual({ data: mockData });
        expect(selectMock).toHaveBeenCalled();
        expect(matchMock).toHaveBeenCalled();
      });

      it('should return an error if the query fails', async () => {
        console.error = jest.fn();
        const mockError = { message: 'Failed to fetch sleep data' };
        const matchMock = jest
          .fn()
          .mockResolvedValue({ data: null, error: mockError });
        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });

        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });
        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });
        const result = await selectSleepDataByDateRange(
          '1',
          '2025-02-20',
          '2025-02-21',
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('sleep_entries');
        expect(selectMock).toHaveBeenCalled();
        expect(result).toEqual({ error: mockError.message });
        expect(console.error).toHaveBeenCalledWith(
          'Error selecting from sleep_entries:',
          mockError.message,
        );
      });

      it('should return empty data when no entries exist in date range', async () => {
        const mockData = { data: [] };

        const matchMock = jest.fn().mockResolvedValue({ data: mockData.data });

        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });

        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });

        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });
        const result = await selectSleepDataByDateRange(
          '1',
          '2025-02-20',
          '2025-02-21',
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('sleep_entries');
        expect(result).toEqual({ data: mockData.data });
        expect(selectMock).toHaveBeenCalled();
        expect(matchMock).toHaveBeenCalled();
      });
    });

    describe('convertTo24Hour', () => {
      it('should convert 12:00 AM to 0', () => {
        expect(convertTo24Hour('12:00 AM')).toBe(24);
      });

      it('should convert 1:00 AM to 1', () => {
        expect(convertTo24Hour('1:00 AM')).toBe(25);
      });

      it('should convert 11:59 PM to 23.9833', () => {
        expect(convertTo24Hour('11:59 PM')).toBeCloseTo(23.9833, 4);
      });

      it('should convert 6:00 AM to 6 (adjusted to 30)', () => {
        expect(convertTo24Hour('6:00 AM')).toBe(30);
      });

      it('should convert 6:00 PM to 18', () => {
        expect(convertTo24Hour('6:00 PM')).toBe(18);
      });

      it('should handle lowercase AM/PM correctly', () => {
        expect(convertTo24Hour('6:00 am')).toBe(30);
        expect(convertTo24Hour('6:00 pm')).toBe(18);
      });
    });

    describe('formatHour', () => {
      it('should format hours correctly for 12-hour AM/PM format', () => {
        expect(formatHour(0)).toBe('12AM');
        expect(formatHour(6)).toBe('6AM');
        expect(formatHour(12)).toBe('12PM');
        expect(formatHour(18)).toBe('6PM');
      });

      it('should handle hours beyond 24 correctly', () => {
        expect(formatHour(25)).toBe('1AM');
        expect(formatHour(42)).toBe('6PM');
      });
    });

    describe('getSleepDuration', () => {
      it('should return the correct duration between start and end times', () => {
        expect(getSleepDuration('6:00 AM', '7:00 AM')).toBe(1);
        expect(getSleepDuration('11:00 PM', '1:00 AM')).toBe(2);
        expect(getSleepDuration('6:00 PM', '9:00 PM')).toBe(3);
        expect(getSleepDuration('11:00 AM', '12:00 PM')).toBe(1);
      });

      it('should return a negative value if the start time is after the end time', () => {
        expect(getSleepDuration('9:00 PM', '8:00 PM')).toBe(-1);
      });
    });

    describe('getBarColour', () => {
      it('should return the correct color for sleep durations', () => {
        expect(getBarColour(5)).toBe('#d9d9d9'); // less than 6
        expect(getBarColour(6)).toBe('#83e3c6'); // between 6 and 8
        expect(getBarColour(9)).toBe('#2ebb61'); // greater than 8
      });
    });

    describe('getTimeAMPM', () => {
      it('should convert time to AM/PM format correctly', () => {
        expect(getTimeAMPM('6:00')).toBe('6:00 AM');
        expect(getTimeAMPM('12:00')).toBe('12:00 PM');
        expect(getTimeAMPM('15:00')).toBe('3:00 PM');
        expect(getTimeAMPM('23:59')).toBe('11:59 PM');
      });

      it('should correctly handle edge cases', () => {
        expect(getTimeAMPM('00:00')).toBe('12:00 AM');
        expect(getTimeAMPM('12:01')).toBe('12:01 PM');
      });
    });
  });
});
