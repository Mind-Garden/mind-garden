import { Page } from '@playwright/test';

import { testDataVisualization } from '@/tests/load/commands/testDataVisualization';
import { testLogin } from '@/tests/load/commands/testLogin';

async function artilleryScript(page: Page) {
  // comment out tests you dont want running to test your own test
  await testLogin(page);
  await testDataVisualization(page);
}

export { artilleryScript };
