import React, { createContext, useContext, useReducer, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SavedContext = createContext()

const SAVED_STORAGE_KEY = '@saved_meals'

const savedReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_SAVED':
      return {
        ...state,
        savedMeals: action.payload || []
      }
    
    case 'TOGGLE_SAVE':
      const existingIndex = state.savedMeals.findIndex(
        item => item.meal.id === action.payload.meal.id &&
                item.restaurant.id === action.payload.restaurant.id
      )
      
      if (existingIndex >= 0) {
        return {
          ...state,
          savedMeals: state.savedMeals.filter((_, index) => index !== existingIndex)
        }
      }
      
      return {
        ...state,
        savedMeals: [
          ...state.savedMeals,
          {
            id: `${action.payload.meal.id}-${action.payload.restaurant.id}`,
            meal: action.payload.meal,
            restaurant: action.payload.restaurant,
            savedAt: new Date().toISOString()
          }
        ]
      }
    
    case 'REMOVE_SAVED':
      return {
        ...state,
        savedMeals: state.savedMeals.filter(item => item.id !== action.payload.itemId)
      }
    
    case 'CLEAR_SAVED':
      return {
        ...state,
        savedMeals: []
      }
    
    default:
      return state
  }
}

export const SavedProvider = ({ children }) => {
  const [state, dispatch] = useReducer(savedReducer, {
    savedMeals: []
  })

  useEffect(() => {
    loadSavedMeals()
  }, [])

  useEffect(() => {
    saveMeals()
  }, [state.savedMeals])

  const loadSavedMeals = async () => {
    try {
      const savedData = await AsyncStorage.getItem(SAVED_STORAGE_KEY)
      if (savedData) {
        const parsedSaved = JSON.parse(savedData)
        dispatch({ type: 'LOAD_SAVED', payload: parsedSaved })
      }
    } catch (error) {
      console.error('Error loading saved meals:', error)
    }
  }

  const saveMeals = async () => {
    try {
      await AsyncStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(state.savedMeals))
    } catch (error) {
      console.error('Error saving meals:', error)
    }
  }

  const toggleSave = (meal, restaurant) => {
    dispatch({
      type: 'TOGGLE_SAVE',
      payload: { meal, restaurant }
    })
  }

  const isSaved = (mealId, restaurantId = null) => {
    return state.savedMeals.some(item => {
      if (restaurantId) {
        return item.meal.id === mealId && item.restaurant.id === restaurantId
      }
      return item.meal.id === mealId
    })
  }

  const getSavedMeals = () => {
    return state.savedMeals.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  }

  const removeSaved = (itemId) => {
    dispatch({
      type: 'REMOVE_SAVED',
      payload: { itemId }
    })
  }

  const clearSaved = () => {
    dispatch({ type: 'CLEAR_SAVED' })
  }

  const value = {
    savedMeals: state.savedMeals,
    toggleSave,
    isSaved,
    getSavedMeals,
    removeSaved,
    clearSaved
  }

  return (
    <SavedContext.Provider value={value}>
      {children}
    </SavedContext.Provider>
  )
}

export const useSaved = () => {
  const context = useContext(SavedContext)
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider')
  }
  return context
}