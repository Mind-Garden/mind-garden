import { Page } from '@playwright/test';

import { testDataVisualization } from '@/tests/load/commands/testDataVisualization';
import { testLogin } from '@/tests/load/commands/testLogin';
import { testDataVisualization } from '@/tests/load/commands/test-data-visualization';
import { testJournal } from '@/tests/load/commands/test-journal';
import { testLogin } from '@/tests/load/commands/test-login';
import { testReminders } from '@/tests/load/commands/testReminders';

async function artilleryScript(page: Page) {
  // comment out tests you dont want running to test your own test
  await testLogin(page);
  await testDataVisualization(page);
  await testReminders(page);
  await testJournal(page);
}

export { artilleryScript };
