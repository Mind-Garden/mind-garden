import { Page } from '@playwright/test';

async function testReminders(page: Page) {
  const testID = Math.floor(Math.random() * 20);
  const email = `load${testID}@test.com`;

  await page.goto('https://mindgarden.vercel.app/'); // change to localhost:3000 for local testing
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('https://mindgarden.vercel.app/home');

  for (let i = 0; i < 10; i++) {
    await page.goto('https://mindgarden.vercel.app/reminders');
    await page.waitForURL('https://mindgarden.vercel.app/reminders');
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
