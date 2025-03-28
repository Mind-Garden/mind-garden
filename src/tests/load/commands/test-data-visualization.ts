import { Page } from '@playwright/test';

import { goToWebsiteAndLogin } from '@/tests/load/commands/test-login';

async function waitForHabitResponses(page: Page) {
  await page.waitForResponse(async (res) => {
    // Filter by URL
    if (!res.url().includes('added_habit')) return false;

    // Ensure response is successful (status code 200-299)
    if (!res.ok()) return false;

    // Try reading JSON
    const jsonBody = await res.json();

    // Check if the response has content (e.g., non-empty or has a certain property)
    return jsonBody;
  });
  await page.waitForResponse(async (res) => {
    // Filter by URL
    if (!res.url().includes('personalized_categories')) return false;

    // Ensure response is successful (status code 200-299)
    if (!res.ok()) return false;

    // Try reading JSON
    const jsonBody = await res.json();

    // Check if the response has content (e.g., non-empty or has a certain property)
    return jsonBody;
  });
}

export async function testDataVisualization(page: Page, baseUrl: string) {
  const workerNumber = Math.floor(Math.random() * 10);
  const email = `load${workerNumber}@test.com`;

  await goToWebsiteAndLogin(page, baseUrl, email);
  await page.waitForURL(baseUrl + '/home');

  for (let i = 0; i < 10; i++) {
    await page.goto(baseUrl + '/home');
    const responsePromise = waitForHabitResponses(page);

    await responsePromise;
  }
}
