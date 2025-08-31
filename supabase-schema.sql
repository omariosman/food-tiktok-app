-- Food Delivery App Database Schema for Supabase
-- Run this script in your Supabase SQL editor

-- Enable PostGIS extension for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Restaurants table
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  delivery_fee DECIMAL(8, 2) DEFAULT 0,
  min_delivery_time INTEGER DEFAULT 30, -- minutes
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create spatial index for location queries
CREATE INDEX restaurants_location_idx ON restaurants USING GIST (ST_Point(lng, lat));

-- RLS for restaurants (public read access)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

-- Menu items table
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(8, 2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for menu items (public read access for available items)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view available menu items" ON menu_items
  FOR SELECT USING (is_available = true);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(8, 2) NOT NULL CHECK (total > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for orders (users can only see their own orders)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(8, 2) NOT NULL CHECK (price > 0)
);

-- RLS for order items (users can only see items from their own orders)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on orders
CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert sample restaurants for testing
INSERT INTO restaurants (name, description, address, lat, lng, delivery_fee, min_delivery_time, rating) VALUES
('Pizza Palace', 'Authentic Italian pizza with fresh ingredients', '123 Main St, Anytown', 40.7128, -74.0060, 2.99, 25, 4.5),
('Burger Barn', 'Gourmet burgers and craft fries', '456 Oak Ave, Anytown', 40.7589, -73.9851, 1.99, 20, 4.2),
('Sushi Spot', 'Fresh sushi and Japanese cuisine', '789 Pine St, Anytown', 40.7831, -73.9712, 3.99, 35, 4.7),
('Taco Town', 'Authentic Mexican tacos and burritos', '321 Elm St, Anytown', 40.7505, -73.9934, 1.49, 15, 4.3);

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
-- Pizza Palace items
((SELECT id FROM restaurants WHERE name = 'Pizza Palace'), 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 18.99, 'Pizza'),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace'), 'Pepperoni Pizza', 'Traditional pepperoni pizza', 21.99, 'Pizza'),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace'), 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 12.99, 'Salad'),

-- Burger Barn items
((SELECT id FROM restaurants WHERE name = 'Burger Barn'), 'Classic Burger', 'Beef patty with lettuce, tomato, and sauce', 15.99, 'Burgers'),
((SELECT id FROM restaurants WHERE name = 'Burger Barn'), 'BBQ Bacon Burger', 'Burger with BBQ sauce and crispy bacon', 18.99, 'Burgers'),
((SELECT id FROM restaurants WHERE name = 'Burger Barn'), 'Sweet Potato Fries', 'Crispy sweet potato fries', 7.99, 'Sides'),

-- Sushi Spot items
((SELECT id FROM restaurants WHERE name = 'Sushi Spot'), 'California Roll', 'Crab, avocado, and cucumber roll', 12.99, 'Rolls'),
((SELECT id FROM restaurants WHERE name = 'Sushi Spot'), 'Salmon Sashimi', 'Fresh salmon sashimi (6 pieces)', 16.99, 'Sashimi'),
((SELECT id FROM restaurants WHERE name = 'Sushi Spot'), 'Miso Soup', 'Traditional miso soup', 4.99, 'Soup'),

-- Taco Town items
((SELECT id FROM restaurants WHERE name = 'Taco Town'), 'Beef Tacos', 'Three beef tacos with onions and cilantro', 9.99, 'Tacos'),
((SELECT id FROM restaurants WHERE name = 'Taco Town'), 'Chicken Burrito', 'Large chicken burrito with rice and beans', 13.99, 'Burritos'),
((SELECT id FROM restaurants WHERE name = 'Taco Town'), 'Guacamole & Chips', 'Fresh guacamole with tortilla chips', 8.99, 'Appetizers');

-- Create indexes for better performance
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_profiles_username ON profiles(username);