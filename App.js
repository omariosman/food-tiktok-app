import 'react-native-gesture-handler'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { SavedProvider } from './contexts/SavedContext'
import AppNavigator from './navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <SavedProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </SavedProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}