import { Page } from '@playwright/test';

import { testLogin } from '../commands/login';

async function artilleryScript(page: Page) {
  await testLogin(page);
}

export { artilleryScript };
