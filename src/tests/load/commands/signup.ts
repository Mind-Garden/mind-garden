import { Page } from '@playwright/test';

async function testSignup(page: Page) {
  await page.goto('http://localhost:3000/');
}

export { testSignup };
