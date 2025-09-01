-- Feed System Database Schema
-- Execute this in Supabase SQL Editor after running previous migrations

-- Create enum for media types
CREATE TYPE media_type_enum AS ENUM ('image', 'video');

-- Create enum for interaction types
CREATE TYPE interaction_type_enum AS ENUM ('view', 'like', 'share', 'save', 'skip');

-- 1. Create feed_items table
CREATE TABLE IF NOT EXISTS public.feed_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dish_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type media_type_enum NOT NULL DEFAULT 'image',
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0, -- in seconds, for videos
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  algorithm_score DECIMAL(10,6) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Denormalized fields for faster queries
  dish_name TEXT,
  dish_price DECIMAL(8,2),
  restaurant_name TEXT,
  cuisine_type TEXT
);

-- 2. Create feed_interactions table
CREATE TABLE IF NOT EXISTS public.feed_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feed_item_id UUID REFERENCES public.feed_items(id) ON DELETE CASCADE,
  interaction_type interaction_type_enum NOT NULL,
  duration_watched INTEGER DEFAULT 0, -- in milliseconds
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate interactions of same type within time window
  UNIQUE(user_id, feed_item_id, interaction_type)
);

-- 3. Create user_preferences table for personalization
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  preferred_cuisines TEXT[] DEFAULT '{}',
  price_range_min DECIMAL(8,2) DEFAULT 0.00,
  price_range_max DECIMAL(8,2) DEFAULT 100.00,
  dietary_restrictions TEXT[] DEFAULT '{}', -- ['vegetarian', 'vegan', 'gluten-free', etc.]
  preferred_delivery_time INTEGER DEFAULT 30, -- in minutes
  location_latitude DECIMAL(10,8),
  location_longitude DECIMAL(11,8),
  location_radius INTEGER DEFAULT 10000, -- in meters
  algorithm_weights JSONB DEFAULT '{}', -- for ML model weights
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feed_items (public read)
DROP POLICY IF EXISTS "Feed items are viewable by everyone" ON public.feed_items;
CREATE POLICY "Feed items are viewable by everyone" ON public.feed_items
  FOR SELECT USING (is_active = true);

-- RLS Policies for feed_interactions (users can only see/modify their own)
DROP POLICY IF EXISTS "Users can view own interactions" ON public.feed_interactions;
CREATE POLICY "Users can view own interactions" ON public.feed_interactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interactions" ON public.feed_interactions;
CREATE POLICY "Users can insert own interactions" ON public.feed_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own interactions" ON public.feed_interactions;
CREATE POLICY "Users can update own interactions" ON public.feed_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_feed_items_algorithm_score ON public.feed_items(algorithm_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_restaurant ON public.feed_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_dish ON public.feed_items(dish_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_active ON public.feed_items(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_cuisine ON public.feed_items(cuisine_type);

CREATE INDEX IF NOT EXISTS idx_feed_interactions_user ON public.feed_interactions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_item ON public.feed_interactions(feed_item_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_timestamp ON public.feed_interactions(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_user_preferences_location ON public.user_preferences(location_latitude, location_longitude);

-- Functions for updating algorithm scores
CREATE OR REPLACE FUNCTION public.update_feed_item_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counters based on interaction type
  UPDATE public.feed_items 
  SET 
    view_count = CASE WHEN NEW.interaction_type = 'view' THEN view_count + 1 ELSE view_count END,
    like_count = CASE WHEN NEW.interaction_type = 'like' THEN like_count + 1 ELSE like_count END,
    share_count = CASE WHEN NEW.interaction_type = 'share' THEN share_count + 1 ELSE share_count END,
    save_count = CASE WHEN NEW.interaction_type = 'save' THEN save_count + 1 ELSE save_count END,
    skip_count = CASE WHEN NEW.interaction_type = 'skip' THEN skip_count + 1 ELSE skip_count END,
    updated_at = NOW()
  WHERE id = NEW.feed_item_id;

  -- Calculate new algorithm score
  -- Score = (likes * 3 + saves * 5 + shares * 4 - skips * 1) / (views + 1) * time_decay
  UPDATE public.feed_items 
  SET algorithm_score = (
    (like_count * 3.0 + save_count * 5.0 + share_count * 4.0 - skip_count * 1.0) / 
    GREATEST(view_count, 1) *
    -- Time decay: newer content gets boost
    EXP(-EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400.0) -- 1 day half-life
  )
  WHERE id = NEW.feed_item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrease stats when interactions are removed
CREATE OR REPLACE FUNCTION public.decrease_feed_item_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease counters based on interaction type
  UPDATE public.feed_items 
  SET 
    view_count = CASE WHEN OLD.interaction_type = 'view' THEN GREATEST(view_count - 1, 0) ELSE view_count END,
    like_count = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(like_count - 1, 0) ELSE like_count END,
    share_count = CASE WHEN OLD.interaction_type = 'share' THEN GREATEST(share_count - 1, 0) ELSE share_count END,
    save_count = CASE WHEN OLD.interaction_type = 'save' THEN GREATEST(save_count - 1, 0) ELSE save_count END,
    skip_count = CASE WHEN OLD.interaction_type = 'skip' THEN GREATEST(skip_count - 1, 0) ELSE skip_count END,
    updated_at = NOW()
  WHERE id = OLD.feed_item_id;

  -- Recalculate algorithm score
  UPDATE public.feed_items 
  SET algorithm_score = (
    (like_count * 3.0 + save_count * 5.0 + share_count * 4.0 - skip_count * 1.0) / 
    GREATEST(view_count, 1) *
    EXP(-EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400.0)
  )
  WHERE id = OLD.feed_item_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_feed_stats_on_insert ON public.feed_interactions;
CREATE TRIGGER update_feed_stats_on_insert
  AFTER INSERT ON public.feed_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_feed_item_stats();

DROP TRIGGER IF EXISTS update_feed_stats_on_delete ON public.feed_interactions;
CREATE TRIGGER update_feed_stats_on_delete
  AFTER DELETE ON public.feed_interactions
  FOR EACH ROW EXECUTE FUNCTION public.decrease_feed_item_stats();

-- Trigger for updated_at timestamps
DROP TRIGGER IF EXISTS handle_feed_items_updated_at ON public.feed_items;
CREATE TRIGGER handle_feed_items_updated_at
  BEFORE UPDATE ON public.feed_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER handle_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to sync dish data to feed_items
CREATE OR REPLACE FUNCTION public.sync_dish_data_to_feed()
RETURNS TRIGGER AS $$
BEGIN
  -- Update feed items when menu_items or restaurants change
  IF TG_TABLE_NAME = 'menu_items' THEN
    UPDATE public.feed_items 
    SET 
      dish_name = NEW.name,
      dish_price = NEW.price,
      updated_at = NOW()
    WHERE dish_id = NEW.id;
  END IF;

  IF TG_TABLE_NAME = 'restaurants' THEN
    UPDATE public.feed_items 
    SET 
      restaurant_name = NEW.name,
      cuisine_type = NEW.cuisine_type,
      updated_at = NOW()
    WHERE restaurant_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to keep feed data in sync
DROP TRIGGER IF EXISTS sync_menu_items_to_feed ON public.menu_items;
CREATE TRIGGER sync_menu_items_to_feed
  AFTER UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_dish_data_to_feed();

DROP TRIGGER IF EXISTS sync_restaurants_to_feed ON public.restaurants;
CREATE TRIGGER sync_restaurants_to_feed
  AFTER UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.sync_dish_data_to_feed();