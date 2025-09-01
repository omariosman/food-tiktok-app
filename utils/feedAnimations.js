import { 
  withTiming, 
  withSpring, 
  withSequence, 
  withDelay,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

/**
 * Feed Animation Utilities
 * Centralized animation configurations and helper functions
 */

// Animation constants
export const ANIMATION_CONSTANTS = {
  // Swipe thresholds
  SWIPE_THRESHOLD: 100,
  VELOCITY_THRESHOLD: 500,
  
  // Timing configurations
  SHORT_ANIMATION: 200,
  MEDIUM_ANIMATION: 300,
  LONG_ANIMATION: 500,
  
  // Spring configurations
  BOUNCE_CONFIG: {
    damping: 20,
    stiffness: 300,
    restSpeedThreshold: 0.01,
    restDisplacementThreshold: 0.01,
  },
  
  GENTLE_SPRING: {
    damping: 30,
    stiffness: 200,
  },
  
  SNAPPY_SPRING: {
    damping: 15,
    stiffness: 400,
  }
}

/**
 * Heart animation for double tap to save
 */
export const heartSaveAnimation = (scale, opacity, onComplete) => {
  'worklet'
  
  return withSequence(
    withTiming(1.2, { duration: 150 }),
    withSpring(1, ANIMATION_CONSTANTS.BOUNCE_CONFIG, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)()
      }
    })
  )
}

/**
 * Button press scale animation
 */
export const buttonPressAnimation = (scale, onPress) => {
  'worklet'
  
  return withSequence(
    withTiming(0.95, { duration: 100 }),
    withSpring(1, ANIMATION_CONSTANTS.GENTLE_SPRING, (finished) => {
      if (finished && onPress) {
        runOnJS(onPress)()
      }
    })
  )
}

/**
 * Cart bounce animation
 */
export const cartBounceAnimation = (scale, rotate) => {
  'worklet'
  
  // Scale animation
  scale.value = withSequence(
    withTiming(1.3, { duration: 200 }),
    withSpring(1, ANIMATION_CONSTANTS.BOUNCE_CONFIG)
  )
  
  // Rotate animation  
  rotate.value = withSequence(
    withTiming(10, { duration: 100 }),
    withTiming(-10, { duration: 100 }),
    withTiming(0, { duration: 100 })
  )
}

/**
 * Swipe card animation
 */
export const swipeCardAnimation = (translateY, direction = 'up') => {
  'worklet'
  
  const target = direction === 'up' ? -1000 : 1000
  
  return withSequence(
    withTiming(target, { duration: 300 }),
    withTiming(0, { duration: 0 }) // Reset for next card
  )
}

/**
 * Fade in animation for loading states
 */
export const fadeInAnimation = (opacity, delay = 0) => {
  'worklet'
  
  return withDelay(
    delay,
    withTiming(1, { duration: ANIMATION_CONSTANTS.MEDIUM_ANIMATION })
  )
}

/**
 * Skeleton shimmer animation
 */
export const shimmerAnimation = (translateX, width) => {
  'worklet'
  
  return withSequence(
    withTiming(width, { duration: 1000 }),
    withTiming(-width, { duration: 0 }),
    withTiming(width, { duration: 1000 })
  )
}

/**
 * Progress bar animation
 */
export const progressBarAnimation = (progress, duration) => {
  'worklet'
  
  return withTiming(progress, { duration })
}

/**
 * Toast slide up animation
 */
export const toastSlideUp = (translateY, opacity) => {
  'worklet'
  
  translateY.value = withSpring(-50, ANIMATION_CONSTANTS.SNAPPY_SPRING)
  opacity.value = withTiming(1, { duration: 200 })
  
  // Auto dismiss after 2 seconds
  setTimeout(() => {
    translateY.value = withSpring(100, ANIMATION_CONSTANTS.GENTLE_SPRING)
    opacity.value = withTiming(0, { duration: 200 })
  }, 2000)
}

/**
 * Share sheet slide up animation
 */
export const shareSheetAnimation = (translateY, show) => {
  'worklet'
  
  return withSpring(
    show ? 0 : 300,
    ANIMATION_CONSTANTS.GENTLE_SPRING
  )
}

/**
 * Video play/pause button animation
 */
export const playPauseAnimation = (scale, opacity) => {
  'worklet'
  
  return withSequence(
    withTiming(0, { duration: 100 }),
    withTiming(1, { duration: 150 })
  )
}

/**
 * Haptic feedback helpers
 */
export const hapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
}

/**
 * Gesture interpolation helpers
 */
export const gestureInterpolation = {
  /**
   * Interpolate swipe gesture to card rotation
   */
  swipeToRotation: (translationY, inputRange = [-200, 0, 200]) => {
    'worklet'
    return interpolate(
      translationY,
      inputRange,
      [-10, 0, 10],
      Extrapolation.CLAMP
    )
  },
  
  /**
   * Interpolate swipe gesture to card scale
   */
  swipeToScale: (translationY, inputRange = [-200, 0, 200]) => {
    'worklet'
    return interpolate(
      translationY,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    )
  },
  
  /**
   * Interpolate swipe gesture to opacity
   */
  swipeToOpacity: (translationY, inputRange = [-200, 0, 200]) => {
    'worklet'
    return interpolate(
      translationY,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolation.CLAMP
    )
  }
}

/**
 * Loading state animations
 */
export const loadingAnimations = {
  /**
   * Pulse animation for loading indicators
   */
  pulse: (scale, opacity) => {
    'worklet'
    
    scale.value = withSequence(
      withTiming(1.1, { duration: 800 }),
      withTiming(1, { duration: 800 })
    )
    
    opacity.value = withSequence(
      withTiming(0.5, { duration: 800 }),
      withTiming(1, { duration: 800 })
    )
  },
  
  /**
   * Rotating animation for spinners
   */
  rotate: (rotation) => {
    'worklet'
    
    rotation.value = withTiming(360, { duration: 1000 }, (finished) => {
      if (finished) {
        rotation.value = 0
      }
    })
  }
}

/**
 * Error state animations
 */
export const errorAnimations = {
  /**
   * Shake animation for error states
   */
  shake: (translateX) => {
    'worklet'
    
    return withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    )
  },
  
  /**
   * Bounce in animation for retry buttons
   */
  bounceIn: (scale, opacity) => {
    'worklet'
    
    scale.value = withSpring(1, ANIMATION_CONSTANTS.BOUNCE_CONFIG)
    opacity.value = withTiming(1, { duration: 200 })
  }
}