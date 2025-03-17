import supabase from '../../../jest.setup';
import { getLocalISOString } from '@/lib/utils';
import {
  selectAllFromCategories,
  selectAllFromAttributes,
  getPersonalizedCategories,
  addResp,
  getAllAddedRespCategory,
  getAddedResp,
  getAddedCategories,
  addUserHabit,
} from '@/actions/data-intake';

jest.mock('next/cache');
jest.mock('next/navigation');

describe('Data intake Integration Tests', () => {
  let userId: string;

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

  it('should select all from categories', async () => {
    //selectAllFromCategories
    const result = await selectAllFromCategories();

    expect(result).toBeDefined();
    expect(result?.length).toBe(3);
  });

  it('it should select all attributes', async () => {
    //selectAllFromAttributes
    const result = await selectAllFromAttributes();

    expect(result).toBeDefined();
    expect(result?.length).toBe(22);
  });

  it('it should get personalized categories', async () => {
    // getPersonalizedCategories
    const result = await getPersonalizedCategories();

    expect(result).toBeDefined();
    expect(result?.length).toBe(5);
  });

  it('it should add a new response', async () => {
    //addResp new
    const result = await addResp(
      userId,
      '00068b9b-5431-4275-9479-f34cf445be23',
      { boolean: false },
      'today',
    );

    expect(result).toBeDefined();
    expect(result).toBe('success');
  });

  it('it should update a new response', async () => {
    //addResp update
    const result = await addResp(
      userId,
      '00068b9b-5431-4275-9479-f34cf445be23',
      { boolean: true },
      getLocalISOString(),
    );

    expect(result).toBeDefined();
    expect(result).toBe('success');
  });

  it('it should get response by category', async () => {
    //getAllAddedRespCategory
    const result = await getAllAddedRespCategory(
      userId,
      '00068b9b-5431-4275-9479-f34cf445be23',
    );

    expect(result).toBeDefined();
    expect(result?.length).toBe(1);
  });

  it('it should get response by date', async () => {
    //getAddedResp
    const result = await getAddedResp(userId, getLocalISOString());

    expect(result).toBeDefined();
    expect(result?.length).toBe(1);
  });

  it('it should add new habit', async () => {
    // addUserHabit insert new
    const result = await addUserHabit(
      userId,
      '00068b9b-5431-4275-9479-f34cf445be23',
      'boolean',
    );

    expect(result).toBeDefined();
    expect(result).toBe('success');
  });

  it('it should add new tracking method to already exiisting habit', async () => {
    // addUserHabit update
    const result = await addUserHabit(
      userId,
      '00068b9b-5431-4275-9479-f34cf445be23',
      'scale',
    );

    expect(result).toBeDefined();
    expect(result).toBe('success');
  });

  it('it should get added categories', async () => {
    //getAddedCategories
    const result = await getAddedCategories(userId);

    expect(result).toBeDefined();
    expect(result?.length).toBe(1);
  });
});
