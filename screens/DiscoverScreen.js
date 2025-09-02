import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import CategoryScroll from '../components/CategoryScroll'
import FoodSection from '../components/FoodSection'

// Sample data for exclusive deals
const exclusiveDeals = [
  {
    id: '1',
    name: 'Spicy Chicken Wings',
    imageUri: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop',
    originalPrice: '12.99',
    dealPrice: '8.99',
    hasBogo: true,
  },
  {
    id: '2',
    name: 'BBQ Bacon Burger',
    imageUri: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    originalPrice: '15.99',
    dealPrice: '11.99',
    hasBogo: false,
  },
  {
    id: '3',
    name: 'Loaded Nachos',
    imageUri: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop',
    originalPrice: '9.99',
    dealPrice: '6.99',
    hasBogo: true,
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    imageUri: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop',
    originalPrice: '18.99',
    dealPrice: '13.99',
    hasBogo: false,
  },
]

// Sample data for plant-based plates
const plantBasedPlates = [
  {
    id: '5',
    name: 'Quinoa Buddha Bowl',
    imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    originalPrice: '14.99',
    dealPrice: '12.99',
    hasBogo: false,
  },
  {
    id: '6',
    name: 'Avocado Toast Deluxe',
    imageUri: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
    originalPrice: '11.99',
    dealPrice: '9.99',
    hasBogo: false,
  },
  {
    id: '7',
    name: 'Veggie Power Wrap',
    imageUri: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    originalPrice: '9.99',
    dealPrice: '7.99',
    hasBogo: false,
  },
  {
    id: '8',
    name: 'Green Goddess Salad',
    imageUri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    originalPrice: '12.99',
    dealPrice: '10.99',
    hasBogo: false,
  },
]

export default function DiscoverScreen() {
  const handleLocationPress = () => {
    // Handle location access request
    console.log('Location access requested')
  }

  const handleCartPress = () => {
    // Handle cart navigation
    console.log('Cart pressed')
  }

  const handleSearchPress = () => {
    // Handle search navigation
    console.log('Search pressed')
  }

  const handleSeeAllDeals = () => {
    // Navigate to all deals
    console.log('See all deals pressed')
  }

  const handleSeeAllPlantBased = () => {
    // Navigate to all plant-based options
    console.log('See all plant-based pressed')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location & Search Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
            <Text style={styles.locationText}>📍 Allow access to location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search for dishes, restaurants...</Text>
          </View>
        </TouchableOpacity>

        {/* Food Categories */}
        <CategoryScroll />

        {/* Exclusive Deals Section */}
        <FoodSection
          title="Exclusive Deals"
          emoji="🔥"
          showSeeAll={true}
          data={exclusiveDeals}
          onSeeAllPress={handleSeeAllDeals}
        />

        {/* Plant-Based Plates Section */}
        <FoodSection
          title="Plant-Based Plates"
          emoji="🌿"
          showSeeAll={true}
          data={plantBasedPlates}
          onSeeAllPress={handleSeeAllPlantBased}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  locationButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cartIcon: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
})