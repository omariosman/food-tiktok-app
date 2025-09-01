-- Sample Feed Data Population
-- Execute this after running 004_feed_system.sql

-- First, let's populate feed_items with content based on our existing menu_items
INSERT INTO public.feed_items (
  id, dish_id, restaurant_id, media_url, media_type, thumbnail_url, 
  view_count, like_count, share_count, save_count, skip_count, algorithm_score,
  dish_name, dish_price, restaurant_name, cuisine_type
) VALUES 
  -- Truffle Mushroom Risotto - trending video content
  (
    '750e8400-e29b-41d4-a716-446655440001', 
    '650e8400-e29b-41d4-a716-446655440001', 
    '550e8400-e29b-41d4-a716-446655440001',
    'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=400&fit=crop',
    1250, 89, 23, 156, 45, 8.7,
    'Truffle Mushroom Risotto', 28.50, 'Bella Italia', 'Italian'
  ),
  -- Wagyu Burger - viral content
  (
    '750e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002', 
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=400&fit=crop',
    2340, 234, 67, 189, 78, 12.3,
    'BBQ Bacon Burger', 15.99, 'Burger House', 'American'
  ),
  -- Sushi Roll - aesthetic content
  (
    '750e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440008',
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=800&fit=crop', 
    'image',
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=400&fit=crop',
    980, 156, 34, 87, 23, 9.8,
    'Salmon Roll', 16.99, 'Sushi Zen', 'Japanese'
  ),
  -- Avocado Toast - healthy trend
  (
    '750e8400-e29b-41d4-a716-446655440004',
    '650e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440005',
    'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&h=800&fit=crop',
    'image', 
    'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=400&fit=crop',
    876, 98, 19, 134, 67, 7.2,
    'Avocado Toast Deluxe', 11.99, 'Toast & Co', 'Breakfast'
  ),
  -- Buddha Bowl - wellness content
  (
    '750e8400-e29b-41d4-a716-446655440005',
    '650e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440003',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=400&fit=crop',
    1456, 187, 43, 203, 89, 10.4,
    'Quinoa Buddha Bowl', 14.99, 'Green Garden', 'Healthy'
  ),
  -- Chicken Wings - comfort food
  (
    '750e8400-e29b-41d4-a716-446655440006',
    '650e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440004',
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&h=400&fit=crop',
    2100, 312, 89, 267, 156, 11.8,
    'Spicy Chicken Wings', 12.99, 'Wing Stop', 'American'
  ),
  -- Pizza - classic favorite  
  (
    '750e8400-e29b-41d4-a716-446655440007',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=400&fit=crop',
    1890, 278, 56, 189, 98, 10.1,
    'Margherita Pizza', 18.99, 'Bella Italia', 'Italian'
  ),
  -- Tacos - trending cuisine
  (
    '750e8400-e29b-41d4-a716-446655440008',
    '650e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440007',
    'https://images.unsplash.com/photo-1565299585323-38174c971bb0?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1565299585323-38174c971bb0?w=300&h=400&fit=crop',
    3456, 423, 134, 378, 234, 14.7,
    'Grilled Chicken Burrito', 12.99, 'Los Tacos', 'Mexican'
  ),
  -- Pad Thai - exotic flavors
  (
    '750e8400-e29b-41d4-a716-446655440009',
    null, -- No existing menu item
    null, -- Restaurant to be added
    'https://images.unsplash.com/photo-1559314809-0f31657dcc5e?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1559314809-0f31657dcc5e?w=300&h=400&fit=crop',
    876, 145, 29, 98, 43, 8.9,
    'Spicy Pad Thai', 16.99, 'Bangkok Kitchen', 'Thai'
  ),
  -- Ramen - comfort trending
  (
    '750e8400-e29b-41d4-a716-446655440010',
    null,
    null,
    'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=800&fit=crop',
    'image', 
    'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=300&h=400&fit=crop',
    2234, 289, 78, 234, 123, 11.2,
    'Tonkotsu Ramen', 18.75, 'Ramen House', 'Japanese'
  ),
  -- Acai Bowl - health trend
  (
    '750e8400-e29b-41d4-a716-446655440011',
    null,
    null,
    'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=400&fit=crop',
    1567, 234, 45, 187, 89, 9.1,
    'Acai Power Bowl', 13.50, 'Superfood Cafe', 'Healthy'
  ),
  -- Steak - premium content
  (
    '750e8400-e29b-41d4-a716-446655440012',
    null,
    null,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=400&fit=crop',
    987, 167, 34, 89, 45, 8.3,
    'Grilled Ribeye Steak', 32.99, 'Prime Steakhouse', 'Steakhouse'
  ),
  -- Pancakes - weekend vibes
  (
    '750e8400-e29b-41d4-a716-446655440013',
    '650e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440005',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=400&fit=crop',
    1234, 189, 34, 123, 67, 8.7,
    'French Toast Stack', 13.99, 'Toast & Co', 'Breakfast'
  ),
  -- Poke Bowl - fresh trend
  (
    '750e8400-e29b-41d4-a716-446655440014',
    null,
    null,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=400&fit=crop',
    1789, 267, 56, 178, 92, 10.3,
    'Salmon Poke Bowl', 19.50, 'Poke Paradise', 'Hawaiian'
  ),
  -- Dessert - indulgent content
  (
    '750e8400-e29b-41d4-a716-446655440015',
    null,
    null,
    'https://images.unsplash.com/photo-1563485446644-2e0c6ccdbe3b?w=600&h=800&fit=crop',
    'image',
    'https://images.unsplash.com/photo-1563485446644-2e0c6ccdbe3b?w=300&h=400&fit=crop',
    2567, 378, 89, 234, 123, 12.1,
    'Chocolate Lava Cake', 12.99, 'Sweet Dreams', 'Dessert'
  )
