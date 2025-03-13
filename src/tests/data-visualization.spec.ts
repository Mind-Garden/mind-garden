import { getSupabaseClient } from '@/supabase/client';
import {
  getPersonalizedCategories,
  addUserHabit,
  getAddedCategories,
  insertAddedResp,
  getAddedResp,
  addResp,
  getAllAddedRespCategory,
} from '@/actions/data-intake';

jest.mock('@/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('Habit Tracking Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('getPersonalizedCategories', () => {
    it('should return personalized categories when successful', async () => {
      const mockData = [{ id: '1', name: 'Fitness' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getPersonalizedCategories();
      expect(result).toEqual(mockData);
    });

    it('should return null and log an error if query fails', async () => {
      console.error = jest.fn();
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      });

      const result = await getPersonalizedCategories();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error selecting personalized categories:',
        'DB error',
      );
    });
  });

  describe('addUserHabit', () => {
    it('should insert new habit if it does not exist', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [] }),
      });
      const insertMock = jest.fn().mockResolvedValue({});
      mockSupabaseClient.from.mockReturnValue({ insert: insertMock });

      const result = await addUserHabit('user1', 'habit1', 'breakfast');
      expect(result).toBe('success');
      expect(insertMock).toHaveBeenCalled();
    });

    it('should update habit if it already exists', async () => {
      const mockData = [{ tracking_method: ['lunch'] }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });
      const updateMock = jest.fn().mockResolvedValue({});
      mockSupabaseClient.from.mockReturnValue({ update: updateMock });

      const result = await addUserHabit('user1', 'habit1', 'breakfast');
      expect(result).toBe('success');
      expect(updateMock).toHaveBeenCalled();
    });

    it('should return "duplicate" if habit already exists with same tracking method', async () => {
      const mockData = [{ tracking_method: ['breakfast'] }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await addUserHabit('user1', 'habit1', 'breakfast');
      expect(result).toBe('duplicate');
    });
  });

  describe('getAddedCategories', () => {
    it('should return added categories', async () => {
      const mockData = [{ id: '1', name: 'Running' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getAddedCategories('user1');
      expect(result).toEqual(mockData);
    });

    it('should return null and log an error if query fails', async () => {
      console.error = jest.fn();
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      });

      const result = await getAddedCategories('user1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error selecting added categories:',
        'DB error',
      );
    });
  });

  describe('insertAddedResp', () => {
    it('should insert response successfully', async () => {
      const insertMock = jest.fn().mockResolvedValue({});
      mockSupabaseClient.from.mockReturnValue({ insert: insertMock });

      await insertAddedResp('user1', 'habit1', { value: 'yes' });
      expect(insertMock).toHaveBeenCalled();
    });

    it('should log an error if insertion fails', async () => {
      console.error = jest.fn();
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      });

      await insertAddedResp('user1', 'habit1', { value: 'yes' });
      expect(console.error).toHaveBeenCalledWith('Error inserting response:', {
        message: 'DB error',
      });
    });
  });

  describe('getAddedResp', () => {
    it('should return added responses', async () => {
      const mockData = [{ user_id: '1', habit: 'Running' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getAddedResp('user1', '2025-02-20');
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllAddedRespCategory', () => {
    it('should return responses for a category', async () => {
      const mockData = [{ habit: 'Running', user_id: '1' }];
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData }),
      });

      const result = await getAllAddedRespCategory('user1', 'Running');
      expect(result).toEqual(mockData);
    });
  });
});
