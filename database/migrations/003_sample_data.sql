-- Insert sample restaurants
INSERT INTO public.restaurants (id, name, description, image_url, cuisine_type, rating, delivery_rating, delivery_time_min, delivery_fee) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Bella Italia', 'Authentic Italian cuisine with fresh ingredients', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop', 'Italian', 4.5, 4.8, 25, 0.00),
  ('550e8400-e29b-41d4-a716-446655440002', 'Burger House', 'Gourmet burgers and crispy fries', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop', 'American', 4.3, 4.6, 20, 0.00),
  ('550e8400-e29b-41d4-a716-446655440003', 'Green Garden', 'Fresh, healthy, plant-based options', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', 'Healthy', 4.7, 4.9, 15, 0.00),
  ('550e8400-e29b-41d4-a716-446655440004', 'Wing Stop', 'Best wings in town with signature sauces', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop', 'American', 4.4, 4.7, 30, 0.00),
  ('550e8400-e29b-41d4-a716-446655440005', 'Toast & Co', 'Artisanal toast and breakfast delights', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop', 'Breakfast', 4.6, 4.8, 18, 0.00),
  ('550e8400-e29b-41d4-a716-446655440006', 'Pizza Palace', 'New York style pizza since 1985', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', 'Italian', 4.2, 4.5, 35, 0.00),
  ('550e8400-e29b-41d4-a716-446655440007', 'Los Tacos', 'Authentic Mexican street tacos', 'https://images.unsplash.com/photo-1565299585323-38174c971bb0?w=400&h=300&fit=crop', 'Mexican', 4.8, 4.9, 22, 0.00),
  ('550e8400-e29b-41d4-a716-446655440008', 'Sushi Zen', 'Fresh sushi and Japanese specialties', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Japanese', 4.9, 4.8, 28, 0.00);

-- Insert sample menu items
INSERT INTO public.menu_items (id, restaurant_id, name, description, price, image_url, category, times_saved) VALUES 
  -- Bella Italia
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Margherita Pizza', 'Classic pizza with fresh mozzarella, tomatoes, and basil', 18.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=225&fit=crop', 'Pizza', 15),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Fettuccine Alfredo', 'Rich and creamy pasta with parmesan cheese', 22.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d30e?w=400&h=225&fit=crop', 'Pasta', 8),
  
  -- Burger House
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'BBQ Bacon Burger', 'Juicy beef patty with BBQ sauce and crispy bacon', 15.99, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=225&fit=crop', 'Burgers', 23),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Truffle Fries', 'Golden fries with truffle oil and parmesan', 9.99, 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&h=225&fit=crop', 'Sides', 12),
  
  -- Green Garden
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Quinoa Buddha Bowl', 'Nutritious bowl with quinoa, vegetables, and tahini dressing', 14.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=225&fit=crop', 'Bowls', 31),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Green Smoothie', 'Spinach, kale, banana, and apple smoothie', 8.99, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=225&fit=crop', 'Beverages', 7),
  
  -- Wing Stop
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'Spicy Chicken Wings', 'Buffalo wings with our signature hot sauce', 12.99, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=225&fit=crop', 'Wings', 19),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'Honey BBQ Wings', 'Sweet and tangy wings with honey BBQ glaze', 13.99, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=225&fit=crop', 'Wings', 14),
  
  -- Toast & Co
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'Avocado Toast Deluxe', 'Multigrain toast with smashed avocado and poached egg', 11.99, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=225&fit=crop', 'Toast', 27),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'French Toast Stack', 'Fluffy French toast with berries and maple syrup', 13.99, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=225&fit=crop', 'Breakfast', 16),
  
  -- Pizza Palace
  ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440006', 'Pepperoni Supreme', 'Classic pepperoni pizza with extra cheese', 21.99, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=225&fit=crop', 'Pizza', 11),
  ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006', 'Meat Lovers', 'Pizza loaded with pepperoni, sausage, and bacon', 25.99, 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=225&fit=crop', 'Pizza', 20),
  
  -- Los Tacos
  ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440007', 'Grilled Chicken Burrito', 'Flour tortilla with grilled chicken, rice, beans, and salsa', 12.99, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=225&fit=crop', 'Burritos', 25),
  ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440007', 'Fish Tacos', 'Fresh fish tacos with cabbage slaw and chipotle mayo', 14.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=225&fit=crop', 'Tacos', 18),
  
  -- Sushi Zen
  ('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440008', 'Salmon Roll', 'Fresh salmon with cucumber and avocado', 16.99, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=225&fit=crop', 'Sushi', 22),
  ('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440008', 'Dragon Roll', 'Tempura shrimp with eel and avocado on top', 24.99, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=225&fit=crop', 'Sushi', 29);

-- Note: The times_saved values are sample data representing how many users have saved each dish