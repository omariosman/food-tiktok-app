import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform
} from 'react-native'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

interface SwipeInstructionsProps {
  onDismiss: () => void
}

export default function SwipeInstructions({ onDismiss }: SwipeInstructionsProps) {
  const animatedValue = useRef(new Animated.Value(0)).current
  const fadeValue = useRef(new Animated.Value(0)).current
  const useNativeDriver = Platform.OS !== 'web'

  useEffect(() => {
    // Fade in the overlay
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver,
    }).start()

    // Animate the arrow continuously
    const animateArrows = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver,
        }),
      ]).start(() => {
        animateArrows() // Loop the animation
      })
    }

    animateArrows()
  }, [])

  const handleDismiss = () => {
    Animated.timing(fadeValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver,
    }).start(() => {
      onDismiss()
    })
  }

  const arrowTransform = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20]
  })

  const arrowOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 1]
  })

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeValue }]}>
      <TouchableOpacity 
        style={styles.dismissArea} 
        onPress={handleDismiss}
        activeOpacity={1}
      >
        <View style={styles.instructionContainer}>
          {/* Arrow Animation */}
          <Animated.View 
            style={[
              styles.arrowContainer,
              {
                transform: [{ translateX: arrowTransform }],
                opacity: arrowOpacity
              }
            ]}
          >
            <Text style={styles.arrowText}>‹‹</Text>
          </Animated.View>

          {/* Instruction Text */}
          <Text style={styles.instructionText}>
            Swipe left to see more dishes from this restaurant
          </Text>

          {/* Additional Instructions */}
          <View style={styles.additionalInstructions}>
            <Text style={styles.smallText}>Swipe up/down to browse dishes</Text>
            <Text style={styles.smallText}>Double tap to save</Text>
            <Text style={styles.smallText}>Tap anywhere to dismiss</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.8)', // Semi-transparent brown
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dismissArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  instructionContainer: {
    alignItems: 'center'
  },
  arrowContainer: {
    marginBottom: 20
  },
  arrowText: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 30,
    lineHeight: 24,
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  additionalInstructions: {
    alignItems: 'center',
    gap: 8
  },
  smallText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
  }
})