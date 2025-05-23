import { fetchResponse } from '@/actions/ai-fetch';
import { getDate } from '@/lib/utils';
import { getSupabaseClient } from '@/supabase/client';
import { insertData, selectData, updateData } from '@/supabase/dbfunctions';
import { ITask } from '@/supabase/schema';

/**
 * Parse the tasks from the text response.
 *
 * @param {string} tasksText the text response from the LLM API
 * @returns {string[]} the tasks as an array of strings
 */
function parseTasksFromText(tasksText: string): string[] {
  return tasksText
    .split('\n')
    .filter((line: string) => line.trim().startsWith('-'))
    .map((line: string) => line.replace(/^-\s*/, '').trim());
}

export async function extractTasksFromTranscript(
  transcript: string,
): Promise<string[]> {
  const tasksText = await fetchResponse(transcript, 'summarize tasks');
  return parseTasksFromText(tasksText);
}

/**
 * Fetch all tasks for a user
 * @param userId - The user ID
 * @returns The fetched tasks or error
 */
export async function fetchTasks(userId: string) {
  const { data, error } = await selectData('tasks', { user_id: userId });

  if (error) {
    console.error('Error fetching tasks:', error);
    return { error: error.message };
  }

  return { data: data as unknown as ITask[] };
}

/**
 * Add multiple tasks to the tasks table
 * @param userId - The user ID
 * @param descriptions - An array of task descriptions
 * @returns The inserted tasks or error
 */
export async function addTasks(userId: string, descriptions: string[]) {
  if (descriptions.length === 0) {
    return { error: 'Tasks list is empty' };
  }
  const tasksToInsert = descriptions.map((description) => ({
    user_id: userId,
    description,
    is_completed: false,
    created_at: getDate(),
  }));

  const { data, error } = await insertData<(typeof tasksToInsert)[0]>(
    'tasks',
    tasksToInsert,
    false,
  );

  if (error) {
    console.error('Error adding tasks:', error);
    return { error: error.message };
  }

  return { data: data as unknown as ITask[] };
}

/**
 * Mark a task as complete
 * @param taskId - The task ID
 * @returns The updated task or error
 */
export async function markTask(taskId: string, completed: boolean) {
  const { data, error } = await updateData(
    'tasks',
    { id: taskId },
    { is_completed: completed },
  );

  if (error) {
    console.error('Error marking task as complete:', error);
    return { error };
  }

  return { data: data as unknown as ITask };
}

/**
 * Delete a task
 * @param taskId - The task ID
 * @returns The deleted task or error
 */
export async function deleteTask(taskId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .match({ id: taskId });

  if (error) {
    console.error('Error deleting task:', error);
    return { error };
  }

  return { data: data as unknown as ITask };
}
