import { Page, Locator, expect } from '@playwright/test'

/**
 * Feed Screen Test Helpers
 * Utilities for testing the TikTok-style feed interactions
 */

export class FeedHelpers {
  readonly page: Page
  
  // Selectors for feed elements
  readonly feedContainer: Locator
  readonly currentCard: Locator
  readonly dishName: Locator
  readonly dishDescription: Locator
  readonly restaurantName: Locator
  readonly priceText: Locator
  readonly saveButton: Locator
  readonly shareButton: Locator
  readonly addToCartButton: Locator
  readonly menuButton: Locator
  readonly locationButton: Locator
  readonly filterButton: Locator
  readonly searchButton: Locator
  readonly mediaPlayer: Locator
  readonly videoControls: Locator
  readonly playButton: Locator
  readonly volumeButton: Locator
  readonly progressBar: Locator
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator
  readonly retryButton: Locator
  readonly heartAnimation: Locator
  readonly saveToast: Locator
  
  // Navigation selectors
  readonly exploreTab: Locator
  readonly savedTab: Locator
  readonly cartTab: Locator
  readonly profileTab: Locator

  constructor(page: Page) {
    this.page = page
    
    // Feed elements - using testId attributes for reliable selection
    this.feedContainer = page.locator('[data-testid="feed-container"]')
    this.currentCard = page.locator('[data-testid="current-feed-card"]')
    this.dishName = page.locator('[data-testid="dish-name"]')
    this.dishDescription = page.locator('[data-testid="dish-description"]')
    this.restaurantName = page.locator('[data-testid="restaurant-name"]')
    this.priceText = page.locator('[data-testid="price-text"]')
    
    // Action buttons
    this.saveButton = page.locator('[data-testid="save-button"]')
    this.shareButton = page.locator('[data-testid="share-button"]')
    this.addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
    this.menuButton = page.locator('[data-testid="menu-button"]')
    
    // Top navigation
    this.locationButton = page.locator('[data-testid="location-button"]')
    this.filterButton = page.locator('[data-testid="filter-button"]')
    this.searchButton = page.locator('[data-testid="search-button"]')
    
    // Media elements
    this.mediaPlayer = page.locator('[data-testid="media-player"]')
    this.videoControls = page.locator('[data-testid="video-controls"]')
    this.playButton = page.locator('[data-testid="play-button"]')
    this.volumeButton = page.locator('[data-testid="volume-button"]')
    this.progressBar = page.locator('[data-testid="progress-bar"]')
    
    // State elements
    this.loadingIndicator = page.locator('[data-testid="loading-indicator"]')
    this.errorMessage = page.locator('[data-testid="error-message"]')
    this.retryButton = page.locator('[data-testid="retry-button"]')
    this.heartAnimation = page.locator('[data-testid="heart-animation"]')
    this.saveToast = page.locator('[data-testid="save-toast"]')
    
    // Bottom navigation
    this.exploreTab = page.locator('[data-testid="tab-explore"]')
    this.savedTab = page.locator('[data-testid="tab-saved"]')
    this.cartTab = page.locator('[data-testid="tab-cart"]')
    this.profileTab = page.locator('[data-testid="tab-profile"]')
  }

  /**
   * Wait for feed to load completely
   */
  async waitForFeedLoad(timeout = 10000) {
    await expect(this.feedContainer).toBeVisible({ timeout })
    await expect(this.currentCard).toBeVisible({ timeout })
    await expect(this.loadingIndicator).toBeHidden({ timeout })
  }

  /**
   * Perform vertical swipe gesture (up/down navigation)
   */
  async swipeVertical(direction: 'up' | 'down', distance = 300) {
    const card = this.currentCard
    await expect(card).toBeVisible()
    
    const boundingBox = await card.boundingBox()
    if (!boundingBox) throw new Error('Card not found for swipe')
    
    const startX = boundingBox.x + boundingBox.width / 2
    const startY = boundingBox.y + boundingBox.height / 2
    const endY = direction === 'up' 
      ? startY - distance 
      : startY + distance
    
    // Perform swipe with proper timing
    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX, endY, { steps: 10 })
    await this.page.mouse.up()
    
