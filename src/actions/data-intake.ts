import {getLocalISOString} from "@/lib/utils";
import {insertData, selectData, updateData} from "@/supabase/dbfunctions";
import {IAttributes, ICategories, IResponses} from "@/supabase/schema";

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

/**
 * Fetches sleep entries by user ID and entry date.
 * @param userId - The user's ID
 * @param entryDate - The date of the sleep entry
 */
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