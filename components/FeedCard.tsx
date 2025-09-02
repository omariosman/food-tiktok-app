import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native'
import MediaPlayer from './MediaPlayer'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

interface FeedData {
  id: string
  mediaUri: string
  mediaType: 'image' | 'video'
  dishName: string
  description: string
  restaurantName: string
  deliveryTime: string
  googleRating: number
  googleReviews: number
  deliveryRating: number
  deliveryReviews: number
  price: number
  reviewCount: number
}

interface FeedCardProps {
  data: FeedData
  onDoubleTap: () => void
  onLongPress: () => void
  onSave: () => void
  onReviews: () => void
  onShare: () => void
  onMenuPress: () => void
  onAddToCart: () => void
}

export default function FeedCard({
  data,
  onDoubleTap,
  onLongPress,
  onSave,
  onReviews,
  onShare,
  onMenuPress,
  onAddToCart
}: FeedCardProps) {
  return (
    <MediaPlayer
      mediaUri={data.mediaUri}
      mediaType={data.mediaType}
      onDoubleTap={onDoubleTap}
      onLongPress={onLongPress}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationText}>📍 Allow access to location</Text>
          </TouchableOpacity>

          <View style={styles.topRightButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side Action Buttons */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onSave}>
            <View style={styles.actionButtonCircle}>
              <Text style={styles.actionIcon}>🔖</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onReviews}>
            <View style={styles.actionButtonCircle}>
              <Text style={styles.actionIcon}>💬</Text>
            </View>
            <Text style={styles.actionText}>{data.reviewCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <View style={styles.actionButtonCircle}>
              <Text style={styles.actionIcon}>📤</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          {/* Dish Information */}
          <View style={styles.dishInfo}>
            <Text style={styles.dishName} numberOfLines={1}>
              {data.dishName}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {data.description}
            </Text>
            
            <View style={styles.restaurantRow}>
              <Text style={styles.restaurantIcon}>🏪</Text>
              <Text style={styles.restaurantName}>{data.restaurantName}</Text>
              <Text style={styles.deliveryTime}>• {data.deliveryTime}</Text>
            </View>

            {/* Rating Badges */}
            <View style={styles.ratingsContainer}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  {data.googleRating}⭐ {data.googleReviews}+
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  {data.deliveryRating}⭐ {data.deliveryReviews}+
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Action Bar */}
          <View style={styles.bottomActionBar}>
            <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
              <Text style={styles.menuIcon}>⚏</Text>
            </TouchableOpacity>

            <View style={styles.priceAndCart}>
              <Text style={styles.price}>${data.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.addToCartButton} onPress={onAddToCart}>
                <Text style={styles.addToCartText}>Add to cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </MediaPlayer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10
  },
  locationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)'
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: 10
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)'
  },
  iconText: {
    fontSize: 18
  },
  rightActions: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -120 }],
    alignItems: 'center',
    gap: 20,
    zIndex: 10
  },
  actionButton: {
    alignItems: 'center',
    gap: 5
  },
  actionButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5
  },
  actionIcon: {
    fontSize: 20
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    zIndex: 10
  },
  dishInfo: {
    marginBottom: 20
  },
  dishName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  description: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    marginBottom: 12,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  restaurantIcon: {
    fontSize: 16,
    marginRight: 6
  },
  restaurantName: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  deliveryTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  ratingsContainer: {
    flexDirection: 'row',
    gap: 10
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(10px)'
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)'
  },
  menuIcon: {
    fontSize: 20,
    color: 'white'
  },
  priceAndCart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  addToCartButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
})