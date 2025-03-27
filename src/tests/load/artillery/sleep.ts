import { Page } from '@playwright/test';

import { testSleep } from '@/tests/load/commands/testSleep';

async function artilleryScript(page: Page) {
  await testSleep(page);
}

export { artilleryScript };
