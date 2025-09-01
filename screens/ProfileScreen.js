import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.userId}>ID: {user?.id?.slice(0, 8)}...</Text>
        </View>

        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderText}>
            👤 Profile features will be here
          </Text>
          <Text style={styles.description}>
            This is where users can manage their profile, view order history, settings, and account preferences.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#666',
  },
  placeholderSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 40,
  },
  logoutButton: {
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