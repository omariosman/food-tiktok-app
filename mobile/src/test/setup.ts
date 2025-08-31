import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-constants', () => ({
  manifest: {},
  expoConfig: {},
}));

jest.mock('expo-location', () => ({}));
jest.mock('expo-notifications', () => ({}));
jest.mock('expo-secure-store', () => ({}));

// Mock Supabase URL polyfill
jest.mock('react-native-url-polyfill/auto', () => {});

// Silence the warning about Animated.Value
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');