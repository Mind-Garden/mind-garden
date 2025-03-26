import { expect, Page } from '@playwright/test';

async function testLogin(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByText('Click here to unlock your').click();
  await page.getByRole('textbox', { name: 'Email' }).fill('load@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.locator('[id="radix-«r6»"]')).toBeVisible();
}

export { testLogin };
