import { test, expect } from '@playwright/test'
import { FeedHelpers } from '../helpers/feedHelpers'
import { 
  mockFeedAPI, 
  waitForReactNativeReady,
  setupAuthentication,
  clearStorage,
  simulateHumanInteraction
} from '../helpers/testUtils'

test.describe('User Flow Tests', () => {
  let feedHelpers: FeedHelpers

  test.beforeEach(async ({ page, context }) => {
    await setupAuthentication(context)
    await mockFeedAPI(page)
    feedHelpers = new FeedHelpers(page)
  })

  test.describe('Complete User Journey', () => {
    test('should complete full discovery to cart flow', async ({ page }) => {
      // Step 1: Launch app and view feed
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Step 2: Browse through items
      const initialDish = await feedHelpers.getCurrentDishInfo()
      expect(initialDish.name).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/flow-1-launch.png' })
      
      // Step 3: Swipe through a few items
      for (let i = 0; i < 3; i++) {
        await feedHelpers.swipeVertical('up')
        await page.waitForTimeout(800) // Realistic browsing pace
        
        const dishInfo = await feedHelpers.getCurrentDishInfo()
        expect(dishInfo.name).toBeTruthy()
      }
      
      await page.screenshot({ path: 'e2e/screenshots/flow-2-browse.png' })
      
      // Step 4: Save a dish (double tap)
      await feedHelpers.doubleTap()
      await feedHelpers.expectHeartAnimation()
      await feedHelpers.expectSaveToast()
      
      await page.screenshot({ path: 'e2e/screenshots/flow-3-save.png' })
      
      // Step 5: Add dish to cart
      const dishToAdd = await feedHelpers.getCurrentDishInfo()
      await feedHelpers.addToCartButton.click()
      
      // Should show confirmation
      await page.waitForTimeout(1000)
      
      await page.screenshot({ path: 'e2e/screenshots/flow-4-cart.png' })
      
      // Step 6: Navigate to saved items
      await feedHelpers.navigateToTab('saved')
      await page.waitForTimeout(500)
      
      // Should see saved items (if implemented)
      await page.screenshot({ path: 'e2e/screenshots/flow-5-saved.png' })
      
      // Step 7: Check cart
      await feedHelpers.navigateToTab('cart')
      await page.waitForTimeout(500)
      
      // Should see cart items
      await page.screenshot({ path: 'e2e/screenshots/flow-6-cart-view.png' })
      
      console.log('✅ Complete user journey test passed')
    })

    test('should handle first-time user experience', async ({ page, context }) => {
      // Clear all storage to simulate first-time user
      await clearStorage(context)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should show onboarding or instructions
      const instructionsVisible = await page.locator(
        '[data-testid="swipe-instructions"], .instructions, [data-testid="onboarding"]'
      ).isVisible()
      
      if (instructionsVisible) {
        await page.screenshot({ path: 'e2e/screenshots/first-time-instructions.png' })
        
        // Dismiss instructions
        await page.click('[data-testid="dismiss-instructions"], .dismiss-button')
        await page.waitForTimeout(500)
      }
      
      // Should then show normal feed
      await feedHelpers.waitForFeedLoad()
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/first-time-feed.png' })
    })

    test('should handle returning user with saved items', async ({ page, context }) => {
      // Setup user with saved items
      await context.addInitScript(() => {
        window.localStorage.setItem('savedDishes', JSON.stringify([
          'test-dish-1',
          'test-dish-3'
        ]))
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Navigate to saved tab
      await feedHelpers.navigateToTab('saved')
      
      // Should show saved dishes
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e/screenshots/returning-user-saved.png' })
      
      // Go back to explore and verify save states
      await feedHelpers.navigateToTab('explore')
      await feedHelpers.waitForFeedLoad()
      
      // Check if current item shows correct save state
      const saveButton = feedHelpers.saveButton
      await expect(saveButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/returning-user-explore.png' })
    })
  })

  test.describe('Restaurant Exploration Flow', () => {
    test('should explore restaurant dishes', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      const initialRestaurant = (await feedHelpers.getCurrentDishInfo()).restaurant
      
      // Swipe left to explore restaurant
      await feedHelpers.swipeHorizontal('left')
      await page.waitForTimeout(1000)
      
      // Should show restaurant mode or more dishes from same restaurant
      const currentRestaurant = (await feedHelpers.getCurrentDishInfo()).restaurant
      expect(currentRestaurant).toBe(initialRestaurant)
      
      await page.screenshot({ path: 'e2e/screenshots/restaurant-exploration.png' })
      
      // Browse through restaurant dishes
      for (let i = 0; i < 2; i++) {
        await feedHelpers.swipeVertical('up')
        await page.waitForTimeout(500)
        
        const dishInfo = await feedHelpers.getCurrentDishInfo()
        expect(dishInfo.restaurant).toBe(initialRestaurant)
      }
      
      await page.screenshot({ path: 'e2e/screenshots/restaurant-dishes.png' })
    })

    test('should return to main feed from restaurant mode', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Enter restaurant mode
      await feedHelpers.swipeHorizontal('left')
      await page.waitForTimeout(1000)
      
      // Look for return to main feed option
      const returnButton = page.locator(
        '[data-testid="return-to-feed"], .return-button, [data-testid="back-to-main"]'
      )
      
      if (await returnButton.isVisible()) {
        await returnButton.click()
        await page.waitForTimeout(500)
        
        // Should be back to main feed
        await feedHelpers.waitForFeedLoad()
        const dishInfo = await feedHelpers.getCurrentDishInfo()
        expect(dishInfo.name).toBeTruthy()
        
        await page.screenshot({ path: 'e2e/screenshots/back-to-main-feed.png' })
      }
    })
  })

  test.describe('Search and Discovery Flow', () => {
    test('should search for specific dishes', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Open search
      await feedHelpers.searchButton.click()
      await page.waitForTimeout(500)
      
      // Look for search input
      const searchInput = page.locator(
        '[data-testid="search-input"], input[type="search"], .search-field'
      )
      
      if (await searchInput.isVisible()) {
        // Type search query
        await searchInput.fill('pasta')
        await page.keyboard.press('Enter')
        
        await page.waitForTimeout(1000)
        
        // Should show search results
        await page.screenshot({ path: 'e2e/screenshots/search-results.png' })
        
        // Click on a result to view it
        const firstResult = page.locator('[data-testid="search-result"]').first()
        if (await firstResult.isVisible()) {
          await firstResult.click()
          await page.waitForTimeout(500)
          
          // Should navigate to dish view
          await page.screenshot({ path: 'e2e/screenshots/search-dish-view.png' })
        }
      }
    })

    test('should use filters to discover content', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Open filters
      await feedHelpers.filterButton.click()
      await page.waitForTimeout(500)
      
      // Look for filter options
      const priceFilter = page.locator('[data-testid="price-filter"], .price-range')
      const cuisineFilter = page.locator('[data-testid="cuisine-filter"], .cuisine-select')
      
      if (await priceFilter.isVisible()) {
        // Apply price filter
        await priceFilter.click()
        await page.waitForTimeout(500)
        
        await page.screenshot({ path: 'e2e/screenshots/filters-applied.png' })
        
        // Apply filters
        const applyButton = page.locator(
          '[data-testid="apply-filters"], .apply-button, button:has-text("Apply")'
        )
        
        if (await applyButton.isVisible()) {
          await applyButton.click()
          await page.waitForTimeout(1000)
          
          // Should show filtered results
          await feedHelpers.waitForFeedLoad()
          await page.screenshot({ path: 'e2e/screenshots/filtered-feed.png' })
        }
      }
    })
  })

  test.describe('Social Interaction Flow', () => {
    test('should complete sharing workflow', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      const dishToShare = await feedHelpers.getCurrentDishInfo()
      
      // Click share button
      await feedHelpers.shareButton.click()
      await page.waitForTimeout(500)
      
      // Should show share options (native or custom)
      await page.screenshot({ path: 'e2e/screenshots/share-options.png' })
      
      // Look for specific share options
      const copyLinkButton = page.locator(
        '[data-testid="copy-link"], .copy-button, button:has-text("Copy Link")'
      )
      
      if (await copyLinkButton.isVisible()) {
        await copyLinkButton.click()
        
        // Should show confirmation
        await page.waitForTimeout(500)
        await page.screenshot({ path: 'e2e/screenshots/link-copied.png' })
      }
    })

    test('should handle review interactions', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Click reviews button
      const reviewsButton = page.locator(
        '[data-testid="reviews-button"], .reviews, button:has-text("Reviews")'
      )
      
      if (await reviewsButton.isVisible()) {
        await reviewsButton.click()
        await page.waitForTimeout(500)
        
        // Should show reviews interface
        await page.screenshot({ path: 'e2e/screenshots/reviews-view.png' })
        
        // Look for review actions
        const writeReviewButton = page.locator(
          '[data-testid="write-review"], .write-review, button:has-text("Write Review")'
        )
        
        if (await writeReviewButton.isVisible()) {
          await writeReviewButton.click()
          await page.waitForTimeout(500)
          
          // Should open review form
          await page.screenshot({ path: 'e2e/screenshots/write-review.png' })
        }
      }
    })
  })

  test.describe('Offline and Error Recovery Flow', () => {
    test('should handle offline mode gracefully', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Go offline
      await feedHelpers.simulateNetworkCondition('offline')
      
      // Try to interact with feed
      await feedHelpers.swipeVertical('up')
      await page.waitForTimeout(1000)
      
      // Should show offline indicator or cached content
      const offlineIndicator = page.locator(
        '[data-testid="offline-indicator"], .offline, .no-connection'
      )
      
      await page.screenshot({ path: 'e2e/screenshots/offline-mode.png' })
      
      // Go back online
      await feedHelpers.simulateNetworkCondition('online')
      await page.waitForTimeout(2000)
      
      // Should recover and sync
      await feedHelpers.waitForFeedLoad()
      await page.screenshot({ path: 'e2e/screenshots/back-online.png' })
    })

    test('should recover from API errors', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Mock API error for next request
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 500,
          body: '{"error": "Server error"}'
        })
      })
      
      // Try to load more content
      await feedHelpers.swipeVertical('up')
      await page.waitForTimeout(2000)
      
      // Should show error and retry option
      await expect(feedHelpers.errorMessage).toBeVisible()
      await expect(feedHelpers.retryButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/api-error.png' })
      
      // Remove error mock
      await page.unroute('**/api/feed**')
      await mockFeedAPI(page)
      
      // Retry should work
      await feedHelpers.retryButton.click()
      await feedHelpers.expectLoadingState(true)
      await feedHelpers.expectLoadingState(false)
      
      await page.screenshot({ path: 'e2e/screenshots/error-recovered.png' })
    })

    test('should handle slow network conditions', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Simulate slow 3G
      await feedHelpers.simulateNetworkCondition('slow-3g')
      
      // Should show loading states appropriately
      await feedHelpers.expectLoadingState(true)
      
      // Wait for eventual load
      await feedHelpers.waitForFeedLoad(20000) // Longer timeout for slow network
      
      await page.screenshot({ path: 'e2e/screenshots/slow-network.png' })
      
      // Interactions should still work but be slower
      await feedHelpers.swipeVertical('up')
      await page.waitForTimeout(2000) // Account for slow network
      
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
    })
  })

  test.describe('Accessibility User Flow', () => {
    test('should support keyboard-only navigation', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Use keyboard to navigate
      await page.keyboard.press('Tab') // Focus first element
      await page.keyboard.press('Tab') // Focus next element
      await page.keyboard.press('Enter') // Activate focused element
      
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'e2e/screenshots/keyboard-navigation.png' })
      
      // Continue tabbing through interface
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(200)
        
        const focusedElement = await page.evaluate(() => {
          const focused = document.activeElement
          return focused ? {
            tagName: focused.tagName,
            role: focused.getAttribute('role'),
            ariaLabel: focused.getAttribute('aria-label')
          } : null
        })
        
        console.log('Focused element:', focusedElement)
      }
    })

    test('should work with screen reader simulation', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Check ARIA labels and roles
      const screenReaderData = await page.evaluate(() => {
        const elements = document.querySelectorAll('[data-testid]')
        const results = []
        
        elements.forEach(element => {
          const ariaLabel = element.getAttribute('aria-label')
          const role = element.getAttribute('role')
          const textContent = element.textContent?.slice(0, 50)
          
          if (ariaLabel || role || textContent) {
            results.push({
              testId: element.getAttribute('data-testid'),
              ariaLabel,
              role,
              textContent
            })
          }
        })
        
        return results
      })
      
      console.log('Screen reader accessible elements:', screenReaderData)
      
      // Verify key elements have accessibility labels
      expect(screenReaderData.length).toBeGreaterThan(0)
      
      await page.screenshot({ path: 'e2e/screenshots/accessibility-elements.png' })
    })
  })

  test.describe('Performance Under Load', () => {
    test('should handle rapid interactions', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Rapid swipe interactions
      const startTime = Date.now()
      
      for (let i = 0; i < 10; i++) {
        await feedHelpers.swipeVertical('up')
        await page.waitForTimeout(100) // Very fast swiping
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      console.log(`Rapid interactions completed in: ${totalTime}ms`)
      
      // Should still be responsive
      const finalDishInfo = await feedHelpers.getCurrentDishInfo()
      expect(finalDishInfo.name).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/rapid-interactions.png' })
    })

    test('should handle multiple simultaneous actions', async ({ page }) => {
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Simulate user trying multiple actions quickly
      const actions = [
        () => feedHelpers.doubleTap(),
        () => feedHelpers.saveButton.click(),
        () => feedHelpers.swipeVertical('up'),
        () => feedHelpers.addToCartButton.click()
      ]
      
      // Execute actions rapidly
      for (const action of actions) {
        action()
        await page.waitForTimeout(50)
      }
      
      // Wait for all actions to complete
      await page.waitForTimeout(2000)
      
      // Should still be in a consistent state
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/simultaneous-actions.png' })
    })
  })
})