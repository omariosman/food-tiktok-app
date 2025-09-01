import { supabase } from '../lib/supabase'

/**
 * Interaction Tracking Service - Track user engagement with feed items
 */

/**
 * Track user interaction with feed item
 * @param {string} feedItemId - Feed item ID
 * @param {string} interactionType - Type: 'view', 'like', 'share', 'save', 'skip'
 * @param {number} durationWatched - Duration in milliseconds (for videos)
 * @returns {Promise<{data: any, error: any}>}
 */
export const trackInteraction = async (feedItemId, interactionType, durationWatched = 0) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Insert or update interaction
    const { data, error } = await supabase
      .from('feed_interactions')
      .upsert({
        user_id: user.id,
        feed_item_id: feedItemId,
        interaction_type: interactionType,
        duration_watched: durationWatched,
        timestamp: new Date().toISOString()
      }, {
        onConflict: 'user_id,feed_item_id,interaction_type',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      throw error
    }

    // For certain interactions, update user preferences for better recommendations
    if (interactionType === 'like' || interactionType === 'save') {
      await updateUserPreferencesFromInteraction(user.id, feedItemId, interactionType)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error tracking interaction:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Track view interaction with automatic duration calculation
 * @param {string} feedItemId - Feed item ID
 * @param {number} startTime - View start timestamp
 * @param {number} endTime - View end timestamp  
 * @returns {Promise<{data: any, error: any}>}
 */
export const trackView = async (feedItemId, startTime = Date.now(), endTime = null) => {
  const duration = endTime ? endTime - startTime : 0
  return trackInteraction(feedItemId, 'view', duration)
}

/**
 * Track like interaction
 * @param {string} feedItemId - Feed item ID
 * @param {boolean} isLiked - Whether user liked (true) or unliked (false)
 * @returns {Promise<{data: any, error: any}>}
 */
export const trackLike = async (feedItemId, isLiked = true) => {
  if (isLiked) {
    return trackInteraction(feedItemId, 'like')
  } else {
    // Remove like interaction
    return removeInteraction(feedItemId, 'like')
  }
}

/**
 * Track save interaction
 * @param {string} feedItemId - Feed item ID
 * @param {boolean} isSaved - Whether user saved (true) or unsaved (false)
 * @returns {Promise<{data: any, error: any}>}
 */
export const trackSave = async (feedItemId, isSaved = true) => {
  if (isSaved) {
    return trackInteraction(feedItemId, 'save')
  } else {
    return removeInteraction(feedItemId, 'save')
  }
}

/**
 * Track share interaction
 * @param {string} feedItemId - Feed item ID
 * @param {string} platform - Share platform (optional)
 * @returns {Promise<{data: any, error: any}>}
 */
export const trackShare = async (feedItemId, platform = null) => {
  const result = await trackInteraction(feedItemId, 'share')
  
  // Optional: track share platform for analytics
  if (platform && result.data) {
    // Could extend to track share platforms in separate table
    console.log(`Shared to ${platform}:`, feedItemId)
  }

  return result
}

/**
 * Track skip interaction (user swiped past quickly)
 * @param {string} feedItemId - Feed item ID  
 * @param {number} timeSpent - Time spent viewing in milliseconds
 * @returns {Promise<{data: any, error: any}>}
 */
export const trackSkip = async (feedItemId, timeSpent = 0) => {
  return trackInteraction(feedItemId, 'skip', timeSpent)
}

/**
 * Remove specific interaction
 * @param {string} feedItemId - Feed item ID
 * @param {string} interactionType - Interaction type to remove
 * @returns {Promise<{data: any, error: any}>}
 */
export const removeInteraction = async (feedItemId, interactionType) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('feed_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('feed_item_id', feedItemId)
      .eq('interaction_type', interactionType)
      .select()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error removing interaction:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get user's interactions with a feed item
 * @param {string} feedItemId - Feed item ID
 * @returns {Promise<{data: Object, error: any}>}
 */
export const getUserInteractions = async (feedItemId) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { data: {}, error: null } // Return empty for unauthenticated users
    }

    const { data: interactions, error } = await supabase
      .from('feed_interactions')
      .select('interaction_type, duration_watched, timestamp')
      .eq('user_id', user.id)
      .eq('feed_item_id', feedItemId)

    if (error) {
      throw error
    }

    // Convert to object for easy lookup
    const interactionMap = {}
    interactions?.forEach(interaction => {
      interactionMap[interaction.interaction_type] = {
        timestamp: interaction.timestamp,
        duration: interaction.duration_watched
      }
    })

    return { data: interactionMap, error: null }
  } catch (error) {
    console.error('Error fetching user interactions:', error)
    return { data: {}, error: error.message }
  }
}

