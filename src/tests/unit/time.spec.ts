import {
  convertToLocalTime,
  convertToUtcTime,
  daysAgo,
  formatDate,
  getLatestDate,
  getStartDate,
} from '@/lib/time';

describe('Time Utils', () => {
  describe('convertToUtcTime', () => {
    it('should convert local time to UTC with full HH:mm:ss format', () => {
      const localTime = '12:30:15';

      const now = new Date();
      const localDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        30,
        15,
      );
      const expectedUtcTime = localDate.toISOString().substring(11, 19);

      const utcTime = convertToUtcTime(localTime);

      expect(utcTime).toBe(expectedUtcTime);
    });

    it('should convert local time to UTC when seconds are omitted', () => {
      const localTime = '12:30'; // No seconds provided

      const now = new Date();
      const localDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        30,
        0,
      ); // Default seconds to 0
      const expectedUtcTime = localDate.toISOString().substring(11, 19);

      const utcTime = convertToUtcTime(localTime);

      expect(utcTime).toBe(expectedUtcTime);
    });
  });

  describe('convertToLocalTime', () => {
    it('should convert UTC time to local time with full HH:mm:ss format', () => {
      const utcTime = '12:30:15';

      const now = new Date();
      const utcDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30, 15),
      );
      const expectedLocalTime = utcDate.toTimeString().substring(0, 8);

      const localTime = convertToLocalTime(utcTime);

      expect(localTime).toBe(expectedLocalTime);
    });

    it('should convert UTC time to local time when seconds are omitted', () => {
      const utcTime = '12:30'; // No seconds provided

      const now = new Date();
      const utcDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30, 0),
      ); // Default seconds to 0
      const expectedLocalTime = utcDate.toTimeString().substring(0, 8);

      const localTime = convertToLocalTime(utcTime);

      expect(localTime).toBe(expectedLocalTime);
    });
  });

  describe('daysAgo', () => {
    it('should return the correct number of days ago', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(daysAgo(today)).toBe(0);

      const oneDayAgo = new Date();
      oneDayAgo.setUTCDate(oneDayAgo.getUTCDate() - 1);
      expect(daysAgo(oneDayAgo.toISOString().split('T')[0])).toBe(1);
    });
  });

  describe('getLatestDate', () => {
    it('should return the later of two dates', () => {
      expect(getLatestDate('2024-03-10', '2024-03-11')).toBe('2024-03-11');
      expect(getLatestDate('2024-03-11', '2024-03-10')).toBe('2024-03-11');
    });

    it('should return the non-null date if only one is provided', () => {
      expect(getLatestDate('2024-03-10', null)).toBe('2024-03-10');
      expect(getLatestDate(null, '2024-03-11')).toBe('2024-03-11');
    });

    it('should return null if both dates are null', () => {
      expect(getLatestDate(null, null)).toBeNull();
    });
  });

  describe('getStartDate', () => {
    beforeEach(() => {
      // Freeze the current date for consistent test output
      jest.useFakeTimers().setSystemTime(new Date('2025-04-06T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns date 7 days ago for "week"', () => {
      const result = getStartDate('week');
      expect(result).toBe('2025-03-30');
    });

    it('returns date 1 month ago for "month"', () => {
      const result = getStartDate('month');
      expect(result).toBe('2025-03-06');
    });

    it('returns date 3 months ago for "3months"', () => {
      const result = getStartDate('3months');
      expect(result).toBe('2025-01-06');
    });

    it('returns date 1 year ago for "year"', () => {
      const result = getStartDate('year');
      expect(result).toBe('2024-04-06');
    });

    it('uses default case for unknown timeRange', () => {
      const result = getStartDate('unknown' as any);
      expect(result).toBe('2025-03-06');
    });
  });

  describe('formatDate', () => {
    it('formats valid date string', () => {
      const formatted = formatDate('2024-12-25');
      expect(formatted).toBe('Dec 25, 2024');
    });
  });
});
