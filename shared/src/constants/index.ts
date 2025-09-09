// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  RESTAURANTS: {
    LIST: '/restaurants',
    DETAILS: '/restaurants/:id',
    MENU: '/restaurants/:id/menu',
    NEARBY: '/restaurants/nearby',
    SEARCH: '/restaurants/search',
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: '/orders/:id',
    CANCEL: '/orders/:id/cancel',
    TRACK: '/orders/:id/track',
  },
  REVIEWS: {
    CREATE: '/reviews',
    LIST: '/restaurants/:id/reviews',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
  },
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    WEBHOOK: '/payments/webhook',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    ADD_ADDRESS: '/user/addresses',
    UPDATE_ADDRESS: '/user/addresses/:id',
    DELETE_ADDRESS: '/user/addresses/:id',
  },
} as const;

// Order Status Constants
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Order Pending',
  [ORDER_STATUSES.CONFIRMED]: 'Order Confirmed',
  [ORDER_STATUSES.PREPARING]: 'Preparing Your Order',
  [ORDER_STATUSES.READY]: 'Order Ready',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
} as const;

// Payment Constants
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  WALLET: 'wallet',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// App Constants
export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_DELIVERY_RADIUS: 10, // km
  MIN_ORDER_AMOUNT: 100, // currency
  DEFAULT_DELIVERY_FEE: 40,
  TAX_RATE: 0.18, // 18% GST
  CURRENCY: '₹',
  CURRENCY_CODE: 'INR',
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  REVIEW_MAX_LENGTH: 500,
  MAX_CART_ITEMS: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Time Constants
export const TIME = {
  TOKEN_EXPIRES_IN: 7 * 24 * 60 * 60 * 1000, // 7 days
  REFRESH_TOKEN_EXPIRES_IN: 30 * 24 * 60 * 60 * 1000, // 30 days
  ORDER_CANCELLATION_WINDOW: 5 * 60 * 1000, // 5 minutes
  CACHE_TTL: 60 * 60 * 1000, // 1 hour
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  ORDER_NOT_FOUND: 'Order not found.',
  RESTAURANT_CLOSED: 'Restaurant is currently closed.',
  DELIVERY_UNAVAILABLE: 'Delivery is not available to this location.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Your order has been placed successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully.',
  PROFILE_UPDATED: 'Your profile has been updated.',
  REVIEW_SUBMITTED: 'Thank you for your review!',
  PASSWORD_RESET: 'Password reset link has been sent to your email.',
  ADDRESS_SAVED: 'Address saved successfully.',
} as const;

// Feature Flags
export const FEATURES = {
  WALLET_PAYMENTS: false,
  REAL_TIME_TRACKING: false,
  SOCIAL_FEATURES: false,
  PUSH_NOTIFICATIONS: true,
  DARK_MODE: true,
} as const;