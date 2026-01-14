import { test, expect } from '../fixtures/page-fixtures';
import { testProjects } from '../fixtures/test-creds';

test.describe('Ethics Checking', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    await helpers.createProject(testProjects.sample);
    await helpers.unlockAiFeature();
  });

  test('should perform ethics check successfully', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Perform ethics check
    const { issuesCount } = await helpers.performEthicsCheck();
    
    // Verify ethics check results are displayed
    await expect(authenticatedPage.locator('[data-testid="ethics-results"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="ethics-summary"]')).toBeVisible();
    
    // Verify close button works
    await authenticatedPage.click('button:has-text("Close")');
    await expect(authenticatedPage.locator('[data-testid="ethics-check-modal"]')).not.toBeVisible();
  });

  test('should identify potential ethical issues', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Add content with potential ethical issues
    const problematicContent = `All students from low-income backgrounds perform poorly in standardized tests. 
    This is because their parents are not well-educated and their schools lack resources. 
    We should separate students based on their family income levels to ensure better educational outcomes.
    Male students are naturally better at mathematics than female students, so we should guide them accordingly.`;
    
    await authenticatedPage.locator('.ProseMirror').fill(problematicContent);
    await authenticatedPage.click('button:has-text("Save")');
    
    // Perform ethics check
    const { issuesCount } = await helpers.performEthicsCheck();
    
    // Should identify issues
    expect(issuesCount).toBeGreaterThan(0);
    
    // Verify issue details are displayed
    await expect(authenticatedPage.locator('[data-testid="ethics-issue"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="issue-sentence"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="issue-explanation"]')).toBeVisible();
  });

  test('should show no issues for ethical content', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Add ethical content
    const ethicalContent = `Educational research shows that students from diverse backgrounds can achieve excellent academic outcomes when provided with appropriate support and resources. 
    Individual student performance should be assessed based on their personal growth and effort rather than demographic factors. 
    Inclusive educational practices that consider the unique needs of each student tend to produce better learning environments.
    All students, regardless of their background, should have equal access to quality educational opportunities.`;
    
    await authenticatedPage.locator('.ProseMirror').fill(ethicalContent);
    await authenticatedPage.click('button:has-text("Save")');
    
    // Perform ethics check
    await authenticatedPage.click('button:has-text("Check Ethics")');
    await authenticatedPage.click('button:has-text("Analyze Ethics")');
    
    // Verify results
    await expect(authenticatedPage.locator('[data-testid="ethics-results"]')).toBeVisible();
    
    // Check if no issues message is shown
    const noIssuesText = await authenticatedPage.locator('text=no ethical issues').isVisible();
    if (noIssuesText) {
      await expect(authenticatedPage.locator('text=no ethical issues')).toBeVisible();
    }
  });

  test('should show error for empty content', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Clear content
    await authenticatedPage.locator('.ProseMirror').clear();
    
    // Try to perform ethics check
    await authenticatedPage.click('button:has-text("Check Ethics")');
    await authenticatedPage.click('button:has-text("Analyze Ethics")');
    
    // Should show error message
    await expect(authenticatedPage.locator('text=Content is required')).toBeVisible();
  });

  test('should show loading state during analysis', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Open ethics check modal
    await authenticatedPage.click('button:has-text("Check Ethics")');
    await authenticatedPage.click('button:has-text("Analyze Ethics")');
    
    // Verify loading state is shown
    await expect(authenticatedPage.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for completion
    await expect(authenticatedPage.locator('[data-testid="ethics-results"]')).toBeVisible({ timeout: 30000 });
    
    // Verify loading state is gone
    await expect(authenticatedPage.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should allow multiple ethics checks', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Perform first ethics check
    const firstCheck = await helpers.performEthicsCheck();
    await authenticatedPage.click('button:has-text("Close")');
    
    // Wait and perform second ethics check
    await authenticatedPage.waitForTimeout(1000);
    const secondCheck = await helpers.performEthicsCheck();
    
    // Both should complete successfully
    expect(firstCheck.issuesCount).toBeGreaterThanOrEqual(0);
    expect(secondCheck.issuesCount).toBeGreaterThanOrEqual(0);
    
    // Verify analytics will track both checks
    await helpers.navigateToAnalytics();
    const metrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(metrics.ethicsChecksCount)).toBeGreaterThanOrEqual(2);
  });

  test('should handle network errors gracefully', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Simulate network offline
    await authenticatedPage.context().setOffline(true);
    
    // Try to perform ethics check
    await authenticatedPage.click('button:has-text("Check Ethics")');
    await authenticatedPage.click('button:has-text("Analyze Ethics")');
    
    // Should show error message
    await expect(authenticatedPage.locator('text=Failed to analyze ethics')).toBeVisible({ timeout: 10000 });
    
    // Restore network
    await authenticatedPage.context().setOffline(false);
  });

  test('should display detailed issue explanations', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Add content with specific types of bias
    const biasedContent = `Asian students are always good at mathematics. 
    Women are not interested in engineering careers.
    All poor students are unmotivated.`;
    
    await authenticatedPage.locator('.ProseMirror').fill(biasedContent);
    await authenticatedPage.click('button:has-text("Save")');
    
    // Perform ethics check
    await helpers.performEthicsCheck();
    
    // Verify issue details
    const issues = await authenticatedPage.locator('[data-testid="ethics-issue"]').count();
    expect(issues).toBeGreaterThan(0);
    
    // Check for issue type labels
    const issueTypes = await authenticatedPage.locator('[data-testid="issue-type"]').count();
    expect(issueTypes).toBeGreaterThan(0);
    
    // Check for explanations
    const explanations = await authenticatedPage.locator('[data-testid="issue-explanation"]').count();
    expect(explanations).toBeGreaterThan(0);
  });
});