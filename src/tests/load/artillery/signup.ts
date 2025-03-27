import { Page } from '@playwright/test';

import { testSignup } from '@/tests/load/commands/signup';

async function artilleryScript(page: Page) {
  await testSignup(page);
}

export { artilleryScript };
