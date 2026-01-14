import { Page, BrowserContext } from '@playwright/test';
import { testCredentials, testProjects } from '../fixtures/test-creds';

export class TestHelpers {
  constructor(private page: Page) {}

  async login(credentials = testCredentials.valid) {
    // Navigate to login page
    await this.page.goto('/login');
    
    // Fill login form
    await this.page.fill('input[name="email"]', credentials.email);
    await this.page.fill('input[name="password"]', credentials.password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('/dashboard');
    
    // Verify we're logged in
    await this.page.locator('text=MITRA AI').waitFor();
  }

  async register(credentials = testCredentials.valid) {
    // Navigate to register page
    await this.page.goto('/register');
    
    // Fill registration form
    await this.page.fill('input[name="name"]', credentials.name);
    await this.page.fill('input[name="email"]', credentials.email);
    await this.page.fill('input[name="password"]', credentials.password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('/dashboard');
  }

  async createProject(projectData = testProjects.sample) {
    // Navigate to dashboard
    await this.page.goto('/dashboard');
    
    // Create new project
    await this.page.fill('input[placeholder="Enter project title..."]', projectData.title);
    await this.page.click('button:has-text("New Project")');
    
    // Wait for project page to load
    await this.page.waitForURL('/project/*');
    
    // Fill project content
    await this.page.locator('.ProseMirror').fill(projectData.content);
    
    // Save content
    await this.page.click('button:has-text("Save")');
    
    // Wait for save confirmation
    await this.page.locator('text=Project saved successfully').waitFor({ timeout: 10000 });
  }

  async unlockAiFeature() {
    // Check if AI is locked and unlock if needed
    const aiLocked = await this.page.locator('text=AI Locked').isVisible();
    if (aiLocked) {
      // Write more content to unlock AI (150+ words required)
      const additionalContent = ' '.repeat(50); // Add some dummy content to reach word count
      await this.page.locator('.ProseMirror').fill(additionalContent);
      await this.page.click('button:has-text("Save")');
      await this.page.locator('text=AI Unlocked').waitFor({ timeout: 10000 });
    }
  }

  async waitForAiResponse(timeout = 30000) {
    // Wait for AI response to appear
    await this.page.locator('[data-testid="ai-response"]').waitFor({ timeout });
  }

  async generateReasoningMap() {
    // Click on reasoning map button
    await this.page.click('button:has-text("Generate Reasoning Map")');
    
    // Wait for reasoning map modal
    await this.page.locator('[data-testid="reasoning-map-modal"]').waitFor({ timeout: 10000 });
    
    // Click generate button in modal
    await this.page.click('button:has-text("Generate Map")');
    
    // Wait for reasoning map to be generated
    await this.page.locator('[data-testid="reasoning-graph"]').waitFor({ timeout: 30000 });
    
    // Verify nodes and edges are present
    const nodes = await this.page.locator('[data-testid="reasoning-node"]').count();
    const edges = await this.page.locator('[data-testid="reasoning-edge"]').count();
    
    return { nodes, edges };
  }

  async performEthicsCheck() {
    // Click on ethics check button
    await this.page.click('button:has-text("Check Ethics")');
    
    // Wait for ethics check modal
    await this.page.locator('[data-testid="ethics-check-modal"]').waitFor({ timeout: 10000 });
    
    // Click analyze button in modal
    await this.page.click('button:has-text("Analyze Ethics")');
    
    // Wait for ethics analysis to complete
    await this.page.locator('[data-testid="ethics-results"]').waitFor({ timeout: 30000 });
    
    // Check if any ethical issues were found
    const issuesCount = await this.page.locator('[data-testid="ethics-issue"]').count();
    
    return { issuesCount };
  }

  async navigateToAnalytics() {
    // Navigate to dashboard
    await this.page.goto('/dashboard');
    
    // Click on Analytics button
    await this.page.click('button:has-text("Analytics")');
    
    // Wait for analytics dashboard to load
    await this.page.locator('[data-testid="analytics-dashboard"]').waitFor({ timeout: 10000 });
  }

  async getAnalyticsMetrics() {
    // Wait for metrics to load
    await this.page.locator('[data-testid="total-usage"]').waitFor({ timeout: 10000 });
    
    // Extract metrics
    const totalUsage = await this.page.locator('[data-testid="total-usage"]').textContent();
    const reasoningMapsCount = await this.page.locator('[data-testid="reasoning-maps-count"]').textContent();
    const ethicsChecksCount = await this.page.locator('[data-testid="ethics-checks-count"]').textContent();
    const avgResponseTime = await this.page.locator('[data-testid="avg-response-time"]').textContent();
    
    return {
      totalUsage: totalUsage || '0',
      reasoningMapsCount: reasoningMapsCount || '0',
      ethicsChecksCount: ethicsChecksCount || '0',
      avgResponseTime: avgResponseTime || '0.00s'
    };
  }

  async cleanup() {
    // Delete test projects if they exist
    await this.page.goto('/dashboard');
    const projectCards = await this.page.locator('[data-testid="project-card"]').count();
    
    for (let i = 0; i < projectCards; i++) {
      const firstCard = this.page.locator('[data-testid="project-card"]').first();
      const title = await firstCard.locator('[data-testid="project-title"]').textContent();
      
      if (title?.includes('E2E Test Project')) {
        await firstCard.locator('button:has-text("🗑️")').click();
        // Handle confirmation dialog
        this.page.on('dialog', dialog => dialog.accept());
      }
    }
  }
}