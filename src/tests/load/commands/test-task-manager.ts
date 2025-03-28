import { Page } from '@playwright/test';

import { goToWebsiteAndLogin } from '@/tests/load/commands/test-login';

export async function testTaskManager(page: Page, baseUrl: string) {
  const workerNumber = Math.floor(Math.random() * 10);
  const email = `load${workerNumber}@test.com`;
  await goToWebsiteAndLogin(page, baseUrl, email);
  await page.waitForURL(baseUrl + '/home');
  await page.goto(baseUrl + '/task-manager');

  for (let i = 0; i < 11; i++) {
    await page.getByRole('main').getByRole('button').nth(2).click();
    await page
      .getByRole('textbox', { name: 'Enter a task...' })
      .fill('New Task');
    await page.getByRole('main').getByRole('button').nth(3).click();
    await page.waitForTimeout(500); // Allow animation to complete
    const taskButtons = await page
      .getByRole('button', { name: 'Delete Task' })
      .all();
    const taskCount = taskButtons.length;

    if (taskCount > 0) {
      await taskButtons[0].click(); // delete the first task
      await page.waitForTimeout(500); // Allow animation to complete
    }
  }
}
