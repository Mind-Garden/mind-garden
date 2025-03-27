import { Page } from '@playwright/test';

async function testSignup(page: Page, context: any) {
  for (let i = 0; i < 10; i++) {
    const workerNumber = Math.floor(Math.random() * 1000000);
    const email = `test${workerNumber}@test.com`;

    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByRole('textbox', { name: 'First Name' }).fill('load');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('test');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await page.waitForSelector('[id="radix-«r6»"]');

    // sleep for 2 seconds
    await page.waitForTimeout(2000);

    await page.locator('[id="radix-«r6»"]').click();
    await page.getByRole('menuitem', { name: 'Profile' }).click();
    await page.getByRole('button', { name: 'Delete Account' }).click();
    await page.getByRole('button', { name: 'Yes, delete my account' }).click();

    await page.waitForURL('http://localhost:3000/');
  }
}

export { testSignup };
