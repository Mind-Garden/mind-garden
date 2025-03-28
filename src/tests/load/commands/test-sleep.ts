import { Page } from '@playwright/test';

import { goToWebsiteAndLogin } from '@/tests/load/commands/test-login';

async function testSleep(page: Page, baseUrl: string) {
  const testID = Math.floor(Math.random() * 20);
  const email = `load${testID}@test.com`;

  // Login
  await goToWebsiteAndLogin(page, baseUrl, email);

  // Wait for load
  await page.waitForURL(baseUrl + '/home');

  for (let i = 0; i < 10; i++) {
    await page.goto(baseUrl + '/sleep-tracker');
    await page.waitForURL(baseUrl + '/sleep-tracker');
    await page.getByRole('textbox', { name: 'Start Time' }).click();
    await page.getByRole('textbox', { name: 'Start Time' }).fill('22:00');
    await page.getByRole('textbox', { name: 'End Time' }).click();
    await page.getByRole('textbox', { name: 'End Time' }).fill('06:00');
    await page.getByRole('button', { name: '5' }).click();

    const updateButton = page.getByRole('button', {
      name: 'Update Sleep Entry',
    });

    if (await updateButton.isVisible()) {
      await updateButton.click();
    } else {
      await page.getByRole('button', { name: 'Save Sleep Entry' }).click();
    }

    await page.waitForTimeout(1000);
  }
}

export { testSleep };
