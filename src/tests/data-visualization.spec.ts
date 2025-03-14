import { getSupabaseClient } from '@/supabase/client';
import {
  selectSleepDataByDateRange,
  selectDataByRange,
  selectWorkDataByDateRange,
  selectStudyDataByDateRange,
  selectWaterDataByDateRange,
} from '@/actions/data-visualization';
import {
  convertTo24Hour,
  convertTo24HourSleepEntry,
  formatHour,
  getSleepDuration,
  getBarColour,
  getTimeAMPM,
} from '@/lib/utils';

jest.mock('@/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

const mockFunction = jest.fn();
const barLineFunctionary = {
  validType: mockFunction,
};

(global as any).barLineFunctionary = barLineFunctionary;

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

    describe('convertTo24HourSleepEntry', () => {
      it('should convert AM times correctly', () => {
        expect(convertTo24HourSleepEntry('12:00 AM')).toBe('00:00');
        expect(convertTo24HourSleepEntry('1:30 AM')).toBe('01:30');
        expect(convertTo24HourSleepEntry('11:59 AM')).toBe('11:59');
      });

      it('should convert PM times correctly', () => {
        expect(convertTo24HourSleepEntry('12:00 PM')).toBe('12:00');
        expect(convertTo24HourSleepEntry('1:30 PM')).toBe('13:30');
        expect(convertTo24HourSleepEntry('11:59 PM')).toBe('23:59');
      });

      it('should handle edge cases', () => {
        expect(convertTo24HourSleepEntry('00:00 AM')).toBe('00:00'); // Invalid input format, should still work
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

  describe('Quantitative Habit Actions', () => {
    describe('selectWorkDataByDateRange', () => {
      it('should return work data when successful', async () => {
        const mockData = [{ entry_date: '2025-02-20', rating: 5, hours: 8 }];
        mockSupabaseClient.rpc.mockResolvedValue({
          data: mockData,
          error: null,
        });

        const result = await selectWorkDataByDateRange(
          '1',
          '2025-02-01',
          '2025-02-20',
        );
        expect(result).toEqual({ data: mockData });
      });

      it('should return an error when query fails', async () => {
        const mockError = { message: 'Database error' };
        mockSupabaseClient.rpc.mockResolvedValue({
          data: null,
          error: mockError,
        });

        const result = await selectWorkDataByDateRange(
          '1',
          '2025-02-01',
          '2025-02-20',
        );
        expect(result).toEqual({ error: 'Database error' });
      });
    });

    describe('selectStudyDataByDateRange', () => {
      it('should return study data when successful', async () => {
        const mockData = [{ entry_date: '2025-02-20', rating: 4, hours: 6 }];
        mockSupabaseClient.rpc.mockResolvedValue({
          data: mockData,
          error: null,
        });

        const result = await selectStudyDataByDateRange(
          '1',
          '2025-02-01',
          '2025-02-20',
        );
        expect(result).toEqual({ data: mockData });
      });

      it('should return an error when query fails', async () => {
        const mockError = { message: 'Database error' };
        mockSupabaseClient.rpc.mockResolvedValue({
          data: null,
          error: mockError,
        });

        const result = await selectStudyDataByDateRange(
          '1',
          '2025-02-01',
          '2025-02-20',
        );
        expect(result).toEqual({ error: 'Database error' });
      });
    });

    describe('selectDataByRange', () => {
      it('should return work data when type is work', async () => {
        const mockData = [{ entry_date: '2025-02-20', rating: 5, hours: 8 }];
        mockSupabaseClient.rpc.mockResolvedValue({
          data: mockData,
          error: null,
        });

        const result = await selectDataByRange(
          '1',
          '2025-02-01',
          '2025-02-20',
          'work',
        );
        expect(result).toEqual(mockData);
      });

      it('should return study data when type is study', async () => {
        const mockData = [{ entry_date: '2025-02-20', rating: 4, hours: 6 }];
        mockSupabaseClient.rpc.mockResolvedValue({
          data: mockData,
          error: null,
        });

        const result = await selectDataByRange(
          '1',
          '2025-02-01',
          '2025-02-20',
          'study',
        );
        expect(result).toEqual(mockData);
      });

      it('should throw an error for invalid type', async () => {
        await expect(
          selectDataByRange('1', '2025-02-01', '2025-02-20', 'invalidType'),
        ).rejects.toThrow('Invalid query type');
      });

      it('should throw an error when the query returns an error', async () => {
        mockSupabaseClient.rpc.mockResolvedValue({ error: 'Query error' });

        await expect(
          selectDataByRange('1', '2025-02-01', '2025-02-20', 'work'),
        ).rejects.toThrow('Error fetching data: undefined');
      });
    });

    describe('selectWaterDataByDateRange', () => {
      it('should return water data when successful', async () => {
        const userId = '1';
        const startDate = '2025-02-20';
        const endDate = '2025-02-21';
        const mockData = [
          { entry_date: startDate, water: 4 },
          { entry_date: endDate, water: 5 },
        ];

        const matchMock = jest.fn().mockResolvedValue({ data: mockData });

        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });

        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });

        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });
        const result = await selectWaterDataByDateRange(
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
        const mockError = { message: 'Failed to fetch water data' };
        const matchMock = jest
          .fn()
          .mockResolvedValue({ data: null, error: mockError });
        const lteMock = jest.fn().mockReturnValue({ match: matchMock });
        const gteMock = jest.fn().mockReturnValue({ lte: lteMock });

        const selectMock = jest.fn().mockReturnValue({ gte: gteMock });
        mockSupabaseClient.from.mockReturnValue({
          select: selectMock,
        });
        const result = await selectWaterDataByDateRange(
          '1',
          '2025-02-20',
          '2025-02-21',
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('responses');
        expect(selectMock).toHaveBeenCalled();
        expect(result).toEqual({ error: mockError.message });
        expect(console.error).toHaveBeenCalledWith(
          'Error selecting from responses:',
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
        const result = await selectWaterDataByDateRange(
          '1',
          '2025-02-20',
          '2025-02-21',
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('responses');
        expect(result).toEqual({ data: mockData.data });
        expect(selectMock).toHaveBeenCalled();
        expect(matchMock).toHaveBeenCalled();
      });
    });
  });
});
