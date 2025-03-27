import { Page } from '@playwright/test';

import { testDailyData } from '@/tests/load/commands/test-daily-data';
import { testSleep } from '@/tests/load/commands/test-sleep';
import { testDataVisualization } from '@/tests/load/commands/testDataVisualization';
import { testLogin } from '@/tests/load/commands/testLogin';

async function artilleryScript(page: Page) {
  // comment out tests you dont want running to test your own test
  await testLogin(page);
  await testDataVisualization(page);
  await testDailyData(page);
  await testSleep(page);
}

export { artilleryScript };
