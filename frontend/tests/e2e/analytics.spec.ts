import { test, expect } from '../fixtures/page-fixtures';
import { testProjects } from '../fixtures/test-creds';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    await helpers.createProject(testProjects.sample);
    await helpers.unlockAiFeature();
  });

  test('should display analytics dashboard', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Verify dashboard components
    await expect(authenticatedPage.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="total-usage"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="reasoning-maps-count"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="ethics-checks-count"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="avg-response-time"]')).toBeVisible();
  });

  test('should show zero usage for new user', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Navigate to analytics without using any AI features
    await helpers.navigateToAnalytics();
    
    // Should show zero usage
    const metrics = await helpers.getAnalyticsMetrics();
    expect(metrics.totalUsage).toBe('0');
    expect(metrics.reasoningMapsCount).toBe('0');
    expect(metrics.ethicsChecksCount).toBe('0');
    expect(metrics.avgResponseTime).toBe('0.00s');
  });

  test('should track reasoning map usage', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Generate reasoning map
    await helpers.generateReasoningMap();
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Should show usage
    const metrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(metrics.totalUsage)).toBeGreaterThan(0);
    expect(parseInt(metrics.reasoningMapsCount)).toBeGreaterThan(0);
  });

  test('should track ethics check usage', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Perform ethics check
    await helpers.performEthicsCheck();
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Should show usage
    const metrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(metrics.totalUsage)).toBeGreaterThan(0);
    expect(parseInt(metrics.ethicsChecksCount)).toBeGreaterThan(0);
  });

  test('should track combined AI feature usage', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Generate reasoning map
    await helpers.generateReasoningMap();
    await authenticatedPage.click('button:has-text("Close")');
    
    // Perform ethics check
    await helpers.performEthicsCheck();
    await authenticatedPage.click('button:has-text("Close")');
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Should show combined usage
    const metrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(metrics.totalUsage)).toBe(2);
    expect(parseInt(metrics.reasoningMapsCount)).toBe(1);
    expect(parseInt(metrics.ethicsChecksCount)).toBe(1);
  });

  test('should display feature usage breakdown', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Use both features
    await helpers.generateReasoningMap();
    await authenticatedPage.click('button:has-text("Close")');
    await helpers.performEthicsCheck();
    await authenticatedPage.click('button:has-text("Close")');
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Verify feature breakdown section
    await expect(authenticatedPage.locator('[data-testid="feature-usage-breakdown"]')).toBeVisible();
    await expect(authenticatedPage.locator('text=Feature Usage Breakdown')).toBeVisible();
    
    // Verify individual feature entries
    await expect(authenticatedPage.locator('text=reasoning map')).toBeVisible();
    await expect(authenticatedPage.locator('text=ethics check')).toBeVisible();
    
    // Verify usage percentages
    const percentages = await authenticatedPage.locator('[data-testid="usage-percentage"]').count();
    expect(percentages).toBe(2);
  });

  test('should display performance metrics', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Use features multiple times to generate performance data
    for (let i = 0; i < 3; i++) {
      await helpers.generateReasoningMap();
      await authenticatedPage.click('button:has-text("Close")');
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Verify performance metrics section
    await expect(authenticatedPage.locator('[data-testid="performance-metrics"]')).toBeVisible();
    await expect(authenticatedPage.locator('text=Performance Metrics')).toBeVisible();
    
    // Verify performance data
    await expect(authenticatedPage.locator('text=Min Time')).toBeVisible();
    await expect(authenticatedPage.locator('text=Avg Time')).toBeVisible();
    await expect(authenticatedPage.locator('text=Max Time')).toBeVisible();
    await expect(authenticatedPage.locator('text=requests')).toBeVisible();
  });

  test('should handle no data gracefully', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Navigate to analytics without using any features
    await helpers.navigateToAnalytics();
    
    // Should show appropriate empty state messages
    const noDataMessage = await authenticatedPage.locator('text=No usage data available yet').isVisible();
    const noPerformanceMessage = await authenticatedPage.locator('text=No performance data available yet').isVisible();
    
    expect(noDataMessage || noPerformanceMessage).toBeTruthy();
  });

  test('should update analytics in real-time', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Check initial state
    const initialMetrics = await helpers.getAnalyticsMetrics();
    expect(initialMetrics.totalUsage).toBe('0');
    
    // Go back and use a feature
    await authenticatedPage.click('button:has-text("Back to Projects")');
    await helpers.generateReasoningMap();
    
    // Return to analytics
    await helpers.navigateToAnalytics();
    
    // Should show updated metrics
    const updatedMetrics = await helpers.getAnalyticsMetrics();
    expect(parseInt(updatedMetrics.totalUsage)).toBeGreaterThan(parseInt(initialMetrics.totalUsage));
    expect(parseInt(updatedMetrics.reasoningMapsCount)).toBeGreaterThan(0);
  });

  test('should navigate between dashboard and analytics', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Start at dashboard
    await authenticatedPage.goto('/dashboard');
    
    // Navigate to analytics
    await authenticatedPage.click('button:has-text("Analytics")');
    await expect(authenticatedPage.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
    
    // Navigate back to dashboard
    await authenticatedPage.click('button:has-text("Back to Projects")');
    await expect(authenticatedPage.locator('text=New Project')).toBeVisible();
    
    // Navigate to analytics again
    await authenticatedPage.click('button:has-text("Analytics")');
    await expect(authenticatedPage.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
  });

  test('should handle analytics loading errors gracefully', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Simulate network issues during analytics loading
    await authenticatedPage.context().setOffline(true);
    
    // Try to navigate to analytics
    await authenticatedPage.click('button:has-text("Analytics")');
    
    // Should handle error gracefully
    const errorMessage = await authenticatedPage.locator('text=Failed to load analytics').isVisible({ timeout: 5000 });
    const analyticsNotVisible = await authenticatedPage.locator('[data-testid="analytics-dashboard"]').isHidden({ timeout: 5000 });
    
    expect(errorMessage || analyticsNotVisible).toBeTruthy();
    
    // Restore network
    await authenticatedPage.context().setOffline(false);
  });

  test('should display average response time correctly', async ({ authenticatedPage, testHelpers }) => {
    const helpers = new (await import('../utils/test-helpers')).TestHelpers(authenticatedPage);
    
    // Use features to generate response time data
    await helpers.generateReasoningMap();
    await authenticatedPage.click('button:has-text("Close")');
    await helpers.performEthicsCheck();
    await authenticatedPage.click('button:has-text("Close")');
    
    // Navigate to analytics
    await helpers.navigateToAnalytics();
    
    // Verify average response time is displayed
    const avgTimeElement = await authenticatedPage.locator('[data-testid="avg-response-time"]');
    await expect(avgTimeElement).toBeVisible();
    
    const avgTimeText = await avgTimeElement.textContent();
    expect(avgTimeText).toMatch(/\d+\.\d+s/); // Should match format like "2.45s"
    expect(avgTimeText).not.toBe('0.00s'); // Should not be zero after usage
  });
});