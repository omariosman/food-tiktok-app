-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (for user management)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles (users can only see/edit their own profile)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create restaurants table
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

-- Create policy for restaurants (readable by everyone)
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants
  FOR SELECT USING (is_active = true);

-- Create menu_items table
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
  restaurant_name TEXT, -- denormalized for faster queries
  delivery_time INTEGER, -- denormalized from restaurant
  delivery_fee DECIMAL(5,2), -- denormalized from restaurant
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy for menu_items (readable by everyone)
CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items
  FOR SELECT USING (is_available = true);

-- Create saved_dishes table
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

-- Create policies for saved_dishes (users can only access their own saved dishes)
CREATE POLICY "Users can view own saved dishes" ON public.saved_dishes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved dishes" ON public.saved_dishes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved dishes" ON public.saved_dishes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_dishes_user_id ON public.saved_dishes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_dishes_dish_id ON public.saved_dishes(dish_id);
CREATE INDEX IF NOT EXISTS idx_saved_dishes_saved_at ON public.saved_dishes(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_times_saved ON public.menu_items(times_saved DESC);

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();