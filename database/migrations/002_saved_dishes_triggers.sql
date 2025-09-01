-- Function to increment times_saved when a dish is saved
CREATE OR REPLACE FUNCTION public.increment_times_saved()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items 
  SET times_saved = times_saved + 1 
  WHERE id = NEW.dish_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement times_saved when a dish is unsaved
CREATE OR REPLACE FUNCTION public.decrement_times_saved()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items 
  SET times_saved = GREATEST(times_saved - 1, 0)
  WHERE id = OLD.dish_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for saved_dishes table
CREATE TRIGGER increment_dish_saved_count
  AFTER INSERT ON public.saved_dishes
  FOR EACH ROW EXECUTE FUNCTION public.increment_times_saved();

CREATE TRIGGER decrement_dish_saved_count
  AFTER DELETE ON public.saved_dishes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_times_saved();

-- Function to sync restaurant data to menu_items (denormalization)
CREATE OR REPLACE FUNCTION public.sync_restaurant_data_to_menu_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all menu items for this restaurant
  UPDATE public.menu_items 
  SET 
    restaurant_name = NEW.name,
    delivery_time = NEW.delivery_time_min,
    delivery_fee = NEW.delivery_fee
  WHERE restaurant_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync restaurant data when restaurant is updated
CREATE TRIGGER sync_restaurant_data
  AFTER UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.sync_restaurant_data_to_menu_items();

-- Function to set restaurant data when inserting menu items
CREATE OR REPLACE FUNCTION public.set_restaurant_data_on_menu_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Get restaurant data and set it on the menu item
  SELECT name, delivery_time_min, delivery_fee
  INTO NEW.restaurant_name, NEW.delivery_time, NEW.delivery_fee
  FROM public.restaurants 
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new menu items
CREATE TRIGGER set_restaurant_data_on_insert
  BEFORE INSERT ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_data_on_menu_item();