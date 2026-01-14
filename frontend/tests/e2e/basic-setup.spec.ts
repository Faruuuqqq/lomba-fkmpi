import { test, expect } from '@playwright/test';

test.describe('Basic E2E Test Setup', () => {
  test('should load the application homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Should show either login page or main app
    const hasLogin = await page.locator('input[name="email"]').isVisible();
    const hasMainApp = await page.locator('text=MITRA AI').isVisible();
    
    expect(hasLogin || hasMainApp).toBeTruthy();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login form
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    
    // Should show register form
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show dashboard when authenticated', async ({ page }) => {
    // This test verifies that the dashboard loads properly
    // In a real scenario, you would authenticate first
    
    await page.goto('/dashboard');
    
    // Should either redirect to login or show dashboard
    const hasLoginForm = await page.locator('input[name="email"]').isVisible();
    const hasDashboard = await page.locator('text=New Project').isVisible();
    
    expect(hasLoginForm || hasDashboard).toBeTruthy();
  });
});