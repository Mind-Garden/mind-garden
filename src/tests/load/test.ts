import { Page } from '@playwright/test';

export const config = {
  target: 'http://localhost:3000',
  phases: [
    {
      duration: 10,
      arrivalRate: 1,
    },
  ],
  engines: {
    playwright: {},
  },
};
export const scenarios = [
  {
    engine: 'playwright',
    testFunction: login,
  },
];

async function login(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('load@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for navigation to /home
  await page.waitForURL('http://localhost:3000/home');
}
