import { getLocalISOString } from '@/lib/utils';
import { insertData, selectData, updateData } from '@/supabase/dbfunctions';
import {
  IAddedCategory,
  IAddedResp,
  IAttributes,
  ICategories,
  IPersonalizedCategories,
  IResponses,
  ISleepEntries,
} from '@/supabase/schema';

/**
 * Fetches all categories from the database.
 * @returns - Array of categories or null
 */
export async function selectAllFromCategories(): Promise<Array<ICategories> | null> {
  const { data, error } = await selectData<ICategories>('categories');
  if (error) {
    console.error('Error selecting categories:', error.message);
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
 *
 * This function takes various parameters related to a user's responses and inserts them
 * into the 'responses' table in the database. It constructs an object with the necessary
 * data, including optional fields for water consumption, work and study details, and handles
 * any errors that may occur during the insertion process.
 *
 * @param attributeIds - Set of attribute IDs representing the user's selected attributes.
 * @param userId - The unique identifier of the user.
 * @param scaleRating - The user's scale rating for their day.
 * @param amountWater - Optional amount of water consumed.
 * @param workHours - Optional number of work hours.
 * @param workRating - Optional rating of the work completed.
 * @param studyHours - Optional number of study hours.
 * @param studyRating - Optional rating of the study completed.
 */
export async function insertResponses(
  attributeIds: Set<string>,
  userId: string,
  scaleRating: number,
  amountWater?: number | null,
  workHours?: number | null,
  workRating?: number | null,
  studyHours?: number | null,
  studyRating?: number | null,
): Promise<void> {
  const responseData: any = {
    user_id: userId,
    attribute_ids: Array.from(attributeIds),
    scale_rating: scaleRating,
  };

  // Add nullable fields only if they are provided (not undefined)
  if (amountWater !== undefined) responseData.water = amountWater;
  if (studyHours !== undefined) responseData.study_hours = studyHours;
  if (studyRating !== undefined) responseData.study_rating = studyRating;
  if (workHours !== undefined) responseData.work_hours = workHours;
  if (workRating !== undefined) responseData.work_rating = workRating;

  const { error } = await insertData('responses', [responseData]);

  if (error) {
    console.error('Error inserting response:', error);
  }
}

/**
 * Updates an existing response in the database with the provided details.
 *
 * @param responseId - The unique identifier of the response to be updated.
 * @param attributeIds - A set of attribute IDs representing the user's selected attributes.
 * @param userId - The unique identifier of the user.
 * @param scaleRating - The user's scale rating for their day.
 * @param amountWater - Optional amount of water consumed.
 * @param workHours - Optional number of work hours.
 * @param workRating - Optional rating of the work completed.
 * @param studyHours - Optional number of study hours.
 * @param studyRating - Optional rating of the study completed.
 */
export async function updateResponses(
  responseId: string,
  attributeIds: Set<string>,
  userId: string,
  scaleRating: number,
  amountWater?: number | null,
  workHours?: number | null,
  workRating?: number | null,
  studyHours?: number | null,
  studyRating?: number | null,
): Promise<void> {
  const entryDate = getLocalISOString();

  const updateFields: Record<string, any> = {
    attribute_ids: Array.from(attributeIds),
    scale_rating: scaleRating,
  };

  if (amountWater !== undefined) updateFields.water = amountWater;
  if (workHours !== undefined) updateFields.work_hours = workHours;
  if (workRating !== undefined) updateFields.work_rating = workRating;
  if (studyHours !== undefined) updateFields.study_hours = studyHours;
  if (studyRating !== undefined) updateFields.study_rating = studyRating;

  const { error } = await updateData(
    'responses',
    { id: responseId, user_id: userId, entry_date: entryDate },
    updateFields,
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
  sleepQuality: number,
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
      quality: sleepQuality,
    },
  ]);
}

/**
 * Fetches sleep entry by user ID and entry date.
 * @param userId - The user's ID
 * @param entryDate - The date of the responses
 * @returns - sleep entry or null
 */
export async function selectSleepEntryByDate(
  userId: string,
  entryDate: string,
) {
  const { data, error } = await selectData('sleep_entries', {
    user_id: userId,
    entry_date: entryDate,
  });

  if (error) {
    console.error('Error selecting sleep entry by date:', error.message);
    return { data: null, error: error.message };
  }
  return {
    data: data.length > 0 ? (data[0] as unknown as ISleepEntries) : null,
    error: null,
  };
}

/**
 * Updates a sleep entry in the database.
 * @param entryId - The ID of the sleep entry to update
 * @param startTime - The new start time of the sleep entry
 * @param endTime - The new end time of the sleep entry
 * @param sleepQuality - The new sleep quality of the sleep entry
 * @returns - Success response or error
 */
export async function updateSleepEntry(
  entryId: string,
  startTime: string,
  endTime: string,
  sleepQuality: number,
) {
  if (!startTime.trim() || !endTime.trim()) return; // Prevent empty entries

  return await updateData(
    'sleep_entries',
    { id: entryId },
    { start: startTime, end: endTime, quality: sleepQuality },
  );
}

