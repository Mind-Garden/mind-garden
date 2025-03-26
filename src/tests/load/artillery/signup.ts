import { Page } from '@playwright/test';

import { testSignup } from '@/tests/load/commands/signup';

async function artilleryScript(page: Page, context: any) {
  await testSignup(page, context);
}

export { artilleryScript };
