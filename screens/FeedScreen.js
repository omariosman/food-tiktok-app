import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Alert,
  Share,
  Modal,
  TextInput,
} from 'react-native'
import { useSaved } from '../contexts/SavedContext'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const MOCK_DATA = [
  {
    id: '1',
    name: 'Plantega',
    deliveryTime: '30 min',
    meals: [
      {
        id: '1-1',
        name: 'Chicken Parm Sub (VEGAN)',
        description: 'Daring Gluten-Free Breaded Plant Chicken Tenders, Marinara, Cashew Mozzarella, Fresh Basil on Artisan Roll',
        price: 17.00,
        rating: 4.0,
        reviews: 0,
        videoUrl: 'https://picsum.photos/400/800?random=1',
        image: 'https://picsum.photos/400/800?random=1'
      },
      {
        id: '1-2',
        name: 'Buffalo Cauliflower Wrap',
        description: 'Crispy buffalo cauliflower with ranch, lettuce, tomato in spinach wrap',
        price: 14.00,
        rating: 4.2,
        reviews: 12,
        videoUrl: 'https://picsum.photos/400/800?random=2',
        image: 'https://picsum.photos/400/800?random=2'
      }
    ]
  },
  {
    id: '2',
    name: 'Green Goddess',
    deliveryTime: '25 min',
    meals: [
      {
        id: '2-1',
        name: 'Buddha Bowl Supreme',
        description: 'Quinoa, roasted vegetables, avocado, tahini dressing',
        price: 16.00,
        rating: 4.5,
        reviews: 24,
        videoUrl: 'https://picsum.photos/400/800?random=3',
        image: 'https://picsum.photos/400/800?random=3'
      },
      {
        id: '2-2',
        name: 'Acai Power Bowl',
        description: 'Acai, granola, fresh berries, coconut flakes, honey',
        price: 12.00,
        rating: 4.3,
        reviews: 18,
        videoUrl: 'https://picsum.photos/400/800?random=4',
        image: 'https://picsum.photos/400/800?random=4'
      }
    ]
  },
  {
    id: '3',
    name: 'Taco Libre',
    deliveryTime: '20 min',
    meals: [
      {
        id: '3-1',
        name: 'Plant-Based Fish Tacos',
        description: 'Beer-battered hearts of palm, cabbage slaw, lime crema',
        price: 15.00,
        rating: 4.1,
        reviews: 31,
        videoUrl: 'https://picsum.photos/400/800?random=5',
        image: 'https://picsum.photos/400/800?random=5'
      }
    ]
  }
]

