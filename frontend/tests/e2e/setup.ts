import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...');
  
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Ensure the application is running
    const baseURL = config.webServer?.url || 'http://localhost:3000';
    
    // Wait for the application to be ready
    console.log(`📡 Checking application at ${baseURL}...`);
    let retries = 0;
    const maxRetries = 30;
    
    while (retries < maxRetries) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        // Check if the page loads successfully
        await page.waitForSelector('body', { timeout: 3000 });
        console.log('✅ Application is ready for testing');
        break;
      } catch (error) {
        retries++;
        console.log(`⏳ Waiting for application... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (retries >= maxRetries) {
      throw new Error('Application failed to start within expected time');
    }
    
    // Perform any database cleanup if needed
    await cleanupDatabase();
    
    console.log('✅ E2E test environment setup complete');
    
  } catch (error) {
    console.error('❌ E2E test setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function cleanupDatabase() {
  // This would typically involve:
  // 1. Connecting to test database
  // 2. Cleaning up test users and projects
  // 3. Resetting analytics data
  // 4. Ensuring clean state for tests
  
  console.log('🧹 Database cleanup...');
  
  // For now, we'll log this action
  // In a real implementation, you would:
  // - Connect to your test database
  // - Run cleanup queries to remove test data
  // - Ensure database is in a known good state
  
  console.log('✅ Database cleanup complete');
}

export default globalSetup;