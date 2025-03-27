import { expect, Page, test } from '@playwright/test';

// Function to wait for habit responses
async function waitForHabitResponses(page: Page, requiredCount: number) {
  const responses = [];

  while (responses.length < requiredCount) {
    const response = await page.waitForResponse(async (res) => {
      if (!res.url().includes('added_habit')) return false;
      if (!res.ok()) return false;

      return true; // Accept successful responses, even if empty
    });

    responses.push(response);
  }
  console.log(responses);

  return responses;
}

// Playwright test
test.describe('Habit Responses Test', () => {
  test('should receive habit responses after login', async ({ page }) => {
    const baseUrl = 'http://localhost:3000/';

    for (let i = 0; i < 10; i++) {
      const workerNumber = i;
      const email = `load${workerNumber}@test.com`;

      await page.goto(baseUrl);
      await page.getByRole('button', { name: 'Get Started' }).click();
      await page.getByRole('textbox', { name: 'Email' }).fill(email);
      await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');

      const responsePromise = waitForHabitResponses(page, 1);
      await page.getByRole('button', { name: 'Log in' }).click();

      const responses = await responsePromise;
      expect(responses.length).toBe(1); // Validate we got at least one response

      console.log(
        `User ${email} received response:`,
        await responses[0].json(),
      );
    }
  });
});
