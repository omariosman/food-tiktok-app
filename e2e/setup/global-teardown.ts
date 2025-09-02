import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...')
  
  // Clean up test artifacts if needed
  const fs = require('fs')
  const path = require('path')
  
  try {
    // Clean up temporary test files
    const tempFiles = [
      'e2e/fixtures/temp-test-data.json',
      'e2e/test-results/temp-*.har'
    ]
    
    tempFiles.forEach(pattern => {
      // Simple cleanup - in production you might use glob patterns
      const filePath = path.join(process.cwd(), pattern)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`🗑️  Cleaned up: ${pattern}`)
      }
    })
    
    // Generate test summary
    const resultsDir = path.join(process.cwd(), 'e2e', 'reports')
    if (fs.existsSync(resultsDir)) {
      console.log('📊 Test reports generated in:', resultsDir)
      
      // List available reports
      const reports = fs.readdirSync(resultsDir)
      reports.forEach(report => {
        console.log(`   - ${report}`)
      })
    }
    
    console.log('✅ Global teardown completed')
  } catch (error) {
    console.error('❌ Teardown error:', error)
  }
}

export default globalTeardown