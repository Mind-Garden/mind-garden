import { Page } from '@playwright/test';

async function testJournal(page: Page) {
  const workerNumber = Math.floor(Math.random() * 10);
  const email = `load${workerNumber}@test.com`;

  // Login
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for load
  await page.waitForURL('http://localhost:3000/home');

  // Go to journal page
  await page.getByRole('button', { name: 'Journal' }).click();
  await page.waitForURL('http://localhost:3000/journal');

  // Loop, making journal entries and deleting them
  for (let i = 0; i < 10; i++) {
    await page
      .getByRole('textbox', { name: "What's on your mind today?" })
      .fill('test entry');
    await page.getByRole('button', { name: 'Save Entry' }).click();
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForTimeout(2000);
  }
}

export { testJournal };
