import { test, expect } from '@playwright/test';

test.describe('App Launch', () => {
  test('should launch app successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Check if the app loaded (look for sign in screen since user is not authenticated)
    await expect(page.locator('text=Welcome Back')).toBeVisible({
      timeout: 30000,
    });
  });

  test('should show sign in form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for sign in form elements
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Don\'t have an account? Sign up')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to sign up screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click sign up link
    await page.locator('text=Don\'t have an account? Sign up').click();
    
    // Should show sign up screen
    await expect(page.locator('text=Create Account')).toBeVisible();
    await expect(page.locator('input[placeholder="Username *"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Email *"]')).toBeVisible();
  });

  test('should navigate back to sign in from sign up', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go to sign up
    await page.locator('text=Don\'t have an account? Sign up').click();
    await expect(page.locator('text=Create Account')).toBeVisible();
    
    // Go back to sign in
    await page.locator('text=Already have an account? Sign in').click();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });
});