import { Page } from '@playwright/test';

async function testDailyData(page: Page) {
  const testID = Math.floor(Math.random() * 20);
  const email = `load${testID}@test.com`;

  await page.goto('http://localhost:3000/'); // change to localhost:3000 for local testing
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();

  for (let i = 0; i < 10; i++) {
    await page.waitForURL('http://localhost:3000/home');
    await page.goto('http://localhost:3000/daily-intake');
    await page.waitForURL('http://localhost:3000/daily-intake');
    await page
      .locator('div')
      .filter({ hasText: /^Rate Your Day$/ })
      .getByRole('button')
      .nth(Math.floor(Math.random() * 3) + 1) // choose random number to rate your day
      .click();

    // sleep for 2 seconds
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);

    await page.goto('http://localhost:3000/home');
  }
}

export { testDailyData };
