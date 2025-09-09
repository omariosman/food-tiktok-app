import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export default function DealCard({ 
  imageUri, 
  name, 
  originalPrice, 
  dealPrice, 
  hasBogo = false,
  onPress,
  onAddPress 
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        {hasBogo && (
          <View style={styles.bogoBadge}>
            <Text style={styles.bogoText}>BOGO</Text>
          </View>
        )}
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.foodName}>{name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>${originalPrice}</Text>
              <Text style={styles.dealPrice}>${dealPrice}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 16,
  },
  bogoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  bogoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  foodName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    color: '#ccc',
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  dealPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
})
