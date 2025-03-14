import {
  cn,
  getDate,
  undoConversion,
  getLocalISOString,
  getSleepDuration,
  getBarColour,
  getTimeAMPM,
  getGreetingText,
  getAverageTimeElapsed,
} from '@/lib/utils'; // replace with the actual path of your file

afterEach(() => {
  // Restore global Date to its original state after each test
  jest.restoreAllMocks();
});

describe('Utility functions', () => {
  describe('cn function', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });
  });

  describe('getLocalISOString function', () => {
    it('should return the local date in YYYY-MM-DD format', () => {
      const date = new Date('2025-02-20T12:00:00Z');
      const result = getLocalISOString(date);
      expect(result).toBe('2025-02-20');
    });
  });

  describe('getSleepDuration function', () => {
    it('should return the correct sleep duration in hours', () => {
      expect(getSleepDuration('10:00 PM', '6:00 AM')).toBe(8);
      expect(getSleepDuration('11:00 PM', '3:00 AM')).toBe(4);
    });
  });

  describe('getBarColour function', () => {
    it('should return the correct color based on the sleep duration', () => {
      expect(getBarColour(5)).toBe('#d9d9d9');
      expect(getBarColour(7)).toBe('#83e3c6');
      expect(getBarColour(9)).toBe('#2ebb61');
    });
  });

  describe('getTimeAMPM function', () => {
    it('should convert 24-hour time to AM/PM format', () => {
      expect(getTimeAMPM('14:30')).toBe('2:30 PM');
      expect(getTimeAMPM('02:30')).toBe('2:30 AM');
    });
  });

  describe('getGreetingText function', () => {
    it('should return the correct greeting based on the current time', () => {
      // Spy on Date.prototype.getHours
      const getHoursSpy = jest.spyOn(Date.prototype, 'getHours');

      // Mock different times for the test
      getHoursSpy.mockReturnValue(6); // Mocking morning time (6 AM)
      expect(getGreetingText()).toBe('Good Morning');

      getHoursSpy.mockReturnValue(12); // Mocking afternoon time (12 PM)
      expect(getGreetingText()).toBe('Good Afternoon');

      getHoursSpy.mockReturnValue(18); // Mocking evening time (6 PM)
      expect(getGreetingText()).toBe('Good Evening');

      // Restore the original implementation after the test
      getHoursSpy.mockRestore();
    });
  });

  describe('getAverageTimeElapsed function', () => {
    it('should return the correct average time elapsed', () => {
      const times = [60, 120, 180];
      const result = getAverageTimeElapsed(times);
      expect(result).toBe(120); // (60 + 120 + 180) / 3 = 120
    });

    it('should return 0 if the times array is empty', () => {
      const result = getAverageTimeElapsed([]);
      expect(result).toBe(0);
    });
  });
});
