import {
  insertResponses,
  selectAllFromAttributes,
  selectAllFromCategories,
  selectResponsesByDate,
  updateResponses,
} from '@/utils/supabase/dbfunctions';
import { getSupabaseClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('Data Intake Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('selectAllFromCategories', () => {
    it('should return categories when data is available', async () => {
      const mockData = [{ id: 1, name: 'Category 1' }];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectAllFromCategories();
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return null and log an error when there is a failure', async () => {
      console.error = jest.fn();
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Error' } });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectAllFromCategories();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error selecting categories:',
        'Error',
      );
    });
  });

  describe('selectAllFromAttributes', () => {
    it('should return attributes when data is available', async () => {
      const mockData = [{ id: 1, name: 'Attribute 1' }];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectAllFromAttributes();
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return null when there is a failure', async () => {
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Error' } });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      await expect(selectAllFromAttributes()).resolves.toBeNull();
    });
  });

  describe('selectResponsesByDate', () => {
    it('should return responses for a given user and date', async () => {
      const mockData = { id: 1, response: 'Good day' };
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: [mockData], error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectResponsesByDate('user123', '2024-02-23');
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return null when no data is found', async () => {
      const matchMock = jest.fn().mockResolvedValue({ data: [], error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectResponsesByDate('user123', '2024-02-23');
      expect(result).toBeNull();
    });

    it('should throw an error when fetching responses fails', async () => {
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Fetch error' } });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      await expect(
        selectResponsesByDate('user123', '2024-02-23'),
      ).resolves.toBeNull();
    });
  });

  describe('insertResponses', () => {
    it('should successfully insert responses', async () => {
      const selectMock = jest
        .fn()
        .mockResolvedValue({ data: [{}], error: null });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock,
      });

      await expect(
        insertResponses(new Set(['attr1', 'attr2']), 'user123', 5),
      ).resolves.toBeUndefined();
      expect(selectMock).toHaveBeenCalled();
      expect(insertMock).toHaveBeenCalled();
    });

    it('should return when insert fails', async () => {
      const selectMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Insert error' } });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock,
      });

      await expect(
        insertResponses(new Set(['attr1']), 'user123', 5),
      ).resolves.toBeUndefined();
    });
  });

  describe('updateResponses', () => {
    const responseId = 'response123';
    const userId = 'user123';
    const attributeIds = ['attr1', 'attr2'];
    const scaleRating = 5;

    it('should successfully update responses', async () => {
      const matchMock = jest.fn().mockReturnThis();
      const selectMock = jest
        .fn()
        .mockResolvedValue({ data: [{}], error: null });
      const updateMock = jest
        .fn()
        .mockReturnValue({ match: matchMock, select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
      });

      await expect(
        updateResponses(responseId, new Set(attributeIds), userId, scaleRating),
      ).resolves.toBeUndefined();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('responses');
      expect(updateMock).toHaveBeenCalledWith({
        attribute_ids: attributeIds,
        scale_rating: scaleRating,
      });
      expect(matchMock).toHaveBeenCalledWith({
        id: responseId,
        user_id: userId,
        entry_date: expect.any(String),
      });
    });

    it('should return when update fails', async () => {
      console.error = jest.fn();
      const matchMock = jest.fn().mockReturnThis();
      const selectMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Update error' } });
      const updateMock = jest
        .fn()
        .mockReturnValue({ match: matchMock, select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
      });

      await expect(
        updateResponses(responseId, new Set(attributeIds), userId, scaleRating),
      ).resolves.toBeUndefined();
    });
  });
});
