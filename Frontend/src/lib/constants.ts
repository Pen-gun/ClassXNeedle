/**
 * Application Constants
 * Centralized configuration for the frontend application
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_TIMEOUT = 30000;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// Cart
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_COST = 9.99;

// Image Defaults
export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600';
export const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600';
export const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80';

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'classxneedle-theme',
  TOKEN: 'auth_token',
  CART: 'cart',
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  ME: ['me'],
  CART: ['cart'],
  PRODUCTS: ['products'],
  FEATURED_PRODUCTS: ['featured-products'],
  CATEGORIES: ['categories'],
  ORDERS: ['orders'],
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Product Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
] as const;

// Routes
export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  CART: '/cart',
  AUTH: '/auth',
  ORDERS: '/orders',
  PRODUCT: '/product/:slug',
} as const;

// Breakpoints (should match Tailwind config)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
