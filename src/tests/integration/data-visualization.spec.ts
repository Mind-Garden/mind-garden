import supabase from '../../../jest.setup';
import { getLocalISOString } from '@/lib/utils';
import {
  selectMoodDataByDateRange,
  selectMoodFrequency,
  selectSleepDataByDateRange,
  selectDataByRange,
  selectWorkDataByDateRange,
  selectStudyDataByDateRange,
  selectWaterDataByDateRange,
  getDataHeatmap,
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
    // Create a input
    const formData = {
      email: `data${Date.now()}@example.com`,
      password: 'data123!',
      options: {
        data: {
          first_name: 'data',
          last_name: 'Tester',
        },
      },
    };
    const { data, error } = await supabase.auth.signUp(formData);

    if (error || !data.user) {
      throw new Error('Failed to create test user');
    }

    userId = data.user.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test user (admin privileges needed)
    await supabase.auth.admin.deleteUser(userId);
  });

  it('should fetch heatmap data', async () => {
    const result = await getDataHeatmap(userId);
    expect(result).toBeDefined();
  });

  it('should fetch mood data by date range', async () => {
    const result = await selectMoodDataByDateRange(
      userId,
      lastMonthDate,
      todaysDate,
    );
    expect(result).toBeDefined();
  });

  it('should fetch mood frequency data', async () => {
    const result = await selectMoodFrequency(userId, lastMonthDate, todaysDate);
    expect(result).toBeDefined();
  });

  it('should fetch sleep data by date range', async () => {
    const result = await selectSleepDataByDateRange(
      userId,
      lastMonthDate,
      todaysDate,
    );
    expect(result).toBeDefined();
  });

  it('should fetch work data by date range', async () => {
    const result = await selectWorkDataByDateRange(
      userId,
      lastMonthDate,
      todaysDate,
    );
    expect(result).toBeDefined();
  });

  it('should fetch study data by date range', async () => {
    const result = await selectStudyDataByDateRange(
      userId,
      lastMonthDate,
      todaysDate,
    );
    expect(result).toBeDefined();
  });

  it('should fetch water intake data by date range', async () => {
    const result = await selectWaterDataByDateRange(
      userId,
      lastMonthDate,
      todaysDate,
    );
    expect(result).toBeDefined();
  });

  it('should fetch generic data by range for study type', async () => {
    const result = await selectDataByRange(
      userId,
      lastMonthDate,
      todaysDate,
      'study',
    );
    expect(result).toBeDefined();
  });

  it('should fetch generic data by range for work type', async () => {
    const result = await selectDataByRange(
      userId,
      lastMonthDate,
      todaysDate,
      'work',
    );
    expect(result).toBeDefined();
  });

  it('should return an empty array for an invalid date range', async () => {
    const result = await selectMoodDataByDateRange(
      userId,
      '2025-12-31',
      '2025-01-01',
    );
    expect(result).toEqual({ data: [] });
  });
});
