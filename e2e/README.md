# 🧪 E2E Testing with Playwright

Comprehensive end-to-end testing suite for the Food TikTok App using Playwright.

## 📋 Overview

This E2E testing suite covers:
- **Feed Interactions**: Swipe gestures, button functionality, media playback
- **User Flows**: Complete user journeys from discovery to cart
- **Edge Cases**: Error handling, performance, security, accessibility
- **Cross-Device**: Mobile, tablet, desktop across different browsers
- **Performance**: Load times, memory usage, responsiveness

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:e2e:install

# Install system dependencies (Linux/macOS)
npm run test:e2e:install-deps
```

### Running Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test suite
npm run test:e2e:feed
npm run test:e2e:flows
npm run test:e2e:edge

# Run on specific devices
npm run test:e2e:mobile
npm run test:e2e:desktop

# View test report
npm run test:e2e:report
```

## 📁 Test Structure

```
e2e/
├── tests/
│   ├── feed.spec.ts              # Core feed functionality
│   ├── user-flows.spec.ts        # Complete user journeys
│   └── edge-cases.spec.ts        # Edge cases and stress tests
├── helpers/
│   ├── feedHelpers.ts            # Feed-specific utilities
│   └── testUtils.ts              # General test utilities
├── setup/
│   ├── global-setup.ts           # Test environment setup
│   └── global-teardown.ts        # Cleanup and reporting
├── fixtures/
│   └── mock-feed-data.json       # Test data
├── screenshots/                  # Visual regression screenshots
└── reports/                      # Test reports and results
```

## 🎯 Test Categories

### 1. Navigation Tests
- App launch and feed display
- Bottom navigation functionality
- Tab switching and active state
- Deep linking and routing

### 2. Feed Interaction Tests
- **Swipe Gestures**:
  - Vertical swipe (up/down) for navigation
  - Horizontal swipe for restaurant exploration
  - Threshold and velocity detection
  - Edge cases (first/last item)

- **Button Functionality**:
  - Save/unsave dishes
  - Add to cart with confirmation
  - Share with native sheet
  - Menu and restaurant navigation
  - Location permission requests
  - Search and filter access

- **Double Tap Interaction**:
  - Heart animation on double tap save
  - Haptic feedback simulation
  - Toast notifications

### 3. Media Tests
- Image loading and error handling
- Video auto-play and controls
- Media fallbacks for failures
- Progressive loading states

### 4. Data Loading Tests
- Initial feed load with skeleton
- Infinite scroll and pagination
- Error states with retry logic
- Empty state handling
- Network failure recovery

### 5. User Flow Tests
- **Complete Journey**: Discovery → Save → Add to Cart
- **First-time User**: Onboarding and instructions
- **Returning User**: Saved items and preferences
- **Restaurant Exploration**: Menu browsing
- **Search and Discovery**: Filtering and search
- **Offline/Online**: Network state handling

### 6. Performance Tests
- Page load performance
- Swipe responsiveness
- Memory leak detection
- Animation smoothness
- Large dataset handling

### 7. Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- ARIA labels and roles
- Color contrast and visibility

### 8. Cross-Device Tests
- Mobile portrait/landscape
- Tablet and desktop layouts
- Touch vs mouse interactions
- High DPI display support

### 9. Edge Cases
- **Data Edge Cases**:
  - Extremely long text content
  - Special characters and emojis
  - Missing or null data
  - Extreme price values

- **Network Edge Cases**:
  - Intermittent connectivity
  - Very slow responses
  - Malformed API responses
  - API rate limiting

- **Security Tests**:
  - Input sanitization (XSS prevention)
  - SQL injection attempts
  - CSRF protection

- **Performance Stress**:
  - Rapid interactions
  - Concurrent user simulation
  - Memory leak detection
  - Large dataset handling

## 🛠️ Test Helpers

### FeedHelpers Class
Provides methods for interacting with the feed:
```typescript
const feedHelpers = new FeedHelpers(page)

// Navigation
await feedHelpers.swipeVertical('up')
await feedHelpers.swipeHorizontal('left')
await feedHelpers.doubleTap()

// Verification
await feedHelpers.expectHeartAnimation()
await feedHelpers.expectSaveToast()
await feedHelpers.waitForFeedLoad()

// Media
await feedHelpers.toggleVideoPlayback()
await feedHelpers.expectVideoControls(true)

// Performance
const duration = await feedHelpers.measureSwipePerformance()
await feedHelpers.checkMemoryUsage()
```

### Test Utilities
Common testing utilities:
```typescript
// Mock API responses
await mockFeedAPI(page)
await mockAPIErrors(page, 'network')

// Authentication setup
await setupAuthentication(context)

// Performance measurement
const metrics = await measurePerformance(page)

// Accessibility checks
const results = await checkAccessibility(page)

// Device simulation
await setOrientation(page, 'landscape')
```

## 📊 Test Data

### Mock Feed Data
- 3 test dishes with different media types
- Realistic restaurant information
- Proper rating and review data
- Mixed content types (image/video)

### Generated Test Data
- Long text for layout testing
- Special characters and emojis
- Edge case price values
- Empty/null data scenarios

## 🎨 Visual Regression Testing

Screenshots are automatically captured for:
- App launch and feed display
- All major user interactions
- Error states and loading screens
- Different device orientations
- Accessibility testing states

Screenshots are stored in `e2e/screenshots/` and can be used for visual regression testing.

