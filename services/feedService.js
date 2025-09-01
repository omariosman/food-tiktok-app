import { supabase } from '../lib/supabase'

/**
 * Feed Algorithm Service - Personalized content delivery
 */

/**
 * Get personalized feed items for user
 * @param {number} limit - Number of items to return (default: 10)
 * @param {number} offset - Pagination offset (default: 0)  
 * @param {string} userId - User ID for personalization
 * @returns {Promise<{data: Array, error: any, hasMore: boolean}>}
 */
export const getPersonalizedFeed = async (limit = 10, offset = 0, userId = null) => {
  try {
    // Get current user if not provided
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.warn('No authenticated user, returning general feed')
      } else {
        userId = user?.id
      }
    }

    let query = supabase
      .from('feed_items')
      .select(`
        id,
        dish_id,
        restaurant_id,
        media_url,
        media_type,
        thumbnail_url,
        duration,
        view_count,
        like_count,
        share_count,
        save_count,
        skip_count,
        algorithm_score,
        dish_name,
        dish_price,
        restaurant_name,
        cuisine_type,
        created_at,
        restaurants (
          id,
          name,
          rating,
          delivery_rating,
          delivery_time_min,
          delivery_fee
        )
      `)
      .eq('is_active', true)

    // Apply personalization if user is available
    if (userId) {
      // Get user preferences
      const { data: preferences } = await getUserPreferences(userId)
      
      if (preferences) {
        // Filter by preferred cuisines if set
        if (preferences.preferred_cuisines && preferences.preferred_cuisines.length > 0) {
          query = query.in('cuisine_type', preferences.preferred_cuisines)
        }

        // Filter by price range
        if (preferences.price_range_min && preferences.price_range_max) {
          query = query
            .gte('dish_price', preferences.price_range_min)
            .lte('dish_price', preferences.price_range_max)
        }
      }

      // Exclude items user has recently interacted with (within last 24 hours)
      const { data: recentInteractions } = await supabase
        .from('feed_interactions')
        .select('feed_item_id')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (recentInteractions && recentInteractions.length > 0) {
        const recentItemIds = recentInteractions.map(i => i.feed_item_id)
        query = query.not('id', 'in', `(${recentItemIds.join(',')})`)
      }
    }

    // Apply algorithm-based ordering with diversity
    // Mix of trending (high algorithm score) and fresh content (recent)
    const { data: feedItems, error } = await query
      .order('algorithm_score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Check if there are more items
    const { count: totalCount, error: countError } = await supabase
      .from('feed_items')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    const hasMore = !countError && totalCount > offset + limit

    // Format data for frontend
    const formattedItems = feedItems?.map(item => ({
      id: item.id,
      dishId: item.dish_id,
      restaurantId: item.restaurant_id,
      name: item.dish_name,
      description: `Delicious ${item.dish_name} from ${item.restaurant_name}`,
      imageUrl: item.media_url,
      videoUrl: item.media_type === 'video' ? item.media_url : null,
      thumbnailUrl: item.thumbnail_url,
      mediaType: item.media_type,
      duration: item.duration,
      restaurantName: item.restaurant_name,
      price: parseFloat(item.dish_price || 0),
      cuisineType: item.cuisine_type,
      
      // Stats
      viewCount: item.view_count,
      likeCount: item.like_count,
      shareCount: item.share_count,
      saveCount: item.save_count,
      skipCount: item.skip_count,
      algorithmScore: parseFloat(item.algorithm_score || 0),

      // Restaurant info
      restaurantRating: item.restaurants?.rating?.toString() || '4.5',
      deliveryRating: item.restaurants?.delivery_rating?.toString() || '4.2',
      deliveryTime: item.restaurants?.delivery_time_min?.toString() || '25',
      deliveryFee: item.restaurants?.delivery_fee?.toString() || '0',
      
      // For UI compatibility
      googleRating: item.restaurants?.rating?.toString() || '4.5',
      googleReviews: `${Math.floor(item.view_count / 10)}+`,
      reviewCount: Math.floor(item.view_count / 20),
      isSaved: false, // Will be checked separately
      createdAt: item.created_at
    })) || []

    // Check which items are saved by the user
    if (userId && formattedItems.length > 0) {
      const itemIds = formattedItems.map(item => item.dishId).filter(Boolean)
      if (itemIds.length > 0) {
        const { data: savedItems } = await supabase
          .from('saved_dishes')
          .select('dish_id')
          .eq('user_id', userId)
          .in('dish_id', itemIds)

        const savedDishIds = new Set(savedItems?.map(item => item.dish_id) || [])
        
        formattedItems.forEach(item => {
          if (item.dishId) {
            item.isSaved = savedDishIds.has(item.dishId)
          }
        })
      }
    }

    return { data: formattedItems, error: null, hasMore }

  } catch (error) {
    console.error('Error fetching personalized feed:', error)
    return { data: [], error: error.message, hasMore: false }
  }
}

