import { fetchResponse } from '@/actions/ai-fetch';
import {
  selectMoodFrequency,
  selectSleepDataByDateRange,
} from '@/actions/data-visualization';
import {
  getAverageTimeElapsed,
  getLocalISOString,
  getSleepDuration,
} from '@/lib/utils';
import { MoodCountData, SleepDataPoint } from '@/supabase/schema';

// function dictionary to map query types to functions
const functionary: Record<
  string,
  (userId: string, todaysDate: string, startDate: string) => Promise<string>
> = {
  sleep: summarizeSleepData,
  mood: summarizeMoodData,
};

// checks for the correct query type and calls it dynamically
export async function summarizeData(
  userId: string,
  queryType: string,
  range: 'week' | 'month' | '3months',
): Promise<string> {
  const functionToCall = functionary[queryType];

  if (!functionToCall) {
    throw new Error('Invalid query type');
  }

  const today = new Date();
  const todaysDate = getLocalISOString(today);

  let startDate: string;
  if (range === 'week') {
    startDate = getLocalISOString(new Date(today.setDate(today.getDate() - 7)));
  } else if (range === 'month') {
    startDate = getLocalISOString(
      new Date(today.setMonth(today.getMonth() - 1)),
    );
  } else if (range === '3months') {
    startDate = getLocalISOString(
      new Date(today.setMonth(today.getMonth() - 3)),
    );
  } else {
    throw new Error('Invalid time range');
  }

  return await functionToCall(userId, todaysDate, startDate);
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
      const averageDuration = parseFloat(
        getAverageTimeElapsed(durations).toFixed(1),
      );

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
    throw new Error('Error with data summarization' + error);
  }
}

/**
 * Summarize mood data for the given user from the last month.
 * @param {string} [todaysDate] - Date string in ISO format. Defaults to today's date.
 * @param {string} [lastMonthDate] - Date string in ISO format. Defaults to today's date minus one month.
 * @returns {Promise<string>} - Summary of mood data from the last month.
 * @throws {Error} - If the AI service is unavailable, or if there is an error querying the database.
 */
async function summarizeMoodData(
  userId: string,
  todaysDate = getLocalISOString(),
  lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  ),
) {
  try {
    const response = await selectMoodFrequency(
      userId,
      lastMonthDate,
      todaysDate,
    );
    const moodData = response.data as MoodCountData[];

    // Calculate total count
    const totalCount = moodData.reduce((sum, item) => sum + item.count, 0);

    if (totalCount === 0) {
      return 'No mood data available to summarize :(';
    }

    // Convert counts into percentage distribution
    const moodDistribution = moodData.map((mood) => ({
      mood_level: mood.scale_rating.toString(),
      percentage: Math.round((mood.count / totalCount) * 100),
    }));

    const formattedText = moodDistribution
      .map(
        ({ mood_level, percentage }) =>
          `- Mood Level ${mood_level}: ${percentage}%`,
      )
      .join('\n');

    const aiResponse = await fetchResponse(formattedText, 'summarize mood');

    return aiResponse;
  } catch (error) {
    throw new Error('AI service is currently unavailable:' + error);
  }
}
