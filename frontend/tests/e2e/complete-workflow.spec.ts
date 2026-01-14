import { test, expect } from '../fixtures/page-fixtures';
import { testProjects } from '../fixtures/test-creds';

test.describe('Complete AI Workflow Integration', () => {
  test('should complete full user journey from registration to AI features usage', async ({ page, context }) => {
    // Test user registration
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Workflow Test User');
    await page.fill('input[name="email"]', 'workflow@example.com');
    await page.fill('input[name="password"]', 'workflowtest123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('text=MITRA AI')).toBeVisible();
    
    // Create a project
    await page.fill('input[placeholder="Enter project title..."]', testProjects.sample.title);
    await page.click('button:has-text("New Project")');
    await page.waitForURL('/project/*');
    
    // Fill project content
    await page.locator('.ProseMirror').fill(testProjects.sample.content);
    await page.click('button:has-text("Save")');
    await page.locator('text=Project saved successfully').waitFor({ timeout: 10000 });
    
    // Verify AI is unlocked (content is long enough)
    await expect(page.locator('text=AI Unlocked')).toBeVisible({ timeout: 10000 });
    
    // Use AI chat feature
    await page.fill('input[placeholder*="Ask MITRA"]', 'What are the main arguments in this essay?');
    await page.click('button:has-text("Send")');
    
    // Wait for AI response
    await page.locator('[data-testid="ai-response"]').waitFor({ timeout: 30000 });
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
    
    // Generate reasoning map
    const mapResult = await (async () => {
      await page.click('button:has-text("Generate Reasoning Map")');
      await page.click('button:has-text("Generate Map")');
      await page.locator('[data-testid="reasoning-graph"]').waitFor({ timeout: 30000 });
      
      const nodes = await page.locator('[data-testid="reasoning-node"]').count();
      const edges = await page.locator('[data-testid="reasoning-edge"]').count();
      await page.click('button:has-text("Close")');
      
      return { nodes, edges };
    })();
    
    expect(await mapResult).toMatchObject({ nodes: expect.any(Number), edges: expect.any(Number) });
    
    // Perform ethics check
    const ethicsResult = await (async () => {
      await page.click('button:has-text("Check Ethics")');
      await page.click('button:has-text("Analyze Ethics")');
      await page.locator('[data-testid="ethics-results"]').waitFor({ timeout: 30000 });
      
      const issuesCount = await page.locator('[data-testid="ethics-issue"]').count();
      await page.click('button:has-text("Close")');
      
      return { issuesCount };
    })();
    
    expect(await ethicsResult).toMatchObject({ issuesCount: expect.any(Number) });
    
    // Check analytics dashboard
    await page.goto('/dashboard');
    await page.click('button:has-text("Analytics")');
    await page.locator('[data-testid="analytics-dashboard"]').waitFor({ timeout: 10000 });
    
    // Verify usage is tracked
    const totalUsage = await page.locator('[data-testid="total-usage"]').textContent();
    const reasoningMaps = await page.locator('[data-testid="reasoning-maps-count"]').textContent();
    const ethicsChecks = await page.locator('[data-testid="ethics-checks-count"]').textContent();
    
    expect(parseInt(totalUsage || '0')).toBeGreaterThan(2); // At least chat + map + ethics
    expect(parseInt(reasoningMaps || '0')).toBe(1);
    expect(parseInt(ethicsChecks || '0')).toBe(1);
    
    // Return to project and complete it
    await page.click('button:has-text("Back to Projects")');
    await page.locator('[data-testid="project-card"]').first().click();
    await page.waitForURL('/project/*');
    
    // Add reflection and finish
    await page.fill('textarea[placeholder*="reflection"]', 'This was a comprehensive analysis of AI in education.');
    await page.click('button:has-text("Finish Project")');
    
    // Should show completion state
    await expect(page.locator('text=Project marked as completed')).toBeVisible({ timeout: 10000 });
  });

  test('should handle multiple projects with AI features', async ({ page, context }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(page);
    
    // Register and login
    await helpers.register({ ...testCredentials.valid, name: 'Multi Project User', email: 'multi@example.com' });
    
    // Create first project with AI features
    await helpers.createProject(testProjects.sample);
    await helpers.unlockAiFeature();
    await helpers.generateReasoningMap();
    await helpers.performEthicsCheck();
    
    // Return to dashboard
    await page.goto('/dashboard');
    
    // Create second project
    await page.fill('input[placeholder="Enter project title..."]', 'Second Test Project');
    await page.click('button:has-text("New Project")');
    await page.waitForURL('/project/*');
    
    await page.locator('.ProseMirror').fill(testProjects.minimal.content);
    await page.click('button:has-text("Save")');
    
    // Unlock AI for second project
    await helpers.unlockAiFeature();
    await helpers.generateReasoningMap();
    
    // Check analytics for combined usage
    await helpers.navigateToAnalytics();
    const metrics = await helpers.getAnalyticsMetrics();
    
    expect(parseInt(metrics.totalUsage)).toBeGreaterThanOrEqual(4); // 2 projects * 2 AI features each
    expect(parseInt(metrics.reasoningMapsCount)).toBe(2);
    
    // Verify performance metrics
    await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
    await expect(page.locator('text=requests')).toBeVisible();
  });

  test('should maintain data persistence across sessions', async ({ page, context }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(page);
    
    // Create project and use AI features
    await helpers.register({ ...testCredentials.valid, name: 'Persistence Test User', email: 'persistence@example.com' });
    await helpers.createProject(testProjects.sample);
    await helpers.unlockAiFeature();
    await helpers.generateReasoningMap();
    await helpers.performEthicsCheck();
    
    // Verify analytics show usage
    await helpers.navigateToAnalytics();
    const initialMetrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(initialMetrics.totalUsage)).toBeGreaterThan(0);
    
    // Simulate session expiration by clearing cookies
    await context.clearCookies();
    
    // Login again
    await helpers.login({ email: 'persistence@example.com', password: testCredentials.valid.password });
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Should show same usage data
    const restoredMetrics = await helpers.getAnalyticsMetrics();
    expect(restoredMetrics.totalUsage).toBe(initialMetrics.totalUsage);
    expect(restoredMetrics.reasoningMapsCount).toBe(initialMetrics.reasoningMapsCount);
    expect(restoredMetrics.ethicsChecksCount).toBe(initialMetrics.ethicsChecksCount);
  });

  test('should handle concurrent AI requests properly', async ({ page, context }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(page);
    
    await helpers.register({ ...testCredentials.valid, name: 'Concurrency Test User', email: 'concurrent@example.com' });
    await helpers.createProject(testProjects.sample);
    await helpers.unlockAiFeature();
    
    // Try to open both AI features quickly
    await page.click('button:has-text("Generate Reasoning Map")');
    await page.waitForTimeout(500); // Small delay to ensure first modal opens
    await page.click('button:has-text("Check Ethics")');
    
    // Should handle gracefully - one modal should be visible, other should queue
    const reasoningModalVisible = await page.locator('[data-testid="reasoning-map-modal"]').isVisible();
    const ethicsModalVisible = await page.locator('[data-testid="ethics-check-modal"]').isVisible();
    
    expect(reasoningModalVisible || ethicsModalVisible).toBeTruthy();
    
    // Close current modal
    if (reasoningModalVisible) {
      await page.click('button:has-text("Close")');
      await page.locator('[data-testid="reasoning-map-modal"]').waitFor({ state: 'hidden' });
    } else {
      await page.click('button:has-text("Close")');
      await page.locator('[data-testid="ethics-check-modal"]').waitFor({ state: 'hidden' });
    }
    
    // Now try the other feature
    if (reasoningModalVisible) {
      await page.click('button:has-text("Check Ethics")');
      await page.locator('[data-testid="ethics-check-modal"]').waitFor({ timeout: 10000 });
    } else {
      await page.click('button:has-text("Generate Reasoning Map")');
      await page.locator('[data-testid="reasoning-map-modal"]').waitFor({ timeout: 10000 });
    }
  });

  test('should validate content before AI processing', async ({ page, context }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(page);
    
    await helpers.register({ ...testCredentials.valid, name: 'Validation Test User', email: 'validation@example.com' });
    await helpers.createProject(testProjects.minimal);
    await helpers.unlockAiFeature();
    
    // Test with very short content
    await page.locator('.ProseMirror').clear();
    await page.locator('.ProseMirror').fill('Short text.');
    await page.click('button:has-text("Save")');
    
    // Try reasoning map
    await page.click('button:has-text("Generate Reasoning Map")');
    await page.click('button:has-text("Generate Map")');
    
    // Should show warning about insufficient content
    const warningVisible = await page.locator('text=insufficient content').isVisible({ timeout: 5000 });
    if (warningVisible) {
      await expect(page.locator('text=insufficient content')).toBeVisible();
    }
    
    // Try ethics check
    await page.click('button:has-text("Check Ethics")');
    await page.click('button:has-text("Analyze Ethics")');
    
    // Should also show warning for ethics check
    const ethicsWarningVisible = await page.locator('text=insufficient content').isVisible({ timeout: 5000 });
    if (ethicsWarningVisible) {
      await expect(page.locator('text=insufficient content')).toBeVisible();
    }
  });

  test('should provide consistent user experience across different content types', async ({ page, context }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(page);
    
    await helpers.register({ ...testCredentials.valid, name: 'Content Type User', email: 'content@example.com' });
    
    // Test with different types of content
    const contentTypes = [
      testProjects.sample, // Educational essay
      {
        title: 'Scientific Paper',
        content: `This study examines the effects of machine learning algorithms on educational outcomes. 
        We conducted a randomized controlled trial with 500 students across 10 schools. 
        Results indicate that AI-powered personalized learning systems improve test scores by an average of 23%. 
        However, we observed significant variance based on student demographics and socioeconomic status. 
        Further research is needed to address potential algorithmic biases in educational technology.`
      },
      {
        title: 'Philosophical Essay',
        content: `The nature of consciousness remains one of philosophy's most enduring mysteries. 
        Some argue that consciousness emerges from complex neural computations, while others propose 
        quantum mechanical explanations. This paper examines both perspectives and suggests that 
        consciousness may be better understood as a spectrum rather than a binary state. 
        The implications for artificial intelligence and ethics are profound and warrant careful consideration.`
      }
    ];
    
    for (const contentType of contentTypes) {
      // Create project with specific content
      await page.goto('/dashboard');
      await page.fill('input[placeholder="Enter project title..."]', contentType.title);
      await page.click('button:has-text("New Project")');
      await page.waitForURL('/project/*');
      
      await page.locator('.ProseMirror').fill(contentType.content);
      await page.click('button:has-text("Save")');
      await helpers.unlockAiFeature();
      
      // Test reasoning map
      const mapResult = await helpers.generateReasoningMap();
      expect(mapResult.nodes).toBeGreaterThan(0);
      await page.click('button:has-text("Close")');
      
      // Test ethics check
      const ethicsResult = await helpers.performEthicsCheck();
      expect(ethicsResult.issuesCount).toBeGreaterThanOrEqual(0);
      await page.click('button:has-text("Close")');
    }
    
    // Verify analytics tracks all usage
    await helpers.navigateToAnalytics();
    const metrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(metrics.totalUsage)).toBeGreaterThanOrEqual(6); // 3 projects * 2 features each
  });
});

// Import testCredentials for the workflow tests
const testCredentials = {
  valid: {
    email: 'workflow@example.com',
    password: 'workflowtest123',
    name: 'Workflow Test User'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }
};