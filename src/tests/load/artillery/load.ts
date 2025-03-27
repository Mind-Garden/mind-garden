import { Page } from '@playwright/test';

import { testDailyData } from '@/tests/load/commands/test-daily-data';
import { testDataVisualization } from '@/tests/load/commands/test-data-visualization';
import { testJournal } from '@/tests/load/commands/test-journal';
import { testLogin } from '@/tests/load/commands/test-login';
import { testSleep } from '@/tests/load/commands/test-sleep';

async function artilleryScript(page: Page) {
  // comment out tests you dont want running to test your own test
  await testLogin(page);
  await testDataVisualization(page);
  await testDailyData(page);
  await testSleep(page);
  await testJournal(page);
}

export { artilleryScript };
