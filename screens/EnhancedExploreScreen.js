import React, { useState, useRef, useEffect } from 'react'
import { 
  View, 
  StyleSheet, 
  Dimensions,
  Alert,
  Text,
  TouchableOpacity
} from 'react-native'
import Animated from 'react-native-reanimated'
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler'
import { useFocusEffect } from '@react-navigation/native'

import EnhancedFeedCard from '../components/EnhancedFeedCard'
import SwipeInstructions from '../components/SwipeInstructions'
import { FeedCardSkeleton, LoadingOverlay } from '../components/SkeletonLoader'
import { useFeedScroll } from '../hooks/useFeedScroll'
import { useFeedGestures } from '../hooks/useFeedGestures'
import { saveDish, removeSavedDish } from '../services/savedDishesService'
import { useAuth } from '../contexts/AuthContext'
import { hapticFeedback } from '../utils/feedAnimations'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function EnhancedExploreScreen() {
  const [showInstructions, setShowInstructions] = useState(true)
  const [isRestaurantMode, setIsRestaurantMode] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  
  const { user } = useAuth()
  
  // Use the feed scroll hook for all feed management
  const {
    currentItem,
    loading,
    loadingMore,
    error,
    hasMoreItems,
    goToNext,
    goToPrevious,
    handleLike,
    handleSave: handleFeedSave,
    handleShare: handleFeedShare,
    handleSkip,
    loadRestaurantItems,
    returnToMainFeed,
    refreshFeed,
    isAtEnd,
    trackCurrentView,
    handleViewStart
  } = useFeedScroll()

  // Enhanced gesture handling
  const {
    panRef,
    singleTapRef,
    doubleTapRef,
    panGestureHandler,
    singleTapGestureHandler,
    doubleTapGestureHandler,
    cardAnimatedStyle,
    backgroundCardAnimatedStyle,
    resetAnimations,
    triggerSwipeAnimation,
    gestureActive
  } = useFeedGestures({
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onDoubleTap: handleDoubleTap,
    onSingleTap: handleSingleTap,
    onVideoTap: handleVideoTap
  })

  // Auto-hide instructions after 5 seconds
  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showInstructions])

  // Start view tracking when component mounts or current item changes
  useEffect(() => {
    if (currentItem) {
      handleViewStart()
    }
  }, [currentItem, handleViewStart])

  // Focus effect to track screen visibility
  useFocusEffect(
    React.useCallback(() => {
      // Screen became focused, ensure current view tracking
      if (currentItem) {
        handleViewStart()
      }
      
      return () => {
        // Screen lost focus, track current view
        trackCurrentView()
      }
    }, [currentItem, handleViewStart, trackCurrentView])
  )

  /**
   * Gesture handlers
   */
  function handleSwipeUp() {
    if (showInstructions) {
      setShowInstructions(false)
    }
    
    trackCurrentView()
    
    // Check if this is a fast swipe (< 1 second view time)
    const viewTime = Date.now() - (currentItem?.viewStartTime || Date.now())
    if (viewTime < 1000) {
      handleSkip(currentItem, viewTime)
    }
    
    triggerSwipeAnimation('up')
    goToNext()
  }

  function handleSwipeDown() {
    if (showInstructions) {
      setShowInstructions(false)
    }
    
    trackCurrentView()
    triggerSwipeAnimation('down')
    goToPrevious()
  }

  async function handleSwipeLeft() {
    // Show more dishes from the same restaurant
    if (currentItem && currentItem.restaurantId) {
      try {
        setIsRestaurantMode(true)
        await loadRestaurantItems(currentItem.restaurantId)
        
        Alert.alert(
          currentItem.restaurantName,
          'Now showing dishes from this restaurant',
          [
            { text: 'Back to Main Feed', onPress: () => {
              setIsRestaurantMode(false)
              returnToMainFeed()
              resetAnimations()
            }},
            { text: 'Continue', style: 'cancel' }
          ]
        )
      } catch (error) {
        Alert.alert('Error', 'Could not load restaurant dishes')
        hapticFeedback.error()
      }
    } else {
      Alert.alert('No Restaurant', 'Restaurant information not available')
      hapticFeedback.warning()
    }
  }

  function handleSwipeRight() {
    // Could be used for other features like filters or discovery
    hapticFeedback.light()
  }

  function handleDoubleTap() {
    // Double tap functionality is handled in EnhancedFeedCard
    // This is just for the gesture detection
  }

  function handleSingleTap() {
    if (showInstructions) {
      setShowInstructions(false)
    }
  }

  function handleVideoTap() {
    // Video controls are handled in EnhancedMediaPlayer
    hapticFeedback.light()
  }

  /**
   * Feed interaction handlers
   */
  const handleSave = async (dish) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to save dishes')
      return
    }

    try {
      // Use both feed tracking and saved dishes service for consistency
      await handleFeedSave(dish)
      
      if (dish.dishId) {
        if (dish.isSaved) {
          await removeSavedDish(dish.dishId)
        } else {
          await saveDish(dish.dishId)
        }
      }
      
    } catch (error) {
      console.error('Error saving dish:', error)
      Alert.alert('Error', 'Failed to save dish. Please try again.')
      hapticFeedback.error()
    }
  }

  const handleShare = async (dish, platform = 'native') => {
    try {
      await handleFeedShare(dish, platform)
    } catch (error) {
      console.error('Error sharing:', error)
      hapticFeedback.error()
    }
  }

  const handleReviews = (dish) => {
    Alert.alert(
      `${dish.name} Reviews`,
      `${dish.reviewCount} reviews available. Feature coming soon!`,
      [{ text: 'OK' }]
    )
  }

  const handleAddToCart = (dish) => {
    Alert.alert(
      'Added to Cart',
      `${dish.name} - $${typeof dish.price === 'number' ? dish.price.toFixed(2) : dish.price}`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => console.log('Navigate to cart') }
      ]
    )
  }

  const handleMenu = (dish) => {
    Alert.alert(
      `${dish.restaurantName} Menu`,
      'Full menu feature coming soon!',
      [{ text: 'OK' }]
    )
  }

  const handleLocationPress = () => {
    Alert.alert(
      'Location Access',
      'Location services will help us show nearby restaurants',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Allow', onPress: () => console.log('Request location permission') }
      ]
    )
  }

  const handleFilterPress = () => {
    Alert.alert('Filters', 'Filter options coming soon!')
  }

  const handleSearchPress = () => {
    Alert.alert('Search', 'Search functionality coming soon!')
  }

  /**
   * Error handling with retry logic
   */
  const handleRetry = async () => {
    if (retryAttempts >= 3) {
      Alert.alert(
        'Connection Issues',
        'Please check your internet connection and try again later.',
        [{ text: 'OK' }]
      )
      return
    }
    
    setRetryAttempts(prev => prev + 1)
    hapticFeedback.light()
    await refreshFeed()
  }

  // Reset retry attempts on successful load
  useEffect(() => {
    if (!error && !loading) {
      setRetryAttempts(0)
    }
  }, [error, loading])

  // Loading state with skeleton
  if (loading && !currentItem) {
    return (
      <View style={styles.container}>
        <FeedCardSkeleton />
      </View>
    )
  }

  // Error state with retry functionality
  if (error && !currentItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>
          {error}
          {retryAttempts > 0 && `\n\nAttempt ${retryAttempts}/3`}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
          disabled={retryAttempts >= 3}
        >
          <Text style={styles.retryButtonText}>
            {retryAttempts >= 3 ? 'Max Retries Reached' : 'Try Again'}
          </Text>
        </TouchableOpacity>
        
        {retryAttempts >= 3 && (
          <TouchableOpacity 
            style={[styles.retryButton, styles.refreshButton]} 
            onPress={() => {
              setRetryAttempts(0)
              refreshFeed()
            }}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // No items state
  if (!currentItem && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🍽️</Text>
        <Text style={styles.emptyTitle}>No dishes found</Text>
        <Text style={styles.emptyText}>Check back later for new content</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshFeed}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Background card (next item preview) */}
      <Animated.View style={[styles.backgroundCard, backgroundCardAnimatedStyle]}>
        <FeedCardSkeleton />
      </Animated.View>
      
      {/* Main card with gestures */}
      <TapGestureHandler
        ref={panRef}
        onGestureEvent={panGestureHandler}
        onHandlerStateChange={panGestureHandler}
        simultaneousHandlers={[singleTapRef, doubleTapRef]}
      >
        <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
          <TapGestureHandler
            ref={singleTapRef}
            onGestureEvent={singleTapGestureHandler}
            waitFor={doubleTapRef}
          >
            <Animated.View style={styles.gestureContainer}>
              <TapGestureHandler
                ref={doubleTapRef}
                numberOfTaps={2}
                onGestureEvent={doubleTapGestureHandler}
              >
                <Animated.View style={styles.gestureContainer}>
                  <EnhancedFeedCard
                    dish={currentItem}
                    isActive={true}
                    onSave={handleSave}
                    onShare={handleShare}
                    onReviews={handleReviews}
                    onAddToCart={handleAddToCart}
                    onMenu={handleMenu}
                    onLocationPress={handleLocationPress}
                    onFilterPress={handleFilterPress}
                    onSearchPress={handleSearchPress}
                    onVideoPress={handleVideoTap}
                  />
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </TapGestureHandler>

      {/* Loading more indicator */}
      {loadingMore && (
        <View style={styles.loadingMoreContainer}>
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      )}

      {/* End of feed indicator */}
      {isAtEnd && (
        <View style={styles.endOfFeedContainer}>
          <Text style={styles.endOfFeedIcon}>🎉</Text>
          <Text style={styles.endOfFeedText}>You've seen all the latest dishes!</Text>
          <TouchableOpacity style={styles.refreshButtonSmall} onPress={refreshFeed}>
            <Text style={styles.refreshButtonText}>Refresh Feed</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Restaurant mode indicator */}
      {isRestaurantMode && (
        <View style={styles.restaurantModeIndicator}>
          <Text style={styles.restaurantModeText}>
            📍 {currentItem?.restaurantName}
          </Text>
        </View>
      )}

      {/* Swipe Instructions Overlay */}
      <SwipeInstructions 
        visible={showInstructions}
        onDismiss={() => setShowInstructions(false)}
      />
      
      {/* Loading overlay for transitions */}
      <LoadingOverlay visible={gestureActive.value && loading} />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cardContainer: {
    flex: 1,
    zIndex: 2,
  },
  gestureContainer: {
    flex: 1,
  },
  
  // Loading states
  loadingMoreContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 50,
    zIndex: 100,
  },
  loadingMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Error states
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },

  // Action buttons
  retryButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#333',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // End of feed
  endOfFeedContainer: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 15,
    zIndex: 100,
  },
  endOfFeedIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  endOfFeedText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  refreshButtonSmall: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Restaurant mode
  restaurantModeIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  restaurantModeText: {
    backgroundColor: 'rgba(255, 107, 0, 0.9)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
})