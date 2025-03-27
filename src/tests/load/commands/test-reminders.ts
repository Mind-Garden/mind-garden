import { Page } from '@playwright/test';

let time = 1;

async function testReminders(page: Page) {
  const workerNumber = Math.floor(Math.random() * 10);
  const email = `load${workerNumber}@test.com`;

  await page.goto('https://mindgarden.vercel.app/');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.goto('https://mindgarden.vercel.app/reminders');

  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: String(time), exact: true }).click();
    time++;
    if (time === 12) {
      time = 1;
    }
    await page.getByRole('button', { name: 'Save Reminders' }).click();

    await page.waitForTimeout(2000);
  }
}

export { testReminders };
