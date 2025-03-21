import {
  deleteJournalEntry,
  fetchJournalEntries,
  getRandomPrompt,
  saveJournalEntry,
  updateJournalEntry,
} from '@/actions/journal';
import { IJournalEntries } from '@/supabase/schema';

import supabase from '../../../jest.setup';

describe('Journal Management Integration Tests', () => {
  let userId: string;
  let entryId: string;

  beforeAll(async () => {
    // Create a test user in the database
    const formData = {
      email: `journaluser${Date.now()}@example.com`,
      password: 'JournalTest123!',
      options: {
        data: {
          first_name: 'Journal',
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

  it('should save a journal entry for a user', async () => {
    const entry = 'This is a test journal entry';
    const result = await saveJournalEntry(entry, userId);

    expect(result).toBeDefined();
    if (result && 'data' in result && Array.isArray(result.data)) {
      const { data } = result;
      entryId = data[0].id; // Save entry ID for later tests
      expect(data[0].journal_text).toBe(entry);
      expect(data[0].user_id).toBe(userId);
    } else {
      fail('Failed to save journal entry');
    }
  });

  it('should fetch journal entries for the user', async () => {
    const { data, error } = await fetchJournalEntries(userId);

    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data!.length).toBeGreaterThan(0);
    expect(data![0].user_id).toBe(userId);
  });

  it('should update a journal entry', async () => {
    const updatedText = 'This journal entry has been updated';
    const result = await updateJournalEntry(entryId, updatedText);

    expect(result).toBeDefined();
    if (result && 'data' in result && Array.isArray(result.data)) {
      const { data } = result;
      expect(data).toBeDefined();
    } else {
      fail('Failed to update journal entry');
    }

    // Fetch to verify update
    const { data: updatedEntry } = await fetchJournalEntries(userId);
    const entry = updatedEntry?.find(
      (entry: IJournalEntries) => entry.id === entryId,
    );
    expect(entry?.journal_text).toBe(updatedText);
  });

  it('should delete a journal entry', async () => {
    const { error } = await deleteJournalEntry(entryId);

    expect(error).toBeNull();

    // Verify deletion
    const { data: entriesAfterDelete } = await fetchJournalEntries(userId);
    expect(
      entriesAfterDelete?.some(
        (entry: IJournalEntries) => entry.id === entryId,
      ),
    ).toBe(false);
  });

  it('should return error when saving an empty journal entry', async () => {
    const result = await saveJournalEntry('', userId);
    expect(result).toBeUndefined();
  });

  it('should return error when updating with an empty journal entry', async () => {
    // First create a valid entry
    const result = await saveJournalEntry(
      'Valid entry for update test',
      userId,
    );
    if (result && 'data' in result && Array.isArray(result.data)) {
      const testEntryId = result.data[0].id;

      // Try to update with empty text
      const updateResult = await updateJournalEntry(testEntryId, '');
      expect(updateResult).toBeUndefined();
    } else {
      fail('Failed to save journal entry for update test');
    }
  });

  it('should return no data when fetching entries for a non-existent user', async () => {
    const { data, error } = await fetchJournalEntries(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data).toStrictEqual([]);
  });

  it('should return error when updating a non-existent journal entry', async () => {
    const result = await updateJournalEntry(
      '00000000-0000-0000-0000-000000000000',
      'New content',
    );
    expect(result).toBeDefined();

    if (result && 'error' in result) {
      expect(result.error).toBeDefined();
    } else {
      fail('Expected an error but got a successful result');
    }
  });

  it('should return error when deleting a non-existent journal entry', async () => {
    const { error } = await deleteJournalEntry(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(error).toBeDefined();
  });

  it('should retrieve a random prompt', async () => {
    const { data, error } = await getRandomPrompt();

    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(typeof data[0].prompt).toBe('string');
  });

  it('should save and retrieve long journal entries', async () => {
    const longEntry = 'A'.repeat(5000); // 5000 character entry
    const result = await saveJournalEntry(longEntry, userId);

    if (result && 'data' in result && Array.isArray(result.data)) {
      const { data } = result;
      expect(data).toBeDefined();
      const entryId = data[0].id;

      // Verify content was saved correctly
      const { data: fetchedEntries } = await fetchJournalEntries(userId);
      const entry = fetchedEntries?.find(
        (e: IJournalEntries) => e.id === entryId,
      );
      expect(entry?.journal_text).toBe(longEntry);
      expect(entry?.journal_text.length).toBe(5000);
    } else {
      fail('Failed to save long journal entry');
    }
  });
});
