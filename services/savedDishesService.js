import { supabase } from '../lib/supabase'

/**
 * Get all saved dishes for the current user
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getSavedDishes = async () => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data: savedDishes, error } = await supabase
      .from('saved_dishes')
      .select(`
        id,
        saved_at,
        dish_id,
        restaurant_id,
        menu_items (
          id,
          name,
          description,
          price,
          image_url,
          category,
          times_saved,
          restaurant_name,
          delivery_time,
          delivery_fee
        ),
        restaurants (
          id,
          name,
          rating,
          delivery_rating,
          delivery_time_min,
          delivery_fee
        )
      `)
      .order('saved_at', { ascending: false })

    if (error) {
      throw error
    }

    // Format the data for the UI
    const formattedData = savedDishes?.map(item => ({
      id: item.id,
      dishId: item.dish_id,
      restaurantId: item.restaurant_id,
      imageUri: item.menu_items?.image_url,
      restaurantName: item.menu_items?.restaurant_name || item.restaurants?.name,
      dishName: item.menu_items?.name,
      restaurantRating: item.restaurants?.rating?.toString(),
      deliveryRating: item.restaurants?.delivery_rating?.toString(),
      deliveryTime: item.menu_items?.delivery_time?.toString() || item.restaurants?.delivery_time_min?.toString(),
      deliveryFee: item.menu_items?.delivery_fee?.toString() || item.restaurants?.delivery_fee?.toString(),
      price: item.menu_items?.price?.toString(),
      savedAt: item.saved_at,
      timesSaved: item.menu_items?.times_saved,
      category: item.menu_items?.category,
      description: item.menu_items?.description
    })) || []

    return { data: formattedData, error: null }
  } catch (error) {
    console.error('Error fetching saved dishes:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Save a dish for the current user
 * @param {string} dishId - The ID of the dish to save
 * @returns {Promise<{data: any, error: any}>}
 */
