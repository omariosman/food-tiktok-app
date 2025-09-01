import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  View, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text,
  ActivityIndicator 
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Video, ResizeMode } from 'expo-av'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { TapGestureHandler } from 'react-native-gesture-handler'
import { hapticFeedback, playPauseAnimation, progressBarAnimation } from '../utils/feedAnimations'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function EnhancedMediaPlayer({ 
  mediaUri, 
  isVideo = false, 
  isActive = true,
  isMuted = false,
  onPress,
  onVideoPress,
  onVideoLoad,
  onVideoError,
  children
}) {
  // State
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [isMutedLocal, setIsMutedLocal] = useState(isMuted)
  
  // Refs
  const videoRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const progressIntervalRef = useRef(null)
  
  // Animation values
  const loadingOpacity = useSharedValue(1)
  const playButtonScale = useSharedValue(0)
  const playButtonOpacity = useSharedValue(0)
  const controlsOpacity = useSharedValue(0)
  const progressWidth = useSharedValue(0)
  const volumeButtonScale = useSharedValue(1)
  
  // Auto-play when active and video loads
  useEffect(() => {
    if (isVideo && videoLoaded && isActive && videoRef.current) {
      playVideo()
    } else if (isVideo && videoRef.current && !isActive) {
      pauseVideo()
    }
  }, [isVideo, videoLoaded, isActive])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])
  
  // Get image dimensions
  useEffect(() => {
    if (mediaUri && !isVideo) {
      Image.getSize(
        mediaUri,
        (width, height) => {
          setImageDimensions({ width, height })
        },
        () => {
          setImageError(true)
        }
      )
    }
  }, [mediaUri, isVideo])
  
  const playVideo = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.playAsync()
        setIsPlaying(true)
        startProgressTracking()
        hapticFeedback.light()
      } catch (error) {
        console.error('Error playing video:', error)
      }
    }
  }, [])
  
  const pauseVideo = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync()
        setIsPlaying(false)
        stopProgressTracking()
        hapticFeedback.light()
      } catch (error) {
        console.error('Error pausing video:', error)
      }
    }
  }, [])
  
  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pauseVideo()
    } else {
      await playVideo()
    }
    
    // Animate play/pause button
    playButtonOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 150 })
    )
  }, [isPlaying, playVideo, pauseVideo])
  
  const toggleMute = useCallback(async () => {
    if (videoRef.current) {
      try {
        const newMutedState = !isMutedLocal
        await videoRef.current.setIsMutedAsync(newMutedState)
        setIsMutedLocal(newMutedState)
        
        // Animate volume button
        volumeButtonScale.value = withSequence(
          withTiming(1.2, { duration: 100 }),
          withSpring(1, { damping: 20, stiffness: 300 })
        )
        
        hapticFeedback.medium()
      } catch (error) {
        console.error('Error toggling mute:', error)
      }
    }
  }, [isMutedLocal])
  
  const showVideoControls = useCallback(() => {
    if (!isVideo) return
    
    setShowControls(true)
    controlsOpacity.value = withTiming(1, { duration: 200 })
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    // Hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
      controlsOpacity.value = withTiming(0, { duration: 200 })
    }, 3000)
  }, [isVideo])
  
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    progressIntervalRef.current = setInterval(async () => {
      if (videoRef.current && isPlaying) {
        try {
          const status = await videoRef.current.getStatusAsync()
          if (status.isLoaded) {
            const progress = status.positionMillis / status.durationMillis || 0
            progressWidth.value = withTiming(progress, { duration: 200 })
            setCurrentTime(status.positionMillis)
          }
        } catch (error) {
          console.error('Error getting video status:', error)
        }
      }
    }, 100)
  }, [isPlaying])
  
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])
  
  const handleVideoLoad = useCallback((status) => {
    setVideoLoaded(true)
    setVideoDuration(status.durationMillis)
    loadingOpacity.value = withTiming(0, { duration: 300 })
    
    onVideoLoad?.(status)
  }, [onVideoLoad])
  
  const handleVideoError = useCallback((error) => {
    setVideoError(true)
    loadingOpacity.value = withTiming(0, { duration: 300 })
    hapticFeedback.error()
    
    onVideoError?.(error)
  }, [onVideoError])
  
  const handleVideoPress = useCallback(() => {
    showVideoControls()
    togglePlayPause()
    onVideoPress?.()
  }, [showVideoControls, togglePlayPause, onVideoPress])
  
  const formatTime = useCallback((milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])
  
  // Animated styles
  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value
  }))
  
  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: playButtonOpacity.value,
    transform: [{ scale: playButtonScale.value }]
  }))
  
  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value
  }))
  
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`
  }))
  
  const volumeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: volumeButtonScale.value }]
  }))
  
  const isPortrait = imageDimensions.width > 0 && imageDimensions.height > imageDimensions.width
  
  const renderVideo = () => (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: mediaUri }}
        resizeMode={ResizeMode.COVER}
        isLooping={true}
        isMuted={isMutedLocal}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish && status.isLoaded) {
            // Loop the video
            videoRef.current?.replayAsync()
          }
        }}
      />
      
      {/* Video tap overlay */}
      <TouchableOpacity 
        style={styles.videoTapOverlay} 
        onPress={handleVideoPress}
        activeOpacity={1}
      />
      
      {/* Play/Pause indicator */}
      <Animated.View style={[styles.playPauseIndicator, playButtonAnimatedStyle]}>
        <View style={styles.playPauseIcon}>
          <Text style={styles.playPauseText}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </View>
      </Animated.View>
      
      {/* Video controls */}
      {showControls && (
        <Animated.View style={[styles.videoControls, controlsAnimatedStyle]}>
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
            </View>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </Text>
          </View>
          
          {/* Volume button */}
          <AnimatedTouchable 
            style={[styles.volumeButton, volumeButtonAnimatedStyle]}
            onPress={toggleMute}
          >
            <Text style={styles.volumeIcon}>{isMutedLocal ? '🔇' : '🔊'}</Text>
          </AnimatedTouchable>
        </Animated.View>
      )}
    </View>
  )
  
  const renderImage = () => {
    if (imageError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🍽️</Text>
          <Text style={styles.errorText}>Image not available</Text>
        </View>
      )
    }
    
    return (
      <View style={styles.imageContainer}>
        {/* Blurred background for portrait images */}
        {isPortrait && (
          <Image
            source={{ uri: mediaUri }}
            style={styles.backgroundImage}
            blurRadius={20}
            resizeMode="cover"
          />
        )}
        
        {/* Main image */}
        <Image
          source={{ uri: mediaUri }}
          style={isPortrait ? styles.portraitImage : styles.landscapeImage}
          resizeMode={isPortrait ? 'contain' : 'cover'}
          onLoad={() => {
            setImageLoaded(true)
            loadingOpacity.value = withTiming(0, { duration: 300 })
          }}
          onError={() => setImageError(true)}
        />
      </View>
    )
  }
  
  const renderVideoPlaceholder = () => (
    <View style={styles.videoPlaceholder}>
      <View style={styles.videoIcon}>
        <Text style={styles.videoIconText}>▶️</Text>
      </View>
      <Text style={styles.videoText}>Video Coming Soon</Text>
      <Text style={styles.videoSubText}>Tap to play when available</Text>
    </View>
  )
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Media Content */}
      {isVideo && mediaUri ? renderVideo() : 
       mediaUri ? renderImage() : 
       renderVideoPlaceholder()}
      
      {/* Loading indicator */}
      <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
      
      {/* Dark gradient overlay at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)']}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />
      
      {/* Children (overlays, buttons, etc.) */}
      {children}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Video styles
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoTapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  
  // Play/Pause indicator
  playPauseIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playPauseText: {
    fontSize: 24,
  },
  
  // Video controls
  videoControls: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 1.5,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 80,
    textAlign: 'right',
  },
  volumeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeIcon: {
    fontSize: 18,
  },
  
  // Image styles (from original MediaPlayer)
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  landscapeImage: {
    width: '100%',
    height: '100%',
  },
  portraitImage: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
  },
  
  // Loading and error states
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  
  // Video placeholder
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  videoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  videoIconText: {
    fontSize: 40,
  },
  videoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoSubText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Gradient overlay
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
})