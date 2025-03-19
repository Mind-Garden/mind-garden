import supabase from '../../../jest.setup';
import { getLocalISOString } from '@/lib/utils';
import {
  selectMoodDataByDateRange,
  selectSleepDataByDateRange,
  selectDataByRange,
  selectWorkDataByDateRange,
  selectStudyDataByDateRange,
  selectWaterDataByDateRange,
} from '@/actions/data-visualization';

jest.mock('next/cache');
jest.mock('next/navigation');

describe('Data Visualization Integration Tests', () => {
  let userId: string;
  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );

  beforeAll(async () => {
    // Create a test user
    const formData = {
      email: `testuser${Date.now()}@example.com`,
      password: 'TestPass123!',
      options: {
        data: { first_name: 'Test', last_name: 'User' },
      },
    };

    const { data, error } = await supabase.auth.signUp(formData);
    if (error || !data.user) throw new Error('Failed to create test user');

    userId = data.user.id;

    await supabase.from('responses').insert([
      {
        user_id: userId,
        scale_rating: 4,
        entry_date: '2025-03-01',
        water: 2,
        work_hours: 2,
        work_rating: 3,
        study_hours: 4,
        study_rating: 5,
      },
      {
        user_id: userId,
        scale_rating: 3,
        entry_date: '2025-03-02',
        water: 3,
        work_hours: 1,
        work_rating: 3,
        study_hours: 2,
        study_rating: 1,
      },
    ]);

    await supabase.from('sleep_entries').insert([
      {
        user_id: userId,
        entry_date: '2025-03-01',
        start: '22:00',
        end: '06:00',
      },
      {
        user_id: userId,
        entry_date: '2025-03-02',
        start: '21:00',
        end: '07:00',
      },
      {
        user_id: userId,
        entry_date: '2025-03-03',
        start: '23:00',
        end: '08:00',
      },
    ]);
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('responses').delete().eq('user_id', userId);
    await supabase.from('sleep_entries').delete().eq('user_id', userId);
    await supabase.auth.admin.deleteUser(userId);
  });

  describe('Data Visualization Integration Tests', () => {
    it('should return mood data for the given date range', async () => {
      const result = await selectMoodDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      expect(result.data).toEqual([
        { scale_rating: 4, entry_date: '2025-03-01' },
        { scale_rating: 3, entry_date: '2025-03-02' },
      ]);
    });

    it('should return sleep data for the given date range', async () => {
      const result = await selectSleepDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      expect(result.data).toEqual([
        { entry_date: '2025-03-01', start: '22:00:00', end: '06:00:00' },
        { entry_date: '2025-03-02', start: '21:00:00', end: '07:00:00' },
        { entry_date: '2025-03-03', start: '23:00:00', end: '08:00:00' },
      ]);
    });

    it('should return water intake data for the given date range', async () => {
      const result = await selectWaterDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      expect(result.data).toEqual([
        { entry_date: '2025-03-01', water: 2 },
        { entry_date: '2025-03-02', water: 3 },
      ]);
    });

    it('should return an empty array for a date range with no entries', async () => {
      const result = await selectMoodDataByDateRange(
        userId,
        '2025-02-01',
        '2025-02-04',
      );
      expect(result.data).toEqual([]);
    });

    it('should return an empty array for a future date range', async () => {
      const result = await selectSleepDataByDateRange(
        userId,
        '2025-05-01',
        '2025-05-04',
      );
      expect(result.data).toEqual([]);
    });

    it('should return an empty array for an invalid date range', async () => {
      const result = await selectMoodDataByDateRange(
        userId,
        '2025-12-31',
        '2025-01-01',
      );
      expect(result.data).toEqual([]);
    });

    it('should return an error for an invalid user ID', async () => {
      const result = await selectMoodDataByDateRange(
        'invalid-user-id',
        lastMonthDate,
        todaysDate,
      );
      expect(result).toHaveProperty('error');
    });

    it('should return partial results if only some dates have data', async () => {
      const result = await selectMoodDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      expect(result.data).toEqual([
        { scale_rating: 4, entry_date: '2025-03-01' },
        { scale_rating: 3, entry_date: '2025-03-02' },
      ]);
    });

    it('should return an error for an invalid date format', async () => {
      const result = await selectMoodDataByDateRange(
        userId,
        'invalid-date',
        todaysDate,
      );
      expect(result).toHaveProperty('error');
    });

    it('should fetch generic data by range for study type', async () => {
      const result = await selectStudyDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      expect(result.data).toEqual([
        {
          entry_date: '2025-03-01',
          tags: [null],
          study_hours: 4,
          study_rating: 5,
        },
        {
          entry_date: '2025-03-02',
          tags: [null],
          study_hours: 2,
          study_rating: 1,
        },
      ]);
    });

    it('should fetch generic data by range for work type', async () => {
      const result = await selectWorkDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      expect(result.data).toEqual([
        {
          entry_date: '2025-03-01',
          tags: [null],
          work_hours: 2,
          work_rating: 3,
        },
        {
          entry_date: '2025-03-02',
          tags: [null],
          work_hours: 1,
          work_rating: 3,
        },
      ]);
    });

    it('should fetch generic data by range for study type', async () => {
      const result = await selectDataByRange(
        userId,
        lastMonthDate,
        todaysDate,
        'study',
      );
      expect(result).toEqual([
        {
          entry_date: '2025-03-01',
          tags: [null],
          study_hours: 4,
          study_rating: 5,
        },
        {
          entry_date: '2025-03-02',
          tags: [null],
          study_hours: 2,
          study_rating: 1,
        },
      ]);
    });

    it('should fetch generic data by range for work type', async () => {
      const result = await selectDataByRange(
        userId,
        lastMonthDate,
        todaysDate,
        'work',
      );
      expect(result).toEqual([
        {
          entry_date: '2025-03-01',
          work_rating: 3,
          work_hours: 2,
          tags: [null],
        },
        {
          entry_date: '2025-03-02',
          work_rating: 3,
          work_hours: 1,
          tags: [null],
        },
      ]);
    });
  });
});