    // Wait for animation to complete
    await this.page.waitForTimeout(500)
  }

  /**
   * Perform horizontal swipe gesture (restaurant exploration)
   */
  async swipeHorizontal(direction: 'left' | 'right', distance = 200) {
    const card = this.currentCard
    await expect(card).toBeVisible()
    
    const boundingBox = await card.boundingBox()
    if (!boundingBox) throw new Error('Card not found for swipe')
    
    const startX = boundingBox.x + boundingBox.width / 2
    const startY = boundingBox.y + boundingBox.height / 2
    const endX = direction === 'left' 
      ? startX - distance 
      : startX + distance
    
    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(endX, startY, { steps: 10 })
    await this.page.mouse.up()
    
    await this.page.waitForTimeout(500)
  }

  /**
   * Perform double tap gesture (save action)
   */
  async doubleTap() {
    const card = this.currentCard
    await expect(card).toBeVisible()
    
    const boundingBox = await card.boundingBox()
    if (!boundingBox) throw new Error('Card not found for double tap')
    
    const centerX = boundingBox.x + boundingBox.width / 2
    const centerY = boundingBox.y + boundingBox.height / 2
    
    // Perform two quick taps
    await this.page.mouse.click(centerX, centerY)
    await this.page.waitForTimeout(50)
    await this.page.mouse.click(centerX, centerY)
    
    // Wait for animation
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if heart animation is visible after double tap
   */
  async expectHeartAnimation() {
    await expect(this.heartAnimation).toBeVisible({ timeout: 1000 })
    await expect(this.heartAnimation).toBeHidden({ timeout: 3000 })
  }

  /**
   * Check if save toast appears
   */
  async expectSaveToast(expectedText?: string) {
    await expect(this.saveToast).toBeVisible({ timeout: 1000 })
    
    if (expectedText) {
      await expect(this.saveToast).toContainText(expectedText)
    }
    
    await expect(this.saveToast).toBeHidden({ timeout: 3000 })
  }

  /**
   * Get current dish information
   */
  async getCurrentDishInfo() {
    return {
      name: await this.dishName.textContent(),
      description: await this.dishDescription.textContent(), 
      restaurant: await this.restaurantName.textContent(),
      price: await this.priceText.textContent()
    }
  }

  /**
   * Check if video is playing (for video content)
   */
  async isVideoPlaying() {
    const videoElement = this.mediaPlayer.locator('video')
    if (await videoElement.count() === 0) return false
    
    const paused = await videoElement.evaluate((video: HTMLVideoElement) => video.paused)
    return !paused
  }

  /**
   * Toggle video playback
   */
  async toggleVideoPlayback() {
    await this.mediaPlayer.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check video controls visibility
   */
  async expectVideoControls(visible: boolean) {
    if (visible) {
      await expect(this.videoControls).toBeVisible({ timeout: 2000 })
    } else {
      await expect(this.videoControls).toBeHidden({ timeout: 4000 })
    }
  }

  /**
   * Navigate using bottom tabs
   */
  async navigateToTab(tab: 'explore' | 'saved' | 'cart' | 'profile') {
    const tabMap = {
      explore: this.exploreTab,
      saved: this.savedTab, 
      cart: this.cartTab,
      profile: this.profileTab
    }
    
    const tabElement = tabMap[tab]
    await expect(tabElement).toBeVisible()
    await tabElement.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Check active tab highlight
   */
  async expectActiveTab(tab: 'explore' | 'saved' | 'cart' | 'profile') {
    const tabMap = {
      explore: this.exploreTab,
      saved: this.savedTab,
      cart: this.cartTab, 
      profile: this.profileTab
    }
    
    const activeTab = tabMap[tab]
    await expect(activeTab).toHaveAttribute('data-active', 'true')
  }

  /**
   * Simulate network conditions
   */
  async simulateNetworkCondition(condition: 'offline' | 'slow-3g' | 'fast-3g' | 'online') {
    const conditions = {
      offline: { offline: true },
      'slow-3g': {
        offline: false,
        downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 150
      },
      'fast-3g': {
        offline: false,
        downloadThroughput: 1.6 * 1024 * 1024 / 8 * 4, // 6.4 Mbps
        uploadThroughput: 750 * 1024 / 8 * 4, // 3 Mbps
        latency: 75
      },
      online: { offline: false }
    }
    
    await this.page.context().setOffline(conditions[condition].offline || false)
    
    if (condition !== 'offline' && condition !== 'online') {
      // Set network throttling for specific conditions
      const cdp = await this.page.context().newCDPSession(this.page)
      await cdp.send('Network.enable')
      await cdp.send('Network.emulateNetworkConditions', conditions[condition])
    }
  }

  /**
   * Wait for media to load
   */
  async waitForMediaLoad(timeout = 10000) {
    // Wait for either image or video to load
    try {
      await this.page.waitForFunction(() => {
        const img = document.querySelector('[data-testid="media-player"] img')
        const video = document.querySelector('[data-testid="media-player"] video')
        
        if (img && img.complete) return true
        if (video && video.readyState >= 2) return true // HAVE_CURRENT_DATA
        
        return false
      }, { timeout })
    } catch {
      // Media might not be loaded, check for error state
      const hasError = await this.errorMessage.isVisible()
      if (hasError) {
        throw new Error('Media failed to load')
      }
    }
  }

  /**
   * Test swipe threshold and snap behavior
   */
  async testSwipeThreshold(direction: 'up' | 'down', distance: number) {
    const initialDish = await this.getCurrentDishInfo()
    
    await this.swipeVertical(direction, distance)
    
    const finalDish = await this.getCurrentDishInfo()
    
    // If distance was above threshold, dish should change
    if (distance >= 100) {
      expect(initialDish.name).not.toBe(finalDish.name)
    } else {
      expect(initialDish.name).toBe(finalDish.name)
    }
  }

  /**
   * Check loading states during feed interactions
   */
  async expectLoadingState(visible: boolean) {
    if (visible) {
      await expect(this.loadingIndicator).toBeVisible({ timeout: 2000 })
    } else {
      await expect(this.loadingIndicator).toBeHidden({ timeout: 5000 })
    }
  }

  /**
   * Handle error states and retry logic
   */
  async handleErrorAndRetry() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 })
    await expect(this.retryButton).toBeVisible()
    
    await this.retryButton.click()
    await this.expectLoadingState(true)
    await this.expectLoadingState(false)
  }

  /**
   * Measure swipe responsiveness (performance test)
   */
  async measureSwipePerformance() {
    const startTime = Date.now()
    await this.swipeVertical('up')
    const endTime = Date.now()
    
    const duration = endTime - startTime
    expect(duration).toBeLessThan(1000) // Swipe should complete within 1 second
    
    return duration
  }

  /**
   * Check memory usage (basic performance test)
   */
  async checkMemoryUsage() {
    const metrics = await this.page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory
      }
      return null
    })
    
    if (metrics) {
      console.log('Memory usage:', {
        used: Math.round(metrics.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(metrics.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(metrics.jsHeapSizeLimit / 1024 / 1024) + ' MB'
      })
      
      // Warn if memory usage is high
      const usedMB = metrics.usedJSHeapSize / 1024 / 1024
      if (usedMB > 100) {
        console.warn(`High memory usage detected: ${usedMB}MB`)
      }
    }
    
    return metrics
  }

  /**
   * Simulate slow device performance
   */
  async simulateSlowDevice() {
    // Slow down CSS animations
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.1s !important;
          animation-delay: 0.01s !important;
          transition-duration: 0.1s !important;
          transition-delay: 0.01s !important;
        }
      `
    })
    
    // Throttle CPU (Chrome DevTools Protocol)
    try {
      const cdp = await this.page.context().newCDPSession(this.page)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    } catch (e) {
      console.warn('CPU throttling not available:', e)
    }
  }
}