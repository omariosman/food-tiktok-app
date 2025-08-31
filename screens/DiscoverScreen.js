import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          🔍 Discovery features will be here
        </Text>
        <Text style={styles.description}>
          This is where users can discover trending food, new restaurants, popular influencers, and featured content.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
})