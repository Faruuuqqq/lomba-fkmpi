import { Page } from '@playwright/test';

export async function loginAsUser(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'user@example.com');
  await page.fill('[data-testid="password-input"]', 'password123!');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'admin@example.com');
  await page.fill('[data-testid="password-input"]', 'admin123!');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function createTestProject(page: Page) {
  await page.click('[data-testid="create-project"]');
  await page.fill('[data-testid="project-title"]', `Test Project ${Date.now()}`);
  await page.click('[data-testid="save-project"]');
  await page.waitForSelector('[data-testid="project-created"]');
  
  // Get project ID from URL
  const url = page.url();
  const projectId = url.split('/').pop();
  
  return { id: projectId };
}

export async function uploadTestFile(page: Page, fileName: string, content: string) {
  const fileBuffer = Buffer.from(content);
  const testFile = {
    name: fileName,
    mimeType: 'text/plain',
    buffer: fileBuffer
  };
  
  await page.setInputFiles('[data-testid="file-input"]', testFile);
  await page.waitForSelector('[data-testid="upload-success"]');
  
  return { name: fileName, size: fileBuffer.length };
}

export async function generateTestContent(wordCount: number = 150) {
  const words = ['research', 'analysis', 'methodology', 'conclusion', 'evidence', 'study', 'experiment', 'data', 'results', 'findings'];
  const sentences = [];
  
  for (let i = 0; i < wordCount / 10; i++) {
    const sentence = words.sort(() => Math.random() - 0.5).slice(0, 8).join(' ') + '.';
    sentences.push(sentence);
  }
  
  return sentences.join(' ');
}

export async function waitForAIResponse(page: Page, timeout = 10000) {
  return await page.waitForSelector('[data-testid="ai-response"]', { timeout });
}

export async function checkToastMessage(page: Page, expectedMessage: string) {
  const toast = page.locator('[data-testid="toast"]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(expectedMessage);
}

export async function navigateToProject(page: Page, projectId: string) {
  await page.goto(`/project/${projectId}`);
  await page.waitForSelector('[data-testid="project-container"]');
}

export async function enableAIUnlocked(page: Page) {
  const content = await generateTestContent(150);
  await page.fill('[data-testid="text-editor"]', content);
  await expect(page.locator('[data-testid="ai-unlocked"]')).toBeVisible();
}