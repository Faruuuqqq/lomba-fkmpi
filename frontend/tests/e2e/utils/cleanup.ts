import { Page, BrowserContext } from '@playwright/test';
import { testCredentials } from '../fixtures/test-creds';

export class TestCleanup {
  constructor(private page: Page, private context: BrowserContext) {}

  async cleanupTestData() {
    try {
      // Navigate to dashboard
      await this.page.goto('/dashboard');
      
      // Remove test projects
      const projectCards = await this.page.locator('[data-testid="project-card"]').count();
      
      for (let i = 0; i < projectCards; i++) {
        const firstCard = this.page.locator('[data-testid="project-card"]').first();
        const title = await firstCard.locator('[data-testid="project-title"]').textContent();
        
        // Check if it's a test project
        if (title && (
          title.includes('Test') || 
          title.includes('E2E') || 
          title.includes('Workflow') ||
          title.includes('Persistence') ||
          title.includes('Concurrency') ||
          title.includes('Validation') ||
          title.includes('Content') ||
          title.includes('Second') ||
          title.includes('Minimal')
        )) {
          // Click delete button
          await firstCard.locator('button').last().click(); // Assuming delete is the last button
          
          // Handle confirmation dialog
          this.page.on('dialog', dialog => dialog.accept());
          
          // Wait for deletion to complete
          await this.page.waitForTimeout(1000);
        }
      }
      
      // Clear analytics data if needed (via API or direct database access)
      await this.cleanupAnalyticsData();
      
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  }

  private async cleanupAnalyticsData() {
    try {
      // This would ideally be done via API endpoint for cleaning test data
      // For now, we'll just navigate away from analytics
      if (this.page.url().includes('analytics')) {
        await this.page.goto('/dashboard');
      }
    } catch (error) {
      console.error('Error cleaning analytics data:', error);
    }
  }

  async cleanupAuthentication() {
    // Clear cookies and local storage
    await this.context.clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async cleanupAll() {
    await this.cleanupAuthentication();
    await this.cleanupTestData();
  }
}

// Global cleanup utility for after all tests
export async function globalCleanup(context: BrowserContext) {
  // Create a new page for cleanup
  const page = await context.newPage();
  const cleanup = new TestCleanup(page, context);
  
  try {
    // Try to login if needed
    await page.goto('/login');
    
    // Check if we're on login page (not already logged in)
    if (await page.locator('input[name="email"]').isVisible()) {
      // Try to login with test credentials
      await page.fill('input[name="email"]', testCredentials.valid.email);
      await page.fill('input[name="password"]', testCredentials.valid.password);
      await page.click('button[type="submit"]');
      
      // Wait for potential redirect
      await page.waitForTimeout(2000);
    }
    
    // Perform cleanup
    await cleanup.cleanupAll();
    
  } catch (error) {
    console.error('Global cleanup error:', error);
  } finally {
    await page.close();
  }
}