import { getSupabaseClient } from '@/supabase/client';
import {
  getPersonalizedCategories,
  addUserHabit,
  getAddedCategories,
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
      const mockData = [{ id: 1, name: 'Category 1' }];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await getPersonalizedCategories();
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return personalized categories when successful', async () => {
      const mockError = { message: 'Error selecting personalized categories' };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await getPersonalizedCategories();
      expect(result).toEqual(null);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });

  describe('getAddedCategories', () => {
    it('should return added categories', async () => {
      const mockData = [{ user_id: 'user123', added_habit: 'habit123' }];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const result = await getAddedCategories('user123');
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should fail at returning added categories', async () => {
      const mockError = { message: 'Error selecting added categories' };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const result = await getAddedCategories('user123');
      expect(result).toEqual(null);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });

  describe('getAddedResp', () => {
    it('should return added responses', async () => {
      const mockData = [
        {
          user_id: 'user123',
          habit: 'habit123',
          tracking_method: { value: true },
        },
      ];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const result = await getAddedResp('user123', '2025-03-13');
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should fail at returning added responses', async () => {
      const mockError = { message: 'Error selecting added habit responses' };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const result = await getAddedResp('user123', '2025-03-13');
      expect(result).toEqual(null);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });

  describe('getAllAddedRespCategory', () => {
    it('should return all added responses for a category', async () => {
      const mockData = [{ user_id: 'user123', habit: 'habit123' }];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const result = await getAllAddedRespCategory('user123', 'habit123');
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should fail at returning all added responses for a category', async () => {
      const mockError = {
        message: 'Error getting all added responses by category',
      };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const result = await getAllAddedRespCategory('user123', 'habit123');
      expect(result).toEqual(null);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });

  describe('addUserHabit', () => {
    it('should insert new habit', async () => {
      const mockData: any[] = [];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        insert: insertMock,
      });

      const result = await addUserHabit('1', 'category', 'boolean');

      expect(result).toEqual('success');
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should update a habits tracking methods', async () => {
      const mockData: any[] = [
        { userId: '1', added_habit: 'category', tracking_method: ['scale'] },
      ];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      const updateSelectMock = jest
        .fn()
        .mockResolvedValue({ select: selectMock });
      const updateMatchMock = jest
        .fn()
        .mockReturnValue({ select: updateSelectMock });
      const updateMock = jest.fn().mockReturnValue({ match: updateMatchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      });

      const result = await addUserHabit('1', 'category', 'boolean');

      expect(result).toEqual('success');
      expect(updateMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should fail at selecting habit', async () => {
      const mockError = {
        message: 'Error getting all added responses by category',
      };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        insert: insertMock,
      });

      const result = await addUserHabit('1', 'category', 'boolean');

      expect(result).toEqual(null);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should fail at inserting a habit', async () => {
      const mockData: any[] = [];
      const mockError = {
        message: 'Error getting all added responses by category',
      };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      const insertSelectMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const insertMock = jest
        .fn()
        .mockReturnValue({ select: insertSelectMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        insert: insertMock,
      });

      const result = await addUserHabit('1', 'category', 'boolean');

      expect(result).toEqual(null);
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should fail at updating a habit', async () => {
      const mockError = {
        message: 'Error getting all added responses by category',
      };
      const mockData: any[] = [
        { userId: '1', added_habit: 'category', tracking_method: ['scale'] },
      ];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      const updateSelectMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const updateMatchMock = jest
        .fn()
        .mockReturnValue({ select: updateSelectMock });
      const updateMock = jest.fn().mockReturnValue({ match: updateMatchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      });

      const result = await addUserHabit('1', 'category', 'boolean');

      expect(result).toEqual(null);
      expect(updateMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should do nothing if inserting a duplicate habit', async () => {
      const mockData: any[] = [
        { userId: '1', added_habit: 'category', tracking_method: ['boolean'] },
      ];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await addUserHabit('1', 'category', 'boolean');

      expect(result).toEqual('duplicate');
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });

  describe('addResp', () => {
    it('it should insert a new response', async () => {
      const mockData: any[] = [];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        insert: insertMock,
      });

      const result = await addResp('1', 'category', { boolean: true }, '');

      expect(result).toEqual('success');
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should fail at inserting new response', async () => {
      const mockData: any[] = [];
      const mockError = {
        message: 'Error getting all added responses by category',
      };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      const insertSelectMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const insertMock = jest
        .fn()
        .mockReturnValue({ select: insertSelectMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        insert: insertMock,
      });

      const result = await addResp('1', 'category', { boolean: true }, '');

      expect(result).toEqual(null);
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should fail selecting a response', async () => {
      const mockError = {
        message: 'Error getting all added responses by category',
      };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        insert: insertMock,
      });

      const result = await addResp('1', 'category', { boolean: true }, '');

      expect(result).toEqual(null);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should update a habits tracking methods', async () => {
      const mockData: any[] = [
        { userId: '1', added_habit: 'category', tracking_method: ['scale'] },
      ];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      const updateSelectMock = jest
        .fn()
        .mockResolvedValue({ select: selectMock });
      const updateMatchMock = jest
        .fn()
        .mockReturnValue({ select: updateSelectMock });
      const updateMock = jest.fn().mockReturnValue({ match: updateMatchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      });

      const result = await addResp('1', 'category', { boolean: true }, '');

      expect(result).toEqual('success');
      expect(updateMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('it should fail at updating a habits tracking methods', async () => {
      const mockError = {
        message: 'Error getting all added responses by category',
      };
      const mockData: any[] = [
        { userId: '1', added_habit: 'category', tracking_method: ['scale'] },
      ];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      const updateSelectMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const updateMatchMock = jest
        .fn()
        .mockReturnValue({ select: updateSelectMock });
      const updateMock = jest.fn().mockReturnValue({ match: updateMatchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      });

      const result = await addResp('1', 'category', { boolean: true }, '');

      expect(result).toEqual(null);
      expect(updateMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });
});
