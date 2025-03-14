const LLM_API_URL = 'http://localhost:11434/api/chat';

const promptionary: { [key: string]: string } = {
  'summarize tasks': 'Summarize all the following tasks in a dashed list:',
  'summarize mood':
    'Here is my Mood from 1-5 and the distribution of them. Please summarize and give advice on how to improve my mood. Keep the response brief and to the point. Dont give me the responses in MD just normal text: ',
  'summarize sleep':
    'Give me a concise summary of my sleep and not in how to improve it based off my average sleep duration. Keep the response brief and to the point. Dont give me the responses in MD just normal text. This is my average sleep duration: ',
};

/**
 * Fetches a response from the LLM API
 *
 * @param {string} transcript the user's transcript
 * @param {string} promptType the type of prompt to use
 * @param {string} modelToUse the model to use
 * @returns {string} the response from the LLM API
 *
 *  The following are the possible prompt types:
 *
 * 'summarize tasks': 'Summarize all the following tasks in a dashed list:',
 *
 * 'summarize mood': 'Please analyze my sleep patterns and provide: 1. A short summary of trends in my sleep schedule. 2. A couple of actionable suggestions for improving my sleep quality. Keep the response brief and to the point. Dont give me the responses in MD just normal text: ',
 *
 * 'summarize sleep': 'Please give me input and advice on my sleep. This is my average sleep duration: '
 *
 *
 *
 */
export async function fetchResponse(
  transcript: string,
  promptType: string,
  modelToUse = 'llama3.2:1b',
): Promise<string> {
  try {
    const staticPrompt = promptionary[promptType];
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'user',
            content: `${staticPrompt} ${transcript}.`,
          },
        ],
        stream: false,
      }),
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
