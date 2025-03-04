import {
  saveJournalEntry,
  fetchJournalEntries,
  updateJournalEntry,
  deleteJournalEntry,
  getRandomPrompt,
} from '@/utils/supabase/dbfunctions';

import { undoConversion } from '@/lib/utility';
import { getSupabaseClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('Journal Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('Save Journal Entry', () => {
    it('should return the saved entry when insert is successful', async () => {
      const mockData = {
        data: [
          {
            journalText: 'Mock Journal Entry',
            userId: '1',
            entry_date: '2025-01-01',
          },
        ],
      };
      const selectMock = jest
        .fn()
        .mockResolvedValue({ data: mockData['data'], error: null });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock,
      });

      const result = await saveJournalEntry(
        mockData.data[0].journalText,
        mockData.data[0].userId,
      );
      expect(result).toEqual(mockData);
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
    });

    it('should return error.message and log the error on failure', async () => {
      console.error = jest.fn();
      const mockData = {
        data: [
          {
            journalText: 'Mock Journal Entry',
            userId: '1',
            entry_date: '2025-01-01',
          },
        ],
      };
      const mockReturnValue = { data: null, error: { message: 'Error' } };

      const selectMock = jest.fn().mockResolvedValue(mockReturnValue);
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseClient.from.mockReturnValue({
        insert: insertMock,
      });

      const result = await saveJournalEntry(
        mockData.data[0].journalText,
        mockData.data[0].userId,
      );
      expect(result).toEqual({ error: mockReturnValue.error.message });
      expect(insertMock).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Error inserting into journal_entries:',
        mockReturnValue.error.message,
      );
    });

    it('should not proceed with empty entry text', async () => {
      const userId = '1';
      const emptyEntryText = '   ';

      const result = await saveJournalEntry(emptyEntryText, userId);

      expect(result).toBeUndefined();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('Fetch Journal Entries', () => {
    it('should return journal entries when select is successful', async () => {
      console.error = jest.fn();
      const userId = '1';
      const mockEntries = [
        {
          id: '1',
          journal_text: 'Entry 1',
          user_id: userId,
          entry_date: '2025-01-01',
        },
        {
          id: '2',
          journal_text: 'Entry 2',
          user_id: userId,
          entry_date: '2025-01-01',
        },
      ];

      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: mockEntries, error: null });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await fetchJournalEntries(userId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('journal_entries');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(result).toEqual({ data: mockEntries });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return error when select fails', async () => {
      console.error = jest.fn();
      const userId = '1';
      const mockError = { message: 'Database error' };

      const matchMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const selectMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        select: selectMock,
      });

      const result = await fetchJournalEntries(userId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('journal_entries');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(result).toEqual({ error: mockError.message });
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching journal entries:',
        mockError.message,
      );
    });
  });

  describe('Update Journal Entry', () => {
    it('should update the journal entry successfully', async () => {
      console.error = jest.fn();
      const entryId = '1';
      const newEntryText = 'Updated journal entry';
      const mockUpdatedEntry = {
        id: entryId,
        journal_text: newEntryText,
        user_id: '1',
        entry_date: '2025-01-01',
      };

      const selectMock = jest.fn().mockResolvedValue({
        data: [mockUpdatedEntry],
        error: null,
      });

      const matchMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const updateMock = jest.fn().mockReturnValue({
        match: matchMock,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
      });

      const result = await updateJournalEntry(entryId, newEntryText);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('journal_entries');
      expect(updateMock).toHaveBeenCalledWith({ journal_text: newEntryText });
      expect(matchMock).toHaveBeenCalledWith({ id: entryId });
      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual({ data: [mockUpdatedEntry] });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return error when update fails', async () => {
      console.error = jest.fn();
      const entryId = '1';
      const newEntryText = 'Updated journal entry';
      const mockError = { message: 'Update error' };

      const selectMock = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const matchMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const updateMock = jest.fn().mockReturnValue({
        match: matchMock,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
      });

      const result = await updateJournalEntry(entryId, newEntryText);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('journal_entries');
      expect(updateMock).toHaveBeenCalledWith({ journal_text: newEntryText });
      expect(matchMock).toHaveBeenCalledWith({ id: entryId });
      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual({ error: mockError.message });
      expect(console.error).toHaveBeenCalledWith(
        'Error updating journal_entries:',
        mockError.message,
      );
    });

    it('should not proceed with empty entry text', async () => {
      const entryId = '1';
      const emptyEntryText = '   ';

      const result = await updateJournalEntry(entryId, emptyEntryText);

      expect(result).toBeUndefined();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('Test UndoConversion Utility function', () => {
    it('should undo time conversion from UTC', async () => {
      // Create a mock date
      const mockDate = new Date('2023-01-15T12:00:00Z');
      const mockTimezoneOffset = 300; // 5 hours in minutes

      // Mock the getTimezoneOffset method only
      jest
        .spyOn(Date.prototype, 'getTimezoneOffset')
        .mockReturnValue(mockTimezoneOffset);

      // Calculate expected: time + offset in ms
      const expectedTime = mockDate.getTime() + mockTimezoneOffset * 60000;
      const expected = new Date(expectedTime);

      // Run function and compare
      const result = undoConversion(mockDate);
      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe('Delete journal entry', () => {
    it('should delete the journal entry successfully', async () => {
      const entryId = '1';

      const matchMock = jest.fn().mockReturnValue({ error: null });
      const deleteMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        delete: deleteMock,
      });

      const result = await deleteJournalEntry(entryId);

      expect(result.data).toBeUndefined();

      expect(deleteMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });

    it('should fail at deleting a journal entry that does not exist', async () => {
      const entryId = '-1';

      const matchMock = jest
        .fn()
        .mockReturnValue({ error: { message: 'Delete error' } });
      const deleteMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        delete: deleteMock,
      });

      const result = await deleteJournalEntry(entryId);

      expect(result.error).toEqual({ message: 'Delete error' });

      expect(deleteMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalled();
    });
  });

  describe('Get random prompt', () => {
    it('should fetch the random prompt successfully', async () => {
      const mockData = { prompt: 'This is an inspirational prompt.' };
      const rpcMock = jest
        .fn()
        .mockReturnValue({ data: mockData, error: null });
      mockSupabaseClient.rpc = rpcMock;

      const result = await getRandomPrompt();

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_random_prompt');
      expect(result).toEqual({ data: mockData });
    });

    it('should fail at fetching the random prompt', async () => {
      const rpcMock = jest
        .fn()
        .mockReturnValue({ data: null, error: { message: 'Prompt error' } });
      mockSupabaseClient.rpc = rpcMock;

      const result = await getRandomPrompt();

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_random_prompt');
      expect(result).toEqual({ error: 'Prompt error' });
    });
  });
});
