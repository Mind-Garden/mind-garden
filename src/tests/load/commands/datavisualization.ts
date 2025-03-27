import { Page } from '@playwright/test';

async function waitForHabitResponses(
  page: Page,
  requiredCount: number,
): Promise<Response[]> {
  const responses: Response[] = [];

  while (responses.length < requiredCount) {
    const response = await page.waitForResponse(async (res) => {
      // Filter by URL
      if (!res.url().includes('added_habit')) return false;

      // Ensure response is successful (status code 200-299)
      if (!res.ok()) return false;

      // Try reading JSON
      const jsonBody = await res.json();

      // Check if the response has content (e.g., non-empty or has a certain property)
      return jsonBody;
    });

    responses.push(response as any);
  }

  return responses;
}

export async function dataVisualization(page: Page, context: any) {
  for (let i = 0; i < 10; i++) {
    const workerNumber = i;
    const email = `load${workerNumber}@test.com`;

    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');

    const responsePromise = waitForHabitResponses(page, 1);
    await page.getByRole('button', { name: 'Log in' }).click();

    await responsePromise;
  }
}
