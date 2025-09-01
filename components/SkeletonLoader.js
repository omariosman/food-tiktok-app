import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

/**
 * Individual skeleton element with shimmer effect
 */
const SkeletonElement = ({ style, shimmer = true }) => {
  const shimmerValue = useSharedValue(0)
  
  useEffect(() => {
    if (shimmer) {
      shimmerValue.value = withRepeat(
        withTiming(1, { duration: 1200 }),
        -1,
        false
      )
    }
  }, [shimmer])
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH],
      Extrapolation.CLAMP
    )
    
    return {
      transform: [{ translateX }]
    }
  })
  
  return (
    <View style={[styles.skeletonBase, style]}>
      {shimmer && (
        <AnimatedLinearGradient
          colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.shimmerGradient, shimmerAnimatedStyle]}
        />
      )}
    </View>
  )
}

/**
 * Skeleton loader for feed cards
 */
export const FeedCardSkeleton = () => {
  return (
    <View style={styles.feedSkeletonContainer}>
      {/* Main image placeholder */}
      <SkeletonElement style={styles.imageSkeleton} />
      
      {/* Top navigation skeleton */}
      <View style={styles.topNavSkeleton}>
        <SkeletonElement style={styles.locationSkeleton} />
        <View style={styles.topActionsSkeleton}>
          <SkeletonElement style={styles.actionButtonSkeleton} />
          <SkeletonElement style={styles.actionButtonSkeleton} />
        </View>
      </View>
      
      {/* Bottom info skeleton */}
      <View style={styles.bottomInfoSkeleton}>
        <View style={styles.dishInfoSkeleton}>
          <SkeletonElement style={styles.dishNameSkeleton} />
          <SkeletonElement style={styles.dishDescSkeleton} />
          <SkeletonElement style={styles.restaurantInfoSkeleton} />
          
          {/* Rating badges skeleton */}
          <View style={styles.ratingsSkeleton}>
            <SkeletonElement style={styles.ratingBadgeSkeleton} />
            <SkeletonElement style={styles.ratingBadgeSkeleton} />
          </View>
        </View>
        
        {/* Right action buttons skeleton */}
        <View style={styles.rightActionsSkeleton}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.actionButtonContainer}>
              <SkeletonElement style={styles.actionCircleSkeleton} />
              <SkeletonElement style={styles.actionLabelSkeleton} />
            </View>
          ))}
        </View>
      </View>
      
      {/* Bottom action bar skeleton */}
      <View style={styles.bottomActionsSkeleton}>
        <SkeletonElement style={styles.menuButtonSkeleton} />
        <SkeletonElement style={styles.priceSkeleton} />
        <SkeletonElement style={styles.addToCartSkeleton} />
      </View>
    </View>
  )
}

/**
 * Skeleton loader for list items
 */
export const ListItemSkeleton = ({ count = 5 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.listItemSkeleton}>
          <SkeletonElement style={styles.listImageSkeleton} />
          <View style={styles.listContentSkeleton}>
            <SkeletonElement style={styles.listTitleSkeleton} />
            <SkeletonElement style={styles.listSubtitleSkeleton} />
            <SkeletonElement style={styles.listPriceSkeleton} />
          </View>
          <SkeletonElement style={styles.listActionSkeleton} />
        </View>
      ))}
    </View>
  )
}

/**
 * Skeleton for search results
 */
export const SearchResultsSkeleton = () => {
  return (
    <View style={styles.searchContainer}>
      {/* Search suggestions */}
      <View style={styles.searchSuggestionsSkeleton}>
        {[1, 2, 3, 4].map((item) => (
          <SkeletonElement key={item} style={styles.suggestionSkeleton} />
        ))}
      </View>
      
      {/* Results */}
      <ListItemSkeleton count={8} />
    </View>
  )
}

/**
 * Generic loading overlay with pulse effect
 */
export const LoadingOverlay = ({ visible = true }) => {
  const pulseValue = useSharedValue(0.3)
  
  useEffect(() => {
    if (visible) {
      pulseValue.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      )
    }
  }, [visible])
  
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseValue.value
  }))
  
  if (!visible) return null
  
  return (
    <View style={styles.loadingOverlay}>
      <Animated.View style={[styles.loadingContent, pulseAnimatedStyle]}>
        <View style={styles.loadingSpinner}>
          <SkeletonElement style={styles.spinnerElement} shimmer={false} />
        </View>
      </Animated.View>
    </View>
  )
}

