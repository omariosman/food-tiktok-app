import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCart } from '../contexts/CartContext'

const ORDER_HISTORY_KEY = '@order_history'

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    loadOrderHistory()
  }, [])

  const loadOrderHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem(ORDER_HISTORY_KEY)
      if (historyData) {
        const parsedHistory = JSON.parse(historyData)
        setOrders(parsedHistory)
      }
    } catch (error) {
      console.error('Error loading order history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatus = (orderDate) => {
    const now = new Date()
    const orderTime = new Date(orderDate)
    const timeDiff = now - orderTime
    const minutesDiff = Math.floor(timeDiff / (1000 * 60))

    if (minutesDiff < 30) {
      return { status: 'Preparing', color: '#FF8C00', emoji: '👨‍🍳' }
    } else if (minutesDiff < 60) {
      return { status: 'On the Way', color: '#2196F3', emoji: '🚗' }
    } else {
      return { status: 'Delivered', color: '#4CAF50', emoji: '✅' }
    }
  }

  const handleReorder = (order) => {
    Alert.alert(
      'Reorder Items',
      `Add ${order.items.length} items to your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reorder',
          onPress: () => {
            order.items.forEach(item => {
              addToCart(item.meal, item.quantity, item.restaurant)
            })
            Alert.alert('Success', 'Items added to cart!')
            navigation.navigate('Feed') // Navigate to main screen
          }
        }
      ]
    )
  }

  const OrderItem = ({ order, index }) => {
    const orderStatus = getOrderStatus(order.date)
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => {
          // Navigate to order details or expand
        }}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Text>
          </View>
          
          <View style={styles.orderStatus}>
            <Text style={styles.statusEmoji}>{orderStatus.emoji}</Text>
            <Text style={[styles.statusText, { color: orderStatus.color }]}>
              {orderStatus.status}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          {order.items.slice(0, 2).map((item, itemIndex) => (
            <View key={itemIndex} style={styles.previewItem}>
              {item.meal.image && (
                <Image source={{ uri: item.meal.image }} style={styles.previewImage} />
              )}
              <View style={styles.previewDetails}>
                <Text style={styles.previewName}>{item.meal.name}</Text>
                <Text style={styles.previewRestaurant}>{item.restaurant.name}</Text>
                <Text style={styles.previewQuantity}>Qty: {item.quantity}</Text>
              </View>
            </View>
          ))}
          
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} more items
            </Text>
          )}
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalText}>Total: ${order.total.toFixed(2)}</Text>
            <Text style={styles.itemCount}>{order.items.length} items</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.reorderButton}
            onPress={() => handleReorder(order)}
          >
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  // Mock data for demonstration if no orders exist
  const mockOrders = [
    {
      orderNumber: '123456',
      date: new Date().toISOString(),
      items: [
        {
          meal: {
            name: 'Margherita Pizza',
            price: 12.99,
            image: 'https://images.unsplash.com/photo-1604382354936-07c5b6fdd9c1?w=300'
          },
          restaurant: { name: 'Pizza Palace' },
          quantity: 1
        },
        {
          meal: {
            name: 'Caesar Salad',
            price: 8.99,
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300'
          },
          restaurant: { name: 'Pizza Palace' },
          quantity: 2
        }
      ],
      total: 30.97
    },
    {
      orderNumber: '123455',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      items: [
        {
          meal: {
            name: 'Chicken Burger',
            price: 9.99,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'
          },
          restaurant: { name: 'Burger House' },
          quantity: 1
        }
      ],
      total: 14.48
    }
  ]

  const displayOrders = orders.length > 0 ? orders : mockOrders

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      {displayOrders.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🍽️</Text>
          <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
          <Text style={styles.emptyStateText}>
            When you place your first order, it will appear here
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
          {displayOrders.map((order, index) => (
            <OrderItem key={order.orderNumber || index} order={order} index={index} />
          ))}
          
          {orders.length === 0 && (
            <View style={styles.mockDataNotice}>
              <Text style={styles.mockDataText}>
                📝 This is sample data for demonstration
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsPreview: {
    marginBottom: 15,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  previewRestaurant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  previewQuantity: {
    fontSize: 12,
    color: '#666',
  },
  moreItems: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
    marginTop: 5,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  totalSection: {
    flex: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  reorderButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reorderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mockDataNotice: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  mockDataText: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
  },
})

export default OrderHistoryScreen