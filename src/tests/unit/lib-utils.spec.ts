import {
  calculateDuration,
  capitalizeWords,
  cn,
  getAverageTimeElapsed,
  getGreetingText,
  getLocalISOString,
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

  describe('capitalizeWords function', () => {
    it('should capitalize the first letter of each word', () => {
      const result = capitalizeWords('hello world');
      expect(result).toBe('Hello World');
    });
  });

  describe('calculateDuration function', () => {
    it('should calculate duration within the same AM period', () => {
      const result = calculateDuration('9:00 AM', '11:30 AM');
      expect(result).toBe('2h 30m');
    });

    it('should calculate duration within the same PM period', () => {
      const result = calculateDuration('2:15 PM', '4:45 PM');
      expect(result).toBe('2h 30m');
    });

    it('should calculate duration crossing from AM to PM', () => {
      const result = calculateDuration('11:00 AM', '1:00 PM');
      expect(result).toBe('2h 0m');
    });

    it('should calculate overnight duration correctly', () => {
      const result = calculateDuration('10:00 PM', '6:00 AM');
      expect(result).toBe('8h 0m');
    });

    it('should handle edge case of midnight', () => {
      const result = calculateDuration('11:59 PM', '12:01 AM');
      expect(result).toBe('0h 2m');
    });

    it('should handle edge case of noon', () => {
      const result = calculateDuration('11:30 AM', '12:30 PM');
      expect(result).toBe('1h 0m');
    });
  });
});
