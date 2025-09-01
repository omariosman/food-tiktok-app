import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'

export default function SavedDishCard({ 
  imageUri,
  restaurantName,
  dishName,
  restaurantRating,
  deliveryRating,
  deliveryTime = '20',
  deliveryFee = '0',
  price,
  onPress,
  onBookmarkPress
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        {/* Bookmark Icon */}
        <TouchableOpacity style={styles.bookmarkButton} onPress={onBookmarkPress}>
          <Text style={styles.bookmarkIcon}>⭐</Text>
        </TouchableOpacity>

        {/* Rating Badges */}
        <View style={styles.badgesContainer}>
          <View style={styles.ratingBadge}>
            <Text style={styles.forkIcon}>🍴</Text>
            <Text style={styles.ratingText}>{restaurantRating}</Text>
          </View>
          
          <View style={styles.ratingBadge}>
            <Text style={styles.deliveryIcon}>🚗</Text>
            <Text style={styles.ratingText}>{deliveryRating}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
        <Text style={styles.dishName}>{dishName}</Text>
        <Text style={styles.deliveryInfo}>
          {deliveryTime} min • ${deliveryFee} Delivery Fee
        </Text>
        <Text style={styles.price}>${price}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'space-between',
  },
  image: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIcon: {
    fontSize: 16,
    color: '#facc15',
  },
  badgesContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  forkIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  deliveryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardContent: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 22,
  },
  deliveryInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
})