/**
 * Progressive image loader with blur effect
 */
export const ProgressiveImage = ({ 
  source, 
  style, 
  thumbnailSource, 
  onLoad, 
  onError,
  resizeMode = 'cover' 
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [thumbnailLoaded, setThumbnailLoaded] = React.useState(false)
  
  const imageOpacity = useSharedValue(0)
  const thumbnailOpacity = useSharedValue(0)
  
  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true)
    thumbnailOpacity.value = withTiming(1, { duration: 200 })
  }
  
  const handleImageLoad = () => {
    setImageLoaded(true)
    imageOpacity.value = withTiming(1, { duration: 300 })
    onLoad?.()
  }
  
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value
  }))
  
  const thumbnailAnimatedStyle = useAnimatedStyle(() => ({
    opacity: thumbnailOpacity.value
  }))
  
  return (
    <View style={style}>
      {/* Skeleton while loading */}
      {!thumbnailLoaded && <SkeletonElement style={StyleSheet.absoluteFill} />}
      
      {/* Low quality thumbnail */}
      {thumbnailSource && (
        <Animated.Image
          source={thumbnailSource}
          style={[StyleSheet.absoluteFill, thumbnailAnimatedStyle]}
          onLoad={handleThumbnailLoad}
          blurRadius={2}
          resizeMode={resizeMode}
        />
      )}
      
      {/* High quality image */}
      <Animated.Image
        source={source}
        style={[StyleSheet.absoluteFill, imageAnimatedStyle]}
        onLoad={handleImageLoad}
        onError={onError}
        resizeMode={resizeMode}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  // Base skeleton styles
  skeletonBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
  },
  
  // Feed card skeleton
  feedSkeletonContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  imageSkeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  
  // Top navigation skeleton
  topNavSkeleton: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationSkeleton: {
    width: 180,
    height: 40,
    borderRadius: 20,
  },
  topActionsSkeleton: {
    flexDirection: 'row',
  },
  actionButtonSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 12,
  },
  
  // Bottom info skeleton
  bottomInfoSkeleton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
  },
  dishInfoSkeleton: {
    flex: 1,
    marginRight: 80,
  },
  dishNameSkeleton: {
    width: '80%',
    height: 28,
    marginBottom: 8,
  },
  dishDescSkeleton: {
    width: '100%',
    height: 16,
    marginBottom: 4,
  },
  restaurantInfoSkeleton: {
    width: '60%',
    height: 14,
    marginBottom: 12,
  },
  ratingsSkeleton: {
    flexDirection: 'row',
  },
  ratingBadgeSkeleton: {
    width: 60,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  
  // Right actions skeleton
  rightActionsSkeleton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  actionButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionCircleSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 4,
  },
  actionLabelSkeleton: {
    width: 30,
    height: 12,
    borderRadius: 6,
  },
  
  // Bottom actions skeleton
  bottomActionsSkeleton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButtonSkeleton: {
    width: 80,
    height: 36,
    borderRadius: 12,
    marginRight: 12,
  },
  priceSkeleton: {
    width: 60,
    height: 20,
    borderRadius: 10,
    flex: 1,
    alignSelf: 'center',
  },
  addToCartSkeleton: {
    width: 100,
    height: 36,
    borderRadius: 18,
  },
  
  // List skeleton
  listContainer: {
    padding: 20,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  listImageSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  listContentSkeleton: {
    flex: 1,
  },
  listTitleSkeleton: {
    width: '80%',
    height: 16,
    marginBottom: 6,
  },
  listSubtitleSkeleton: {
    width: '60%',
    height: 12,
    marginBottom: 6,
  },
  listPriceSkeleton: {
    width: '40%',
    height: 14,
  },
  listActionSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  // Search skeleton
  searchContainer: {
    flex: 1,
    padding: 20,
  },
  searchSuggestionsSkeleton: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  suggestionSkeleton: {
    width: 80,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 60,
    height: 60,
  },
  spinnerElement: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
})