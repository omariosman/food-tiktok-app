import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

type RestaurantScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Restaurant'>;
type RestaurantScreenRouteProp = RouteProp<RootStackParamList, 'Restaurant'>;

interface Props {
  navigation: RestaurantScreenNavigationProp;
  route: RestaurantScreenRouteProp;
}

export const RestaurantScreen: React.FC<Props> = ({ route }) => {
  const { restaurantId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Details</Text>
      <Text style={styles.subtitle}>Restaurant ID: {restaurantId}</Text>
      
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Restaurant details and menu will be displayed here
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});