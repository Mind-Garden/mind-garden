import { Page } from '@playwright/test';

import { goToWebsiteAndLogin } from '@/tests/load/commands/test-login';

async function testReminders(page: Page, baseUrl: string) {
  const testID = Math.floor(Math.random() * 20);
  const email = `load${testID}@test.com`;

  // Login
  await goToWebsiteAndLogin(page, baseUrl, email);

  // Wait for load
  await page.waitForURL(baseUrl + '/home');

  for (let i = 0; i < 10; i++) {
    await page.goto(baseUrl + '/reminders');
    await page.waitForURL(baseUrl + '/reminders');

    await page
      .getByRole('button', {
        name: String(Math.floor(Math.random() * 12) + 1),
        exact: true,
      })
      .click();

    const saveButton = page.getByRole('button', {
      name: 'Save Reminders',
    });

    if (await saveButton.isVisible()) {
      await saveButton.click();
    } else {
      // save button not visible, select new number and try again
      await page
        .getByRole('button', {
          name: String(Math.floor(Math.random() * 12) + 1),
          exact: true,
        })
        .click();
      await saveButton.click();
    }

    await page.waitForTimeout(2000);
  }
}

export { testReminders };
