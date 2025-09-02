import React, { useState, useRef } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated
} from 'react-native'

import FeedCard from '../components/FeedCard'
import SwipeInstructions from '../components/SwipeInstructions'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

// Mock data for the feed
const mockFeedData = [
  {
    id: '1',
    mediaUri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=600&fit=crop',
    mediaType: 'image' as const,
    dishName: 'Truffle Pasta Carbonara',
    description: 'Creamy carbonara with truffle shavings and crispy pancetta',
    restaurantName: 'Mama Mia Trattoria',
    deliveryTime: '25 min',
    googleRating: 4.5,
    googleReviews: 500,
    deliveryRating: 4.2,
    deliveryReviews: 100,
    price: 26.00,
    reviewCount: 45
  },
  {
    id: '2',
    mediaUri: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=600&fit=crop',
    mediaType: 'image' as const,
    dishName: 'BBQ Bacon Cheeseburger',
    description: 'Double patty with crispy bacon, aged cheddar, and BBQ sauce',
    restaurantName: 'The Burger Joint',
    deliveryTime: '30 min',
    googleRating: 4.7,
    googleReviews: 1200,
    deliveryRating: 4.4,
    deliveryReviews: 250,
    price: 18.99,
    reviewCount: 78
  },
  {
    id: '3',
    mediaUri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=600&fit=crop',
    mediaType: 'image' as const,
    dishName: 'Salmon Teriyaki Bowl',
    description: 'Grilled salmon with teriyaki glaze over jasmine rice',
    restaurantName: 'Tokyo Kitchen',
    deliveryTime: '35 min',
    googleRating: 4.3,
    googleReviews: 800,
    deliveryRating: 4.1,
    deliveryReviews: 150,
    price: 22.50,
    reviewCount: 92
  }
]

export default function FeedScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)
  const pan = useRef(new Animated.ValueXY()).current

  const goToNext = () => {
    if (currentIndex < mockFeedData.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSwipeLeft = () => {
    console.log('Swipe left: Show more from restaurant')
    // TODO: Implement show more from restaurant
  }

  const handleDoubleTap = () => {
    console.log('Double tap: Like/Save')
    // TODO: Implement like/save functionality
  }

  const handleLongPress = () => {
    console.log('Long press: Show details')
    // TODO: Implement show details functionality
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      })
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset()

      const { dx, dy, vx, vy } = gestureState
      const shouldGoToNext = dy < -50 && vy < -0.5
      const shouldGoToPrevious = dy > 50 && vy > 0.5
      const shouldSwipeLeft = Math.abs(dx) > 100 && dx < 0

      if (shouldSwipeLeft) {
        handleSwipeLeft()
      } else if (shouldGoToNext) {
        goToNext()
      } else if (shouldGoToPrevious) {
        goToPrevious()
      }

      // Reset position
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start()
    },
  })

  const currentItem = mockFeedData[currentIndex]

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.feedContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <FeedCard
          key={currentItem.id}
          data={currentItem}
          onDoubleTap={handleDoubleTap}
          onLongPress={handleLongPress}
          onSave={() => console.log('Save pressed')}
          onReviews={() => console.log('Reviews pressed')}
          onShare={() => console.log('Share pressed')}
          onMenuPress={() => console.log('Menu pressed')}
          onAddToCart={() => console.log('Add to cart pressed')}
        />
      </Animated.View>

      {showInstructions && (
        <SwipeInstructions onDismiss={() => setShowInstructions(false)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  feedContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  }
})