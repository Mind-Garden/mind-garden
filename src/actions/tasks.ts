import { getSupabaseClient } from "@/supabase/client";
import { insertData, selectData, updateData} from "@/supabase/dbfunctions";
import { ITask } from "@/supabase/schema";

const LLM_API_URL = 'http://localhost:11434/api/chat';

async function fetchTasksFromTranscript(transcript: string): Promise<string> {
  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        messages: [{"role": "user", "content": `Summarize all the following tasks in a dashed list: ${transcript}.`}],
        stream: false
      })
    });

    if (response.status === 200) {
      const data = await response.json();
      return data.message.content;
    } else {
      return '';
    }
  } catch (error) {
    throw new Error('AI service is currently unavailable');
  }
}

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

export async function extractTasksFromTranscript(transcript: string): Promise<string[]> {
  try {
    // Fetch task text from LLM
    const tasksText = await fetchTasksFromTranscript(transcript);
    
    // Parse tasks from text
    return parseTasksFromText(tasksText);
  } catch (error) {
    throw error; // Re-throw to be handled by caller
  }
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
  const tasksToInsert = descriptions.map(description => ({
    user_id: userId,
    description,
    is_completed: false,
    created_at: new Date().toISOString()
  }));

  const { data, error } = await insertData<typeof tasksToInsert[0]>('tasks', tasksToInsert, false);

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
  const { data, error } = await updateData('tasks', { id: taskId }, { is_completed: completed });

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
  const { data, error } = await supabase.from('tasks').delete().match({ id: taskId });

  if (error) {
    console.error('Error deleting task:', error);
    return { error };
  }

  return { data: data as unknown as ITask };
}