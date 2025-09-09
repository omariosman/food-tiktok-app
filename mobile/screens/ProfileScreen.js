import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../contexts/AuthContext'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('foodCourt')

  const joinDate = new Date(2024, 0, 1) // January 1, 2024
  const formattedJoinDate = joinDate.getFullYear()

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      {/* Enhanced Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/120x120/ddd/999?text=User' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.fullName}>John Doe</Text>
        <Text style={styles.username}>@johndoe</Text>
        <Text style={styles.memberSince}>Real Eater Since {formattedJoinDate}</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileButtonText}>Manage Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Savings Banner */}
      <LinearGradient
        colors={['#FF8C00', '#FFA500']}
        style={styles.savingsBanner}
      >
        <Text style={styles.savingsText}>$0.00 saved with promos and discounts</Text>
      </LinearGradient>

      {/* Food Court Section */}
      <View style={styles.foodCourtSection}>
        <View style={styles.tabSelector}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'foodCourt' && styles.activeTab]}
            onPress={() => setActiveTab('foodCourt')}
          >
            <Text style={[styles.tabText, activeTab === 'foodCourt' && styles.activeTabText]}>Food Court</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'orderHistory' && styles.activeTab]}
            onPress={() => setActiveTab('orderHistory')}
          >
            <Text style={[styles.tabText, activeTab === 'orderHistory' && styles.activeTabText]}>Order History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'foodCourt' && (
            <View style={styles.foodCourtContent}>
              <Text style={styles.sectionTitle}>My Food Court</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>0 places</Text>
                <Text style={styles.emptyStateSubtext}>Save your favorite restaurants here</Text>
              </View>
            </View>
          )}
          
          {activeTab === 'orderHistory' && (
            <View style={styles.orderHistoryContent}>
              <Text style={styles.sectionTitle}>Order History</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No orders yet</Text>
                <Text style={styles.emptyStateSubtext}>Your order history will appear here</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
    paddingBottom: 20,
  },
  
  // Enhanced Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#FF8C00',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 30,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  profileButtonText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },

  // Savings Banner
  savingsBanner: {
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  // Food Court Section
  foodCourtSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF8C00',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 200,
  },
  foodCourtContent: {
    flex: 1,
  },
  orderHistoryContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },

  // Logout Button
  logoutButton: {
    marginHorizontal: 20,
    height: 50,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
})
