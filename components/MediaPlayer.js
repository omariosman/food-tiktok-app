import React, { useState, useEffect, useRef } from 'react'
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function MediaPlayer({ 
  mediaUri, 
  isVideo = false, 
  isActive = true,
  onPress,
  children
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  // Get image dimensions to determine if we need blurred background
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

  const isPortrait = imageDimensions.width > 0 && imageDimensions.height > imageDimensions.width

  const renderVideoPlaceholder = () => (
    <View style={styles.videoPlaceholder}>
      <View style={styles.videoIcon}>
        <Text style={styles.videoIconText}>▶️</Text>
      </View>
      <Text style={styles.videoText}>Video Coming Soon</Text>
      <Text style={styles.videoSubText}>Tap to play when available</Text>
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
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {!imageLoaded && !imageError && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Media Content */}
      {isVideo ? renderVideoPlaceholder() : renderImage()}

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
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
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
})