import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import DealCard from './DealCard'

export default function FoodSection({ 
  title, 
  emoji, 
  showSeeAll = false, 
  onSeeAllPress, 
  data = [] 
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          {title} {emoji}
        </Text>
        {showSeeAll && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.cardGrid}>
        {data.map((item, index) => (
          <View key={item.id || index} style={styles.cardWrapper}>
            <DealCard
              imageUri={item.imageUri}
              name={item.name}
              originalPrice={item.originalPrice}
              dealPrice={item.dealPrice}
              hasBogo={item.hasBogo}
              onPress={() => item.onPress?.(item)}
              onAddPress={() => item.onAddPress?.(item)}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '600',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
  },
})