/**
 * Get user's interaction history
 * @param {number} limit - Number of interactions to return
 * @param {number} offset - Pagination offset
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getUserInteractionHistory = async (limit = 50, offset = 0) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data: interactions, error } = await supabase
      .from('feed_interactions')
      .select(`
        interaction_type,
        duration_watched,
        timestamp,
        feed_items (
          id,
          dish_name,
          restaurant_name,
          media_url,
          cuisine_type
        )
      `)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { data: interactions || [], error: null }
  } catch (error) {
    console.error('Error fetching interaction history:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get feed item statistics
 * @param {string} feedItemId - Feed item ID
 * @returns {Promise<{data: Object, error: any}>}
 */
export const getFeedItemStats = async (feedItemId) => {
  try {
    const { data: feedItem, error } = await supabase
      .from('feed_items')
      .select('view_count, like_count, share_count, save_count, skip_count, algorithm_score')
      .eq('id', feedItemId)
      .single()

    if (error) {
      throw error
    }

    return { data: feedItem, error: null }
  } catch (error) {
    console.error('Error fetching feed item stats:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update user preferences based on interaction patterns
 * @param {string} userId - User ID
 * @param {string} feedItemId - Feed item ID
 * @param {string} interactionType - Type of interaction
 * @returns {Promise<void>}
 */
const updateUserPreferencesFromInteraction = async (userId, feedItemId, interactionType) => {
  try {
    // Get feed item details
    const { data: feedItem, error: feedError } = await supabase
      .from('feed_items')
      .select('cuisine_type, dish_price')
      .eq('id', feedItemId)
      .single()

    if (feedError || !feedItem) {
      return // Skip if can't get feed item data
    }

    // Get current user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    let updatedPreferences = {}

    if (prefError && prefError.code === 'PGRST116') {
      // User preferences don't exist, create new ones
      updatedPreferences = {
        user_id: userId,
        preferred_cuisines: feedItem.cuisine_type ? [feedItem.cuisine_type] : [],
        price_range_min: feedItem.dish_price ? Math.max(0, feedItem.dish_price - 10) : 0,
        price_range_max: feedItem.dish_price ? feedItem.dish_price + 20 : 100,
      }
    } else if (!prefError && preferences) {
      // Update existing preferences
      updatedPreferences = { ...preferences }

      // Add cuisine to preferred list if not already there
      if (feedItem.cuisine_type) {
        const cuisines = updatedPreferences.preferred_cuisines || []
        if (!cuisines.includes(feedItem.cuisine_type)) {
          updatedPreferences.preferred_cuisines = [...cuisines, feedItem.cuisine_type]
        }
      }

      // Adjust price range based on liked/saved items
      if (feedItem.dish_price) {
        const currentMin = updatedPreferences.price_range_min || 0
        const currentMax = updatedPreferences.price_range_max || 100

        // Expand price range if item is outside current range
        updatedPreferences.price_range_min = Math.min(currentMin, feedItem.dish_price - 5)
        updatedPreferences.price_range_max = Math.max(currentMax, feedItem.dish_price + 5)
      }
    }

    // Upsert preferences
    await supabase
      .from('user_preferences')
      .upsert(updatedPreferences, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    // Don't throw - this is background processing
  }
}

/**
 * Batch track multiple interactions (for performance)
 * @param {Array} interactions - Array of interaction objects
 * @returns {Promise<{data: any, error: any}>}
 */
export const batchTrackInteractions = async (interactions) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Format interactions with user_id and timestamp
    const formattedInteractions = interactions.map(interaction => ({
      user_id: user.id,
      feed_item_id: interaction.feedItemId,
      interaction_type: interaction.type,
      duration_watched: interaction.duration || 0,
      timestamp: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('feed_interactions')
      .upsert(formattedInteractions, {
        onConflict: 'user_id,feed_item_id,interaction_type',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error batch tracking interactions:', error)
    return { data: null, error: error.message }
  }
}