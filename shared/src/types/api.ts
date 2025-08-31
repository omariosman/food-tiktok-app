// API request and response types

import { Order, OrderItem, MenuItem, Restaurant, Profile } from './database';

// Authentication
export interface SignUpRequest {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Profile;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// Orders
export interface CreateOrderRequest {
  restaurantId: string;
  items: {
    menuItemId: string;
    quantity: number;
    price: number;
  }[];
  deliveryAddress: string;
  total: number;
}

export interface OrderWithDetails extends Order {
  restaurants: Pick<Restaurant, 'name' | 'image_url' | 'address'>;
  order_items: (OrderItem & {
    menu_items: Pick<MenuItem, 'name' | 'price' | 'description'>;
  })[];
}

// Error responses
export interface ErrorResponse {
  error: {
    message: string;
    stack?: string;
  };
}

// Success responses
export interface SuccessResponse<T = any> {
  message: string;
  data?: T;
}