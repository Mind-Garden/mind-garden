import {
  deleteResponses,
  insertResponses,
  selectAllFromAttributes,
  selectAllFromCategories,
  selectResponsesByDate,
} from '@/utils/supabase/dbfunctions';
import { createClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('Data Intake Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
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
        'Error selecting responses by date:',
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

    it('should throw an error when there is a failure', async () => {
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Error' } });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      await expect(selectAllFromAttributes()).rejects.toThrow('Error');
    });
  });

  describe('selectResponsesByDate', () => {
    it('should return responses for a given user and date', async () => {
      const mockData = [{ id: 1, response: 'Good day' }];
      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectResponsesByDate('user123', '2024-02-23');
      expect(result).toEqual(mockData);
      expect(selectMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should return empty array when no data is found', async () => {
      const matchMock = jest.fn().mockResolvedValue({ data: [], error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await selectResponsesByDate('user123', '2024-02-23');
      expect(result).toEqual([]);
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
      ).rejects.toThrow('Fetch error');
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

    it('should throw an error when insert fails', async () => {
      const selectMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Insert error' } });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock,
      });

      await expect(
        insertResponses(new Set(['attr1']), 'user123', 5),
      ).rejects.toThrow('Insert error');
    });
  });

  describe('deleteResponses', () => {
    it('should successfully delete responses', async () => {
      const inMock = jest.fn().mockResolvedValue({ error: null });
      const matchMock = jest.fn().mockReturnValue({ in: inMock });
      const deleteMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        delete: deleteMock,
      });

      await expect(
        deleteResponses(new Set(['attr1', 'attr2']), 'user123'),
      ).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
      expect(inMock).toHaveBeenCalled();
    });

    it('should throw an error when delete fails', async () => {
      const inMock = jest
        .fn()
        .mockResolvedValue({ error: { message: 'Delete error' } });
      const matchMock = jest.fn().mockReturnValue({ in: inMock });
      const deleteMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        delete: deleteMock,
      });

      await expect(
        deleteResponses(new Set(['attr1', 'attr2']), 'user123'),
      ).rejects.toThrow('Delete error');
    });
  });
});