/**
 * Get trending feed items (high algorithm scores)
 * @param {number} limit - Number of items to return
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getTrendingFeed = async (limit = 20) => {
  try {
    const { data: feedItems, error } = await supabase
      .from('feed_items')
      .select(`
        id, dish_name, restaurant_name, media_url, algorithm_score,
        view_count, like_count, share_count, save_count
      `)
      .eq('is_active', true)
      .order('algorithm_score', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return { data: feedItems || [], error: null }
  } catch (error) {
    console.error('Error fetching trending feed:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get user preferences for personalization
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object, error: any}>}
 */
export const getUserPreferences = async (userId) => {
  try {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is OK
      throw error
    }

    return { data: preferences, error: null }
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Preference updates
 * @returns {Promise<{data: Object, error: any}>}
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get feed items by restaurant (for swipe left functionality)
 * @param {string} restaurantId - Restaurant ID
 * @param {number} limit - Number of items to return
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getFeedItemsByRestaurant = async (restaurantId, limit = 10) => {
  try {
    const { data: feedItems, error } = await supabase
      .from('feed_items')
      .select(`
        id, dish_id, restaurant_id, media_url, media_type, thumbnail_url,
        dish_name, dish_price, restaurant_name, cuisine_type, algorithm_score,
        restaurants (rating, delivery_rating, delivery_time_min, delivery_fee)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('algorithm_score', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Format data similar to getPersonalizedFeed
    const formattedItems = feedItems?.map(item => ({
      id: item.id,
      dishId: item.dish_id,
      restaurantId: item.restaurant_id,
      name: item.dish_name,
      description: `Delicious ${item.dish_name} from ${item.restaurant_name}`,
      imageUrl: item.media_url,
      videoUrl: item.media_type === 'video' ? item.media_url : null,
      restaurantName: item.restaurant_name,
      price: parseFloat(item.dish_price || 0),
      cuisineType: item.cuisine_type,
      restaurantRating: item.restaurants?.rating?.toString() || '4.5',
      deliveryRating: item.restaurants?.delivery_rating?.toString() || '4.2',
      deliveryTime: item.restaurants?.delivery_time_min?.toString() || '25',
      deliveryFee: item.restaurants?.delivery_fee?.toString() || '0',
      googleRating: item.restaurants?.rating?.toString() || '4.5',
      googleReviews: '500+',
      reviewCount: 89,
      isSaved: false,
      algorithmScore: parseFloat(item.algorithm_score || 0)
    })) || []

    return { data: formattedItems, error: null }
  } catch (error) {
    console.error('Error fetching restaurant feed items:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Preload next batch of feed items for smooth scrolling
 * @param {number} currentOffset - Current pagination offset
 * @param {number} preloadCount - Number of items to preload (default: 3)
 * @param {string} userId - User ID for personalization
 * @returns {Promise<{data: Array, error: any}>}
 */
export const preloadFeedItems = async (currentOffset, preloadCount = 3, userId = null) => {
  return getPersonalizedFeed(preloadCount, currentOffset + 10, userId)
}

/**
 * Search feed items by query
 * @param {string} query - Search query
 * @param {number} limit - Number of items to return
 * @returns {Promise<{data: Array, error: any}>}
 */
export const searchFeedItems = async (query, limit = 20) => {
  try {
    const { data: feedItems, error } = await supabase
      .from('feed_items')
      .select(`
        id, dish_id, restaurant_id, media_url, media_type,
        dish_name, dish_price, restaurant_name, cuisine_type,
        restaurants (rating, delivery_rating, delivery_time_min, delivery_fee)
      `)
      .eq('is_active', true)
      .or(`dish_name.ilike.%${query}%,restaurant_name.ilike.%${query}%,cuisine_type.ilike.%${query}%`)
      .order('algorithm_score', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    const formattedItems = feedItems?.map(item => ({
      id: item.id,
      dishId: item.dish_id,
      name: item.dish_name,
      imageUrl: item.media_url,
      restaurantName: item.restaurant_name,
      price: parseFloat(item.dish_price || 0),
      cuisineType: item.cuisine_type,
      restaurantRating: item.restaurants?.rating?.toString() || '4.5',
      deliveryRating: item.restaurants?.delivery_rating?.toString() || '4.2',
      deliveryTime: item.restaurants?.delivery_time_min?.toString() || '25',
    })) || []

    return { data: formattedItems, error: null }
  } catch (error) {
    console.error('Error searching feed items:', error)
    return { data: [], error: error.message }
  }
}