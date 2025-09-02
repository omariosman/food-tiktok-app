import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

const categories = [
  { id: '1', name: 'Breakfast', icon: '🍳' },
  { id: '2', name: 'Sushi', icon: '🍣' },
  { id: '3', name: 'Fast Food', icon: '🍔' },
  { id: '4', name: 'Soul Food', icon: '🍽️' },
  { id: '5', name: 'Barbecue', icon: '🔥' },
  { id: '6', name: 'Pizza', icon: '🍕' },
  { id: '7', name: 'Chinese', icon: '🥡' },
  { id: '8', name: 'Mexican', icon: '🌮' },
  { id: '9', name: 'Italian', icon: '🍝' },
  { id: '10', name: 'Dessert', icon: '🧁' },
]

export default function CategoryScroll() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryCircle}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    fontWeight: '500',
  },
})