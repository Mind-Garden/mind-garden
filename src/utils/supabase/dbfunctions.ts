import { getSupabaseClient } from './client';
import {
  IAttributes,
  ICategories,
  IResponses,
  IJournalEntries,
} from '@/utils/supabase/schema';
import { getLocalISOString } from '@/lib/utility';

/**
 * Inserts data into a given Supabase table
 * @param table - The name of the table
 * @param dataToInsert - The data to insert (object or array of objects)
 * @returns - Success response or error
 * This will be a general function for all our insert operations (private to this script)
 */

async function insertData<T>(table: string, dataToInsert: T[]) {
  const supabase = getSupabaseClient();

  // Add entry_date to each item in the array
  const dataWithDate = dataToInsert.map((item) => ({
    ...item,
    entry_date: getLocalISOString(),
  }));

  const { data, error } = await supabase
    .from(table)
    .insert(dataWithDate)
    .select();

  if (error) {
    console.error(`Error inserting into ${table}:`, error.message);
    return { error };
  }

  return { data };
}

/**
 * Saves a journal entry to the database
 * @param entry - The journal entry text
 * @param userId - The user ID of the journal entry owner
 * @returns - Success response or error
 */
export async function saveJournalEntry(entry: string, userId: string) {
  if (!entry.trim()) return; // Prevent empty entries
  const { data, error } = await insertData('journal_entries', [
    {
      user_id: userId,
      journal_text: entry,
    },
  ]);

  if (error) {
    console.error('Error saving journal entry:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Selects data from a given Supabase table
 * @param table - The name of the table
 * @param conditions - The conditions for filtering data (optional)
 * @param columns - The columns to select (optional, defaults to all columns)
 * @returns - The selected data or error
 * This will be a general function for all our select operations (private to this script)
 */

async function selectData<T>(
  table: string,
  conditions?: object,
  columns: string[] = ['*'],
) {
  const supabase = getSupabaseClient();

  // Build the query with conditions and selected columns
  const { data, error } = await supabase
    .from(table)
    .select(columns.join(', ')) // Use columns passed or default to '*'
    .match(conditions ?? {}); // Use conditions (if any)

  if (error) {
    console.error(`Error selecting from ${table}:`, error.message);
    return { error };
  }

  return { data };
}

/**
 * Fetches journal entries for a specific user
 * @param userId - The user ID whose journal entries need to be fetched
 * @returns - The journal entries data or error
 */
export async function fetchJournalEntries(userId: string) {
  const { data, error } = await selectData(
    'journal_entries',
    { user_id: userId },
    ['*'],
  );

  if (error) {
    console.error('Error fetching journal entries:', error.message);
    return { error: error.message };
  }

  return { data: data as unknown as IJournalEntries[] };
}

/**
 * Updates data in a given Supabase table
 * @param table - The name of the table
 * @param conditions - The conditions for filtering data
 * @param dataToUpdate - The data to update
 * @returns - Success response or error
 * This will be a general function for all our update operations (private to this script)
 */

async function updateData<T>(
  table: string,
  conditions: object,
  dataToUpdate: T,
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(table)
    .update(dataToUpdate)
    .match(conditions)
    .select();

  if (error) {
    console.error(`Error updating ${table}:`, error.message);
    return { error: error.message };
  } else {
    return { data };
  }
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
    { id: entryId },
    { journal_text: newEntry },
  );
}

/**
 * Fetches all categories from the database.
 * @returns - Array of categories or null
 */
export async function selectAllFromCategories(): Promise<Array<ICategories> | null> {
  const { data, error } = await selectData<ICategories>('categories');
  if (error) {
    console.error(`Error selecting categories:`, error.message);
    return null;
  }
  return data as unknown as ICategories[];
}

/**
 * Fetches all attributes from the database.
 * @returns - Array of attributes or null
 */
export async function selectAllFromAttributes(): Promise<Array<IAttributes> | null> {
  const { data, error } = await selectData<IAttributes>('attributes');

  if (error) {
    console.error('Error selecting categories:', error);
    return null;
  }

  return data as unknown as IAttributes[];
}

/**
 * Fetches responses by user ID and entry date.
 * @param userId - The user's ID
 * @param entryDate - The date of the responses
 * @returns - Array of responses or null
 */
export async function selectResponsesByDate(
  userId: string,
  entryDate: string,
): Promise<IResponses | null> {
  const { data, error } = await selectData<IResponses>('responses', {
    user_id: userId,
    entry_date: entryDate,
  });

  if (error) {
    console.error('Error selecting response by date:', error);
    return null;
  }

  return data.length > 0 ? (data[0] as unknown as IResponses) : null;
}

/**
 * Inserts new responses into the database.
 * @param attributeIds - Set of attribute IDs
 * @param userId - The user's ID
 * @param scaleRating - The user's scale rating for their day
 */
export async function insertResponses(
  attributeIds: Set<string>,
  userId: string,
  scaleRating: number,
): Promise<void> {
  const { error } = await insertData('responses', [
    {
      user_id: userId,
      attribute_ids: Array.from(attributeIds),
      scale_rating: scaleRating,
    },
  ]);

  if (error) {
    console.error('Error inserting response:', error);
  }
}
/**
 * Updates an existing response in the database.
 * @param responseId - The unique identifier of the response.
 * @param attributeIds - A set of attribute IDs representing the user's selected attributes.
 * @param userId - The unique identifier of the user.
 * @param scaleRating - The user's scale rating for their day.
 */
export async function updateResponses(
  responseId: string,
  attributeIds: Set<string>,
  userId: string,
  scaleRating: number,
): Promise<void> {
  const entryDate = new Date().toISOString().split('T')[0];

  const { error } = await updateData(
    'responses',
    { id: responseId, user_id: userId, entry_date: entryDate },
    { attribute_ids: Array.from(attributeIds), scale_rating: scaleRating },
  );

  if (error) {
    console.error('Error updating response:', error);
  }
}

export async function deleteJournalEntry(id: string) {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from('journal_entries')
    .delete()
    .match({ id: id });

  return result;
}

/**
 * Inserts new sleep entries into the database.
 * @param startTime - Start time of the sleep
 * @param endTime - End time of the sleep
 * @param userId - The user's ID
 */
export async function insertSleepEntry(
  startTime: string,
  endTime: string,
  userId: string,
) {
  // Validate inputs
  if (!startTime.trim() || !endTime.trim()) {
    return undefined; // Ensures test expects undefined
  }
  // Get today's date for entry date
  const entryDate = getLocalISOString();

  return await insertData('sleep_entries', [
    {
      user_id: userId,
      entry_date: entryDate,
      start: startTime,
      end: endTime,
    },
  ]);
}

export async function sleepEntryExists(userId: string, entryDate: string) {
  const { data: existingEntry, error } = await selectData('sleep_entries', {
    user_id: userId,
    entry_date: entryDate,
  });

  if (error) {
    console.error('Error checking existing sleep entry:', error);
    return { error };
  }

  if (existingEntry && existingEntry.length > 0) {
    return { exists: true };
  }
  return { exists: false };
}

/**
 * Calls a supabase table function to retrieve a random prompt
 */
export async function getRandomPrompt() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_random_prompt');

  if (error) {
    return { error: error.message };
  }

  return { data };
}
