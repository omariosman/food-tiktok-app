import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show validation errors for empty sign in form', async ({ page }) => {
    // Try to sign in with empty form
    await page.locator('text=Sign In').nth(1).click(); // Click button, not link
    
    // Should show validation message (implemented in the app)
    // This is a placeholder test - actual behavior depends on implementation
    await expect(page.locator('text=Please fill in all fields')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show validation errors for incomplete sign up form', async ({ page }) => {
    // Navigate to sign up
    await page.locator('text=Don\'t have an account? Sign up').click();
    await expect(page.locator('text=Create Account')).toBeVisible();
    
    // Fill in only email
    await page.locator('input[placeholder="Email *"]').fill('test@example.com');
    
    // Try to submit
    await page.locator('text=Sign Up').nth(1).click(); // Click button
    
    // Should show validation message
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should validate password confirmation', async ({ page }) => {
    // Navigate to sign up
    await page.locator('text=Don\'t have an account? Sign up').click();
    
    // Fill form with mismatched passwords
    await page.locator('input[placeholder="Username *"]').fill('testuser');
    await page.locator('input[placeholder="Email *"]').fill('test@example.com');
    await page.locator('input[placeholder="Password *"]').fill('password123');
    await page.locator('input[placeholder="Confirm Password *"]').fill('differentpassword');
    
    // Try to submit
    await page.locator('text=Sign Up').nth(1).click();
    
    // Should show password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should validate password length', async ({ page }) => {
    // Navigate to sign up
    await page.locator('text=Don\'t have an account? Sign up').click();
    
    // Fill form with short password
    await page.locator('input[placeholder="Username *"]').fill('testuser');
    await page.locator('input[placeholder="Email *"]').fill('test@example.com');
    await page.locator('input[placeholder="Password *"]').fill('123');
    await page.locator('input[placeholder="Confirm Password *"]').fill('123');
    
    // Try to submit
    await page.locator('text=Sign Up').nth(1).click();
    
    // Should show password length error
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible({
      timeout: 5000,
    });
  });
});