ON CONFLICT (id) DO NOTHING;

-- Add some additional restaurants for feed items without existing ones
INSERT INTO public.restaurants (id, name, description, cuisine_type, rating, delivery_rating, delivery_time_min, delivery_fee) VALUES 
  ('550e8400-e29b-41d4-a716-446655440009', 'Bangkok Kitchen', 'Authentic Thai street food experience', 'Thai', 4.6, 4.7, 28, 0.00),
  ('550e8400-e29b-41d4-a716-446655440010', 'Ramen House', 'Traditional Japanese ramen and noodles', 'Japanese', 4.8, 4.9, 22, 0.00),
  ('550e8400-e29b-41d4-a716-446655440011', 'Superfood Cafe', 'Healthy bowls and smoothies', 'Healthy', 4.5, 4.6, 18, 0.00),
  ('550e8400-e29b-41d4-a716-446655440012', 'Prime Steakhouse', 'Premium cuts and fine dining', 'Steakhouse', 4.9, 4.8, 45, 3.99),
  ('550e8400-e29b-41d4-a716-446655440013', 'Poke Paradise', 'Fresh Hawaiian poke bowls', 'Hawaiian', 4.7, 4.8, 20, 0.00),
  ('550e8400-e29b-41d4-a716-446655440014', 'Sweet Dreams', 'Artisanal desserts and pastries', 'Dessert', 4.4, 4.5, 25, 2.99)
ON CONFLICT (id) DO NOTHING;

-- Update feed_items to link to the new restaurants
UPDATE public.feed_items SET restaurant_id = '550e8400-e29b-41d4-a716-446655440009' WHERE id = '750e8400-e29b-41d4-a716-446655440009';
UPDATE public.feed_items SET restaurant_id = '550e8400-e29b-41d4-a716-446655440010' WHERE id = '750e8400-e29b-41d4-a716-446655440010';
UPDATE public.feed_items SET restaurant_id = '550e8400-e29b-41d4-a716-446655440011' WHERE id = '750e8400-e29b-41d4-a716-446655440011';
UPDATE public.feed_items SET restaurant_id = '550e8400-e29b-41d4-a716-446655440012' WHERE id = '750e8400-e29b-41d4-a716-446655440012';
UPDATE public.feed_items SET restaurant_id = '550e8400-e29b-41d4-a716-446655440013' WHERE id = '750e8400-e29b-41d4-a716-446655440014';
UPDATE public.feed_items SET restaurant_id = '550e8400-e29b-41d4-a716-446655440014' WHERE id = '750e8400-e29b-41d4-a716-446655440015';

-- Create some sample user preferences for personalization testing
-- (These would normally be set by users through the app)
INSERT INTO public.user_preferences (
  user_id, preferred_cuisines, price_range_min, price_range_max, 
  dietary_restrictions, preferred_delivery_time
) VALUES 
  -- Sample user 1: Italian food lover
  ('00000000-0000-0000-0000-000000000001', '{"Italian", "American"}', 15.00, 50.00, '{}', 30),
  -- Sample user 2: Health-conscious
  ('00000000-0000-0000-0000-000000000002', '{"Healthy", "Japanese"}', 10.00, 25.00, '{"vegetarian"}', 20),
  -- Sample user 3: Adventurous eater
  ('00000000-0000-0000-0000-000000000003', '{"Thai", "Mexican", "Japanese"}', 12.00, 35.00, '{}', 25)
ON CONFLICT (user_id) DO NOTHING;

-- Verification query to check our data
DO $$
BEGIN
    RAISE NOTICE 'Feed system setup completed successfully!';
    RAISE NOTICE 'Created % feed items with algorithm scores', 
        (SELECT COUNT(*) FROM public.feed_items);
    RAISE NOTICE 'Added % additional restaurants', 
        (SELECT COUNT(*) FROM public.restaurants WHERE id::text LIKE '550e8400-e29b-41d4-a716-446655440%' AND name NOT IN ('Bella Italia', 'Burger House', 'Green Garden', 'Wing Stop', 'Toast & Co', 'Pizza Palace'));
    RAISE NOTICE 'Sample feed items with highest scores:';
    
    -- Show top 5 items by algorithm score
    FOR rec IN 
        SELECT dish_name, restaurant_name, algorithm_score, view_count, like_count 
        FROM public.feed_items 
        ORDER BY algorithm_score DESC 
        LIMIT 5
    LOOP
        RAISE NOTICE '- %: % (Score: %, Views: %, Likes: %)', 
            rec.restaurant_name, rec.dish_name, rec.algorithm_score, rec.view_count, rec.like_count;
    END LOOP;
END $$;