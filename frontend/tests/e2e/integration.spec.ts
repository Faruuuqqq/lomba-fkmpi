import { test, expect } from '@playwright/test';
import { loginAsUser, createTestProject, uploadTestFile } from '../helpers/auth-helper';

test.describe('File Upload Integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should upload and manage files for a project', async ({ page }) => {
    // Create a test project
    const project = await createTestProject(page);
    
    // Navigate to project page
    await page.goto(`/project/${project.id}`);
    
    // Click on Files tab
    await page.click('[data-testid="files-tab"]');
    
    // Should show file upload component
    await expect(page.locator('[data-testid="file-upload"]')).toBeVisible();
    
    // Create a test file
    const testFile = {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    };
    
    // Upload file
    await page.setInputFiles('[data-testid="file-input"]', testFile);
    
    // Wait for upload to complete
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Verify file appears in media manager
    await expect(page.locator('[data-testid="media-manager"]')).toContainText('test-document.pdf');
    
    // Test file preview
    await page.click('[data-testid="preview-file"]');
    await expect(page.locator('[data-testid="file-preview-modal"]')).toBeVisible();
    
    // Close preview
    await page.click('[data-testid="close-preview"]');
    
    // Test file deletion
    await page.click('[data-testid="delete-file"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify file is removed
    await expect(page.locator('[data-testid="media-manager"]')).not.toContainText('test-document.pdf');
  });

  test('should handle multiple file uploads', async ({ page }) => {
    const project = await createTestProject(page);
    await page.goto(`/project/${project.id}`);
    await page.click('[data-testid="files-tab"]');
    
    // Upload multiple files
    const files = [
      { name: 'file1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('image1') },
      { name: 'file2.png', mimeType: 'image/png', buffer: Buffer.from('image2') },
      { name: 'file3.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf3') }
    ];
    
    await page.setInputFiles('[data-testid="file-input"]', files);
    
    // Wait for all uploads to complete
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Verify all files are uploaded
    for (const file of files) {
      await expect(page.locator('[data-testid="media-manager"]')).toContainText(file.name);
    }
    
    // Verify file count
    const fileCount = await page.locator('[data-testid="media-item"]').count();
    expect(fileCount).toBe(3);
  });

  test('should reject invalid file types', async ({ page }) => {
    const project = await createTestProject(page);
    await page.goto(`/project/${project.id}`);
    await page.click('[data-testid="files-tab"]');
    
    // Try to upload invalid file (executable)
    const invalidFile = {
      name: 'malware.exe',
      mimeType: 'application/x-executable',
      buffer: Buffer.from('fake executable')
    };
    
    await page.setInputFiles('[data-testid="file-input"]', invalidFile);
    
    // Should show error message
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-error"]')).toContainText('File type not allowed');
  });

  test('should reject oversized files', async ({ page }) => {
    const project = await createTestProject(page);
    await page.goto(`/project/${project.id}`);
    await page.click('[data-testid="files-tab"]');
    
    // Create oversized file (over 10MB)
    const oversizedFile = {
      name: 'huge-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(11 * 1024 * 1024) // 11MB
    };
    
    await page.setInputFiles('[data-testid="file-input"]', oversizedFile);
    
    // Should show error message
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-error"]')).toContainText('File size exceeds');
  });
});

