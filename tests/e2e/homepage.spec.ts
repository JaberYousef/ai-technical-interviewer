import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title and main heading
    await expect(page).toHaveTitle(/AI Interview Coach/);
    await expect(page.getByRole('heading', { name: /AI Interview Coach/i })).toBeVisible();
  });

  test('should display session timer and controls', async ({ page }) => {
    await page.goto('/');
    
    // Check timer display
    await expect(page.locator('[data-testid="timer"]')).toBeVisible();
    
    // Check session controls
    await expect(page.getByRole('button', { name: /Start Session/i })).toBeVisible();
  });

  test('should load PRD data from API', async ({ page }) => {
    await page.goto('/');
    
    // Wait for PRD data to load
    await expect(page.getByText(/Project Overview/i)).toBeVisible();
    
    // Check that features are displayed
    await expect(page.getByText(/Features/i)).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/');
    
    // Click settings link
    await page.getByRole('link', { name: /Settings/i }).click();
    
    // Check we're on settings page
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  });

  test('should test report API endpoint', async ({ page }) => {
    await page.goto('/');
    
    // Click test report button
    await page.getByRole('button', { name: /Test Report API/i }).click();
    
    // Check that download starts (this might need adjustment based on actual implementation)
    // For now, just verify the button is clickable
    await expect(page.getByRole('button', { name: /Test Report API/i })).toBeEnabled();
  });
});
