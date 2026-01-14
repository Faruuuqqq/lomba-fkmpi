import { test, expect } from '../fixtures/page-fixtures';
import { testProjects } from '../fixtures/test-creds';

test.describe('Reasoning Map Generation', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    await helpers.createProject(testProjects.sample);
    await helpers.unlockAiFeature();
  });

  test('should generate reasoning map successfully', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Generate reasoning map
    const { nodes, edges } = await helpers.generateReasoningMap();
    
    // Verify reasoning map components
    expect(nodes).toBeGreaterThan(0);
    expect(edges).toBeGreaterThan(0);
    
    // Verify graph is visible
    await expect(authenticatedPage.locator('[data-testid="reasoning-graph"]')).toBeVisible();
    
    // Verify analysis text is present
    await expect(authenticatedPage.locator('[data-testid="reasoning-analysis"]')).toBeVisible();
    
    // Verify close button works
    await authenticatedPage.click('button:has-text("Close")');
    await expect(authenticatedPage.locator('[data-testid="reasoning-map-modal"]')).not.toBeVisible();
  });

  test('should show error for empty content', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Clear content
    await authenticatedPage.locator('.ProseMirror').clear();
    
    // Try to generate reasoning map
    await authenticatedPage.click('button:has-text("Generate Reasoning Map")');
    await authenticatedPage.click('button:has-text("Generate Map")');
    
    // Should show error message
    await expect(authenticatedPage.locator('text=Content is required')).toBeVisible();
  });

  test('should save reasoning map to database', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Generate reasoning map
    const { nodes } = await helpers.generateReasoningMap();
    
    // Navigate away and back to verify persistence
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.goBack();
    
    // Verify reasoning map is still accessible
    await authenticatedPage.click('button:has-text("Generate Reasoning Map")');
    await expect(authenticatedPage.locator('[data-testid="reasoning-graph"]')).toBeVisible();
  });

  test('should handle multiple reasoning map generations', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Generate first reasoning map
    const firstMap = await helpers.generateReasoningMap();
    await authenticatedPage.click('button:has-text("Close")');
    
    // Wait a bit and generate second reasoning map
    await authenticatedPage.waitForTimeout(1000);
    const secondMap = await helpers.generateReasoningMap();
    
    // Both should have generated successfully
    expect(firstMap.nodes).toBeGreaterThan(0);
    expect(secondMap.nodes).toBeGreaterThan(0);
    
    // Verify analytics will track both generations
    await helpers.navigateToAnalytics();
    const metrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(metrics.reasoningMapsCount)).toBeGreaterThanOrEqual(2);
  });

  test('should show loading state during generation', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Open reasoning map modal
    await authenticatedPage.click('button:has-text("Generate Reasoning Map")');
    await authenticatedPage.click('button:has-text("Generate Map")');
    
    // Verify loading state is shown
    await expect(authenticatedPage.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for completion
    await expect(authenticatedPage.locator('[data-testid="reasoning-graph"]')).toBeVisible({ timeout: 30000 });
    
    // Verify loading state is gone
    await expect(authenticatedPage.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should handle network errors gracefully', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Simulate network offline
    await authenticatedPage.context().setOffline(true);
    
    // Try to generate reasoning map
    await authenticatedPage.click('button:has-text("Generate Reasoning Map")');
    await authenticatedPage.click('button:has-text("Generate Map")');
    
    // Should show error message
    await expect(authenticatedPage.locator('text=Failed to generate reasoning map')).toBeVisible({ timeout: 10000 });
    
    // Restore network
    await authenticatedPage.context().setOffline(false);
  });
});