export async function getPersonalizedCategories() {
  const { data, error } = await selectData<IPersonalizedCategories>(
    'personalized_categories',
  );
  if (error) {
    console.error('Error selecting personalized categories:', error.message);
    return null;
  }
  return data as unknown as IPersonalizedCategories[];
}

/**
 * Adds a habit to the user's list of added habits.
 * @param userId - The ID of the user to add the habit to
 * @param categoryId - The ID of the category of the habit to add
 * @param trackingMethod - The tracking method of the habit to add
 * @returns - 'success' or 'duplicate' if the habit already exists
 */
export async function addUserHabit(
  userId: string,
  categoryId: string,
  trackingMethod: 'boolean' | 'scale' | 'breakfast' | 'lunch' | 'dinner',
) {
  const { data, error: selectError } = await selectData(
    'added_habit',
    {
      user_id: userId,
      added_habit: categoryId,
    },
    ['added_habit', 'tracking_method'],
  );

  if (selectError) {
    console.error('Error selecting added habit:', selectError);
    return null;
  }
  if (!selectError) {
    if (data && data.length != 0 && 'tracking_method' in data[0]) {
      const tracking_method = data[0].tracking_method as string[];
      for (const i in tracking_method) {
        if (tracking_method[i] == trackingMethod) {
          // habit with tracking method already exists
          return 'duplicate';
        }
      }

      // update habit with new tracking method
      const { error } = await updateData(
        'added_habit',
        { user_id: userId, added_habit: categoryId },
        { tracking_method: [...tracking_method, trackingMethod] },
      );

      if (error) {
        console.error('error updating added user habits: ' + error);
        return null;
      }
      return 'success';
    }

    // insert new habit
    const { error } = await insertData(
      'added_habit',
      [
        {
          user_id: userId,
          added_habit: categoryId,
          tracking_method: [trackingMethod],
        },
      ],
      false,
    );

    if (error) {
      console.error('Error inserting response:', error);
      return null;
    }

    return 'success';
  }
}

export async function getAddedCategories(userId: string) {
  const { data, error } = await selectData<IAddedCategory>('added_habit', {
    user_id: userId,
  });
  if (error) {
    console.error('Error selecting added categories:', error.message);
    return null;
  }
  return data as unknown as IAddedCategory[];
}

export async function getAddedResp(userId: string, entryDate: string) {
  // Get responses by date
  const { data, error } = await selectData<IAddedResp>(
    'added_habit_responses',
    {
      user_id: userId,
      entry_date: entryDate,
    },
  );
  if (error) {
    console.error('Error selecting added habit responses:', error.message);
    return null;
  }
  return data as unknown as IAddedResp[];
}

/**
 * Adds or updates a response for a specified habit and user.
 *
 * This function first checks if a response for the given user, habit, and entry date
 * already exists. If it does, the function updates the existing response with the new
 * tracking value. If it doesn't exist, the function inserts a new response with the
 * provided details.
 *
 * @param userId - The unique identifier of the user.
 * @param habit - The habit associated with the response.
 * @param trackingValue - The tracking data for the habit response.
 * @param entryDate - The date of the response entry.
 * @returns - 'success' if the response was added or updated successfully, otherwise null.
 */

export async function addResp(
  userId: string,
  habit: string,
  trackingValue: Record<string, any>,
  entryDate: string,
) {
  const { data, error: selectError } = await selectData(
    'added_habit_responses',
    {
      user_id: userId,
      habit: habit,
      entry_date: entryDate,
    },
    ['habit', 'tracking_method'],
  );

  if (selectError) {
    console.error('Error selecting added habit:', selectError);
    return null;
  } else {
    if (data && data.length != 0) {
      //update already existing response
      const { error } = await updateData(
        'added_habit_responses',
        { user_id: userId, habit: habit, entry_date: entryDate },
        { tracking_method: trackingValue },
      );
      if (error) {
        console.error('Error updating habit:', error);
        return null;
      }
      return 'success';
    }
    //insert a new response
    const { error } = await insertData('added_habit_responses', [
      {
        user_id: userId,
        habit: habit,
        tracking_method: trackingValue,
      },
    ]);

    if (error) {
      console.error('Error inserting response:', error);
      return null;
    }

    return 'success';
  }
}

/**
 * Selects all added habit responses for a given user and category
 * @param userId - The ID of the user to select the responses for
 * @param category - The category of the habit to select the responses for
 * @returns An array of added habit responses for the given user and category, or null if there was an error
 */
export async function getAllAddedRespCategory(
  userId: string,
  category: string,
) {
  const { data, error } = await selectData<IAddedResp>(
    'added_habit_responses',
    {
      user_id: userId,
      habit: category,
    },
  );
  if (error) {
    console.error('Error selecting added habit responses:', error.message);
    return null;
  }
  return data as unknown as IAddedResp[];
}
