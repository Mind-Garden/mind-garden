import { fetchResponse } from '@/actions/tasks';
import {
  getLocalISOString,
  getSleepDuration,
  getAverageTimeElapsed,
} from '@/lib/utils';
import { selectSleepDataByDateRange } from '@/actions/data-visualization';
import { SleepDataPoint } from '@/supabase/schema';

// design
// i want a function that returns a string based off what is available in our system.
// it can also return an error but it must return a string
// possible errors,
// 1. ai service unavailable
// 2. no data available to summarize
// 3. error querying the data base

// function inputs
// 1. userId
// 2. what kind of data you want to sumamrize

// the function will query that data, and also return get an AI prompt based on the type of query that you requested

const functionary: Record<string, (userId: string) => Promise<string>> = {
  sleep: summarizeSleepData,
};

export async function summarizeData(
  userId: string,
  queryType: string,
): Promise<string> {
  const functionToCall = functionary[queryType];

  if (!functionToCall) {
    throw new Error('Invalid query type');
  }
  return await functionToCall(userId);
}

// functions for the function dictionary

/**
 * Summarize sleep data for the given user from the last month.
 * @param {string} [todaysDate] - Date string in ISO format. Defaults to today's date.
 * @param {string} [lastMonthDate] - Date string in ISO format. Defaults to today's date minus one month.
 * @returns {Promise<string>} - Summary of sleep data from the last month.
 * @throws {Error} - If the AI service is unavailable, or if there is an error querying the database.
 */
async function summarizeSleepData(
  userId: string,
  todaysDate = getLocalISOString(),
  lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  ),
) {
  try {
    const response = await selectSleepDataByDateRange(
      userId,
      lastMonthDate,
      todaysDate,
    );
    if (
      Array.isArray(response.data) &&
      response.data.every(
        (item) => 'entry_date' in item && 'start' in item && 'end' in item,
      )
    ) {
      // get the average sleep
      const sleepData = response.data as SleepDataPoint[];
      const durations = sleepData.map((item) =>
        getSleepDuration(item.start, item.end),
      );
      const averageDuration = getAverageTimeElapsed(durations);
      try {
        const aiResponse = await fetchResponse(
          `${averageDuration}`,
          'summarize sleep',
        );
        return aiResponse;
      } catch (error) {
        throw new Error('AI service is currently unavailable');
      }
    } else {
      throw new Error('Data not in correct format');
    }
  } catch (error) {
    console.error('Error summarizing sleep data:', error);
    throw new Error('Error querying the database');
  }
}
