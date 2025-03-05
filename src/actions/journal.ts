import {getSupabaseClient} from "@/supabase/client";
import {insertData, selectData, updateData} from "@/supabase/dbfunctions";
import {IJournalEntries} from "@/supabase/schema";

/**
 * Saves a journal entry to the database
 * @param entry - The journal entry text
 * @param userId - The user ID of the journal entry owner
 * @returns - Success response or error
 */
export async function saveJournalEntry(entry: string, userId: string) {
  if (!entry.trim()) return; // Prevent empty entries
  const {data, error} = await insertData('journal_entries', [
    {
      user_id: userId,
      journal_text: entry,
    },
  ]);

  if (error) {
    console.error('Error saving journal entry:', error.message);
    return {error: error.message};
  }

  return {data};
}

/**
 * Fetches journal entries for a specific user
 * @param userId - The user ID whose journal entries need to be fetched
 * @returns - The journal entries data or error
 */
export async function fetchJournalEntries(userId: string) {
  const {data, error} = await selectData(
    'journal_entries',
    {user_id: userId},
    ['*'],
  );

  if (error) {
    console.error('Error fetching journal entries:', error.message);
    return {error: error.message};
  }

  return {data: data as unknown as IJournalEntries[]};
}

/**
 * Updates a journal entry in the database
 * @param entryId - The ID of the journal entry to update
 * @param newEntry - The new journal entry text
 * @returns - Success response or error
 */
export async function updateJournalEntry(entryId: string, newEntry: string) {
  if (!newEntry.trim()) return; // Prevent empty entries

  return await updateData(
    'journal_entries',
    {id: entryId},
    {journal_text: newEntry},
  );
}

/**
 * Deletes a journal entry from the database
 * @param id - The ID of the journal entry to delete
 */
export async function deleteJournalEntry(id: string) {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from('journal_entries')
    .delete()
    .match({id: id});

  return result;
}

/**
 * Calls a supabase table function to retrieve a random prompt
 */
export async function getRandomPrompt() {
  const supabase = getSupabaseClient();

  const {data, error} = await supabase.rpc('get_random_prompt');

  if (error) {
    return {error: error.message};
  }

  return {data};
}