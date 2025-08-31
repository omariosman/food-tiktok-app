import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { Text } from 'react-native';

// Mock Supabase
jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Test component that uses auth context
const TestComponent: React.FC = () => {
  const { loading, user } = useAuth();
  
  return (
    <Text testID="auth-state">
      {loading ? 'Loading' : user ? 'Authenticated' : 'Not authenticated'}
    </Text>
  );
};

describe('AuthContext', () => {
  it('should provide authentication state', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should be loading or not authenticated
    const authState = getByTestId('auth-state');
    expect(authState).toBeTruthy();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});