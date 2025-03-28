import { Page } from '@playwright/test';

async function testLogin(page: Page, baseUrl: string) {
  for (let i = 0; i < 10; i++) {
    // get random test user id
    const testID = Math.floor(Math.random() * 20);
    const email = `load${testID}@test.com`;

    await goToWebsiteAndLogin(page, baseUrl, email);

    // wait for the open user menu button
    await page.waitForSelector('[aria-label="Open user menu"]');

    // sleep for 4 seconds
    await page.waitForTimeout(4000);

    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByText('Log out').click();

    await page.waitForURL(baseUrl);
  }
}

async function goToWebsiteAndLogin(page: Page, baseUrl: string, email: string) {
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
}

export { goToWebsiteAndLogin, testLogin };
