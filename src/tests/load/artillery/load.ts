import { Page } from '@playwright/test';

import { testDailyData } from '@/tests/load/commands/test-daily-data';
import { testDataVisualization } from '@/tests/load/commands/test-data-visualization';
import { testJournal } from '@/tests/load/commands/test-journal';
import { testLogin } from '@/tests/load/commands/test-login';
import { testReminders } from '@/tests/load/commands/test-reminders';
import { testSleep } from '@/tests/load/commands/test-sleep';
import { testTaskManager } from '@/tests/load/commands/test-task-manager';

const BASE_URL = 'http://localhost:3000'; // change to https://mindgarden.vercel.app/ for testing on vercel

async function artilleryScript(page: Page) {
  // comment out tests you dont want running to test your own test
  await testLogin(page, BASE_URL);
  await testDailyData(page, BASE_URL);
  await testDataVisualization(page, BASE_URL);
  await testJournal(page, BASE_URL);
  await testTaskManager(page, BASE_URL);
  await testReminders(page, BASE_URL);
  await testSleep(page, BASE_URL);
}

export { artilleryScript };
