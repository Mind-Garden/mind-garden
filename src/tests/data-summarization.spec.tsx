import { fetchResponse } from '@/actions/ai-fetch';
import {
  selectSleepDataByDateRange,
  selectMoodFrequency,
} from '@/actions/data-visualization';
import { summarizeData } from '@/actions/ai-data-analysis';

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

      const result = await summarizeData(userId, 'sleep');
      expect(selectSleepDataByDateRange).toHaveBeenCalled();
      expect(fetchResponse).toHaveBeenCalled();
      expect(result).toBe('You have an average sleep duration of 8 hours.');
    });

    it('should throw an error when data format is incorrect', async () => {
      console.error = jest.fn();
      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({
        data: [{ invalid: 'data' }],
      });
      await expect(summarizeData('1', 'sleep')).rejects.toThrow(
        'Data not in correct format',
      );
    });

    it('should throw an error when AI service is unavailable', async () => {
      console.error = jest.fn();
      (selectSleepDataByDateRange as jest.Mock).mockReturnValue({ data: [] });
      (fetchResponse as jest.Mock).mockRejectedValue(
        new Error('AI service is currently unavailable'),
      );
      await expect(summarizeData('1', 'sleep')).rejects.toThrow(
        'AI service is currently unavailable',
      );
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

      const result = await summarizeData(userId, 'mood');
      expect(selectMoodFrequency).toHaveBeenCalled();
      expect(fetchResponse).toHaveBeenCalled();
      expect(result).toBe(
        'Your mood has been mostly positive with some fluctuations.',
      );
    });

    it('should return a message when no mood data is available', async () => {
      (selectMoodFrequency as jest.Mock).mockReturnValue({ data: [] });
      const result = await summarizeData('1', 'mood');
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
      await expect(summarizeData('1', 'mood')).rejects.toThrow(
        'AI service is currently unavailable',
      );
    });
  });

  describe('summarizeData', () => {
    it('should throw an error for an invalid query type', async () => {
      await expect(summarizeData('1', 'invalidType')).rejects.toThrow(
        'Invalid query type',
      );
    });
  });
});
