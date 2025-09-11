import React, { createContext, useContext, useReducer, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CartContext = createContext()

const CART_STORAGE_KEY = '@cart_items'

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      }
    
    case 'ADD_TO_CART':
      const existingItemIndex = state.items.findIndex(
        item => item.meal.id === action.payload.meal.id && 
                item.restaurant.id === action.payload.restaurant.id
      )
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += action.payload.quantity
        return {
          ...state,
          items: updatedItems
        }
      }
      
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: `${action.payload.meal.id}-${action.payload.restaurant.id}-${Date.now()}`,
            meal: action.payload.meal,
            restaurant: action.payload.restaurant,
            quantity: action.payload.quantity
          }
        ]
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId)
      }
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.newQuantity }
            : item
        ).filter(item => item.quantity > 0)
      }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }
    
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  })

  useEffect(() => {
    loadCart()
  }, [])

  useEffect(() => {
    saveCart()
  }, [state.items])

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY)
      if (cartData) {
        const parsedCart = JSON.parse(cartData)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  const addToCart = (meal, quantity = 1, restaurant) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { meal, quantity, restaurant }
    })
  }

  const removeFromCart = (itemId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { itemId }
    })
  }

  const updateQuantity = (itemId, newQuantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { itemId, newQuantity }
    })
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      return total + (item.meal.price * item.quantity)
    }, 0)
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}