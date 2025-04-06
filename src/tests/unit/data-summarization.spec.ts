import { summarizeData } from '@/actions/ai-data-analysis';
import { fetchResponse } from '@/actions/ai-fetch';
import {
  selectMoodFrequency,
  selectSleepDataByDateRange,
} from '@/actions/data-visualization';
import { getLocalISOString } from '@/lib/utils';

jest.mock('@/actions/ai-fetch', () => ({
  fetchResponse: jest.fn(),
}));

jest.mock('@/actions/data-visualization', () => ({
  selectSleepDataByDateRange: jest.fn(),
  selectMoodFrequency: jest.fn(),
}));

describe('AI Data Summarization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('summarizeSleepData', () => {
    it('should return a summarized sleep response when successful', async () => {
      const userId = '1';
      const todaysDate = '2025-02-20';
      const lastMonthDate = '2025-01-20';
      const mockData = [
        { entry_date: todaysDate, start: '22:00:00', end: '06:00:00' },
        { entry_date: lastMonthDate, start: '23:00:00', end: '07:00:00' },
      ];

      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({
        data: mockData,
      });
      (fetchResponse as jest.Mock).mockReturnValue(
        'You have an average sleep duration of 8 hours.',
      );

      const result = await summarizeData(userId, 'sleep', 'month');
      expect(selectSleepDataByDateRange).toHaveBeenCalled();
      expect(fetchResponse).toHaveBeenCalled();
      expect(result).toBe('You have an average sleep duration of 8 hours.');
    });

    it('should throw an error when data format is incorrect', async () => {
      console.error = jest.fn();
      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({
        data: [{ invalid: 'data' }],
      });
      await expect(summarizeData('1', 'sleep', 'month')).rejects.toThrow(
        'Data not in correct format',
      );
    });

    it('should throw an error when AI service is unavailable', async () => {
      console.error = jest.fn();
      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({ data: [] });
      (fetchResponse as jest.Mock).mockRejectedValue(
        new Error('AI service is currently unavailable'),
      );
      await expect(summarizeData('1', 'sleep', 'month')).rejects.toThrow(
        'AI service is currently unavailable',
      );
    });
  });

  describe('summarizeSleepData with different ranges', () => {
    const userId = '1';
    const todaysDate = getLocalISOString();

    it('should calculate correct dates for range: week', async () => {
      const today = new Date();
      const lastWeekDate = getLocalISOString(
        new Date(today.setDate(today.getDate() - 7)),
      );

      const mockData = [
        { entry_date: todaysDate, start: '22:00:00', end: '06:00:00' },
        { entry_date: lastWeekDate, start: '23:00:00', end: '07:00:00' },
      ];

      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({
        data: mockData,
      });
      (fetchResponse as jest.Mock).mockReturnValue('Summary for week range');

      const result = await summarizeData(userId, 'sleep', 'week');

      expect(selectSleepDataByDateRange).toHaveBeenCalledWith(
        userId,
        lastWeekDate, // 7 days before
        todaysDate,
      );
      expect(result).toBe('Summary for week range');
    });

    it('should calculate correct dates for range: month', async () => {
      const today = new Date();
      const lastMonthDate = getLocalISOString(
        new Date(today.setMonth(today.getMonth() - 1)),
      );

      const mockData = [
        { entry_date: todaysDate, start: '22:00:00', end: '06:00:00' },
        { entry_date: lastMonthDate, start: '23:00:00', end: '07:00:00' },
      ];

      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({
        data: mockData,
      });
      (fetchResponse as jest.Mock).mockReturnValue('Summary for month range');

      const result = await summarizeData(userId, 'sleep', 'month');

      expect(selectSleepDataByDateRange).toHaveBeenCalledWith(
        userId,
        lastMonthDate,
        todaysDate,
      );
      expect(result).toBe('Summary for month range');
    });

    it('should calculate correct dates for range: 3months', async () => {
      const today = new Date();
      const last3MonthsDate = getLocalISOString(
        new Date(today.setMonth(today.getMonth() - 3)),
      );

      const mockData = [
        { entry_date: todaysDate, start: '22:00:00', end: '06:00:00' },
        { entry_date: last3MonthsDate, start: '23:00:00', end: '07:00:00' },
      ];

      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({
        data: mockData,
      });
      (fetchResponse as jest.Mock).mockReturnValue('Summary for 3months range');

      const result = await summarizeData(userId, 'sleep', '3months');

      expect(selectSleepDataByDateRange).toHaveBeenCalledWith(
        userId,
        last3MonthsDate,
        todaysDate,
      );
      expect(result).toBe('Summary for 3months range');
    });

    it('should throw an error for invalid time range', async () => {
      await expect(
        summarizeData(userId, 'sleep', 'year' as any),
      ).rejects.toThrow('Invalid time range');
    });
  });

  describe('summarizeMoodData', () => {
    it('should return a summarized mood response when successful', async () => {
      const userId = '1';
      const mockData = [
        { scale_rating: 1, count: 5 },
        { scale_rating: 3, count: 10 },
        { scale_rating: 5, count: 3 },
      ];

      (selectMoodFrequency as jest.Mock).mockReturnValue({ data: mockData });
      (fetchResponse as jest.Mock).mockReturnValue(
        'Your mood has been mostly positive with some fluctuations.',
      );

      const result = await summarizeData(userId, 'mood', 'month');
      expect(selectMoodFrequency).toHaveBeenCalled();
      expect(fetchResponse).toHaveBeenCalled();
      expect(result).toBe(
        'Your mood has been mostly positive with some fluctuations.',
      );
    });

    it('should return a message when no mood data is available', async () => {
      (selectMoodFrequency as jest.Mock).mockReturnValue({ data: [] });
      const result = await summarizeData('1', 'mood', 'month');
      expect(result).toBe('No mood data available to summarize :(');
    });

    it('should throw an error when AI service is unavailable', async () => {
      console.error = jest.fn();
      (selectMoodFrequency as jest.Mock).mockReturnValue({
        data: [
          { scale_rating: 1, count: 5 },
          { scale_rating: 3, count: 10 },
          { scale_rating: 5, count: 3 },
        ],
      });
      (fetchResponse as jest.Mock).mockRejectedValue(
        new Error('AI service is currently unavailable'),
      );
      await expect(summarizeData('1', 'mood', 'month')).rejects.toThrow(
        'AI service is currently unavailable',
      );
    });
  });

  describe('summarizeData', () => {
    it('should throw an error for an invalid query type', async () => {
      await expect(summarizeData('1', 'invalidType', 'month')).rejects.toThrow(
        'Invalid query type',
      );
    });
  });
});