export const saveDish = async (dishId) => {
  try {
    // First get the restaurant_id for the dish
    const { data: menuItem, error: menuError } = await supabase
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', dishId)
      .single()

    if (menuError) {
      throw menuError
    }

    if (!menuItem) {
      throw new Error('Dish not found')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Insert the saved dish
    const { data, error } = await supabase
      .from('saved_dishes')
      .insert({
        user_id: user.id,
        dish_id: dishId,
        restaurant_id: menuItem.restaurant_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error saving dish:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Remove a dish from saved dishes
 * @param {string} dishId - The ID of the dish to remove
 * @returns {Promise<{data: any, error: any}>}
 */
export const removeSavedDish = async (dishId) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('saved_dishes')
      .delete()
      .eq('user_id', user.id)
      .eq('dish_id', dishId)
      .select()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error removing saved dish:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Check if a dish is saved by the current user
 * @param {string} dishId - The ID of the dish to check
 * @returns {Promise<{isSaved: boolean, error: any}>}
 */
export const isDishSaved = async (dishId) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { isSaved: false, error: null }
    }

    const { data, error } = await supabase
      .from('saved_dishes')
      .select('id')
      .eq('user_id', user.id)
      .eq('dish_id', dishId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error
    }

    return { isSaved: !!data, error: null }
  } catch (error) {
    console.error('Error checking if dish is saved:', error)
    return { isSaved: false, error: error.message }
  }
}

/**
 * Search saved dishes by name or restaurant
 * @param {string} query - The search query
 * @returns {Promise<{data: Array, error: any}>}
 */
export const searchSavedDishes = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return getSavedDishes()
    }

    const { data: savedDishes, error } = await supabase
      .from('saved_dishes')
      .select(`
        id,
        saved_at,
        dish_id,
        restaurant_id,
        menu_items (
          id,
          name,
          description,
          price,
          image_url,
          category,
          times_saved,
          restaurant_name,
          delivery_time,
          delivery_fee
        ),
        restaurants (
          id,
          name,
          rating,
          delivery_rating,
          delivery_time_min,
          delivery_fee
        )
      `)
      .or(`menu_items.name.ilike.%${query}%,menu_items.restaurant_name.ilike.%${query}%,restaurants.name.ilike.%${query}%`)
      .order('saved_at', { ascending: false })

    if (error) {
      throw error
    }

    // Format the data for the UI
    const formattedData = savedDishes?.map(item => ({
      id: item.id,
      dishId: item.dish_id,
      restaurantId: item.restaurant_id,
      imageUri: item.menu_items?.image_url,
      restaurantName: item.menu_items?.restaurant_name || item.restaurants?.name,
      dishName: item.menu_items?.name,
      restaurantRating: item.restaurants?.rating?.toString(),
      deliveryRating: item.restaurants?.delivery_rating?.toString(),
      deliveryTime: item.menu_items?.delivery_time?.toString() || item.restaurants?.delivery_time_min?.toString(),
      deliveryFee: item.menu_items?.delivery_fee?.toString() || item.restaurants?.delivery_fee?.toString(),
      price: item.menu_items?.price?.toString(),
      savedAt: item.saved_at,
      timesSaved: item.menu_items?.times_saved,
      category: item.menu_items?.category,
      description: item.menu_items?.description
    })) || []

    return { data: formattedData, error: null }
  } catch (error) {
    console.error('Error searching saved dishes:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get all available menu items (for browsing/discovery)
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getAllMenuItems = async () => {
  try {
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        category,
        times_saved,
        restaurant_name,
        delivery_time,
        delivery_fee,
        restaurants (
          id,
          name,
          rating,
          delivery_rating,
          delivery_time_min,
          delivery_fee
        )
      `)
      .eq('is_available', true)
      .order('times_saved', { ascending: false })

    if (error) {
      throw error
    }

    // Format the data for the UI
    const formattedData = menuItems?.map(item => ({
      id: item.id,
      imageUri: item.image_url,
      restaurantName: item.restaurant_name || item.restaurants?.name,
      dishName: item.name,
      restaurantRating: item.restaurants?.rating?.toString(),
      deliveryRating: item.restaurants?.delivery_rating?.toString(),
      deliveryTime: item.delivery_time?.toString() || item.restaurants?.delivery_time_min?.toString(),
      deliveryFee: item.delivery_fee?.toString() || item.restaurants?.delivery_fee?.toString(),
      price: item.price?.toString(),
      timesSaved: item.times_saved,
      category: item.category,
      description: item.description
    })) || []

    return { data: formattedData, error: null }
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get popular dishes (most saved)
 * @param {number} limit - Number of dishes to return
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getPopularDishes = async (limit = 20) => {
  try {
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        category,
        times_saved,
        restaurant_name,
        delivery_time,
        delivery_fee,
        restaurants (
          id,
          name,
          rating,
          delivery_rating,
          delivery_time_min,
          delivery_fee
        )
      `)
      .eq('is_available', true)
      .gte('times_saved', 1)
      .order('times_saved', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Format the data for the UI
    const formattedData = menuItems?.map(item => ({
      id: item.id,
      imageUri: item.image_url,
      restaurantName: item.restaurant_name || item.restaurants?.name,
      dishName: item.name,
      restaurantRating: item.restaurants?.rating?.toString(),
      deliveryRating: item.restaurants?.delivery_rating?.toString(),
      deliveryTime: item.delivery_time?.toString() || item.restaurants?.delivery_time_min?.toString(),
      deliveryFee: item.delivery_fee?.toString() || item.restaurants?.delivery_fee?.toString(),
      price: item.price?.toString(),
      timesSaved: item.times_saved,
      category: item.category,
      description: item.description
    })) || []

    return { data: formattedData, error: null }
  } catch (error) {
    console.error('Error fetching popular dishes:', error)
    return { data: [], error: error.message }
  }
}