export default function FeedScreen({ navigation }) {
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0)
  const [currentMealIndices, setCurrentMealIndices] = useState({})
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [reviews, setReviews] = useState({})
  const restaurantListRef = useRef(null)
  const bookmarkAnimValue = useRef(new Animated.Value(1)).current
  const { toggleSave, isSaved } = useSaved()

  const getCurrentMealIndex = (restaurantId) => {
    return currentMealIndices[restaurantId] || 0
  }

  const handleMealScroll = (restaurantId, mealIndex) => {
    setCurrentMealIndices(prev => ({
      ...prev,
      [restaurantId]: mealIndex
    }))
  }

  const handleSavePress = (meal, restaurant) => {
    // Animate the bookmark button
    Animated.sequence([
      Animated.timing(bookmarkAnimValue, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkAnimValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()

    toggleSave(meal, restaurant)

    // Show toast notification
    const isCurrentlySaved = isSaved(meal.id, restaurant.id)
    Alert.alert(
      isCurrentlySaved ? 'Removed from Saved' : 'Added to Saved',
      isCurrentlySaved ? `${meal.name} removed from your saved meals` : `${meal.name} added to your saved meals`,
      [{ text: 'OK', style: 'default' }],
      { duration: 2000 }
    )
  }

  const handleSharePress = async (meal, restaurant) => {
    try {
      const shareMessage = `Check out this delicious ${meal.name} from ${restaurant.name}!\n\nPrice: $${meal.price.toFixed(2)}\nRating: ${meal.rating} stars\n\n${meal.description}`
      
      await Share.share({
        message: shareMessage,
        title: `${meal.name} - ${restaurant.name}`,
      })
    } catch (error) {
      console.error('Error sharing meal:', error)
      Alert.alert('Error', 'Unable to share this meal. Please try again.')
    }
  }

  const handleReviewPress = (meal, restaurant) => {
    setSelectedMeal(meal)
    setSelectedRestaurant(restaurant)
    setReviewModalVisible(true)
  }

  const getMealReviews = (mealId, restaurantId) => {
    const key = `${mealId}-${restaurantId}`
    return reviews[key] || []
  }

  const addReview = (rating, comment) => {
    const key = `${selectedMeal.id}-${selectedRestaurant.id}`
    const newReview = {
      id: Date.now(),
      rating,
      comment,
      date: new Date().toLocaleDateString(),
      user: 'You'
    }
    
    setReviews(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newReview]
    }))
    
    setReviewModalVisible(false)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★')
    }
    if (hasHalfStar) {
      stars.push('☆')
    }
    while (stars.length < 5) {
      stars.push('☆')
    }
    
    return stars.join('')
  }

  const renderRatingStars = (rating, onRatingPress, size = 20) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => onRatingPress?.(i)}>
          <Text style={[styles.ratingStar, { fontSize: size, color: i <= rating ? '#FFD700' : '#ccc' }]}>
            ★
          </Text>
        </TouchableOpacity>
      )
    }
    return <View style={styles.starContainer}>{stars}</View>
  }

  const ReviewModal = () => {
    const [userRating, setUserRating] = useState(0)
    const [userComment, setUserComment] = useState('')
    const mealReviews = selectedMeal && selectedRestaurant ? getMealReviews(selectedMeal.id, selectedRestaurant.id) : []

    const handleSubmitReview = () => {
      if (userRating === 0) {
        Alert.alert('Rating Required', 'Please select a rating before submitting.')
        return
      }
      addReview(userRating, userComment)
      setUserRating(0)
      setUserComment('')
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reviews</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            {selectedMeal && (
              <Text style={styles.modalMealName}>{selectedMeal.name}</Text>
            )}
            
            <ScrollView style={styles.reviewsList}>
              {mealReviews.length > 0 ? (
                mealReviews.map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewUser}>{review.user}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <View style={styles.reviewRating}>
                      {renderRatingStars(review.rating, null, 16)}
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
              )}
            </ScrollView>
            
            <View style={styles.addReviewSection}>
              <Text style={styles.addReviewTitle}>Add Your Review</Text>
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                {renderRatingStars(userRating, setUserRating, 24)}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Write your review (optional)"
                placeholderTextColor="#999"
                value={userComment}
                onChangeText={setUserComment}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitReview}
              >
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  const renderRestaurantItem = ({ item: restaurant, index }) => {
    const currentMealIndex = getCurrentMealIndex(restaurant.id)
    const currentMeal = restaurant.meals[currentMealIndex]
    const isCurrentMealSaved = isSaved(currentMeal.id, restaurant.id)

    return (
      <View style={styles.restaurantContainer}>
        <StatusBar hidden />
        
        {/* Full Screen Video/Image */}
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: currentMeal.image }} 
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          
          {/* Dark overlay for better text readability */}
          <View style={styles.darkOverlay} />
        </View>

        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          <Animated.View style={{ transform: [{ scale: bookmarkAnimValue }] }}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSavePress(currentMeal, restaurant)}
            >
              <Text style={[
                styles.bookmarkIcon,
                { color: isCurrentMealSaved ? '#FFD700' : '#fff' }
              ]}>
                {isCurrentMealSaved ? '★' : '🔖'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.reviewsContainer}
            onPress={() => handleReviewPress(currentMeal, restaurant)}
          >
            <Text style={styles.reviewsText}>Reviews</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSharePress(currentMeal, restaurant)}
          >
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Overlay - Meal Info */}
        <View style={styles.bottomOverlay}>
          {/* Meal Name and Description */}
          <View style={styles.mealInfoContainer}>
            <Text style={styles.mealName}>{currentMeal.name}</Text>
            <Text style={styles.mealDescription}>{currentMeal.description}</Text>
            
            {/* Restaurant Info Row */}
            <View style={styles.restaurantRow}>
              <View style={styles.restaurantIconContainer}>
                <Text style={styles.restaurantIcon}>🏪</Text>
              </View>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
            </View>
            
            {/* Rating Row */}
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>{renderStars(currentMeal.rating)}</Text>
              <Text style={styles.ratingText}>{currentMeal.rating}</Text>
              <Text style={styles.reviewCount}>({currentMeal.reviews}+ reviews)</Text>
            </View>
          </View>

          {/* Meal Position Dots (if multiple meals) */}
          {restaurant.meals.length > 1 && (
            <View style={styles.dotIndicators}>
              {restaurant.meals.map((_, mealIndex) => (
                <View
                  key={mealIndex}
                  style={[
                    styles.dot,
                    mealIndex === currentMealIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
          )}

          {/* Bottom Buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navigation.navigate('Restaurant', { restaurant })}
            >
              <Text style={styles.menuIcon}>📋</Text>
              <Text style={styles.menuText}>Menu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.cartIcon}>🛒</Text>
              <Text style={styles.addToCartText}>Add to cart ${currentMeal.price.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hidden Horizontal Scroll for Meal Navigation */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const mealIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH)
            handleMealScroll(restaurant.id, mealIndex)
          }}
          style={styles.hiddenMealScroll}
        >
          {restaurant.meals.map((meal, mealIndex) => (
            <View key={meal.id} style={styles.hiddenMealItem} />
          ))}
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={restaurantListRef}
        data={MOCK_DATA}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / SCREEN_HEIGHT)
          setCurrentRestaurantIndex(index)
        }}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
      <ReviewModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  restaurantContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    zIndex: 2,
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookmarkIcon: {
    fontSize: 24,
    color: '#fff',
  },
  shareIcon: {
    fontSize: 22,
    color: '#fff',
  },
  reviewsContainer: {
    marginBottom: 16,
  },
  reviewsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 80,
    zIndex: 2,
  },
  mealInfoContainer: {
    marginBottom: 16,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 28,
  },
  mealDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 18,
    marginBottom: 12,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  restaurantIcon: {
    fontSize: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 12,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#ccc',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 6,
  },
  reviewCount: {
    fontSize: 14,
    color: '#ccc',
  },
  dotIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  menuButton: {
    flex: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addToCartButton: {
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8C00',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cartIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  hiddenMealScroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  hiddenMealItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: SCREEN_WIDTH - 40,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 30,
    color: '#666',
    fontWeight: 'bold',
  },
  modalMealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  noReviews: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  addReviewSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    marginHorizontal: 2,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})