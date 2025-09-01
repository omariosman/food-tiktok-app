import React, { useState, useRef, useCallback } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  Share as RNShare
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS
} from 'react-native-reanimated'
import { TapGestureHandler } from 'react-native-gesture-handler'
import EnhancedMediaPlayer from './EnhancedMediaPlayer'
import { 
  hapticFeedback, 
  heartSaveAnimation, 
  buttonPressAnimation, 
  cartBounceAnimation,
  ANIMATION_CONSTANTS 
} from '../utils/feedAnimations'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export default function EnhancedFeedCard({
  dish,
  isActive = true,
  onSave,
  onShare,
  onReviews,
  onAddToCart,
  onMenu,
  onLocationPress,
  onFilterPress,
  onSearchPress,
  onVideoPress
}) {
  const [isSaved, setIsSaved] = useState(dish?.isSaved || false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSaveToast, setShowSaveToast] = useState(false)
  
  // Refs for gesture handlers
  const doubleTapRef = useRef()
  
  // Animation values
  const heartScale = useSharedValue(0)
  const heartOpacity = useSharedValue(0)
  const saveButtonScale = useSharedValue(1)
  const addToCartScale = useSharedValue(1)
  const cartIconScale = useSharedValue(1)
  const cartIconRotate = useSharedValue(0)
  const toastTranslateY = useSharedValue(100)
  const toastOpacity = useSharedValue(0)
  
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price || '0.00'
  }
  
  /**
   * Handle double tap to save with heart animation
   */
  const handleDoubleTapSave = useCallback(() => {
    const newSavedState = !isSaved
    setIsSaved(newSavedState)
    
    // Heart animation
    heartOpacity.value = 1
    heartScale.value = withSequence(
      withTiming(1.5, { duration: 200 }),
      withTiming(1.2, { duration: 100 }),
      withDelay(500, withTiming(0, { duration: 200 }))
    )
    
    // Heart opacity animation
    heartOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(600, withTiming(0, { duration: 200 }))
    )
    
    // Save button scale animation
    saveButtonScale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withSpring(1, ANIMATION_CONSTANTS.BOUNCE_CONFIG)
    )
    
    // Show toast
    setShowSaveToast(true)
    toastTranslateY.value = withSpring(-60, ANIMATION_CONSTANTS.SNAPPY_SPRING)
    toastOpacity.value = withTiming(1, { duration: 200 })
    
    // Hide toast after 2 seconds
    setTimeout(() => {
      toastTranslateY.value = withSpring(100, ANIMATION_CONSTANTS.GENTLE_SPRING)
      toastOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setShowSaveToast)(false)
      })
    }, 2000)
    
    // Haptic feedback
    hapticFeedback.success()
    
    // Call parent handler
    onSave?.({ ...dish, isSaved: newSavedState })
  }, [isSaved, dish, onSave])
  
  /**
   * Handle save button press (single tap)
   */
  const handleSave = useCallback(() => {
    const newSavedState = !isSaved
    setIsSaved(newSavedState)
    
    // Save button animation
    saveButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, ANIMATION_CONSTANTS.BOUNCE_CONFIG)
    )
    
    hapticFeedback.medium()
    onSave?.({ ...dish, isSaved: newSavedState })
  }, [isSaved, dish, onSave])
  
  /**
   * Handle add to cart with animations
   */
  const handleAddToCart = useCallback(() => {
    // Button scale animation
    addToCartScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, ANIMATION_CONSTANTS.BOUNCE_CONFIG)
    )
    
    // Cart icon animations
    cartBounceAnimation(cartIconScale, cartIconRotate)
    
    hapticFeedback.success()
    onAddToCart?.(dish)
  }, [dish, onAddToCart])
  
  /**
   * Handle share with native share sheet
   */
  const handleShare = useCallback(async () => {
    try {
      hapticFeedback.light()
      
      const shareContent = {
        message: `Check out this amazing ${dish?.name} from ${dish?.restaurantName}! Only $${formatPrice(dish?.price)} 🍽️`,
        title: dish?.name || 'Delicious Dish',
        url: dish?.imageUrl
      }
      
      if (dish?.imageUrl) {
        shareContent.url = dish.imageUrl
      }
      
      await RNShare.share(shareContent)
      onShare?.(dish, 'native')
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }, [dish, onShare])
  
  /**
   * Handle video press
   */
  const handleVideoPress = useCallback(() => {
    hapticFeedback.light()
    onVideoPress?.(dish)
  }, [dish, onVideoPress])
  
  // Animated styles
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }]
  }))
  
  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }]
  }))
  
  const addToCartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addToCartScale.value }]
  }))
  
  const cartIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cartIconScale.value },
      { rotateZ: `${cartIconRotate.value}deg` }
    ]
  }))
  
  const toastAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastTranslateY.value }]
  }))
  
  return (
    <View style={styles.container}>
      <TapGestureHandler
        ref={doubleTapRef}
        numberOfTaps={2}
        onActivated={handleDoubleTapSave}
      >
        <Animated.View style={styles.gestureContainer}>
          <EnhancedMediaPlayer
            mediaUri={dish?.imageUrl || dish?.videoUrl}
            isVideo={!!dish?.videoUrl}
            isActive={isActive}
            isMuted={!soundEnabled}
            onVideoPress={handleVideoPress}
          >
            {/* Floating heart animation for double tap */}
            <Animated.View style={[styles.floatingHeart, heartAnimatedStyle]}>
              <Text style={styles.heartIcon}>❤️</Text>
            </Animated.View>
            
            {/* Top Navigation Bar */}
            <View style={styles.topNav}>
              <StatusBar barStyle="light-content" />
              
              {/* Location Button */}
              <TouchableOpacity style={styles.locationButton} onPress={onLocationPress}>
                <View style={styles.blurButton}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>Allow access to location</Text>
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.topActions}>
                <TouchableOpacity style={styles.topActionButton} onPress={onFilterPress}>
                  <View style={styles.blurCircle}>
                    <Text style={styles.actionIcon}>⚙️</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.topActionButton} onPress={onSearchPress}>
                  <View style={styles.blurCircle}>
                    <Text style={styles.actionIcon}>🔍</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dish Information Overlay (bottom-left) */}
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{dish?.name || 'Delicious Dish'}</Text>
              <Text style={styles.dishDescription} numberOfLines={2}>
                {dish?.description || 'A mouth-watering culinary experience that will delight your taste buds'}
              </Text>
              
              {/* Restaurant Info */}
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantIcon}>🏪</Text>
                <Text style={styles.restaurantName}>{dish?.restaurantName || 'Amazing Restaurant'}</Text>
                <Text style={styles.deliveryTime}>• {dish?.deliveryTime || '35'} min</Text>
              </View>

              {/* Rating Badges */}
              <View style={styles.ratingContainer}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>
                    {dish?.googleRating || '4.5'}⭐ {dish?.googleReviews || '500+'}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>
                    {dish?.deliveryRating || '4.2'}⭐ {dish?.deliveryReviews || '100+'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons (right side) */}
            <View style={styles.rightActions}>
              <AnimatedTouchableOpacity 
                style={[styles.actionButton, saveButtonAnimatedStyle]} 
                onPress={handleSave}
              >
                <View style={[styles.actionCircle, isSaved && styles.actionCircleSaved]}>
                  <Text style={styles.rightActionIcon}>{isSaved ? '❤️' : '🤍'}</Text>
                </View>
                <Text style={styles.actionLabel}>Save</Text>
              </AnimatedTouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onReviews?.(dish)}
              >
                <View style={styles.actionCircle}>
                  <Text style={styles.rightActionIcon}>💬</Text>
                </View>
                <Text style={styles.actionLabel}>{dish?.reviewCount || '24'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleShare}
              >
                <View style={styles.actionCircle}>
                  <Text style={styles.rightActionIcon}>📤</Text>
                </View>
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>

              {dish?.videoUrl && (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => setSoundEnabled(!soundEnabled)}
                >
                  <View style={styles.actionCircle}>
                    <Text style={styles.rightActionIcon}>{soundEnabled ? '🔊' : '🔇'}</Text>
                  </View>
                  <Text style={styles.actionLabel}>Sound</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.menuButton} onPress={() => onMenu?.(dish)}>
                <Text style={styles.menuIcon}>▦</Text>
                <Text style={styles.menuText}>Menu</Text>
              </TouchableOpacity>

              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>${formatPrice(dish?.price)}</Text>
              </View>

              <AnimatedTouchableOpacity 
                style={[styles.addToCartButton, addToCartAnimatedStyle]} 
                onPress={handleAddToCart}
              >
                <Animated.View style={cartIconAnimatedStyle}>
                  <Text style={styles.cartIcon}>🛒</Text>
                </Animated.View>
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </AnimatedTouchableOpacity>
            </View>
            
            {/* Save toast notification */}
            {showSaveToast && (
              <Animated.View style={[styles.saveToast, toastAnimatedStyle]}>
                <Text style={styles.toastIcon}>❤️</Text>
                <Text style={styles.toastText}>
                  {isSaved ? '+1 Saved' : 'Removed from saved'}
                </Text>
              </Animated.View>
            )}
          </EnhancedMediaPlayer>
        </Animated.View>
      </TapGestureHandler>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
  },
  gestureContainer: {
    flex: 1,
  },
  
  // Floating heart
  floatingHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  heartIcon: {
    fontSize: 100,
    textAlign: 'center',
  },
  
  // Save toast
  saveToast: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
    pointerEvents: 'none',
  },
  toastIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Top Navigation
  topNav: {
    position: 'absolute',
    top: StatusBar.currentHeight + 10 || 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  locationButton: {
    flex: 1,
    marginRight: 20,
  },
  blurButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  topActions: {
    flexDirection: 'row',
  },
  topActionButton: {
    marginLeft: 12,
  },
  blurCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  actionIcon: {
    fontSize: 18,
  },

  // Dish Information
  dishInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 100,
    zIndex: 10,
  },
  dishName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dishDescription: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  restaurantName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    backdropFilter: 'blur(10px)',
  },
  ratingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  // Right Action Buttons
  rightActions: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  actionCircleSaved: {
    backgroundColor: 'rgba(255, 107, 0, 0.8)',
  },
  rightActionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Bottom Action Bar
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginRight: 12,
    backdropFilter: 'blur(10px)',
  },
  menuIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 6,
  },
  menuText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  priceContainer: {
    flex: 1,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cartIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})