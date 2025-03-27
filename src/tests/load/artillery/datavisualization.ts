import { Page } from '@playwright/test';

import { dataVisualization } from '@/tests/load/commands/datavisualization';

async function artilleryScript(page: Page, context: any) {
  await dataVisualization(page, context);
}

export { artilleryScript };
