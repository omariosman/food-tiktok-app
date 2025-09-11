import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert
} from 'react-native'
import Modal from 'react-native-modal'
import { useCart } from '../contexts/CartContext'

const AddToCartModal = ({ visible, onClose, meal, restaurant }) => {
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (!meal || !restaurant) {
      Alert.alert('Error', 'Meal or restaurant information is missing')
      return
    }

    addToCart(meal, quantity, restaurant)
    Alert.alert('Success', `${meal.name} added to cart!`)
    onClose()
    setQuantity(1)
    setSpecialInstructions('')
  }

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1)
  }

  const getTotalPrice = () => {
    return meal ? (meal.price * quantity).toFixed(2) : '0.00'
  }

  if (!meal) return null

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContent}>
        {/* Meal Image and Details */}
        <View style={styles.mealInfo}>
          {meal.image && (
            <Image source={{ uri: meal.image }} style={styles.mealImage} />
          )}
          <View style={styles.mealDetails}>
            <Text style={styles.mealName}>{meal.name}</Text>
            {restaurant && (
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
            )}
            <Text style={styles.mealPrice}>${meal.price?.toFixed(2)}</Text>
            {meal.description && (
              <Text style={styles.mealDescription}>{meal.description}</Text>
            )}
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Any special requests? (optional)"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Total Price */}
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>Total: ${getTotalPrice()}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  mealInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  mealPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF8C00',
    marginBottom: 5,
  },
  mealDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  quantitySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  instructionsSection: {
    marginBottom: 20,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
    fontSize: 16,
    color: '#333',
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addButton: {
    flex: 2,
    paddingVertical: 15,
    marginLeft: 10,
    backgroundColor: '#FF8C00',
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})

export default AddToCartModal