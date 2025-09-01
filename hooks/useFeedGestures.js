import { useRef, useCallback } from 'react'
import { Dimensions } from 'react-native'
import { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle,
  runOnJS,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler'
import { 
  ANIMATION_CONSTANTS, 
  hapticFeedback, 
  gestureInterpolation,
  swipeCardAnimation
} from '../utils/feedAnimations'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

/**
 * Custom hook for managing all feed gestures and animations
 */
export const useFeedGestures = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  onSingleTap,
  onVideoTap
}) => {
  // Refs for gesture handlers
  const panRef = useRef()
  const singleTapRef = useRef()
  const doubleTapRef = useRef()
  const videoTapRef = useRef()
  
  // Animation values
  const translateY = useSharedValue(0)
  const translateX = useSharedValue(0)
  const scale = useSharedValue(1)
  const rotation = useSharedValue(0)
  const opacity = useSharedValue(1)
  
  // Gesture state
  const gestureActive = useSharedValue(false)
  const lastTap = useSharedValue(0)
  
  /**
   * Pan gesture handler for swipe navigation
   */
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value
      context.startX = translateX.value
      gestureActive.value = true
      
      // Light haptic feedback on gesture start
      runOnJS(hapticFeedback.light)()
    },
    
    onActive: (event, context) => {
      // Update translation values
      translateY.value = context.startY + event.translationY
      translateX.value = context.startX + event.translationX
      
      // Apply interpolated transformations
      scale.value = gestureInterpolation.swipeToScale(translateY.value)
      rotation.value = gestureInterpolation.swipeToRotation(translateY.value)
      opacity.value = gestureInterpolation.swipeToOpacity(translateY.value)
      
      // Provide haptic feedback at swipe threshold
      const absY = Math.abs(translateY.value)
      const absX = Math.abs(translateX.value)
      
      if (absY > ANIMATION_CONSTANTS.SWIPE_THRESHOLD || absX > ANIMATION_CONSTANTS.SWIPE_THRESHOLD) {
        runOnJS(hapticFeedback.medium)()
      }
    },
    
    onEnd: (event) => {
      gestureActive.value = false
      
      const { translationY, translationX, velocityY, velocityX } = event
      const absY = Math.abs(translationY)
      const absX = Math.abs(translationX)
      const absVelY = Math.abs(velocityY)
      const absVelX = Math.abs(velocityX)
      
      // Determine gesture type based on direction and threshold
      let gestureTriggered = false
      
      // Vertical swipes (up/down navigation)
      if (absY > ANIMATION_CONSTANTS.SWIPE_THRESHOLD || absVelY > ANIMATION_CONSTANTS.VELOCITY_THRESHOLD) {
        if (translationY > 0) {
          // Swipe down - previous item
          runOnJS(hapticFeedback.success)()
          runOnJS(onSwipeDown)()
        } else {
          // Swipe up - next item
          runOnJS(hapticFeedback.success)()
          runOnJS(onSwipeUp)()
        }
        gestureTriggered = true
      }
      // Horizontal swipes (restaurant exploration)
      else if (absX > ANIMATION_CONSTANTS.SWIPE_THRESHOLD || absVelX > ANIMATION_CONSTANTS.VELOCITY_THRESHOLD) {
        if (translationX > 0) {
          // Swipe right
          runOnJS(hapticFeedback.medium)()
          runOnJS(onSwipeRight)()
        } else {
          // Swipe left - restaurant dishes
          runOnJS(hapticFeedback.medium)()
          runOnJS(onSwipeLeft)()
        }
        gestureTriggered = true
      }
      
      // Reset animations
      if (gestureTriggered) {
        // Quick snap animation for gesture completion
        translateY.value = withSpring(0, ANIMATION_CONSTANTS.SNAPPY_SPRING)
        translateX.value = withSpring(0, ANIMATION_CONSTANTS.SNAPPY_SPRING)
        scale.value = withSpring(1, ANIMATION_CONSTANTS.SNAPPY_SPRING)
        rotation.value = withSpring(0, ANIMATION_CONSTANTS.SNAPPY_SPRING)
        opacity.value = withTiming(1, { duration: 200 })
      } else {
        // Gentle spring back for incomplete gestures
        translateY.value = withSpring(0, ANIMATION_CONSTANTS.GENTLE_SPRING)
        translateX.value = withSpring(0, ANIMATION_CONSTANTS.GENTLE_SPRING)
        scale.value = withSpring(1, ANIMATION_CONSTANTS.GENTLE_SPRING)
        rotation.value = withSpring(0, ANIMATION_CONSTANTS.GENTLE_SPRING)
        opacity.value = withTiming(1, { duration: 300 })
      }
    }
  })
  
  /**
   * Double tap gesture handler
   */
  const doubleTapGestureHandler = useAnimatedGestureHandler({
    onEnd: () => {
      runOnJS(hapticFeedback.success)()
      runOnJS(onDoubleTap)()
    }
  })
  
  /**
   * Single tap gesture handler
   */
  const singleTapGestureHandler = useAnimatedGestureHandler({
    onEnd: () => {
      const now = Date.now()
      if (now - lastTap.value < 300) {
        // This is actually a double tap, ignore
        return
      }
      
      lastTap.value = now
      runOnJS(hapticFeedback.selection)()
      runOnJS(onSingleTap)()
    }
  })
  
  /**
   * Video tap gesture handler (separate from single tap)
   */
  const videoTapGestureHandler = useAnimatedGestureHandler({
    onEnd: () => {
      runOnJS(hapticFeedback.light)()
      runOnJS(onVideoTap)()
    }
  })
  
  /**
   * Animated style for the main card
   */
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
        { rotateZ: `${rotation.value}deg` }
      ],
      opacity: opacity.value
    }
  })
  
  /**
   * Animated style for background cards (next/previous preview)
   */
  const backgroundCardAnimatedStyle = useAnimatedStyle(() => {
    const backgroundScale = interpolate(
      Math.abs(translateY.value),
      [0, ANIMATION_CONSTANTS.SWIPE_THRESHOLD],
      [0.9, 1],
      Extrapolation.CLAMP
    )
    
    return {
      transform: [{ scale: backgroundScale }],
      opacity: interpolate(
        Math.abs(translateY.value),
        [0, ANIMATION_CONSTANTS.SWIPE_THRESHOLD],
        [0.3, 0.7],
        Extrapolation.CLAMP
      )
    }
  })
  
  /**
   * Reset all animations to default state
   */
  const resetAnimations = useCallback(() => {
    translateY.value = withSpring(0, ANIMATION_CONSTANTS.GENTLE_SPRING)
    translateX.value = withSpring(0, ANIMATION_CONSTANTS.GENTLE_SPRING)
    scale.value = withSpring(1, ANIMATION_CONSTANTS.GENTLE_SPRING)
    rotation.value = withSpring(0, ANIMATION_CONSTANTS.GENTLE_SPRING)
    opacity.value = withTiming(1, { duration: 200 })
  }, [])
  
  /**
   * Trigger swipe animation programmatically
   */
  const triggerSwipeAnimation = useCallback((direction = 'up') => {
    const target = direction === 'up' ? -SCREEN_HEIGHT : SCREEN_HEIGHT
    
    translateY.value = withTiming(target, { duration: 300 }, (finished) => {
      if (finished) {
        // Reset for next card
        translateY.value = 0
        scale.value = 1
        rotation.value = 0
        opacity.value = 1
      }
    })
    
    scale.value = withTiming(0.9, { duration: 300 })
    opacity.value = withTiming(0, { duration: 300 })
  }, [])
  
  /**
   * Get current gesture progress (0-1)
   */
  const getGestureProgress = useCallback(() => {
    'worklet'
    return Math.abs(translateY.value) / ANIMATION_CONSTANTS.SWIPE_THRESHOLD
  }, [translateY])
  
  return {
    // Gesture handlers
    panRef,
    singleTapRef,
    doubleTapRef,
    videoTapRef,
    panGestureHandler,
    singleTapGestureHandler,
    doubleTapGestureHandler,
    videoTapGestureHandler,
    
    // Animated styles
    cardAnimatedStyle,
    backgroundCardAnimatedStyle,
    
    // Animation values (for external use)
    translateY,
    translateX,
    scale,
    rotation,
    opacity,
    
    // Helper functions
    resetAnimations,
    triggerSwipeAnimation,
    getGestureProgress,
    
    // State
    gestureActive
  }
}