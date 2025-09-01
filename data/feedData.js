// Sample data for TikTok-style food feed

export const feedData = [
  {
    id: '1',
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy Arborio rice with wild mushrooms, truffle oil, and Parmesan cheese. A luxurious Italian classic.',
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder - would contain actual video URL
    restaurantName: 'Bella Vista Italian',
    deliveryTime: 25,
    price: 28.50,
    googleRating: 4.7,
    googleReviews: '1.2K',
    deliveryRating: 4.8,
    deliveryReviews: '500+',
    reviewCount: 147,
    isSaved: false,
    category: 'Italian',
  },
  {
    id: '2',
    name: 'Wagyu Beef Burger',
    description: 'Premium Wagyu beef patty with caramelized onions, aged cheddar, and truffle aioli on brioche bun.',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder
    restaurantName: 'Gourmet Burger Co.',
    deliveryTime: 20,
    price: 24.99,
    googleRating: 4.6,
    googleReviews: '890',
    deliveryRating: 4.5,
    deliveryReviews: '300+',
    reviewCount: 89,
    isSaved: true,
    category: 'American',
  },
  {
    id: '3',
    name: 'Dragon Roll Sushi',
    description: 'Fresh salmon, cucumber, and avocado wrapped in nori with eel sauce and sesame seeds.',
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder
    restaurantName: 'Sushi Zen',
    deliveryTime: 35,
    price: 18.75,
    googleRating: 4.9,
    googleReviews: '2.1K',
    deliveryRating: 4.7,
    deliveryReviews: '800+',
    reviewCount: 203,
    isSaved: false,
    category: 'Japanese',
  },
  {
    id: '4',
    name: 'Avocado Toast Supreme',
    description: 'Multigrain sourdough with smashed avocado, poached egg, cherry tomatoes, and everything bagel seasoning.',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder
    restaurantName: 'The Breakfast Spot',
    deliveryTime: 15,
    price: 14.50,
    googleRating: 4.4,
    googleReviews: '650',
    deliveryRating: 4.6,
    deliveryReviews: '200+',
    reviewCount: 76,
    isSaved: false,
    category: 'Breakfast',
  },
  {
    id: '5',
    name: 'Spicy Thai Pad Thai',
    description: 'Traditional rice noodles with shrimp, tofu, bean sprouts, crushed peanuts, and lime. Extra spicy!',
    imageUrl: 'https://images.unsplash.com/photo-1559314809-0f31657dcc5e?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder
    restaurantName: 'Bangkok Street Kitchen',
    deliveryTime: 30,
    price: 16.99,
    googleRating: 4.8,
    googleReviews: '1.5K',
    deliveryRating: 4.9,
    deliveryReviews: '600+',
    reviewCount: 134,
    isSaved: true,
    category: 'Thai',
  },
  {
    id: '6',
    name: 'Margherita Pizza Napoletana',
    description: 'Wood-fired pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder
    restaurantName: 'Nonna\'s Pizzeria',
    deliveryTime: 28,
    price: 22.00,
    googleRating: 4.5,
    googleReviews: '980',
    deliveryRating: 4.3,
    deliveryReviews: '400+',
    reviewCount: 95,
    isSaved: false,
    category: 'Italian',
  },
  {
    id: '7',
    name: 'Korean BBQ Bibimbap',
    description: 'Traditional mixed rice bowl with marinated beef, vegetables, gochujang sauce, and a fried egg on top.',
    imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder
    restaurantName: 'Seoul Kitchen',
    deliveryTime: 25,
    price: 19.75,
    googleRating: 4.7,
    googleReviews: '1.1K',
    deliveryRating: 4.8,
    deliveryReviews: '450+',
    reviewCount: 156,
    isSaved: false,
    category: 'Korean',
  },
  {
    id: '8',
    name: 'Chocolate Lava Cake',
    description: 'Decadent warm chocolate cake with molten center, served with vanilla ice cream and berry compote.',
    imageUrl: 'https://images.unsplash.com/photo-1563485446644-2e0c6ccdbe3b?w=400&h=600&fit=crop',
    videoUrl: null, // Video placeholder
    restaurantName: 'Sweet Dreams Desserts',
    deliveryTime: 20,
    price: 12.99,
    googleRating: 4.6,
    googleReviews: '750',
    deliveryRating: 4.4,
    deliveryReviews: '280+',
    reviewCount: 68,
    isSaved: true,
    category: 'Dessert',
  }
]

// Function to get dishes by restaurant (for swipe left functionality)
export const getDishesByRestaurant = (restaurantName) => {
  return feedData.filter(dish => dish.restaurantName === restaurantName)
}

// Function to get random dishes for infinite scroll
export const getMoreDishes = (excludeIds = []) => {
  return feedData.filter(dish => !excludeIds.includes(dish.id))
}