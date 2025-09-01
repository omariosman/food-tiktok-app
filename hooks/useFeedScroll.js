import { useState, useEffect, useCallback, useRef } from 'react'
import { getPersonalizedFeed, getFeedItemsByRestaurant, preloadFeedItems } from '../services/feedService'
import { 
  trackView, 
  trackLike, 
  trackSave, 
  trackShare, 
  trackSkip,
  getUserInteractions 
} from '../services/interactionService'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook for infinite scroll TikTok-style feed
 */
export const useFeedScroll = () => {
  const [feedItems, setFeedItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [preloadedItems, setPreloadedItems] = useState([])
  
  // View tracking
  const [viewStartTime, setViewStartTime] = useState(Date.now())
  const currentItemRef = useRef(null)
  const viewTimeoutRef = useRef(null)

  const { user } = useAuth()

  // Load initial feed
  useEffect(() => {
    if (user) {
      loadInitialFeed()
    }
  }, [user])

  // Track view when current item changes
  useEffect(() => {
    if (feedItems.length > 0 && currentIndex >= 0) {
      handleViewStart()
      preloadNextItems()
    }
  }, [currentIndex, feedItems])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewTimeoutRef.current) {
        clearTimeout(viewTimeoutRef.current)
      }
      trackCurrentView() // Track final view
    }
  }, [])

  /**
   * Load initial feed items
   */
  const loadInitialFeed = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: items, error: feedError, hasMore } = await getPersonalizedFeed(10, 0, user?.id)
      
      if (feedError) {
        throw new Error(feedError)
      }

      // Get user interactions for each item
      const itemsWithInteractions = await Promise.all(
        items.map(async (item) => {
          const { data: interactions } = await getUserInteractions(item.id)
          return {
            ...item,
            isLiked: !!interactions.like,
            isSaved: !!interactions.save,
            hasViewed: !!interactions.view,
            userInteractions: interactions
          }
        })
      )

      setFeedItems(itemsWithInteractions)
      setHasMoreItems(hasMore)
      setCurrentIndex(0)
      
    } catch (err) {
      console.error('Error loading initial feed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load more feed items for infinite scroll
   */
  const loadMoreItems = async () => {
    if (!hasMoreItems || loadingMore) return

    try {
      setLoadingMore(true)
      const currentOffset = feedItems.length

      const { data: moreItems, error: feedError, hasMore } = await getPersonalizedFeed(
        10, 
        currentOffset, 
        user?.id
      )

      if (feedError) {
        throw new Error(feedError)
      }

      // Get user interactions for new items
      const itemsWithInteractions = await Promise.all(
        moreItems.map(async (item) => {
          const { data: interactions } = await getUserInteractions(item.id)
          return {
            ...item,
            isLiked: !!interactions.like,
            isSaved: !!interactions.save,
            hasViewed: !!interactions.view,
            userInteractions: interactions
          }
        })
      )

      setFeedItems(prev => [...prev, ...itemsWithInteractions])
      setHasMoreItems(hasMore)

    } catch (err) {
      console.error('Error loading more items:', err)
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  /**
   * Preload next few items for smoother experience
   */
  const preloadNextItems = useCallback(async () => {
    // Only preload when near the end of current items
    if (currentIndex >= feedItems.length - 3 && hasMoreItems && !loadingMore) {
      const { data: nextItems } = await preloadFeedItems(feedItems.length, 3, user?.id)
      if (nextItems && nextItems.length > 0) {
        setPreloadedItems(nextItems)
      }
    }

    // Add preloaded items to main feed when needed
    if (currentIndex >= feedItems.length - 1 && preloadedItems.length > 0) {
      setFeedItems(prev => [...prev, ...preloadedItems])
      setPreloadedItems([])
    }
  }, [currentIndex, feedItems.length, hasMoreItems, loadingMore, preloadedItems, user])

  /**
   * Navigate to next item
   */
  const goToNext = useCallback(() => {
    trackCurrentView() // Track view of current item

    if (currentIndex < feedItems.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (hasMoreItems) {
      loadMoreItems()
    }
  }, [currentIndex, feedItems.length, hasMoreItems])

  /**
   * Navigate to previous item
   */
  const goToPrevious = useCallback(() => {
    trackCurrentView() // Track view of current item

    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  /**
   * Handle view start - record timestamp
   */
  const handleViewStart = useCallback(() => {
    setViewStartTime(Date.now())
    currentItemRef.current = feedItems[currentIndex]

    // Auto-track view after 1 second
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current)
    }
    
    viewTimeoutRef.current = setTimeout(() => {
      trackCurrentView()
    }, 1000)
  }, [currentIndex, feedItems])

  /**
   * Track current item view
   */
  const trackCurrentView = useCallback(async () => {
    if (currentItemRef.current && viewStartTime) {
      const viewDuration = Date.now() - viewStartTime
      
      // Only track if viewed for more than 500ms
      if (viewDuration > 500) {
        await trackView(currentItemRef.current.id, viewStartTime, Date.now())
        
        // Update view status locally
        setFeedItems(prev => prev.map(item => 
          item.id === currentItemRef.current.id 
            ? { ...item, hasViewed: true, userInteractions: { ...item.userInteractions, view: { timestamp: new Date().toISOString() } } }
            : item
        ))
      }
    }
  }, [viewStartTime])

  /**
   * Handle like interaction
   */
  const handleLike = useCallback(async (item) => {
    if (!user) return

    const newLikedState = !item.isLiked

    try {
      // Optimistic update
      setFeedItems(prev => prev.map(feedItem => 
        feedItem.id === item.id 
          ? { ...feedItem, isLiked: newLikedState, likeCount: newLikedState ? feedItem.likeCount + 1 : feedItem.likeCount - 1 }
          : feedItem
      ))

      await trackLike(item.id, newLikedState)
      
    } catch (error) {
      console.error('Error handling like:', error)
      
      // Revert optimistic update on error
      setFeedItems(prev => prev.map(feedItem => 
        feedItem.id === item.id 
          ? { ...feedItem, isLiked: !newLikedState, likeCount: !newLikedState ? feedItem.likeCount + 1 : feedItem.likeCount - 1 }
          : feedItem
      ))
    }
  }, [user])

  /**
   * Handle save interaction
   */
  const handleSave = useCallback(async (item) => {
    if (!user) return

    const newSavedState = !item.isSaved

    try {
      // Optimistic update
      setFeedItems(prev => prev.map(feedItem => 
        feedItem.id === item.id 
          ? { ...feedItem, isSaved: newSavedState, saveCount: newSavedState ? feedItem.saveCount + 1 : feedItem.saveCount - 1 }
          : feedItem
      ))

      await trackSave(item.id, newSavedState)
      
    } catch (error) {
      console.error('Error handling save:', error)
      
      // Revert optimistic update on error
      setFeedItems(prev => prev.map(feedItem => 
        feedItem.id === item.id 
          ? { ...feedItem, isSaved: !newSavedState, saveCount: !newSavedState ? feedItem.saveCount + 1 : feedItem.saveCount - 1 }
          : feedItem
      ))
    }
  }, [user])

  /**
   * Handle share interaction
   */
  const handleShare = useCallback(async (item, platform = null) => {
    if (!user) return

    try {
      // Optimistic update
      setFeedItems(prev => prev.map(feedItem => 
        feedItem.id === item.id 
          ? { ...feedItem, shareCount: feedItem.shareCount + 1 }
          : feedItem
      ))

      await trackShare(item.id, platform)
      
    } catch (error) {
      console.error('Error handling share:', error)
      
      // Revert optimistic update on error
      setFeedItems(prev => prev.map(feedItem => 
        feedItem.id === item.id 
          ? { ...feedItem, shareCount: feedItem.shareCount - 1 }
          : feedItem
      ))
    }
  }, [user])

  /**
   * Handle skip interaction (fast swipe)
   */
  const handleSkip = useCallback(async (item, timeSpent = 0) => {
    if (!user) return

    try {
      await trackSkip(item.id, timeSpent)
      
      // Update skip count locally
      setFeedItems(prev => prev.map(feedItem => 
        feedItem.id === item.id 
          ? { ...feedItem, skipCount: feedItem.skipCount + 1 }
          : feedItem
      ))
      
    } catch (error) {
      console.error('Error handling skip:', error)
    }
  }, [user])

  /**
   * Load items from specific restaurant
   */
  const loadRestaurantItems = useCallback(async (restaurantId) => {
    try {
      setLoading(true)
      const { data: restaurantItems, error: feedError } = await getFeedItemsByRestaurant(restaurantId, 10)
      
      if (feedError) {
        throw new Error(feedError)
      }

      // Get user interactions for restaurant items
      const itemsWithInteractions = await Promise.all(
        restaurantItems.map(async (item) => {
          const { data: interactions } = await getUserInteractions(item.id)
          return {
            ...item,
            isLiked: !!interactions.like,
            isSaved: !!interactions.save,
            hasViewed: !!interactions.view,
            userInteractions: interactions
          }
        })
      )

      setFeedItems(itemsWithInteractions)
      setCurrentIndex(0)
      setHasMoreItems(false) // Restaurant-specific feed doesn't have infinite scroll
      
    } catch (err) {
      console.error('Error loading restaurant items:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Return to main feed
   */
  const returnToMainFeed = useCallback(() => {
    loadInitialFeed()
  }, [])

  /**
   * Refresh feed
   */
  const refreshFeed = useCallback(() => {
    loadInitialFeed()
  }, [])

  /**
   * Get current item
   */
  const getCurrentItem = useCallback(() => {
    return feedItems[currentIndex] || null
  }, [feedItems, currentIndex])

  /**
   * Check if at end of feed
   */
  const isAtEnd = useCallback(() => {
    return currentIndex >= feedItems.length - 1 && !hasMoreItems
  }, [currentIndex, feedItems.length, hasMoreItems])

  return {
    // Data
    feedItems,
    currentIndex,
    currentItem: getCurrentItem(),
    
    // Loading states
    loading,
    loadingMore,
    error,
    hasMoreItems,
    
    // Navigation
    goToNext,
    goToPrevious,
    setCurrentIndex,
    
    // Actions
    handleLike,
    handleSave,
    handleShare,
    handleSkip,
    
    // Restaurant specific
    loadRestaurantItems,
    returnToMainFeed,
    
    // Utilities
    refreshFeed,
    loadMoreItems,
    isAtEnd,
    
    // View tracking
    trackCurrentView,
    handleViewStart
  }
}