-- Supabase Database Setup for Food TikTok App
-- Execute this entire script in the Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cuisine_type TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  delivery_rating DECIMAL(2,1) DEFAULT 0.0,
  delivery_time_min INTEGER DEFAULT 30,
  delivery_fee DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for restaurants
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy for restaurants
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON public.restaurants;
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants
  FOR SELECT USING (is_active = true);

-- 3. Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  times_saved INTEGER DEFAULT 0,
  restaurant_name TEXT,
  delivery_time INTEGER,
  delivery_fee DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy for menu_items
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON public.menu_items;
CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items
  FOR SELECT USING (is_available = true);

-- 4. Create saved_dishes table (THE MAIN TABLE THAT WAS MISSING)
CREATE TABLE IF NOT EXISTS public.saved_dishes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dish_id)
);

-- Enable RLS for saved_dishes
ALTER TABLE public.saved_dishes ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_dishes
DROP POLICY IF EXISTS "Users can view own saved dishes" ON public.saved_dishes;
CREATE POLICY "Users can view own saved dishes" ON public.saved_dishes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved dishes" ON public.saved_dishes;
CREATE POLICY "Users can insert own saved dishes" ON public.saved_dishes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved dishes" ON public.saved_dishes;
CREATE POLICY "Users can delete own saved dishes" ON public.saved_dishes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_dishes_user_id ON public.saved_dishes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_dishes_dish_id ON public.saved_dishes(dish_id);
CREATE INDEX IF NOT EXISTS idx_saved_dishes_saved_at ON public.saved_dishes(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_times_saved ON public.menu_items(times_saved DESC);

-- 6. Create functions and triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER handle_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER handle_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Functions for saved dishes counters
CREATE OR REPLACE FUNCTION public.increment_times_saved()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items 
  SET times_saved = times_saved + 1 
  WHERE id = NEW.dish_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_times_saved()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items 
  SET times_saved = GREATEST(times_saved - 1, 0)
  WHERE id = OLD.dish_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create saved dishes triggers
DROP TRIGGER IF EXISTS increment_dish_saved_count ON public.saved_dishes;
CREATE TRIGGER increment_dish_saved_count
  AFTER INSERT ON public.saved_dishes
  FOR EACH ROW EXECUTE FUNCTION public.increment_times_saved();

DROP TRIGGER IF EXISTS decrement_dish_saved_count ON public.saved_dishes;
CREATE TRIGGER decrement_dish_saved_count
  AFTER DELETE ON public.saved_dishes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_times_saved();

-- 8. Function to sync restaurant data
CREATE OR REPLACE FUNCTION public.set_restaurant_data_on_menu_item()
RETURNS TRIGGER AS $$
BEGIN
  SELECT name, delivery_time_min, delivery_fee
  INTO NEW.restaurant_name, NEW.delivery_time, NEW.delivery_fee
  FROM public.restaurants 
  WHERE id = NEW.restaurant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_restaurant_data_on_insert ON public.menu_items;
CREATE TRIGGER set_restaurant_data_on_insert
  BEFORE INSERT ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_data_on_menu_item();

-- 9. Insert sample restaurants
INSERT INTO public.restaurants (id, name, description, image_url, cuisine_type, rating, delivery_rating, delivery_time_min, delivery_fee) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Bella Italia', 'Authentic Italian cuisine with fresh ingredients', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop', 'Italian', 4.5, 4.8, 25, 0.00),
  ('550e8400-e29b-41d4-a716-446655440002', 'Burger House', 'Gourmet burgers and crispy fries', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop', 'American', 4.3, 4.6, 20, 0.00),
  ('550e8400-e29b-41d4-a716-446655440003', 'Green Garden', 'Fresh, healthy, plant-based options', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', 'Healthy', 4.7, 4.9, 15, 0.00),
  ('550e8400-e29b-41d4-a716-446655440004', 'Wing Stop', 'Best wings in town with signature sauces', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop', 'American', 4.4, 4.7, 30, 0.00),
  ('550e8400-e29b-41d4-a716-446655440005', 'Toast & Co', 'Artisanal toast and breakfast delights', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop', 'Breakfast', 4.6, 4.8, 18, 0.00),
  ('550e8400-e29b-41d4-a716-446655440006', 'Pizza Palace', 'New York style pizza since 1985', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', 'Italian', 4.2, 4.5, 35, 0.00)
ON CONFLICT (id) DO NOTHING;

-- 10. Insert sample menu items
INSERT INTO public.menu_items (id, restaurant_id, name, description, price, image_url, category, times_saved) VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Margherita Pizza', 'Classic pizza with fresh mozzarella, tomatoes, and basil', 18.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=225&fit=crop', 'Pizza', 15),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'BBQ Bacon Burger', 'Juicy beef patty with BBQ sauce and crispy bacon', 15.99, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=225&fit=crop', 'Burgers', 23),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Quinoa Buddha Bowl', 'Nutritious bowl with quinoa, vegetables, and tahini dressing', 14.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=225&fit=crop', 'Bowls', 31),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Spicy Chicken Wings', 'Buffalo wings with our signature hot sauce', 12.99, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=225&fit=crop', 'Wings', 19),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Avocado Toast Deluxe', 'Multigrain toast with smashed avocado and poached egg', 11.99, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=225&fit=crop', 'Toast', 27),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Pepperoni Supreme', 'Classic pepperoni pizza with extra cheese', 21.99, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=225&fit=crop', 'Pizza', 11)
ON CONFLICT (id) DO NOTHING;

-- 11. Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: profiles, restaurants, menu_items, saved_dishes';
    RAISE NOTICE 'Sample data inserted: % restaurants, % menu items', 
        (SELECT COUNT(*) FROM public.restaurants),
        (SELECT COUNT(*) FROM public.menu_items);
END $$;