import React, { useState, useEffect, useCallback } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import SavedDishCard from '../components/SavedDishCard'
import { getSavedDishes, removeSavedDish, searchSavedDishes } from '../services/savedDishesService'
import { useAuth } from '../contexts/AuthContext'

export default function SavedScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [savedDishes, setSavedDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Load saved dishes when component mounts
  useEffect(() => {
    if (user) {
      loadSavedDishes()
    } else {
      setLoading(false)
      setSavedDishes([])
      setFilteredDishes([])
    }
  }, [user])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, savedDishes])

  const loadSavedDishes = async () => {
    try {
      setError(null)
      const { data, error: serviceError } = await getSavedDishes()
      
      if (serviceError) {
        throw new Error(serviceError)
      }

      setSavedDishes(data)
      setFilteredDishes(data)
    } catch (err) {
      console.error('Error loading saved dishes:', err)
      setError(err.message)
      Alert.alert('Error', 'Failed to load saved dishes. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    loadSavedDishes()
  }, [])

  const handleSearch = async (text) => {
    if (!text || text.trim() === '') {
      setFilteredDishes(savedDishes)
    } else {
      try {
        const { data, error: searchError } = await searchSavedDishes(text.trim())
        
        if (searchError) {
          throw new Error(searchError)
        }

        setFilteredDishes(data)
      } catch (err) {
        console.error('Error searching saved dishes:', err)
        // Fallback to local filtering if search fails
        const filtered = savedDishes.filter(dish => 
          dish.dishName?.toLowerCase().includes(text.toLowerCase()) ||
          dish.restaurantName?.toLowerCase().includes(text.toLowerCase())
        )
        setFilteredDishes(filtered)
      }
    }
  }

  const handleDishPress = (dish) => {
    console.log('Dish pressed:', dish.dishName)
    // TODO: Navigate to dish detail screen or add to cart
    Alert.alert(
      dish.dishName,
      `${dish.description || 'Delicious dish from ' + dish.restaurantName}\n\nPrice: $${dish.price}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Order Now', onPress: () => console.log('Order:', dish.dishName) }
      ]
    )
  }

  const handleBookmarkPress = async (dish) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Remove from Saved',
        `Remove "${dish.dishName}" from your saved dishes?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => {
              try {
                const { error: removeError } = await removeSavedDish(dish.dishId)
                
                if (removeError) {
                  throw new Error(removeError)
                }

                // Update local state immediately for better UX
                const updatedSaved = savedDishes.filter(item => item.dishId !== dish.dishId)
                setSavedDishes(updatedSaved)
                
                // Update filtered dishes as well
                const updatedFiltered = filteredDishes.filter(item => item.dishId !== dish.dishId)
                setFilteredDishes(updatedFiltered)

                console.log('Dish removed from saved:', dish.dishName)
              } catch (err) {
                console.error('Error removing saved dish:', err)
                Alert.alert('Error', 'Failed to remove dish. Please try again.')
              }
            }
          }
        ]
      )
    } catch (err) {
      console.error('Error in handleBookmarkPress:', err)
    }
  }

  const renderDishCard = ({ item, index }) => (
    <View style={[styles.cardWrapper, { marginRight: index % 2 === 0 ? 8 : 0, marginLeft: index % 2 === 1 ? 8 : 0 }]}>
      <SavedDishCard
        imageUri={item.imageUri}
        restaurantName={item.restaurantName}
        dishName={item.dishName}
        restaurantRating={item.restaurantRating}
        deliveryRating={item.deliveryRating}
        deliveryTime={item.deliveryTime}
        deliveryFee={item.deliveryFee}
        price={item.price}
        onPress={() => handleDishPress(item)}
        onBookmarkPress={() => handleBookmarkPress(item)}
      />
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>⭐</Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No dishes found' : 'No saved dishes yet'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? `No saved dishes match "${searchQuery}"`
          : 'Start saving your favorite dishes to see them here'
        }
      </Text>
    </View>
  )

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>⚠️</Text>
      <Text style={styles.emptyStateTitle}>Something went wrong</Text>
      <Text style={styles.emptyStateText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadSavedDishes}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  )

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔐</Text>
          <Text style={styles.emptyStateTitle}>Please log in</Text>
          <Text style={styles.emptyStateText}>
            You need to be logged in to view your saved dishes
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Your Saved Dishes</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search saved dishes or restaurants"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!loading}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.gridContainer}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF8C00" />
            <Text style={styles.loadingText}>Loading your saved dishes...</Text>
          </View>
        ) : error ? (
          renderErrorState()
        ) : filteredDishes.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredDishes}
            renderItem={renderDishCard}
            keyExtractor={(item) => item.id || item.dishId}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.row}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#FF8C00']}
                tintColor="#FF8C00"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gridContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})