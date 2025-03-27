import { Page } from '@playwright/test';

let time = 1;

async function testReminders(page: Page) {
  await page.goto('http://localhost:3000/');
  await page
    .locator('section')
    .filter({ hasText: 'Mind GardenCultivate' })
    .getByRole('img')
    .nth(2)
    .click();
  await page.getByRole('textbox', { name: 'Email' }).fill('load@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'Reminders', exact: true }).click();
  await page.getByRole('button', { name: String(time), exact: true }).click();
  time++;
  if (time === 12) {
    time = 1;
  }
  await page.getByRole('button', { name: 'Save Reminders' }).click();

  await page.waitForTimeout(2000);
}

export { testReminders };
