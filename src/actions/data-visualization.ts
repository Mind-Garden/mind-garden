'use server';

import { createClient } from '@/supabase/server';
import { getSupabaseClient } from '@/supabase/client';
import { selectData } from '@/supabase/dbfunctions';

export async function getDataHeatmap(userId: string) {
  const supabase = getSupabaseClient();

  const result = await supabase.rpc('get_heatmap_data', {
    user_id_param: userId,
  });

  return result;
}

export async function selectMoodDataByDateRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  const table = 'responses';
  const columns = ['scale_rating', 'entry_date'];
  const conditions = {
    user_id: userId,
  };

  const { data, error } = await selectData(
    table,
    conditions,
    columns,
    startDate,
    endDate,
  );

  if (error) {
    console.error('Error fetching mood data:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 *
 * @param userId - The user ID whose mood frequency needs to be fetched
 * @returns a list of dictionaries with scale_rating and count
 */
export async function selectMoodFrequency(
  userId: string,
  lastMonthDate: string,
  todaysDate: string,
) {
  const supabase = getSupabaseClient();

  //retrieve mood frequency data from the database for the past month starting from today
  const { data, error } = await supabase.rpc('get_mood_count_by_user', {
    user_id_param: userId,
    start_date_param: lastMonthDate,
    end_date_param: todaysDate,
  });

  if (error) {
    console.error('Error fetching mood data:', error.message);
    return { error: error.message };
  }

  return { data };
}

export async function selectSleepDataByDateRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  const table = 'sleep_entries';
  const columns = ['entry_date', 'start', 'end'];
  const conditions = {
    user_id: userId,
  };

  const { data, error } = await selectData(
    table,
    conditions,
    columns,
    startDate,
    endDate,
  );

  if (error) {
    return { error: error.message };
  }

  return { data };
}

const barLineFunctionary: Record<
  string,
  (
    userId: string,
    lastMonthDate: string,
    todaysDate: string,
  ) => Promise<{ data: any; error?: string } | { error: string }>
> = {
  work: selectWorkDataByDateRange,
  study: selectStudyDataByDateRange,
};

function hasData(result: any): result is { data: any } {
  return 'data' in result && result.data !== undefined;
}

export async function selectDataByRange(
  userId: string,
  lastMonthDate: string,
  todaysDate: string,
  type: string,
): Promise<any> {
  const functionToCall = barLineFunctionary[type];

  if (!functionToCall) {
    throw new Error('Invalid query type');
  }

  const result = await functionToCall(userId, lastMonthDate, todaysDate);

  if (!hasData(result)) {
    throw new Error(`Error fetching data: ${result.error}`);
  }

  return result.data;
}

/**
 *
 * @param userId - The user ID whose work data needs to be fetched
 * @param lastMonthDate - start of date range
 * @param todaysDate - end of date range
 * @returns a list of dictionaries with entry_date, rating, hours and attributes
 */
export async function selectWorkDataByDateRange(
  userId: string,
  lastMonthDate: string,
  todaysDate: string,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_work_data_attributes', {
    user_id_param: userId,
    start_date_param: lastMonthDate,
    end_date_param: todaysDate,
  });

  if (error) {
    console.error('Error fetching work data:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 *
 * @param userId - The user ID whose study data needs to be fetched
 * @param lastMonthDate - start of date range
 * @param todaysDate - end of date range
 * @returns a list of dictionaries with entry_date, rating, hours and attributes
 */
export async function selectStudyDataByDateRange(
  userId: string,
  lastMonthDate: string,
  todaysDate: string,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('get_study_data_attributes', {
    user_id_param: userId,
    start_date_param: lastMonthDate,
    end_date_param: todaysDate,
  });

  if (error) {
    console.error('Error fetching study data:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 *
 * @param userId - The user ID whose study data needs to be fetched
 * @param lastMonthDate - start of date range
 * @param todaysDate - end of date range
 * @returns a list of dictionaries with entry_date and water (number of cups)
 */
export async function selectWaterDataByDateRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  const table = 'responses';
  const columns = ['entry_date', 'water'];
  const conditions = {
    user_id: userId,
  };

  const { data, error } = await selectData(
    table,
    conditions,
    columns,
    startDate,
    endDate,
  );

  if (error) {
    return { error: error.message };
  }

  return { data };
}
