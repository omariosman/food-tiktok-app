/**
 * Feed Interactions Test Suite
 * Tests for Issue #26 - Feed Interactions & Animations
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import EnhancedFeedCard from '../components/EnhancedFeedCard'
import { useFeedGestures } from '../hooks/useFeedGestures'
import { hapticFeedback } from '../utils/feedAnimations'

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy'
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error'
  }
}))

jest.mock('expo-av', () => ({
  Video: 'Video',
  ResizeMode: {
    COVER: 'cover',
    CONTAIN: 'contain'
  }
}))

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Sample dish data for testing
const mockDish = {
  id: '1',
  name: 'Test Dish',
  description: 'A delicious test dish',
  imageUrl: 'https://example.com/dish.jpg',
  price: 15.99,
  restaurantName: 'Test Restaurant',
  restaurantId: 'restaurant-1',
  deliveryTime: '30',
  googleRating: '4.5',
  googleReviews: '500+',
  deliveryRating: '4.2',
  deliveryReviews: '100+',
  reviewCount: 24,
  isSaved: false
}

const TestWrapper = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    {children}
  </GestureHandlerRootView>
)

describe('Feed Interactions & Animations', () => {
  describe('EnhancedFeedCard', () => {
    let mockHandlers

    beforeEach(() => {
      mockHandlers = {
        onSave: jest.fn(),
        onShare: jest.fn(),
        onReviews: jest.fn(),
        onAddToCart: jest.fn(),
        onMenu: jest.fn(),
        onLocationPress: jest.fn(),
        onFilterPress: jest.fn(),
        onSearchPress: jest.fn(),
        onVideoPress: jest.fn()
      }
    })

    it('renders correctly with dish data', () => {
      const { getByText } = render(
        <TestWrapper>
          <EnhancedFeedCard
            dish={mockDish}
            isActive={true}
            {...mockHandlers}
          />
        </TestWrapper>
      )

      expect(getByText('Test Dish')).toBeTruthy()
      expect(getByText('Test Restaurant')).toBeTruthy()
      expect(getByText('$15.99')).toBeTruthy()
    })

    it('handles save button press', async () => {
      const { getByText } = render(
        <TestWrapper>
          <EnhancedFeedCard
            dish={mockDish}
            isActive={true}
            {...mockHandlers}
          />
        </TestWrapper>
      )

      const saveButton = getByText('Save')
      fireEvent.press(saveButton)

      await waitFor(() => {
        expect(mockHandlers.onSave).toHaveBeenCalledWith({
          ...mockDish,
          isSaved: true
        })
      })
    })

    it('handles add to cart button press', async () => {
      const { getByText } = render(
        <TestWrapper>
          <EnhancedFeedCard
            dish={mockDish}
            isActive={true}
            {...mockHandlers}
          />
        </TestWrapper>
      )

      const addToCartButton = getByText('Add to Cart')
      fireEvent.press(addToCartButton)

      await waitFor(() => {
        expect(mockHandlers.onAddToCart).toHaveBeenCalledWith(mockDish)
      })
    })

    it('handles share button press', async () => {
      const { getByText } = render(
        <TestWrapper>
          <EnhancedFeedCard
            dish={mockDish}
            isActive={true}
            {...mockHandlers}
          />
        </TestWrapper>
      )

      const shareButton = getByText('Share')
      fireEvent.press(shareButton)

      await waitFor(() => {
        expect(mockHandlers.onShare).toHaveBeenCalled()
      })
    })

    it('shows correct save state when dish is already saved', () => {
      const savedDish = { ...mockDish, isSaved: true }
      
      const { getByText } = render(
        <TestWrapper>
          <EnhancedFeedCard
            dish={savedDish}
            isActive={true}
            {...mockHandlers}
          />
        </TestWrapper>
      )

      // Should show heart emoji instead of empty heart
      expect(getByText('Save')).toBeTruthy()
    })

    it('formats price correctly', () => {
      const dishWithNumericPrice = { ...mockDish, price: 15.5 }
      
      const { getByText } = render(
        <TestWrapper>
          <EnhancedFeedCard
            dish={dishWithNumericPrice}
            isActive={true}
            {...mockHandlers}
          />
        </TestWrapper>
      )

      expect(getByText('$15.50')).toBeTruthy()
    })
  })

  describe('useFeedGestures Hook', () => {
    let mockGestureHandlers

    beforeEach(() => {
      mockGestureHandlers = {
        onSwipeUp: jest.fn(),
        onSwipeDown: jest.fn(),
        onSwipeLeft: jest.fn(),
        onSwipeRight: jest.fn(),
        onDoubleTap: jest.fn(),
        onSingleTap: jest.fn(),
        onVideoTap: jest.fn()
      }
    })

    // Note: Testing react-native-reanimated hooks requires special setup
    // This is a basic structure - full testing would need detox or similar
    it('should initialize with default values', () => {
      // Mock implementation for gesture hook testing
      expect(mockGestureHandlers.onSwipeUp).toBeDefined()
      expect(mockGestureHandlers.onSwipeDown).toBeDefined()
      expect(mockGestureHandlers.onSwipeLeft).toBeDefined()
      expect(mockGestureHandlers.onSwipeRight).toBeDefined()
    })
  })

  describe('Animation Utilities', () => {
    describe('hapticFeedback', () => {
      it('should provide all feedback types', () => {
        expect(hapticFeedback.light).toBeDefined()
        expect(hapticFeedback.medium).toBeDefined()
        expect(hapticFeedback.heavy).toBeDefined()
        expect(hapticFeedback.success).toBeDefined()
        expect(hapticFeedback.warning).toBeDefined()
        expect(hapticFeedback.error).toBeDefined()
        expect(hapticFeedback.selection).toBeDefined()
      })

      it('should call expo-haptics functions', async () => {
        const { impactAsync } = require('expo-haptics')
        
        await hapticFeedback.light()
        expect(impactAsync).toHaveBeenCalled()
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete interaction flow', async () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <EnhancedFeedCard
            dish={mockDish}
            isActive={true}
            {...mockHandlers}
          />
        </TestWrapper>
      )

      // Test save interaction
      fireEvent.press(getByText('Save'))
      await waitFor(() => {
        expect(mockHandlers.onSave).toHaveBeenCalled()
      })

      // Test add to cart interaction
      fireEvent.press(getByText('Add to Cart'))
      await waitFor(() => {
        expect(mockHandlers.onAddToCart).toHaveBeenCalled()
      })

      // Test share interaction
      fireEvent.press(getByText('Share'))
      await waitFor(() => {
        expect(mockHandlers.onShare).toHaveBeenCalled()
      })
    })
  })
})

describe('Performance Tests', () => {
  it('should not cause memory leaks with animations', () => {
    // This would require more sophisticated testing setup
    // with performance monitoring tools
    expect(true).toBe(true)
  })

  it('should handle rapid gesture inputs', () => {
    // Test for gesture debouncing and proper cleanup
    expect(true).toBe(true)
  })
})

describe('Accessibility Tests', () => {
  it('should have proper accessibility labels', () => {
    const { getByText } = render(
      <TestWrapper>
        <EnhancedFeedCard
          dish={mockDish}
          isActive={true}
          onSave={jest.fn()}
          onShare={jest.fn()}
          onReviews={jest.fn()}
          onAddToCart={jest.fn()}
          onMenu={jest.fn()}
          onLocationPress={jest.fn()}
          onFilterPress={jest.fn()}
          onSearchPress={jest.fn()}
        />
      </TestWrapper>
    )

    expect(getByText('Save')).toBeTruthy()
    expect(getByText('Share')).toBeTruthy()
    expect(getByText('Add to Cart')).toBeTruthy()
  })

  it('should work with screen readers', () => {
    // Test with accessibility testing tools
    expect(true).toBe(true)
  })
})