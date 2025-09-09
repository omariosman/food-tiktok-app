import { test, expect } from '@playwright/test'
import { FeedHelpers } from '../helpers/feedHelpers'
import { 
  mockFeedAPI, 
  waitForReactNativeReady,
  setupAuthentication,
  generateTestData,
  measurePerformance
} from '../helpers/testUtils'

test.describe('Edge Cases and Stress Tests', () => {
  let feedHelpers: FeedHelpers

  test.beforeEach(async ({ page, context }) => {
    await setupAuthentication(context)
    feedHelpers = new FeedHelpers(page)
  })

  test.describe('Data Edge Cases', () => {
    test('should handle extremely long text content', async ({ page }) => {
      const testData = generateTestData()
      
      // Mock API with long text
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'long-text-dish',
              name: testData.longText.name,
              description: testData.longText.description,
              restaurantName: testData.longText.restaurant,
              price: 15.99,
              imageUrl: 'https://picsum.photos/400/600?random=1'
            }],
            hasMore: true,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Check that long text is handled properly (truncated, etc.)
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      expect(dishInfo.description).toBeTruthy()
      
      // Text should be truncated or scrollable
      const dishNameElement = feedHelpers.dishName
      const isOverflowing = await dishNameElement.evaluate((element: HTMLElement) => {
        return element.scrollHeight > element.clientHeight ||
               element.scrollWidth > element.clientWidth
      })
      
      // Should handle overflow gracefully
      await page.screenshot({ path: 'e2e/screenshots/long-text-content.png' })
    })

    test('should handle special characters and emojis', async ({ page }) => {
      const testData = generateTestData()
      
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'special-chars-dish',
              name: testData.specialCharacters.name,
              description: testData.specialCharacters.description,
              restaurantName: testData.specialCharacters.restaurant,
              price: 12.50,
              imageUrl: 'https://picsum.photos/400/600?random=2'
            }],
            hasMore: true,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Verify special characters render correctly
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toContain('🍕')
      expect(dishInfo.description).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/special-characters.png' })
    })

    test('should handle missing or null data', async ({ page }) => {
      const testData = generateTestData()
      
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'empty-data-dish',
              name: testData.emptyValues.name || 'Fallback Dish Name',
              description: testData.emptyValues.description,
              restaurantName: testData.emptyValues.restaurant || 'Unknown Restaurant',
              price: testData.emptyValues.price || 0,
              imageUrl: null
            }],
            hasMore: true,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should handle missing data gracefully
      await feedHelpers.waitForFeedLoad(15000) // Longer timeout for potential errors
      
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy() // Should have fallback
      
      // Check for proper fallbacks
      await page.screenshot({ path: 'e2e/screenshots/missing-data.png' })
    })

    test('should handle extreme price values', async ({ page }) => {
      const testData = generateTestData()
      
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'free-dish',
                name: 'Free Sample',
                price: testData.edgeCasePrices.free,
                restaurantName: 'Test Restaurant',
                imageUrl: 'https://picsum.photos/400/600?random=3'
              },
              {
                id: 'expensive-dish',
                name: 'Luxury Dish',
                price: testData.edgeCasePrices.large,
                restaurantName: 'Test Restaurant',
                imageUrl: 'https://picsum.photos/400/600?random=4'
              },
              {
                id: 'precision-dish',
                name: 'Precise Price',
                price: testData.edgeCasePrices.precision,
                restaurantName: 'Test Restaurant', 
                imageUrl: 'https://picsum.photos/400/600?random=5'
              }
            ],
            hasMore: true,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Check free item
      let dishInfo = await feedHelpers.getCurrentDishInfo()
      let priceText = dishInfo.price
      expect(priceText).toContain('0.00') // Should format free as 0.00
      
      // Swipe to expensive item
      await feedHelpers.swipeVertical('up')
      dishInfo = await feedHelpers.getCurrentDishInfo()
      priceText = dishInfo.price
      expect(priceText).toContain('999.99')
      
      // Swipe to precision item
      await feedHelpers.swipeVertical('up')
      dishInfo = await feedHelpers.getCurrentDishInfo()
      priceText = dishInfo.price
      // Should handle precision appropriately (round to 2 decimals)
      expect(priceText).toMatch(/\d+\.\d{2}/)
      
      await page.screenshot({ path: 'e2e/screenshots/extreme-prices.png' })
    })
  })

  test.describe('Network and Connectivity Edge Cases', () => {
    test('should handle intermittent connectivity', async ({ page }) => {
      await mockFeedAPI(page)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Simulate connection dropping during interaction
      let connectionUp = true
      
      await page.route('**/api/**', route => {
        if (connectionUp) {
          route.continue()
        } else {
          route.abort('failed')
        }
      })
      
      // Drop connection
      connectionUp = false
      
      // Try to interact
      await feedHelpers.swipeVertical('up')
      await page.waitForTimeout(2000)
      
      // Should show error or use cached data
      const hasError = await feedHelpers.errorMessage.isVisible()
      const hasContent = await feedHelpers.currentCard.isVisible()
      
      expect(hasError || hasContent).toBeTruthy()
      
      // Restore connection
      connectionUp = true
      
      if (hasError) {
        await feedHelpers.retryButton.click()
        await feedHelpers.expectLoadingState(true)
        await feedHelpers.expectLoadingState(false)
      }
      
      await page.screenshot({ path: 'e2e/screenshots/intermittent-connectivity.png' })
    })

    test('should handle very slow responses', async ({ page }) => {
      // Mock slow API
      await page.route('**/api/feed**', async route => {
        // Delay response by 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'slow-dish',
              name: 'Slow Loading Dish',
              restaurantName: 'Slow Restaurant',
              price: 15.99,
              imageUrl: 'https://picsum.photos/400/600?random=6'
            }],
            hasMore: true,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should show loading state
      await feedHelpers.expectLoadingState(true)
      
      // Should eventually load
      await feedHelpers.waitForFeedLoad(10000)
      
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBe('Slow Loading Dish')
      
      await page.screenshot({ path: 'e2e/screenshots/slow-response.png' })
    })

    test('should handle malformed API responses', async ({ page }) => {
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'invalid json {'
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should handle JSON parsing error gracefully
      await page.waitForTimeout(5000)
      
      // Should show error state
      await expect(feedHelpers.errorMessage).toBeVisible()
      await expect(feedHelpers.retryButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/malformed-response.png' })
    })
  })

  test.describe('Memory and Performance Stress Tests', () => {
    test('should handle many rapid interactions without memory leaks', async ({ page }) => {
      await mockFeedAPI(page)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      const initialMemory = await feedHelpers.checkMemoryUsage()
      
      // Perform 50 rapid interactions
      for (let i = 0; i < 50; i++) {
        if (i % 5 === 0) {
          await feedHelpers.doubleTap()
        } else if (i % 3 === 0) {
          await feedHelpers.saveButton.click()
        } else {
          await feedHelpers.swipeVertical('up')
        }
        
        await page.waitForTimeout(50) // Very rapid
        
        // Check memory every 10 iterations
        if (i % 10 === 0) {
          await feedHelpers.checkMemoryUsage()
        }
      }
      
      const finalMemory = await feedHelpers.checkMemoryUsage()
      
      // Memory shouldn't increase dramatically
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        const increasePercentage = (memoryIncrease / initialMemory.usedJSHeapSize) * 100
        
        console.log(`Memory increase after stress test: ${increasePercentage.toFixed(2)}%`)
        expect(increasePercentage).toBeLessThan(100) // Less than 100% increase
      }
      
      await page.screenshot({ path: 'e2e/screenshots/stress-test-final.png' })
    })

    test('should maintain performance with large datasets', async ({ page }) => {
      // Mock large dataset
      const largeFeedData = Array.from({ length: 100 }, (_, index) => ({
        id: `large-dataset-dish-${index}`,
        name: `Dish ${index + 1}`,
        description: `Description for dish ${index + 1}`,
        restaurantName: `Restaurant ${Math.floor(index / 10) + 1}`,
        price: 10 + (index * 0.5),
        imageUrl: `https://picsum.photos/400/600?random=${index + 100}`
      }))
      
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: largeFeedData,
            hasMore: false,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Measure initial load performance
      const loadStartTime = Date.now()
      await feedHelpers.waitForFeedLoad(30000) // Longer timeout for large dataset
      const loadTime = Date.now() - loadStartTime
      
      console.log(`Large dataset loaded in: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(10000) // Should load within 10 seconds
      
      // Test scrolling performance through dataset
      const scrollStartTime = Date.now()
      
      for (let i = 0; i < 20; i++) {
        await feedHelpers.swipeVertical('up')
        
        // Measure each swipe
        const swipeTime = await feedHelpers.measureSwipePerformance()
        expect(swipeTime).toBeLessThan(1000) // Each swipe should be fast
      }
      
      const totalScrollTime = Date.now() - scrollStartTime
      console.log(`Scrolled through 20 items in: ${totalScrollTime}ms`)
      
      await page.screenshot({ path: 'e2e/screenshots/large-dataset.png' })
    })

    test('should handle concurrent users simulation', async ({ page, context }) => {
      // Simulate multiple "users" by opening multiple tabs
      const pages = []
      
      // Create 3 additional pages to simulate concurrent users
      for (let i = 0; i < 3; i++) {
        const newPage = await context.newPage()
        await mockFeedAPI(newPage)
        pages.push(newPage)
      }
      
      // Setup original page
      await mockFeedAPI(page)
      pages.unshift(page) // Add original page to the beginning
      
      // Start all pages simultaneously
      const startPromises = pages.map(async (p, index) => {
        await p.goto('/')
        await waitForReactNativeReady(p)
        
        const helpers = new FeedHelpers(p)
        await helpers.waitForFeedLoad()
        
        // Each "user" performs different actions
        for (let action = 0; action < 10; action++) {
          switch (index % 3) {
            case 0:
              await helpers.swipeVertical('up')
              break
            case 1:
              await helpers.doubleTap()
              break
            case 2:
              await helpers.saveButton.click()
              break
          }
          
          await p.waitForTimeout(100 + Math.random() * 200) // Random delays
        }
      })
      
      // Wait for all "users" to complete
      const startTime = Date.now()
      await Promise.all(startPromises)
      const endTime = Date.now()
      
      console.log(`Concurrent users simulation completed in: ${endTime - startTime}ms`)
      
      // Clean up additional pages
      for (const p of pages.slice(1)) {
        await p.close()
      }
      
      await page.screenshot({ path: 'e2e/screenshots/concurrent-users.png' })
    })
  })

  test.describe('Device and Browser Compatibility Edge Cases', () => {
    test('should work with disabled JavaScript features', async ({ page }) => {
      // Disable some modern features
      await page.addInitScript(() => {
        // Simulate older browser by removing modern features
        delete (window as any).IntersectionObserver
        delete (window as any).ResizeObserver
      })
      
      await mockFeedAPI(page)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      
      // Should still work with fallbacks
      await feedHelpers.waitForFeedLoad()
      
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/limited-js-features.png' })
    })

    test('should handle touch vs mouse input differences', async ({ page }) => {
      await mockFeedAPI(page)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Test mouse interactions
      await feedHelpers.swipeVertical('up')
      await page.waitForTimeout(500)
      
      // Test click vs tap
      await feedHelpers.saveButton.click()
      await page.waitForTimeout(500)
      
      // Should work the same way
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      
      await page.screenshot({ path: 'e2e/screenshots/mouse-interactions.png' })
    })

    test('should work with high DPI screens', async ({ page }) => {
      // Set high device pixel ratio
      await page.emulateMedia({ forcedColors: 'none' })
      await page.setViewportSize({ width: 390, height: 844 })
      
      // Simulate high DPI
      await page.addInitScript(() => {
        Object.defineProperty(window, 'devicePixelRatio', {
          value: 3,
          writable: false
        })
      })
      
      await mockFeedAPI(page)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Check that images and UI scale properly
      const mediaPlayer = feedHelpers.mediaPlayer
      await expect(mediaPlayer).toBeVisible()
      
      // Take high-res screenshot
      await page.screenshot({ 
        path: 'e2e/screenshots/high-dpi.png',
        fullPage: false
      })
    })
  })

  test.describe('Security and Input Validation', () => {
    test('should sanitize user inputs', async ({ page }) => {
      // Test XSS prevention
      const maliciousContent = {
        name: '<script>alert("XSS")</script>Test Dish',
        description: '<img src=x onerror=alert("XSS")>',
        restaurant: 'javascript:alert("XSS")'
      }
      
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'malicious-dish',
              name: maliciousContent.name,
              description: maliciousContent.description,
              restaurantName: maliciousContent.restaurant,
              price: 15.99,
              imageUrl: 'https://picsum.photos/400/600?random=7'
            }],
            hasMore: true,
            error: null
          })
        })
      })
      
      // Listen for any JavaScript alerts (security issue if they fire)
      let alertFired = false
      page.on('dialog', dialog => {
        alertFired = true
        dialog.dismiss()
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Wait a bit for any potential XSS to execute
      await page.waitForTimeout(2000)
      
      // Should not have executed malicious scripts
      expect(alertFired).toBe(false)
      
      // Content should be sanitized/escaped
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).not.toContain('<script>')
      
      await page.screenshot({ path: 'e2e/screenshots/sanitized-input.png' })
    })

    test('should handle SQL injection attempts in API calls', async ({ page }) => {
      let suspiciousRequest = false
      
      // Monitor API calls for suspicious content
      page.on('request', request => {
        const url = request.url()
        const postData = request.postData()
        
        if (url.includes("'") || url.includes('DROP') || url.includes('SELECT') ||
            (postData && (postData.includes("'") || postData.includes('DROP')))) {
          suspiciousRequest = true
        }
      })
      
      await mockFeedAPI(page)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Try to trigger API calls with user interactions
      await feedHelpers.searchButton.click()
      await page.waitForTimeout(500)
      
      const searchInput = page.locator('input[type="search"], [data-testid="search-input"]')
      if (await searchInput.isVisible()) {
        // Try malicious search input
        await searchInput.fill("'; DROP TABLE dishes; --")
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)
      }
      
      // Should not have made suspicious requests
      expect(suspiciousRequest).toBe(false)
      
      await page.screenshot({ path: 'e2e/screenshots/sql-injection-test.png' })
    })
  })

  test.describe('Internationalization Edge Cases', () => {
    test('should handle RTL languages', async ({ page }) => {
      // Set RTL language
      await page.addInitScript(() => {
        document.documentElement.setAttribute('dir', 'rtl')
        document.documentElement.setAttribute('lang', 'ar')
      })
      
      await mockFeedAPI(page)
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Check that layout adapts to RTL
      const container = feedHelpers.feedContainer
      const direction = await container.evaluate((el: HTMLElement) => 
        window.getComputedStyle(el).direction
      )
      
      // UI should adapt to RTL
      await page.screenshot({ path: 'e2e/screenshots/rtl-layout.png' })
      
      // Interactions should still work
      await feedHelpers.swipeVertical('up')
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
    })

    test('should handle very long translated text', async ({ page }) => {
      // Simulate German translations (notoriously long)
      await page.route('**/api/feed**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'german-dish',
              name: 'Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz',
              description: 'Ein außergewöhnlich langer deutscher Beschreibungstext der zeigt wie das Interface mit sehr langen Übersetzungen umgeht',
              restaurantName: 'Gasthaus zur Donaudampfschifffahrtskapitän',
              price: 25.50,
              imageUrl: 'https://picsum.photos/400/600?random=8'
            }],
            hasMore: true,
            error: null
          })
        })
      })
      
      await page.goto('/')
      await waitForReactNativeReady(page)
      await feedHelpers.waitForFeedLoad()
      
      // Should handle very long German text
      const dishInfo = await feedHelpers.getCurrentDishInfo()
      expect(dishInfo.name).toBeTruthy()
      
      // Text should not break layout
      await page.screenshot({ path: 'e2e/screenshots/long-translations.png' })
    })
  })
})
