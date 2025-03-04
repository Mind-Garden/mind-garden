import { getSupabaseClient } from './client';
import { getLocalISOString } from '@/lib/utils';

/**
 * Inserts data into a given Supabase table
 * @param table - The name of the table
 * @param dataToInsert - The data to insert (object or array of objects)
 * @returns - Success response or error
 * This will be a general function for all our insert operations (private to this script)
 */
export async function insertData<T>(table: string, dataToInsert: T[]) {
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


