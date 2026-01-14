import { test as base, Page } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

// Extend base test with custom fixtures
type CustomFixtures = {
  testHelpers: TestHelpers;
  authenticatedPage: Page;
};

export const test = base.extend<CustomFixtures>({
  testHelpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },

  authenticatedPage: async ({ page, context }, use) => {
    const helpers = new TestHelpers(page);
    
    // Create a new context for authenticated user
    const authContext = context.browser().newContext();
    const authPage = await authContext.newPage();
    const authHelpers = new TestHelpers(authPage);
    
    // Register and login the test user
    await authHelpers.register();
    
    await use(authPage);
    
    // Cleanup
    await authContext.close();
  },
});

export { expect } from '@playwright/test';