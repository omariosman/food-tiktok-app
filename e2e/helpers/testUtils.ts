import { Page, BrowserContext, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * General Test Utilities
 * Common helpers for E2E testing
 */

/**
 * Mock API responses for testing
 */
export async function mockFeedAPI(page: Page) {
  const mockData = JSON.parse(
    readFileSync(join(__dirname, '..', 'fixtures', 'mock-feed-data.json'), 'utf-8')
  )
  
  await page.route('**/api/feed**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: mockData.feedItems,
        hasMore: true,
        error: null
      })
    })
  })
  
  await page.route('**/api/restaurants/**', route => {
    const url = new URL(route.request().url())
    const restaurantId = url.pathname.split('/').pop()
    
    const restaurant = mockData.restaurants.find(r => r.id === restaurantId)
    const restaurantDishes = mockData.feedItems.filter(
      item => item.restaurantId === restaurantId
    )
    
    route.fulfill({
      status: 200,
      contentType: 'application/json', 
      body: JSON.stringify({
        restaurant,
        dishes: restaurantDishes,
        error: null
      })
    })
  })
}

/**
 * Mock error responses for error handling tests
 */
export async function mockAPIErrors(page: Page, errorType: 'network' | 'server' | 'timeout') {
  const errorResponses = {
    network: { status: 0 }, // Network error
    server: { status: 500, body: '{"error": "Internal server error"}' },
    timeout: { status: 408, body: '{"error": "Request timeout"}' }
  }
  
  const response = errorResponses[errorType]
  
  await page.route('**/api/**', route => {
    if (response.status === 0) {
      route.abort('failed')
    } else {
      route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: response.body || '{"error": "Unknown error"}'
      })
    }
  })
}

/**
 * Wait for React Native Web to be ready
 */
export async function waitForReactNativeReady(page: Page, timeout = 30000) {
  await page.waitForFunction(
    () => {
      // Check if React Native is loaded
      return window.React && 
             document.querySelector('[data-testid]') !== null &&
             !document.querySelector('[data-testid="loading-screen"]')
    },
    { timeout }
  )
}

/**
 * Take screenshots for visual regression testing
 */
export async function takeScreenshot(
  page: Page, 
  name: string, 
  options: { fullPage?: boolean; clip?: any } = {}
) {
  const screenshotPath = join(__dirname, '..', 'screenshots', `${name}.png`)
  
  await page.screenshot({
    path: screenshotPath,
    fullPage: options.fullPage || false,
    clip: options.clip,
    animations: 'disabled' // Disable animations for consistent screenshots
  })
  
  return screenshotPath
}

/**
 * Setup authentication for authenticated tests
 */
export async function setupAuthentication(context: BrowserContext) {
  // Mock authentication state
  await context.addInitScript(() => {
    window.localStorage.setItem('auth-token', 'test-auth-token')
    window.localStorage.setItem('user-data', JSON.stringify({
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User'
    }))
  })
}

/**
 * Clear all storage data
 */
export async function clearStorage(context: BrowserContext) {
  await context.clearCookies()
  await context.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

/**
 * Simulate different device orientations
 */
export async function setOrientation(page: Page, orientation: 'portrait' | 'landscape') {
  const orientations = {
    portrait: { width: 390, height: 844 },
    landscape: { width: 844, height: 390 }
  }
  
  await page.setViewportSize(orientations[orientation])
  await page.waitForTimeout(500) // Wait for orientation change
}

/**
 * Check accessibility compliance
 */
export async function checkAccessibility(page: Page, element?: string) {
  const results = await page.evaluate((elementSelector) => {
    // Simple accessibility checks
    const checks = []
    const container = elementSelector 
      ? document.querySelector(elementSelector) 
      : document
    
    if (!container) return { violations: ['Element not found'] }
    
    // Check for missing alt attributes on images
    const images = container.querySelectorAll('img')
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        checks.push(`Image ${index + 1} missing alt attribute`)
      }
    })
    
    // Check for interactive elements without aria-label
    const interactiveElements = container.querySelectorAll(
      'button, [role="button"], input, select, textarea'
    )
    interactiveElements.forEach((element, index) => {
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      element.textContent?.trim()
      
      if (!hasLabel) {
        checks.push(`Interactive element ${index + 1} missing accessible label`)
      }
    })
    
    return { violations: checks }
  }, element)
  
  return results
}

