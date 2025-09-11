import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native'

const OrderConfirmationScreen = ({ navigation, route }) => {
  const {
    orderNumber,
    items = [],
    total,
    deliveryAddress,
    phoneNumber,
    paymentMethod
  } = route.params || {}

  // Generate estimated delivery time (30-45 minutes from now)
  const getEstimatedDeliveryTime = () => {
    const now = new Date()
    const deliveryTime = new Date(now.getTime() + (35 * 60 * 1000)) // 35 minutes
    return deliveryTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleTrackOrder = () => {
    // Navigate to order tracking (future feature)
    navigation.navigate('OrderHistory')
  }

  const handleContinueShopping = () => {
    navigation.navigate('Discover')
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been confirmed and is being prepared
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Number</Text>
            <Text style={styles.detailValue}>#{orderNumber}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Delivery</Text>
            <Text style={styles.deliveryTime}>{getEstimatedDeliveryTime()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Address</Text>
            <Text style={styles.detailValue}>{deliveryAddress}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            <Text style={styles.detailValue}>{phoneNumber}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {paymentMethod === 'cash' ? '💵 Cash on Delivery' : '💳 Card Payment'}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Order</Text>
          
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              {item.meal.image && (
                <Image source={{ uri: item.meal.image }} style={styles.itemImage} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.meal.name}</Text>
                <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.meal.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${total?.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          
          <View style={styles.statusTracker}>
            <View style={[styles.statusStep, styles.activeStep]}>
              <View style={[styles.statusDot, styles.activeDot]} />
              <Text style={[styles.statusText, styles.activeText]}>Order Placed</Text>
            </View>
            
            <View style={styles.statusLine} />
            
            <View style={styles.statusStep}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Preparing</Text>
            </View>
            
            <View style={styles.statusLine} />
            
            <View style={styles.statusStep}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>On the Way</Text>
            </View>
            
            <View style={styles.statusLine} />
            
            <View style={styles.statusStep}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Delivered</Text>
            </View>
          </View>
        </View>

        {/* Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            📱 You'll receive SMS updates about your order status
          </Text>
          <Text style={styles.infoText}>
            🍽️ Our delivery partner will contact you when they arrive
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.trackButton} 
          onPress={handleTrackOrder}
        >
          <Text style={styles.trackButtonText}>View Order History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinueShopping}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    marginVertical: 20,
    borderRadius: 12,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  deliveryTime: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
  },
  statusTracker: {
    alignItems: 'center',
  },
  statusStep: {
    alignItems: 'center',
    marginVertical: 5,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginBottom: 5,
  },
  activeDot: {
    backgroundColor: '#FF8C00',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  activeText: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  statusLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
  infoSection: {
    backgroundColor: '#E8F4FD',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  trackButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})

export default OrderConfirmationScreen