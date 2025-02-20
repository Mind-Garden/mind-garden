import {createClient} from "./client";
import {IAttributes, ICategories, IResponses} from "@/utils/supabase/schema";

/**
 * Inserts data into a given Supabase table
 * @param table - The name of the table
 * @param data - The data to insert (object or array of objects)
 * @returns - Success response or error
 * This will be a general function for all our insert operations (private to this script)
 */
export async function insertData<T>(table: string, data: T | T[]) {
  const supabase = createClient();

  const {data: insertedData, error} = await supabase.from(table).insert(data).select();

  if (error) {
    console.error(`Error inserting into ${table}:`, error.message);
    return {error};
  }

  return {data: insertedData};
}

/**
 * Saves a journal entry to the database
 * @param entry - The journal entry text
 * @param userId - The user ID of the journal entry owner
 * @returns - Success response or error
 **/
export async function saveJournalEntry(entry: string, userId: string) {

  if (!entry.trim()) return; // Prevent empty entries
  return await insertData("journal_entries", {
    user_id: userId,
    journal_text: entry
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
export async function selectData<T>(table: string, conditions?: object, columns: string[] = ['*']) {
  const supabase = createClient();

  // Build the query with conditions and selected columns
  const {data, error} = await supabase
    .from(table)
    .select(columns.join(', '))  // Use columns passed or default to '*'
    .match(conditions ?? {});    // Use conditions (if any)

  if (error) {
    console.error(`Error selecting from ${table}:`, error.message);
    return {error};
  }

  return {data};
}

/**
 * Selects data from a given Supabase table with pagination support
 * @param table - The name of the table
 * @param conditions - The conditions for filtering data (optional)
 * @param columns - The columns to select (optional, defaults to all columns)
 * @param lastEntryId - The ID of the last fetched entry for pagination
 * @param rangeEnd - The number of entries to fetch
 * @returns - The selected data or error
 * This will be the function for all our select operations with pagination (private to this script)
 */
export async function selectDataLazy<T>(table: string, conditions?: object, columns: string[] = ['*'], lastRetrievedId: string | null = null, rangeEnd: number = 5) {
  const supabase = createClient();
  let query = supabase.from(table).select(columns.join(', '));

  if (conditions) {
    query = query.match(conditions);
  }

  // If lastEntryId is provided, we'll fetch entries that come after this ID 
  if (lastRetrievedId) {
    query = query.gt('id', lastRetrievedId);
  }

  // Apply pagination using limit and ordering by id in ascending order
  query = query.order('id', {ascending: true}).limit(rangeEnd);

  const {data, error} = await query;

  if (error) {
    console.error(`Error selecting from ${table}:`, error.message);
    return {error};
  }

  return {data};
}

/**
 * Selects journal entries for a specific user, using entry ID for pagination
 * @param userId - The user ID whose journal entries need to be fetched
 * @param lastEntryId - The ID of the last fetched journal entry to continue from
 * @param columns - Optional columns to fetch (defaults to all columns)
 * @returns - The journal entries data or error
 */
export async function selectJournalEntries(userId: string, lastEntryId: string | null, columns: string[] = ['*']) {
  const {data, error} = await selectDataLazy('journal_entries', {user_id: userId}, columns, lastEntryId);

  if (error) {
    console.error("Error fetching journal entries:", error.message);
    return {error: error.message};
  }

  return {data};
}

/**
 * Updates data in a given Supabase table
 * @param table - The name of the table
 * @param conditions - The conditions for filtering data
 * @param dataToUpdate - The data to update
 * @returns - Success response or error
 * This will be a general function for all our update operations (private to this script)
 */

export async function updateData<T>(table: string, conditions: object, dataToUpdate: T) {
  const supabase = createClient();
  const {data, error} = await supabase.from(table).update(dataToUpdate).match(conditions).select();

  if (error) {
    console.error(`Error updating ${table}:`, error.message);
    return {error};
  } else {
    return {data};
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

  return await updateData('journal_entries', {id: entryId}, {journal_text: newEntry});
}

/**
 * Fetches all categories from the database.
 * @returns - Array of categories or null
 */
export async function selectAllFromCategories(): Promise<Array<ICategories> | null> {
  const {data, error} = await selectData<ICategories>("categories");
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
  const {data, error} = await selectData<IAttributes>("attributes");
  if (error) throw new Error(error.message);
  return data as unknown as IAttributes[];
}

/**
 * Fetches responses by user ID and entry date.
 * @param userId - The user's ID
 * @param entryDate - The date of the responses
 * @returns - Array of responses or null
 */
export async function selectResponsesByDate(userId: string, entryDate: string): Promise<Array<IResponses> | null> {
  const {data, error} = await selectData<IResponses>("responses", {
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
export async function insertResponses(attributeIds: Set<string>, userId: string, scaleRating: number): Promise<void> {
  const {error} = await insertData("responses", {user_id: userId, attribute_ids: Array.from(attributeIds), scale_rating: scaleRating});
  if (error) throw new Error(error.message);
}

/**
 * Deletes responses for a given user and date.
 * @param attributeIds - Set of attribute IDs to delete
 * @param userId - The user's ID
 */
export async function deleteResponses(attributeIds: Set<string>, userId: string): Promise<void> {
  const supabase = createClient();
  const entryDate = new Date().toISOString().split("T")[0];

  const {error} = await supabase
    .from("responses")
    .delete()
    .match({user_id: userId, entry_date: entryDate})
    .in("attribute_id", Array.from(attributeIds));

  if (error) throw new Error(error.message);

}