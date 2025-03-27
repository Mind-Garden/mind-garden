import { Page } from '@playwright/test';

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

export async function testDataVisualization(page: Page) {
  const workerNumber = Math.floor(Math.random() * 10);
  const email = `load${workerNumber}@test.com`;
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('http://localhost:3000/home');

  for (let i = 0; i < 10; i++) {
    await page.goto('http://localhost:3000/home');
    const responsePromise = waitForHabitResponses(page);

    await responsePromise;
  }
}
