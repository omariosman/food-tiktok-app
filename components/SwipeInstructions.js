import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function SwipeInstructions({ visible, onDismiss }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const arrowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Fade in the overlay
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start()

      // Start arrow animation
      startArrowAnimation()
    } else {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [visible])

  const startArrowAnimation = () => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
  }

  const arrowTranslateX = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  })

  const arrowOpacity = arrowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 1],
  })

  if (!visible) return null

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.touchableArea}
        onPress={onDismiss}
        activeOpacity={1}
      >
        <View style={styles.instructionsContainer}>
          {/* Arrow Animation */}
          <View style={styles.arrowContainer}>
            <Animated.View 
              style={[
                styles.arrowWrapper,
                {
                  transform: [{ translateX: arrowTranslateX }],
                  opacity: arrowOpacity,
                }
              ]}
            >
              <Text style={styles.arrows}>‹‹</Text>
            </Animated.View>
          </View>

          {/* Main instruction text */}
          <Text style={styles.mainText}>Swipe left to see more dishes</Text>
          <Text style={styles.mainText}>from this restaurant</Text>

          {/* Additional instructions */}
          <View style={styles.additionalInstructions}>
            <View style={styles.instructionRow}>
              <Text style={styles.gestureIcon}>↑</Text>
              <Text style={styles.instructionText}>Swipe up for next dish</Text>
            </View>
            <View style={styles.instructionRow}>
              <Text style={styles.gestureIcon}>↓</Text>
              <Text style={styles.instructionText}>Swipe down for previous</Text>
            </View>
            <View style={styles.instructionRow}>
              <Text style={styles.gestureIcon}>💖</Text>
              <Text style={styles.instructionText}>Double tap to save</Text>
            </View>
          </View>

          {/* Dismiss button */}
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>Got it!</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(101, 67, 33, 0.85)', // Semi-transparent brown
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  touchableArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  arrowContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  arrowWrapper: {
    alignItems: 'center',
  },
  arrows: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 26,
  },
  additionalInstructions: {
    marginTop: 30,
    marginBottom: 30,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  gestureIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
    marginRight: 15,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dismissButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 30,
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
  dismissButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
})