## 📈 Performance Monitoring

Performance metrics tracked:
- **Page Load Times**: Total load, DOM ready, first paint
- **Interaction Responsiveness**: Swipe duration, button response
- **Memory Usage**: JS heap size, garbage collection
- **Animation Performance**: Frame rates, smooth scrolling
- **Network Performance**: Request counts, payload sizes

## 🔧 Configuration

### Playwright Config
- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile device emulation (iPhone, Android)
- Network condition simulation
- Screenshot and video recording
- Parallel test execution

### Environment Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
CI=true  # For CI environment
```

### Test Timeouts
- Action timeout: 10 seconds
- Navigation timeout: 30 seconds
- Test timeout: 60 seconds
- Expect timeout: 10 seconds

## 🚦 CI/CD Integration

### GitHub Actions Workflow
- Runs on push to main/develop branches
- Supports manual triggers with test suite selection
- Multi-browser and multi-Node version matrix
- Artifact collection for reports and screenshots
- Performance analysis and visual regression
- PR comments with test results

### Scheduled Testing
- Daily runs at 2 AM UTC
- Weekly comprehensive testing
- Performance regression monitoring

## 📝 Test Reports

Multiple report formats generated:
- **HTML Report**: Interactive test results with screenshots
- **JSON Report**: Programmatic access to results
- **JUnit XML**: CI/CD integration
- **Performance Report**: Load times and metrics
- **Visual Report**: Screenshot comparisons

Access reports:
```bash
# View HTML report
npm run test:e2e:report

# Reports are also available at:
# e2e/reports/html/index.html
```

## 🐛 Debugging

### Debug Mode
```bash
# Run tests in debug mode
npm run test:e2e:debug

# Run with UI mode
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed
```

### Common Issues

**Tests failing due to timing**:
- Increase timeouts in `playwright.config.ts`
- Add explicit waits: `await page.waitForTimeout(1000)`
- Use proper selectors: `[data-testid]` attributes

**Element not found**:
- Verify selectors match the actual DOM
- Wait for elements: `await expect(element).toBeVisible()`
- Check for proper test IDs in components

**Flaky tests**:
- Add proper wait conditions
- Use deterministic test data
- Avoid time-dependent assertions

**Performance tests failing**:
- Adjust performance thresholds
- Consider CI environment differences
- Monitor resource usage during tests

## 📋 Best Practices

### Writing Tests
1. **Use Page Object Model**: Encapsulate interactions in helper classes
2. **Proper Selectors**: Use `data-testid` attributes for reliable selection
3. **Wait Strategies**: Always wait for elements and states
4. **Independent Tests**: Each test should be isolated and repeatable
5. **Descriptive Names**: Test names should clearly describe what they verify

### Test Data
1. **Mock API Responses**: Use consistent, realistic test data
2. **Edge Cases**: Test with various data scenarios
3. **Clean State**: Reset data between tests
4. **Realistic Content**: Use representative text and media

### Performance
1. **Parallel Execution**: Run tests in parallel when possible
2. **Smart Waits**: Use efficient waiting strategies
3. **Resource Cleanup**: Clean up resources after tests
4. **Selective Testing**: Run only relevant tests for changes

## 🤝 Contributing

### Adding New Tests
1. Create test file in appropriate category
2. Use existing helpers and utilities
3. Follow naming conventions
4. Add proper documentation
5. Include performance considerations

### Extending Helpers
1. Add methods to appropriate helper class
2. Include proper typing
3. Add error handling
4. Document new functionality
5. Write tests for helpers

### Updating Configuration
1. Test configuration changes locally
2. Update CI/CD workflows if needed
3. Document breaking changes
4. Consider backward compatibility

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [React Native Web Testing](https://necolas.github.io/react-native-web/)
- [Accessibility Testing](https://web.dev/accessibility/)
- [Performance Testing](https://web.dev/performance/)
- [Visual Regression Testing](https://playwright.dev/docs/test-snapshots)

## ✅ Issue #27 Coverage

This E2E testing suite fully addresses Issue #27 requirements:

### ✅ Navigation Tests
- App launch and feed display
- Bottom navigation functionality
- Tab switching with active highlighting

### ✅ Feed Interaction Tests
- Vertical swipe navigation (up/down)
- Horizontal swipe for restaurant exploration
- Swipe threshold and snap behavior
- Edge cases (first/last item handling)

### ✅ Button Functionality Tests
- Location permission requests
- Search and filter navigation
- Save button toggle with animation
- Share sheet opening
- Add to cart with count increment
- Menu button functionality

### ✅ Media Tests
- Video auto-play and pause
- Video controls and interaction
- Image loading and error handling
- Media fallback mechanisms

### ✅ Data Loading Tests
- Initial feed load with skeleton
- Infinite scroll implementation
- Pull to refresh functionality
- Error state handling with retry
- Empty state display

### ✅ User Flow Tests
- Complete discovery to cart journey
- First-time user onboarding
- Returning user experience
- Offline mode behavior

### ✅ Performance Tests
- Swipe responsiveness measurement
- Animation smoothness verification
- Memory usage monitoring
- Battery optimization testing

### ✅ Cross-Platform Testing
- iOS and Android emulation
- Different screen sizes
- Network conditions
- Edge case handling

The implementation exceeds the original requirements with additional security testing, accessibility verification, and comprehensive CI/CD integration.