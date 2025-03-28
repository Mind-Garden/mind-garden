import { Page } from '@playwright/test';

import { goToWebsiteAndLogin } from '@/tests/load/commands/test-login';

async function testDailyData(page: Page, baseUrl: string) {
  const testID = Math.floor(Math.random() * 20);
  const email = `load${testID}@test.com`;

  await goToWebsiteAndLogin(page, baseUrl, email);
  await page.waitForURL(baseUrl + '/home');

  for (let i = 0; i < 10; i++) {
    await page.goto(baseUrl + '/daily-intake');
    await page.waitForURL(baseUrl + '/daily-intake');
    await page
      .locator('div')
      .filter({ hasText: /^Rate Your Day$/ })
      .getByRole('button')
      .nth(i % 5) // choose random number to rate your day
      .click();

    // sleep for 2 seconds
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  }
}

export { testDailyData };
