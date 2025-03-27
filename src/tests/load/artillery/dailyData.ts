import { Page } from '@playwright/test';

import { testDailyData } from '@/tests/load/commands/testDailyData';

async function artilleryScript(page: Page) {
  await testDailyData(page);
}

export { artilleryScript };
