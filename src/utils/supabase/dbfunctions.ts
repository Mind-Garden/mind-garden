import { createClient } from './client';
import { IAttributes, ICategories, IResponses, IJournalEntries } from '@/utils/supabase/schema';


export const getDate = () => {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  return new Date(date.getTime() - offsetMs);
}

function getLocalISOString(date = new Date()) {
  return getDate().toISOString().split('T')[0] //only get the month-day-year
}

/**
 * Inserts data into a given Supabase table
 * @param table - The name of the table
 * @param data - The data to insert (object or array of objects)
 * @returns - Success response or error
 * This will be a general function for all our insert operations (private to this script)
 */
export async function insertData<T>(table: string, data: T | T[]) {
  const supabase = createClient();

  // Ensure data is an array
  const dataArray = Array.isArray(data) ? data : [data];

  // Add entry_date to each item in the array
  const dataWithDate = dataArray.map(item => ({ ...item, entry_date: getLocalISOString() }));

  console.log(dataWithDate);

  const { data: insertedData, error } = await supabase
    .from(table)
    .insert(dataWithDate)
    .select();

  if (error) {
    console.error(`Error inserting into ${table}:`, error.message);
    return { error };
  }

  return { data: insertedData };
}

/**
 * Saves a journal entry to the database
 * @param entry - The journal entry text
 * @param userId - The user ID of the journal entry owner
 * @returns - Success response or error
 **/
export async function saveJournalEntry(entry: string, userId: string) {
  if (!entry.trim()) return; // Prevent empty entries
  return await insertData('journal_entries', {
    user_id: userId,
    journal_text: entry,
  });
}

/**
 * Selects data from a given Supabase table
 * @param table - The name of the table
 * @param conditions - The conditions for filtering data (optional)
 * @param columns - The columns to select (optional, defaults to all columns)
 * @returns - The selected data or error
 * This will be a general function for all our select operations (private to this script)
 */
export async function selectData<T>(
  table: string,
  conditions?: object,
  columns: string[] = ['*'],
) {
  const supabase = createClient();

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
  const { data, error } = await selectData('journal_entries', { user_id: userId }, ['*']);

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

export async function updateData<T>(
  table: string,
  conditions: object,
  dataToUpdate: T,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .update(dataToUpdate)
    .match(conditions)
    .select();

  if (error) {
    console.error(`Error updating ${table}:`, error.message);
    return { error };
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
    console.error(`Error selecting responses by date:`, error.message);
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
  if (error) throw new Error(error.message);
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
): Promise<Array<IResponses> | null> {
  const { data, error } = await selectData<IResponses>('responses', {
    user_id: userId,
    entry_date: entryDate,
  });

  if (error) throw new Error(error.message);
  return data as unknown as IResponses[];
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
  const { error } = await insertData('responses', {
    user_id: userId,
    attribute_ids: Array.from(attributeIds),
    scale_rating: scaleRating,
  });
  if (error) throw new Error(error.message);
}

/**
 * Deletes responses for a given user and date.
 * @param attributeIds - Set of attribute IDs to delete
 * @param userId - The user's ID
 */
export async function deleteResponses(
  attributeIds: Set<string>,
  userId: string,
): Promise<void> {
  const supabase = createClient();
  const entryDate = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('responses')
    .delete()
    .match({ user_id: userId, entry_date: entryDate })
    .in('attribute_id', Array.from(attributeIds));

  if (error) throw new Error(error.message);
}

export async function deleteJournalEntry(entryId: string) {
  const supabase = createClient();

  return await supabase.from('journal_entries').delete().eq('id', entryId);
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
  // Get today's date for entry date
  const entryDate = new Date().toISOString().split('T')[0];

  const { exists, error } = await sleepEntryExists(userId, entryDate);

  if (error) {
    console.error('Error checking existing sleep entry:', error);
    return { error };
  }

  if (exists) {
    return { error: 'Sleep entry already exists for today' };
  }

  return await insertData('sleep_entries', {
    user_id: userId,
    entry_date: entryDate,
    start: startTime,
    end: endTime,
  });
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

export async function getRandomPrompt() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_random_prompt');

  if (error) {
    return { error: error.message };
  }

  return { data };
}
