const LLM_API_URL = 'http://localhost:11434/api/chat';

export async function fetchTasksFromTranscript(transcript: string): Promise<string> {
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
      console.error('Error fetching tasks:', response.statusText);
      return '';
    }
  } catch (error) {
    console.error('Error processing transcript:', error);
    return '';
  }
}

/**
 * Parse the tasks from the text response.
 *
 * @param {string} tasksText the text response from the LLM API
 * @returns {string[]} the tasks as an array of strings
 */
export function parseTasksFromText(tasksText: string): string[] {
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
    console.error('Error in task extraction:', error);
    return [];
  }
}