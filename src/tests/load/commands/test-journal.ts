import { Page } from '@playwright/test';

import { goToWebsiteAndLogin } from '@/tests/load/commands/test-login';

async function testJournal(page: Page, baseUrl: string) {
  const workerNumber = Math.floor(Math.random() * 10);
  const email = `load${workerNumber}@test.com`;

  // Login
  await goToWebsiteAndLogin(page, baseUrl, email);

  // Wait for load
  await page.waitForURL(baseUrl + '/home');

  // Go to journal page
  await page.getByRole('button', { name: 'Journal' }).click();
  await page.waitForURL(baseUrl + '/journal');

  // Loop, making journal entries and deleting them
  for (let i = 0; i < 10; i++) {
    await page
      .getByRole('textbox', { name: 'What\'s on your mind today?' })
      .fill('test entry');
    await page.getByRole('button', { name: 'Save Entry' }).click();
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForTimeout(2000);
  }
}

export { testJournal };
