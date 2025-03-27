import { Page } from '@playwright/test';

async function testSleep(page: Page) {
  const testID = Math.floor(Math.random() * 20);
  const email = `load${testID}@test.com`;

  await page.goto('http://localhost:3000/'); // change to localhost:3000 for local testing
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('http://localhost:3000/home');

  for (let i = 0; i < 10; i++) {
    await page.goto('http://localhost:3000/sleep-tracker');
    await page.waitForURL('http://localhost:3000/sleep-tracker');
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
