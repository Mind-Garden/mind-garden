import { getSupabaseClient } from '@/supabase/client';
import {
  selectMoodDataByDateRange,
  selectMoodFrequency,
  selectSleepDataByDateRange,
} from '@/actions/data-visualization';
import {
  convertTo24Hour,
  formatHour,
  getSleepDuration,
  getBarColour,
  getTimeAMPM,
} from '@/lib/utils';
import { summarizeData } from '@/actions/ai-data-analysis';
import { fetchResponse } from '@/actions/ai-fetch';

jest.mock('@/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('Data Visualization', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
      rpc: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

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

  describe('Mood Data Visualization Actions', () => {
    describe('selectMoodDataByDateRange', () => {
      it('should return mood data when successful', async () => {
        const userId = '1';
        const startDate = '2025-02-20';
        const endDate = '2025-02-21';
        const mockData = [
          { scale_rating: 4, entry_date: startDate },
          { scale_rating: 3, entry_date: endDate },
        ];

        // Mock the database query chain
        const matchMock = jest
          .fn()
          .mockResolvedValue({ data: mockData, error: null });
        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });

        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });
        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });

        const result = await selectMoodDataByDateRange(
          userId,
          startDate,
          endDate,
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('responses');
        expect(selectMock).toHaveBeenCalledWith('scale_rating, entry_date');
        expect(result).toEqual({ data: mockData });
      });

      it('should return an error if the query fails', async () => {
        console.error = jest.fn();
        const mockError = { message: 'Failed to fetch mood data' };

        // Mock the database query chain with error
        const matchMock = jest
          .fn()
          .mockResolvedValue({ data: null, error: mockError });
        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });
        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });
        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });

        mockSupabaseClient.from.mockReturnValue({ select: selectMock });

        const result = await selectMoodDataByDateRange(
          '1',
          '2025-02-20',
          '2025-02-21',
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('responses');
        expect(result).toEqual({ error: mockError.message });
        expect(console.error).toHaveBeenCalledWith(
          'Error fetching mood data:',
          mockError.message,
        );
      });

      it('should return empty data when no entries exist in date range', async () => {
        const mockData: any[] = [];

        // Mock the database query chain with empty data
        const matchMock = jest
          .fn()
          .mockResolvedValue({ data: mockData, error: null });
        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });
        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });
        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });

        mockSupabaseClient.from.mockReturnValue({ select: selectMock });

        const result = await selectMoodDataByDateRange(
          '1',
          '2025-02-20',
          '2025-02-21',
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('responses');
        expect(result).toEqual({ data: mockData });
      });
    });

    describe('selectMoodFrequency', () => {
      it('should return mood frequency data when successful', async () => {
        const userId = '1';
        const lastMonthDate = '2025-01-20';
        const todaysDate = '2025-02-20';
        const mockData = [
          { scale_rating: 1, count: 5 },
          { scale_rating: 2, count: 7 },
          { scale_rating: 3, count: 10 },
          { scale_rating: 4, count: 8 },
          { scale_rating: 5, count: 3 },
        ];

        mockSupabaseClient.rpc.mockResolvedValue({
          data: mockData,
          error: null,
        });

        const result = await selectMoodFrequency(
          userId,
          lastMonthDate,
          todaysDate,
        );

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
          'get_mood_count_by_user',
          {
            user_id_param: userId,
            start_date_param: lastMonthDate,
            end_date_param: todaysDate,
          },
        );
        expect(result).toEqual({ data: mockData });
      });

      it('should return an error if the RPC call fails', async () => {
        console.error = jest.fn();
        const mockError = { message: 'Failed to fetch mood frequency data' };

        mockSupabaseClient.rpc.mockResolvedValue({
          data: null,
          error: mockError,
        });

        const result = await selectMoodFrequency(
          '1',
          '2025-01-20',
          '2025-02-20',
        );

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
          'get_mood_count_by_user',
          {
            user_id_param: '1',
            start_date_param: '2025-01-20',
            end_date_param: '2025-02-20',
          },
        );
        expect(result).toEqual({ error: mockError.message });
        expect(console.error).toHaveBeenCalledWith(
          'Error fetching mood data:',
          mockError.message,
        );
      });

      it('should return empty data when no mood entries exist', async () => {
        const mockData: any[] = [];

        mockSupabaseClient.rpc.mockResolvedValue({
          data: mockData,
          error: null,
        });

        const result = await selectMoodFrequency(
          '1',
          '2025-01-20',
          '2025-02-20',
        );

        expect(mockSupabaseClient.rpc).toHaveBeenCalled();
        expect(result).toEqual({ data: mockData });
      });
    });
  });
});
