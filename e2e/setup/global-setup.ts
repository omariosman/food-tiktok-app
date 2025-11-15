import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...')
  
  // Check if the web server is running
  try {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    // Try to access the app
    const baseURL = config.use?.baseURL || 'http://localhost:8081'
    console.log(`📡 Checking if app is available at: ${baseURL}`)
    
    try {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 })
      console.log('✅ App is accessible')
    } catch (error) {
      console.warn('⚠️  App not accessible, tests may fail:', error.message)
    }
    
    await browser.close()
  } catch (error) {
    console.error('❌ Global setup failed:', error)
  }
  
  // Set up test data if needed
  console.log('📋 Setting up test fixtures...')
  
  // Create mock API responses for testing
  const mockApiData = {
    feedItems: [
      {
        id: 'test-dish-1',
        name: 'Test Dish 1',
        description: 'A delicious test dish for E2E testing',
        imageUrl: 'https://picsum.photos/400/600?random=1',
        price: 12.99,
        restaurantName: 'Test Restaurant',
        restaurantId: 'test-restaurant-1',
        deliveryTime: '25',
        googleRating: '4.5',
        googleReviews: '500+',
        deliveryRating: '4.2',
        deliveryReviews: '100+',
        reviewCount: 24,
        isSaved: false
      },
      {
        id: 'test-dish-2', 
        name: 'Test Video Dish',
        description: 'A test dish with video content',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://picsum.photos/400/600?random=2',
        price: 18.50,
        restaurantName: 'Video Test Restaurant',
        restaurantId: 'test-restaurant-2',
        deliveryTime: '30',
        googleRating: '4.7',
        googleReviews: '1000+',
        deliveryRating: '4.4',
        deliveryReviews: '200+',
        reviewCount: 45,
        isSaved: false
      },
      {
        id: 'test-dish-3',
        name: 'Test Saved Dish',
        description: 'A pre-saved test dish',
        imageUrl: 'https://picsum.photos/400/600?random=3',
        price: 15.75,
        restaurantName: 'Saved Test Restaurant',
        restaurantId: 'test-restaurant-3',
        deliveryTime: '20',
        googleRating: '4.8',
        googleReviews: '750+',
        deliveryRating: '4.6',
        deliveryReviews: '150+',
        reviewCount: 32,
        isSaved: true
      }
    ],
    restaurants: [
      {
        id: 'test-restaurant-1',
        name: 'Test Restaurant',
        cuisine: 'International',
        rating: 4.5,
        deliveryTime: 25,
        deliveryFee: 2.99
      },
      {
        id: 'test-restaurant-2', 
        name: 'Video Test Restaurant',
        cuisine: 'Modern',
        rating: 4.7,
        deliveryTime: 30,
        deliveryFee: 3.99
      },
      {
        id: 'test-restaurant-3',
        name: 'Saved Test Restaurant', 
        cuisine: 'Gourmet',
        rating: 4.8,
        deliveryTime: 20,
        deliveryFee: 1.99
      }
    ]
  }
  
  // Save mock data to fixtures
  const fs = require('fs')
  const path = require('path')
  
  const fixturesDir = path.join(__dirname, '..', 'fixtures')
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true })
  }
  
  fs.writeFileSync(
    path.join(fixturesDir, 'mock-feed-data.json'),
    JSON.stringify(mockApiData, null, 2)
  )
  
  console.log('✅ Global setup completed')
}

export default globalSetup