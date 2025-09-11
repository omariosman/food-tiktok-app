import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native'
import { useCart } from '../contexts/CartContext'

const CheckoutScreen = ({ navigation }) => {
  const { items, getTotalPrice, clearCart } = useCart()
  
  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash') // 'cash' or 'card'
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  
  // Fees and totals
  const deliveryFee = 2.99
  const serviceFee = 1.50
  const subtotal = getTotalPrice()
  const total = subtotal + deliveryFee + serviceFee

  const validateForm = () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter your delivery address')
      return false
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number')
      return false
    }
    
    const phoneRegex = /^\d{10,}$/
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number')
      return false
    }
    
    if (paymentMethod === 'card') {
      if (!cardNumber.trim() || cardNumber.replace(/\D/g, '').length < 16) {
        Alert.alert('Error', 'Please enter a valid card number')
        return false
      }
      
      if (!expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)')
        return false
      }
      
      if (!cvv.trim() || cvv.length < 3) {
        Alert.alert('Error', 'Please enter a valid CVV')
        return false
      }
    }
    
    return true
  }

  const handlePlaceOrder = () => {
    if (!validateForm()) return
    
    // Generate order number
    const orderNumber = Math.floor(Math.random() * 1000000).toString()
    
    // Simulate order placement
    Alert.alert(
      'Order Placed Successfully!',
      `Your order #${orderNumber} has been placed.`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart()
            navigation.navigate('OrderConfirmation', {
              orderNumber,
              items,
              total,
              deliveryAddress,
              phoneNumber,
              paymentMethod
            })
          }
        }
      ]
    )
  }

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '')
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
  }

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
      setExpiryDate(formatted)
    } else {
      setExpiryDate(cleaned)
    }
  }

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '')
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    setPhoneNumber(formatted)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your full delivery address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Phone Number Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChangeText={formatPhoneNumber}
            keyboardType="phone-pad"
            maxLength={14}
          />
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.selectedPaymentOption
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'cash' && styles.selectedPaymentOptionText
              ]}>
                💵 Cash on Delivery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.selectedPaymentOption
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'card' && styles.selectedPaymentOptionText
              ]}>
                💳 Credit/Debit Card
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card Details - Only show if card is selected */}
          {paymentMethod === 'card' && (
            <View style={styles.cardDetails}>
              <TextInput
                style={styles.textInput}
                placeholder="Card Number (1234 5678 9012 3456)"
                value={cardNumber}
                onChangeText={formatCardNumber}
                keyboardType="numeric"
                maxLength={19}
              />
              
              <View style={styles.cardRow}>
                <TextInput
                  style={[styles.textInput, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={formatExpiryDate}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.textInput, styles.halfInput]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>
                {item.quantity}x {item.meal.name}
              </Text>
              <Text style={styles.orderItemPrice}>
                ${(item.meal.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View style={styles.orderTotals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Service Fee</Text>
              <Text style={styles.totalValue}>${serviceFee.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderButtonText}>
            Place Order • ${total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  paymentMethods: {
    marginBottom: 15,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedPaymentOption: {
    borderColor: '#FF8C00',
    backgroundColor: '#FFF5E6',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPaymentOptionText: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  cardDetails: {
    marginTop: 15,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderItemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  orderTotals: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C00',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  placeOrderButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})

export default CheckoutScreen