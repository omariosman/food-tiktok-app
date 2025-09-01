import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  StatusBar
} from 'react-native'
// Note: expo-blur might need to be installed - using fallback for now
import MediaPlayer from './MediaPlayer'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function FeedCard({
  dish,
  isActive = true,
  onSave,
  onShare,
  onReviews,
  onAddToCart,
  onMenu,
  onLocationPress,
  onFilterPress,
  onSearchPress
}) {
  const [isSaved, setIsSaved] = useState(dish?.isSaved || false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.(dish)
  }

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price || '0.00'
  }

  return (
    <View style={styles.container}>
      <MediaPlayer
        mediaUri={dish?.imageUrl || dish?.videoUrl}
        isVideo={!!dish?.videoUrl}
        isActive={isActive}
      >
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
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <View style={[styles.actionCircle, isSaved && styles.actionCircleSaved]}>
              <Text style={styles.rightActionIcon}>{isSaved ? '❤️' : '🤍'}</Text>
            </View>
            <Text style={styles.actionLabel}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => onReviews?.(dish)}>
            <View style={styles.actionCircle}>
              <Text style={styles.rightActionIcon}>💬</Text>
            </View>
            <Text style={styles.actionLabel}>{dish?.reviewCount || '24'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => onShare?.(dish)}>
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

          <TouchableOpacity 
            style={styles.addToCartButton} 
            onPress={() => onAddToCart?.(dish)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </MediaPlayer>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
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
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
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
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})