import React, { useState, useRef } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  TouchableOpacity,
  Text
} from 'react-native'
import { Video, AVPlaybackStatus } from 'expo-av'
import { LinearGradient } from 'expo-linear-gradient'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

interface MediaPlayerProps {
  mediaUri: string
  mediaType: 'image' | 'video'
  onDoubleTap?: () => void
  onLongPress?: () => void
  children?: React.ReactNode
}

export default function MediaPlayer({
  mediaUri,
  mediaType,
  onDoubleTap,
  onLongPress,
  children
}: MediaPlayerProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<Video>(null)
  const lastTap = useRef<number | null>(null)

  const handleTap = () => {
    const now = Date.now()
    const DOUBLE_PRESS_DELAY = 300

    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      onDoubleTap?.()
    }
    lastTap.current = now
  }

  const handleVideoLoad = () => {
    setIsLoading(false)
  }

  const handleVideoError = (error: string) => {
    console.error('Video error:', error)
    setIsLoading(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  if (mediaType === 'video') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={handleTap}
          onLongPress={onLongPress}
          delayLongPress={500}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: mediaUri }}
            shouldPlay={true}
            isLooping={true}
            isMuted={isMuted}
            resizeMode="cover"
            onLoad={handleVideoLoad}
            onError={handleVideoError}
          />

          {/* Mute/Unmute button */}
          <TouchableOpacity style={styles.soundButton} onPress={toggleMute}>
            <View style={styles.soundButtonCircle}>
              <Text style={styles.soundIcon}>
                {isMuted ? '🔇' : '🔊'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Dark gradient overlay at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
            pointerEvents="none"
          />

          {children}
        </TouchableOpacity>
      </View>
    )
  }

  // For images
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={handleTap}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={1}
      >
        <Image
          source={{ uri: mediaUri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setIsLoading(false)}
        />

        {/* Blurred background for portrait images */}
        <ImageBackground
          source={{ uri: mediaUri }}
          style={styles.blurredBackground}
          blurRadius={20}
          resizeMode="cover"
        />

        {/* Dark gradient overlay at bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
          pointerEvents="none"
        />

        {children}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000'
  },
  touchableArea: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 2
  },
  blurredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.4,
    zIndex: 3
  },
  soundButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 4
  },
  soundButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  soundIcon: {
    fontSize: 20
  }
})