import { Page } from '@playwright/test';

async function testDailyData(page: Page) {
  const testID = Math.floor(Math.random() * 20);
  const email = `load${testID}@test.com`;

  await page.goto('https://mindgarden.vercel.app/'); // change to localhost:3000 for local testing
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForSelector('[id="radix-«r6»"]');
  await page.getByRole('button', { name: 'Enter today' }).click();
  for (let i = 0; i < 10; i++) {
    await page
      .locator('div')
      .filter({ hasText: /^Rate Your Day$/ })
      .getByRole('button')
      .nth(4)
      .click();
    await page.getByRole('button', { name: 'happy' }).click();
    await page
      .locator('div')
      .filter({
        hasText:
          /^0How would you rate your school day\?12345PoorExcellentclasshomeworkexam$/,
      })
      .getByLabel('Increase count')
      .click();
    await page.getByRole('button', { name: '5' }).first().click();
    await page.getByRole('button', { name: '5' }).nth(1).click();
    await page.getByRole('button', { name: 'Increase count' }).nth(1).click();
    await page
      .locator('div')
      .filter({ hasText: /^Did you smoke today\?$/ })
      .getByRole('button')
      .nth(1)
      .click();
    await page.getByRole('button', { name: 'Submit' }).click();

    // sleep for 2 seconds
    await page.waitForTimeout(4000);
  }
}

export { testDailyData };
