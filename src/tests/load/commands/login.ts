import { Page } from '@playwright/test';

async function testLogin(page: Page) {
  for (let i = 0; i < 10; i++) {
    // get random test user id
    const testID = Math.floor(Math.random() * 20);
    const email = `load${testID}@test.com`;

    await page.goto('https://mindgarden.vercel.app/');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
    await page.getByRole('button', { name: 'Log in' }).click();

    await page.waitForSelector('[id="radix-«r6»"]');

    // sleep for 2 seconds
    await page.waitForTimeout(4000);

    await page.locator('[id="radix-«r6»"]').click();
    await page.getByText('Log out').click();

    await page.waitForURL('https://mindgarden.vercel.app/');
  }
}

export { testLogin };