test.describe('Admin Dashboard Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'admin123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should allow admin to manage users', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin');
    
    // Should show admin dashboard
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    
    // Click on Users tab
    await page.click('[data-testid="users-tab"]');
    
    // Should show users list
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    
    // Test user status toggle
    const userRow = page.locator('[data-testid="user-row"]').first();
    await userRow.click('[data-testid="toggle-status"]');
    
    // Should confirm status change
    await expect(page.locator('[data-testid="status-updated"]')).toBeVisible();
    
    // Test role change
    await userRow.selectOption('[data-testid="role-select"]', 'ADMIN');
    await expect(page.locator('[data-testid="role-updated"]')).toBeVisible();
  });

  test('should display system analytics', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show dashboard stats
    await expect(page.locator('[data-testid="total-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-projects"]')).toBeVisible();
    
    // Click on Analytics tab
    await page.click('[data-testid="analytics-tab"]');
    
    // Should show analytics data
    await expect(page.locator('[data-testid="analytics-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-usage"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
  });

  test('should allow project management', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on Projects tab
    await page.click('[data-testid="projects-tab"]');
    
    // Should show projects table
    await expect(page.locator('[data-testid="projects-table"]')).toBeVisible();
    
    // Verify project data is displayed
    const projectRow = page.locator('[data-testid="project-row"]').first();
    await expect(projectRow.locator('[data-testid="project-title"]')).toBeVisible();
    await expect(projectRow.locator('[data-testid="project-author"]')).toBeVisible();
    await expect(projectRow.locator('[data-testid="project-status"]')).toBeVisible();
    await expect(projectRow.locator('[data-testid="project-stats"]')).toBeVisible();
  });

  test('should access system configuration', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on Settings tab
    await page.click('[data-testid="settings-tab"]');
    
    // Should show configuration panel
    await expect(page.locator('[data-testid="system-config"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-config"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-config"]')).toBeVisible();
    await expect(page.locator('[data-testid="security-config"]')).toBeVisible();
    
    // Test configuration update
    await page.fill('[data-testid="max-tokens-input"]', '4000');
    await page.click('[data-testid="save-config"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="config-saved"]')).toBeVisible();
  });
});

test.describe('Security Integration', () => {
  test('should protect admin routes from non-admin users', async ({ page }) => {
    // Login as regular user
    await loginAsUser(page);
    
    // Try to access admin dashboard
    await page.goto('/admin');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible();
  });

  test('should enforce file upload security', async ({ page }) => {
    await loginAsUser(page);
    const project = await createTestProject(page);
    
    await page.goto(`/project/${project.id}`);
    await page.click('[data-testid="files-tab"]');
    
    // Test authentication for file operations
    await page.context().clearCookies();
    
    // Try to access file upload without authentication
    await page.reload();
    
    // Should redirect to login
    await page.waitForURL('/login');
  });

  test('should protect API endpoints', async ({ request }) => {
    // Test unprotected API calls
    const usersResponse = await request.get('/api/admin/users');
    expect(usersResponse.status()).toBe(401); // Unauthorized
    
    const projectsResponse = await request.get('/api/admin/projects');
    expect(projectsResponse.status()).toBe(401); // Unauthorized
    
    // Test with invalid token
    const authHeaders = {
      'Authorization': 'Bearer invalid-token'
    };
    
    const protectedUsersResponse = await request.get('/api/admin/users', { headers: authHeaders });
    expect(protectedUsersResponse.status()).toBe(401); // Unauthorized
  });
});

test.describe('End-to-End Workflow', () => {
  test('should complete full user journey with files and admin oversight', async ({ page }) => {
    // User registration and login
    await page.goto('/register');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'testuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="register-button"]');
    
    // Create project with content
    await page.click('[data-testid="create-project"]');
    await page.fill('[data-testid="project-title"]', 'My Research Paper');
    await page.click('[data-testid="save-project"]');
    
    // Write content to unlock AI
    const editor = page.locator('[data-testid="text-editor"]');
    await editor.fill('This is my research paper content. '.repeat(20)); // 150+ words
    
    // Upload supporting files
    await page.click('[data-testid="files-tab"]');
    
    const testFile = {
      name: 'research.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('research data')
    };
    
    await page.setInputFiles('[data-testid="file-input"]', testFile);
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Use AI features
    await page.click('[data-testid="ai-chat-tab"]');
    await expect(page.locator('[data-testid="ai-unlocked"]')).toBeVisible();
    
    await page.fill('[data-testid="ai-message-input"]', 'Help me improve my introduction');
    await page.click('[data-testid="send-message"]');
    
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
    
    // Generate reasoning map
    await page.click('[data-testid="reasoning-map-tab"]');
    await page.click('[data-testid="generate-map"]');
    await expect(page.locator('[data-testid="reasoning-map"]')).toBeVisible();
    
    // Admin verification
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'admin123!');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/admin');
    
    // Verify user and project in admin dashboard
    await page.click('[data-testid="users-tab"]');
    await expect(page.locator('[data-testid="users-table"]')).toContainText('testuser@example.com');
    
    await page.click('[data-testid="projects-tab"]');
    await expect(page.locator('[data-testid="projects-table"]')).toContainText('My Research Paper');
    
    // Check analytics
    await page.click('[data-testid="analytics-tab"]');
    await expect(page.locator('[data-testid="analytics-overview"]')).toBeVisible();
  });
});