/**
 * Measure page load performance
 */
export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
    }
  })
  
  console.log('Performance metrics:', {
    domContentLoaded: Math.round(metrics.domContentLoaded) + 'ms',
    loadComplete: Math.round(metrics.loadComplete) + 'ms', 
    firstPaint: Math.round(metrics.firstPaint) + 'ms',
    firstContentfulPaint: Math.round(metrics.firstContentfulPaint) + 'ms',
    totalLoadTime: Math.round(metrics.totalLoadTime) + 'ms'
  })
  
  // Assert performance requirements
  expect(metrics.totalLoadTime).toBeLessThan(5000) // 5 second max load time
  expect(metrics.firstContentfulPaint).toBeLessThan(3000) // 3 second FCP
  
  return metrics
}

/**
 * Wait for animations to complete
 */
export async function waitForAnimations(page: Page) {
  await page.waitForFunction(() => {
    // Check if CSS animations and transitions are complete
    const animatedElements = document.querySelectorAll('*')
    
    for (const element of animatedElements) {
      const computedStyle = window.getComputedStyle(element)
      
      // Check for running animations
      if (computedStyle.animationName !== 'none') {
        return false
      }
      
      // Check for running transitions
      if (parseFloat(computedStyle.transitionDuration) > 0) {
        return false
      }
    }
    
    return true
  })
  
  // Additional wait for React state updates
  await page.waitForTimeout(100)
}

/**
 * Generate test data for edge cases
 */
export function generateTestData() {
  return {
    longText: {
      name: 'A'.repeat(100),
      description: 'B'.repeat(500),
      restaurant: 'C'.repeat(80)
    },
    specialCharacters: {
      name: 'Tëst Dîsh with émojis 🍕',
      description: 'Special chars: <>{}[]()&@#$%^*+=|\\:;"\'?,./`~',
      restaurant: 'Café Réstuarant & Grïll'
    },
    edgeCasePrices: {
      free: 0,
      decimal: 12.99,
      large: 999.99,
      precision: 12.999
    },
    emptyValues: {
      name: '',
      description: null,
      restaurant: undefined,
      price: null
    }
  }
}

/**
 * Simulate user interactions with realistic delays
 */
export async function simulateHumanInteraction(page: Page) {
  // Add realistic delays between actions
  const originalClick = page.click
  const originalType = page.type
  
  page.click = async function(selector: string, options?: any) {
    await page.waitForTimeout(Math.random() * 200 + 100) // 100-300ms delay
    return originalClick.call(this, selector, options)
  }
  
  page.type = async function(selector: string, text: string, options?: any) {
    const delay = (options?.delay || 50) + Math.random() * 50 // Variable typing speed
    return originalType.call(this, selector, text, { ...options, delay })
  }
}

/**
 * Create test report data
 */
export function createTestReport(testName: string, results: any) {
  return {
    testName,
    timestamp: new Date().toISOString(),
    duration: results.duration,
    status: results.status,
    screenshots: results.screenshots || [],
    performance: results.performance || {},
    errors: results.errors || [],
    coverage: results.coverage || {}
  }
}

/**
 * Validate test environment
 */
export async function validateTestEnvironment(page: Page) {
  // Check if required features are available
  const features = await page.evaluate(() => {
    return {
      touch: 'ontouchstart' in window,
      gestures: 'GestureEvent' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      webAnimations: 'Animation' in window,
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      fetch: 'fetch' in window
    }
  })
  
  // Warn about missing features
  Object.entries(features).forEach(([feature, available]) => {
    if (!available) {
      console.warn(`Feature not available: ${feature}`)
    }
  })
  
  return features
}