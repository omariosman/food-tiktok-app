import { useState, useEffect } from 'react'
import { 
  getSavedDishes, 
  saveDish, 
  removeSavedDish, 
  isDishSaved,
  searchSavedDishes 
} from '../services/savedDishesService'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook for managing saved dishes functionality
 * @returns {object} Hook state and actions
 */
export const useSavedDishes = () => {
  const [savedDishes, setSavedDishes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Load saved dishes when user changes
  useEffect(() => {
    if (user) {
      loadSavedDishes()
    } else {
      setSavedDishes([])
    }
  }, [user])

  /**
   * Load all saved dishes from the backend
   */
  const loadSavedDishes = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: serviceError } = await getSavedDishes()
      
      if (serviceError) {
        throw new Error(serviceError)
      }

      setSavedDishes(data || [])
    } catch (err) {
      console.error('Error loading saved dishes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Save a dish to user's favorites
   * @param {string} dishId - The ID of the dish to save
   * @returns {Promise<boolean>} Success status
   */
  const addSavedDish = async (dishId) => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const { error: serviceError } = await saveDish(dishId)
      
      if (serviceError) {
        throw new Error(serviceError)
      }

      // Refresh the saved dishes list to get updated data
      await loadSavedDishes()
      
      return true
    } catch (err) {
      console.error('Error saving dish:', err)
      setError(err.message)
      return false
    }
  }

  /**
   * Remove a dish from user's favorites
   * @param {string} dishId - The ID of the dish to remove
   * @returns {Promise<boolean>} Success status
   */
  const removeSavedDishLocal = async (dishId) => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const { error: serviceError } = await removeSavedDish(dishId)
      
      if (serviceError) {
        throw new Error(serviceError)
      }

      // Update local state immediately for better UX
      setSavedDishes(prev => prev.filter(dish => dish.dishId !== dishId))
      
      return true
    } catch (err) {
      console.error('Error removing saved dish:', err)
      setError(err.message)
      return false
    }
  }

  /**
   * Check if a specific dish is saved by the user
   * @param {string} dishId - The ID of the dish to check
   * @returns {boolean} Whether the dish is saved
   */
  const isDishSavedLocal = (dishId) => {
    return savedDishes.some(dish => dish.dishId === dishId)
  }

  /**
   * Check if a dish is saved (server-side verification)
   * @param {string} dishId - The ID of the dish to check
   * @returns {Promise<boolean>} Whether the dish is saved
   */
  const checkDishSaved = async (dishId) => {
    if (!user) return false

    try {
      const { isSaved, error: serviceError } = await isDishSaved(dishId)
      
      if (serviceError) {
        console.warn('Error checking if dish is saved:', serviceError)
        return isDishSavedLocal(dishId) // Fallback to local check
      }

      return isSaved
    } catch (err) {
      console.error('Error checking saved status:', err)
      return isDishSavedLocal(dishId) // Fallback to local check
    }
  }

  /**
   * Toggle save status of a dish
   * @param {string} dishId - The ID of the dish to toggle
   * @returns {Promise<boolean>} New saved status
   */
  const toggleSavedDish = async (dishId) => {
    const currentlySaved = isDishSavedLocal(dishId)
    
    if (currentlySaved) {
      const success = await removeSavedDishLocal(dishId)
      return !success // If removal succeeded, dish is no longer saved
    } else {
      const success = await addSavedDish(dishId)
      return success // If save succeeded, dish is now saved
    }
  }

  /**
   * Search within saved dishes
   * @param {string} query - Search query
   * @returns {Promise<Array>} Filtered dishes
   */
  const searchSaved = async (query) => {
    if (!user) return []

    try {
      const { data, error: serviceError } = await searchSavedDishes(query)
      
      if (serviceError) {
        throw new Error(serviceError)
      }

      return data || []
    } catch (err) {
      console.error('Error searching saved dishes:', err)
      setError(err.message)
      return []
    }
  }

  /**
   * Get count of saved dishes
   * @returns {number} Number of saved dishes
   */
  const getSavedCount = () => {
    return savedDishes.length
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null)
  }

  return {
    // State
    savedDishes,
    loading,
    error,
    
    // Actions
    loadSavedDishes,
    addSavedDish,
    removeSavedDish: removeSavedDishLocal,
    toggleSavedDish,
    isDishSaved: isDishSavedLocal,
    checkDishSaved,
    searchSaved,
    getSavedCount,
    clearError,
    
    // Computed
    hasSavedDishes: savedDishes.length > 0,
  }
}