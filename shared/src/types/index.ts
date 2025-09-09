// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends User {
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryFee: number;
  minDeliveryTime: number;
  maxDeliveryTime: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  cuisineType: string[];
  priceRange: 1 | 2 | 3; // ₹, ₹₹, ₹₹₹
  createdAt: string;
  updatedAt: string;
}

// Menu Types
export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  isVegetarian: boolean;
  isVegan: boolean;
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'card' | 'cash' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: Address;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Address Types
export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  orderId: string;
  rating: number; // 1-5
  comment?: string;
  imageUrls: string[];
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl'>;
}

// Cart Types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Cart {
  restaurantId: string;
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  cuisineTypes: string[];
  priceRange: number[];
  rating: number;
  deliveryTime: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface AuthResponse extends ApiResponse {
  data: {
    user: AuthUser;
    token: string;
    refreshToken: string;
  };
}