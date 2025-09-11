import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native'
import { useCart } from '../contexts/CartContext'
import { useSaved } from '../contexts/SavedContext'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function RestaurantScreen({ route, navigation }) {
  const { restaurant } = route.params
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [reviews, setReviews] = useState({})
  const categoryScrollRef = useRef(null)
  const { addToCart } = useCart()
  const { toggleSave, isSaved } = useSaved()

  // Sample expanded menu data with categories
  const menuCategories = [
    {
      id: 0,
      name: 'Popular',
      meals: restaurant.meals || []
    },
    {
      id: 1,
      name: 'Appetizers',
      meals: [
        {
          id: 'app1',
          name: 'Buffalo Wings',
          description: 'Spicy buffalo wings with blue cheese dipping sauce',
          price: 12.99,
          rating: 4.2,
          reviews: 18,
          image: 'https://picsum.photos/300/200?random=10'
        },
        {
          id: 'app2',
          name: 'Loaded Nachos',
          description: 'Crispy tortilla chips with cheese, jalapeños, and sour cream',
          price: 9.99,
          rating: 4.0,
          reviews: 12,
          image: 'https://picsum.photos/300/200?random=11'
        }
      ]
    },
    {
      id: 2,
      name: 'Mains',
      meals: [
        {
          id: 'main1',
          name: 'Grilled Salmon',
          description: 'Fresh atlantic salmon with seasonal vegetables',
          price: 24.99,
          rating: 4.5,
          reviews: 32,
          image: 'https://picsum.photos/300/200?random=12'
        },
        {
          id: 'main2',
          name: 'Ribeye Steak',
          description: 'Premium ribeye steak cooked to perfection',
          price: 29.99,
          rating: 4.7,
          reviews: 45,
          image: 'https://picsum.photos/300/200?random=13'
        }
      ]
    },
    {
      id: 3,
      name: 'Desserts',
      meals: [
        {
          id: 'dessert1',
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate cake with molten center',
          price: 8.99,
          rating: 4.6,
          reviews: 28,
          image: 'https://picsum.photos/300/200?random=14'
        }
      ]
    }
  ]

  const handleAddToCart = (meal) => {
    addToCart(meal, 1, restaurant)
    Alert.alert('Added to Cart', `${meal.name} has been added to your cart!`)
  }

  const handleSavePress = (meal) => {
    toggleSave(meal, restaurant)
    const isCurrentlySaved = isSaved(meal.id, restaurant.id)
    Alert.alert(
      isCurrentlySaved ? 'Removed from Saved' : 'Added to Saved',
      isCurrentlySaved ? `${meal.name} removed from your saved meals` : `${meal.name} added to your saved meals`
    )
  }

  const handleReviewPress = (meal) => {
    setSelectedMeal(meal)
    setReviewModalVisible(true)
  }

  const getMealReviews = (mealId) => {
    return reviews[mealId] || []
  }

  const addReview = (rating, comment) => {
    const newReview = {
      id: Date.now(),
      rating,
      comment,
      date: new Date().toLocaleDateString(),
      user: 'You'
    }
    
    setReviews(prev => ({
      ...prev,
      [selectedMeal.id]: [...(prev[selectedMeal.id] || []), newReview]
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
    const mealReviews = selectedMeal ? getMealReviews(selectedMeal.id) : []

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

  const renderMealItem = ({ item: meal }) => {
    const isCurrentMealSaved = isSaved(meal.id, restaurant.id)
    
    return (
      <View style={styles.mealCard}>
        <Image source={{ uri: meal.image }} style={styles.mealImage} />
        
        <View style={styles.mealContent}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <TouchableOpacity
              onPress={() => handleSavePress(meal)}
              style={styles.saveButton}
            >
              <Text style={[
                styles.saveIcon,
                { color: isCurrentMealSaved ? '#FFD700' : '#ccc' }
              ]}>
                {isCurrentMealSaved ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.mealDescription}>{meal.description}</Text>
          
          <View style={styles.mealInfo}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>{renderStars(meal.rating)}</Text>
              <Text style={styles.ratingText}>{meal.rating}</Text>
              <TouchableOpacity onPress={() => handleReviewPress(meal)}>
                <Text style={styles.reviewsLink}>({meal.reviews} reviews)</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.mealPrice}>${meal.price.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(meal)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartButton}
        >
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Restaurant Header */}
        <View style={styles.restaurantHeader}>
          <Image
            source={{ uri: restaurant.meals?.[0]?.image || 'https://picsum.photos/400/200?random=8' }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantOverlay}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.restaurantInfo}>
              <Text style={styles.deliveryTime}>🚚 {restaurant.deliveryTime || '30 min'}</Text>
              <Text style={styles.restaurantRating}>⭐ 4.5 (200+ reviews)</Text>
            </View>
          </View>
        </View>

        {/* Restaurant Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📍</Text>
            <View>
              <Text style={styles.detailTitle}>Location</Text>
              <Text style={styles.detailText}>123 Main Street, Downtown</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🕒</Text>
            <View>
              <Text style={styles.detailTitle}>Hours</Text>
              <Text style={styles.detailText}>Mon-Sun: 10:00 AM - 10:00 PM</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📞</Text>
            <View>
              <Text style={styles.detailTitle}>Contact</Text>
              <Text style={styles.detailText}>(555) 123-4567</Text>
            </View>
          </View>
        </View>

        {/* Menu Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {menuCategories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === index && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory(index)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === index && styles.activeCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{menuCategories[selectedCategory]?.name}</Text>
          <FlatList
            data={menuCategories[selectedCategory]?.meals}
            renderItem={renderMealItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <ReviewModal />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  restaurantHeader: {
    position: 'relative',
    height: 200,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  restaurantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#fff',
  },
  restaurantRating: {
    fontSize: 14,
    color: '#fff',
  },
  detailsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  activeCategoryTab: {
    backgroundColor: '#FF8C00',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  menuSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  mealContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    padding: 4,
  },
  saveIcon: {
    fontSize: 20,
  },
  mealDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  mealInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingStars: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  reviewsLink: {
    fontSize: 12,
    color: '#FF8C00',
    textDecorationLine: 'underline',
  },
  mealPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  addToCartButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
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