import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { OrdersScreen } from '../screens/main/OrdersScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { RestaurantScreen } from '../screens/restaurant/RestaurantScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Restaurant: { restaurantId: string };
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const MainTabNavigator = () => (
  <MainTabs.Navigator>
    <MainTabs.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Restaurants' }}
    />
    <MainTabs.Screen 
      name="Orders" 
      component={OrdersScreen}
      options={{ title: 'My Orders' }}
    />
    <MainTabs.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </MainTabs.Navigator>
);

const MainNavigator = () => (
  <RootStack.Navigator>
    <RootStack.Screen 
      name="MainTabs" 
      component={MainTabNavigator}
      options={{ headerShown: false }}
    />
    <RootStack.Screen 
      name="Restaurant" 
      component={RestaurantScreen}
      options={{ title: 'Restaurant' }}
    />
  </RootStack.Navigator>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <MainNavigator /> : <AuthNavigator />;
};