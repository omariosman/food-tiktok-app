// Database entity types based on Supabase schema

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  address: string;
  lat: number;
  lng: number;
  delivery_fee: number;
  min_delivery_time: number;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  total: number;
  status: OrderStatus;
  delivery_address: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
}