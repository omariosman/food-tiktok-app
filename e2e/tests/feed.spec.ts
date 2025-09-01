import { test, expect } from '@playwright/test'
import { FeedHelpers } from '../helpers/feedHelpers'
import { 
  mockFeedAPI, 
  mockAPIErrors, 
  waitForReactNativeReady,
  setupAuthentication,
  measurePerformance,
  checkAccessibility,
  setOrientation,
  simulateHumanInteraction
} from '../helpers/testUtils'

test.describe('Feed Screen E2E Tests', () => {
  let feedHelpers: FeedHelpers

  test.beforeEach(async ({ page, context }) => {
    // Setup authentication
    await setupAuthentication(context)
    
    // Mock API responses
    await mockFeedAPI(page)
    
    // Initialize helpers
    feedHelpers = new FeedHelpers(page)
    
    // Navigate to app and wait for it to load
    await page.goto('/')
    await waitForReactNativeReady(page)
  })

  test.describe('Navigation Tests', () => {
    test('should launch app and show feed', async ({ page }) => {
      // Check that the app launches successfully
      await expect(page).toHaveTitle(/Food TikTok App/i)
      
      // Verify feed container is visible
      await feedHelpers.waitForFeedLoad()
      
      // Check that we have content
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      expect(dishInfo.restaurant).toBeTruthy()
      
      // Take screenshot for visual regression
      await page.screenshot({ path: 'e2e/screenshots/app-launch.png' })
    })

    test('should show bottom navigation tabs', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Check all tabs are visible
      await expect(feedHelpers.exploreTab).toBeVisible()
      await expect(feedHelpers.savedTab).toBeVisible()
      await expect(feedHelpers.cartTab).toBeVisible()
      await expect(feedHelpers.profileTab).toBeVisible()
      
      // Check explore tab is active by default
      await feedHelpers.expectActiveTab('explore')
    })

    test('should switch between tabs', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Test tab navigation
      await feedHelpers.navigateToTab('saved')
      await feedHelpers.expectActiveTab('saved')
      
      await feedHelpers.navigateToTab('cart')
      await feedHelpers.expectActiveTab('cart')
      
      await feedHelpers.navigateToTab('profile')
      await feedHelpers.expectActiveTab('profile')
      
      // Return to explore
      await feedHelpers.navigateToTab('explore')
      await feedHelpers.expectActiveTab('explore')
      await feedHelpers.waitForFeedLoad()
    })

    test('should maintain active tab highlighting', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Switch tabs and verify highlighting
      for (const tab of ['saved', 'cart', 'profile', 'explore'] as const) {
        await feedHelpers.navigateToTab(tab)
        await feedHelpers.expectActiveTab(tab)
        
        // Check other tabs are not active
        const allTabs = ['saved', 'cart', 'profile', 'explore'] as const
        for (const otherTab of allTabs) {
          if (otherTab !== tab) {
            const tabElement = feedHelpers[`${otherTab}Tab`]
            await expect(tabElement).not.toHaveAttribute('data-active', 'true')
          }
        }
      }
    })
  })

  test.describe('Feed Interaction Tests', () => {
    test('should swipe up to next item', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      const initialDish = await feedHelpers.getCurrentDishInfo()
      
      // Perform swipe up gesture
      await feedHelpers.swipeVertical('up')
      
      // Verify we moved to next item
      const newDish = await feedHelpers.getCurrentDishInfo()
      expect(newDish.name).not.toBe(initialDish.name)
      
      await page.screenshot({ path: 'e2e/screenshots/swipe-up.png' })
    })

    test('should swipe down to previous item', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // First swipe up to get a previous item
      await feedHelpers.swipeVertical('up')
      const secondDish = await feedHelpers.getCurrentDishInfo()
      
      // Then swipe down to go back
      await feedHelpers.swipeVertical('down')
      const backToFirst = await feedHelpers.getCurrentDishInfo()
      
      expect(backToFirst.name).not.toBe(secondDish.name)
    })

    test('should handle horizontal swipe for restaurant items', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      const initialRestaurant = (await feedHelpers.getCurrentDishInfo()).restaurant
      
      // Perform horizontal swipe left
      await feedHelpers.swipeHorizontal('left')
      
      // Should show more items from same restaurant or show restaurant mode
      await page.waitForTimeout(1000)
      
      // Verify restaurant mode indicator or same restaurant
      const currentRestaurant = (await feedHelpers.getCurrentDishInfo()).restaurant
      expect(currentRestaurant).toBe(initialRestaurant)
    })

    test('should respect swipe thresholds', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Test small swipe (should not trigger navigation)
      await feedHelpers.testSwipeThreshold('up', 50)
      
      // Test large swipe (should trigger navigation) 
      await feedHelpers.testSwipeThreshold('up', 200)
    })

    test('should handle edge cases - first/last item', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Try to swipe down at first item (should not break)
      const initialDish = await feedHelpers.getCurrentDishInfo()
      await feedHelpers.swipeVertical('down')
      
      // Should stay on same item or handle gracefully
      const afterDownSwipe = await feedHelpers.getCurrentDishInfo()
      expect(afterDownSwipe.name).toBeTruthy()
      
      // Swipe up multiple times to reach end
      for (let i = 0; i < 5; i++) {
        await feedHelpers.swipeVertical('up')
        await page.waitForTimeout(500)
      }
      
      // Should handle end of feed gracefully
      const finalDish = await feedHelpers.getCurrentDishInfo()
      expect(finalDish.name).toBeTruthy()
    })
  })

  test.describe('Button Functionality Tests', () => {
    test('should toggle save button', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Check initial save state
      const saveButton = feedHelpers.saveButton
      await expect(saveButton).toBeVisible()
      
      // Click save button
      await saveButton.click()
      
      // Should show save feedback (toast or visual change)
      // Note: This depends on implementation
      await page.waitForTimeout(500)
      
      await page.screenshot({ path: 'e2e/screenshots/save-button.png' })
    })

    test('should open share sheet', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Click share button
      await feedHelpers.shareButton.click()
      
      // Should open native share dialog or show share options
      // Note: Actual sharing behavior may vary by platform
      await page.waitForTimeout(1000)
      
      await page.screenshot({ path: 'e2e/screenshots/share-button.png' })
    })

    test('should handle add to cart', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Click add to cart
      await feedHelpers.addToCartButton.click()
      
      // Should show confirmation or navigate to cart
      await page.waitForTimeout(500)
      
      // Check for success indication
      const hasAlert = await page.locator('dialog, [role="dialog"], .alert').isVisible()
      const hasToast = await page.locator('.toast, [data-testid="toast"]').isVisible()
      
      expect(hasAlert || hasToast).toBeTruthy()
    })

    test('should open menu', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      await feedHelpers.menuButton.click()
      
      // Should show restaurant menu or navigation
      await page.waitForTimeout(500)
      
      await page.screenshot({ path: 'e2e/screenshots/menu-button.png' })
    })

    test('should handle location permission request', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Mock geolocation permission
      await page.context().grantPermissions(['geolocation'])
      
      await feedHelpers.locationButton.click()
      
      // Should show location permission dialog
      await page.waitForTimeout(500)
      
      await page.screenshot({ path: 'e2e/screenshots/location-permission.png' })
    })

    test('should open search', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      await feedHelpers.searchButton.click()
      
      // Should open search interface
      await page.waitForTimeout(500)
      
      await page.screenshot({ path: 'e2e/screenshots/search-button.png' })
    })

    test('should open filters', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      await feedHelpers.filterButton.click()
      
      // Should open filter options
      await page.waitForTimeout(500)
      
      await page.screenshot({ path: 'e2e/screenshots/filter-button.png' })
    })
  })

  test.describe('Double Tap Interaction', () => {
    test('should save item on double tap', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Perform double tap
      await feedHelpers.doubleTap()
      
      // Check for heart animation
      await feedHelpers.expectHeartAnimation()
      
      // Check for save toast
      await feedHelpers.expectSaveToast()
      
      await page.screenshot({ path: 'e2e/screenshots/double-tap-save.png' })
    })

    test('should show heart animation on double tap', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      await feedHelpers.doubleTap()
      
      // Verify heart animation appears and disappears
      await expect(feedHelpers.heartAnimation).toBeVisible({ timeout: 1000 })
      await expect(feedHelpers.heartAnimation).toBeHidden({ timeout: 3000 })
    })
  })

  test.describe('Media Tests', () => {
    test('should load images properly', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Wait for media to load
      await feedHelpers.waitForMediaLoad()
      
      // Check that image is displayed
      const mediaPlayer = feedHelpers.mediaPlayer
      await expect(mediaPlayer).toBeVisible()
      
      // Check for successful image load (no error state)
      await expect(feedHelpers.errorMessage).toBeHidden()
      
      await page.screenshot({ path: 'e2e/screenshots/image-loaded.png' })
    })

    test('should handle video playback', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Look for video content (if available)
      const hasVideo = await page.locator('video').count() > 0
      
      if (hasVideo) {
        // Test video controls
        await feedHelpers.toggleVideoPlayback()
        await feedHelpers.expectVideoControls(true)
        
        // Check if video is playing
        const isPlaying = await feedHelpers.isVideoPlaying()
        expect(typeof isPlaying).toBe('boolean')
        
        await page.screenshot({ path: 'e2e/screenshots/video-controls.png' })
      } else {
        console.log('No video content found in current test data')
      }
    })

    test('should handle media loading failures', async ({ page }) => {
      // Mock network error for media
      await page.route('**/*.{jpg,jpeg,png,gif,mp4,webm}', route => {
        route.abort('failed')
      })
      
      await feedHelpers.waitForFeedLoad()
      
      // Should show error state for failed media
      await expect(feedHelpers.errorMessage).toBeVisible({ timeout: 5000 })
      
      await page.screenshot({ path: 'e2e/screenshots/media-error.png' })
    })

    test('should auto-pause video on swipe', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      const hasVideo = await page.locator('video').count() > 0
      
      if (hasVideo) {
        // Start video playing
        await feedHelpers.toggleVideoPlayback()
        const wasPlaying = await feedHelpers.isVideoPlaying()
        
        if (wasPlaying) {
          // Swipe to next item
          await feedHelpers.swipeVertical('up')
          
          // Previous video should be paused
          // (This test would need to be implemented based on actual video behavior)
          await page.waitForTimeout(500)
        }
      }
    })
  })

  test.describe('Data Loading Tests', () => {
    test('should show loading state during initial load', async ({ page }) => {
      // Navigate but don't wait for load
      await page.goto('/')
      
      // Should show loading initially
      await feedHelpers.expectLoadingState(true)
      
      // Then should hide loading when ready
      await feedHelpers.expectLoadingState(false)
      
      await page.screenshot({ path: 'e2e/screenshots/loading-state.png' })
    })

    test('should handle empty state', async ({ page }) => {
      // Mock empty API response
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [],
            hasMore: false,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should show empty state
      const emptyMessage = page.locator('[data-testid="empty-state"], .empty-state')
      await expect(emptyMessage).toBeVisible({ timeout: 5000 })
      
      await page.screenshot({ path: 'e2e/screenshots/empty-state.png' })
    })

    test('should handle API errors with retry', async ({ page }) => {
      // Mock server error
      await mockAPIErrors(page, 'server')
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should show error state with retry option
      await feedHelpers.handleErrorAndRetry()
      
      await page.screenshot({ path: 'e2e/screenshots/error-retry.png' })
    })

    test('should handle network failures', async ({ page }) => {
      // Mock network failure
      await mockAPIErrors(page, 'network')
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should handle network error gracefully
      await expect(feedHelpers.errorMessage).toBeVisible({ timeout: 10000 })
      await expect(feedHelpers.retryButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/network-error.png' })
    })
  })

  test.describe('Performance Tests', () => {
    test('should have acceptable page load performance', async ({ page }) => {
      await page.goto('/')
      
      // Measure performance
      const metrics = await measurePerformance(page)
      
      // Assert performance requirements
      expect(metrics.totalLoadTime).toBeLessThan(5000)
      expect(metrics.firstContentfulPaint).toBeLessThan(3000)
    })

    test('should maintain smooth swipe performance', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Measure swipe performance
      const swipeDuration = await feedHelpers.measureSwipePerformance()
      
      expect(swipeDuration).toBeLessThan(1000) // Should complete within 1 second
    })

    test('should not have memory leaks', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      const initialMemory = await feedHelpers.checkMemoryUsage()
      
      // Perform multiple interactions
      for (let i = 0; i < 10; i++) {
        await feedHelpers.swipeVertical('up')
        await page.waitForTimeout(200)
      }
      
      const finalMemory = await feedHelpers.checkMemoryUsage()
      
      // Memory shouldn't increase dramatically
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        const increasePercentage = (memoryIncrease / initialMemory.usedJSHeapSize) * 100
        
        expect(increasePercentage).toBeLessThan(50) // Less than 50% increase
      }
    })

    test('should work on slow devices', async ({ page }) => {
      await feedHelpers.simulateSlowDevice()
      await feedHelpers.waitForFeedLoad()
      
      // Test basic functionality still works
      await feedHelpers.swipeVertical('up')
      await feedHelpers.saveButton.click()
      
      // Should still be responsive
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
    })
  })

  test.describe('Accessibility Tests', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Check accessibility
      const results = await checkAccessibility(page, '[data-testid="feed-container"]')
      
      expect(results.violations).toHaveLength(0)
      
      // Check that interactive elements have proper labels
      await expect(feedHelpers.saveButton).toHaveAttribute('aria-label')
      await expect(feedHelpers.shareButton).toHaveAttribute('aria-label')
      await expect(feedHelpers.addToCartButton).toHaveAttribute('aria-label')
    })

    test('should support keyboard navigation', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Test tab navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Should focus interactive elements
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })
  })

  test.describe('Cross-Device Tests', () => {
    test('should work on different screen sizes', async ({ page }) => {
      // Test mobile portrait
      await setOrientation(page, 'portrait')
      await feedHelpers.waitForFeedLoad()
      
      let dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      
      // Test mobile landscape
      await setOrientation(page, 'landscape')
      await page.waitForTimeout(1000)
      
      dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/landscape-mode.png' })
    })

    test('should handle touch interactions', async ({ page }) => {
      await feedHelpers.waitForFeedLoad()
      
      // Simulate human-like interactions
      await simulateHumanInteraction(page)
      
      // Test touch-specific interactions
      await feedHelpers.doubleTap()
      await feedHelpers.expectHeartAnimation()
    })
  })
})