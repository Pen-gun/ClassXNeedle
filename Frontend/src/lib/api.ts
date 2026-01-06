import axios from 'axios';
import type { Category, Product, User, Cart, Order } from '../types';

const REST_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

export const restClient = axios.create({
  baseURL: REST_BASE_URL,
  withCredentials: true,
  timeout: 10000
});

restClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on 401 - let individual components/hooks handle auth
    return Promise.reject(error);
  }
);

type GraphQLResponse<T> = { data: T; errors?: { message: string }[] };

const gq = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  const res = await axios.post<GraphQLResponse<T>>(GRAPHQL_URL, { query, variables }, { withCredentials: true });
  if (res.data.errors?.length) throw new Error(res.data.errors[0].message);
  return res.data.data;
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const data = await gq<{ products: { products: Product[] } }>(`
      query FeaturedProducts {
        products(filter: { limit: 8, sort: "-createdAt" }) {
          products {
            _id
            name
            slug
            description
            price
            priceAfterDiscount
            ratingsAverage
            coverImage
            category { _id name slug }
          }
        }
      }
    `);
    return data.products.products;
  } catch (error) {
    console.warn('Featured products fallback', error);
    return [];
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const data = await gq<{ products: { products: Product[] } }>(`
      query Products {
        products(filter: { limit: 24, sort: "-createdAt" }) {
          products {
            _id
            name
            slug
            description
            price
            priceAfterDiscount
            ratingsAverage
            coverImage
            category { _id name slug }
          }
        }
      }
    `);
    return data.products.products;
  } catch (error) {
    console.warn('Products fallback', error);
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const data = await gq<{ categories: Category[] }>(`
      query Categories {
        categories {
          _id
          name
          slug
          image
        }
      }
    `);
    return data.categories;
  } catch (error) {
    console.warn('Categories fallback', error);
    return [];
  }
};

export const fetchMe = async (): Promise<User | null> => {
  try {
    const res = await restClient.get('/auth/me');
    return res.data?.data || null;
  } catch (error) {
    return null;
  }
};

export const login = async (payload: { username?: string; email?: string; phone?: string; password: string }) => {
  const res = await restClient.post('/auth/login', payload);
  return res.data?.data;
};

export const register = async (payload: { username: string; fullName: string; email?: string; phone?: string; password: string }) => {
  const res = await restClient.post('/auth/register', payload);
  return res.data?.data;
};

export const logout = async () => {
  await restClient.post('/auth/logout');
};

export const fetchCart = async (): Promise<Cart | null> => {
  try {
    const data = await gq<{ myCart: Cart | null }>(`
      query MyCart {
        myCart {
          _id
          totalCartPrice
          priceAfterDiscount
          cartItem {
            productId {
              _id
              name
              slug
              price
              coverImage
            }
            quantity
            price
          }
        }
      }
    `);
    return data.myCart;
  } catch (error) {
    console.warn('Cart fetch failed', error);
    return null;
  }
};

export const addCartItem = async (payload: { productId: string; quantity: number }) => {
  const res = await restClient.post('/cart/items', payload);
  return res.data?.data;
};

export const updateCartItem = async (productId: string, quantity: number) => {
  const res = await restClient.patch(`/cart/items/${productId}`, { quantity });
  return res.data?.data;
};

export const removeCartItem = async (productId: string) => {
  const res = await restClient.delete(`/cart/items/${productId}`);
  return res.data?.data;
};

export const clearCart = async () => {
  const res = await restClient.delete('/cart');
  return res.data?.data;
};

export const applyCoupon = async (couponCode: string) => {
  const res = await restClient.post('/cart/coupon', { couponCode });
  return res.data?.data;
};

export const removeCoupon = async () => {
  const res = await restClient.delete('/cart/coupon');
  return res.data?.data;
};

export const createOrder = async (payload: { address: string; shippingCost?: number }) => {
  const res = await restClient.post('/orders', payload);
  return res.data?.data;
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const data = await gq<{ myOrders: Order[] }>(`
      query MyOrders {
        myOrders(page: 1, limit: 20) {
          _id
          orderPrice
          status
          isPaid
          createdAt
          orderItems {
            productId
            quantity
          }
        }
      }
    `);
    return data.myOrders;
  } catch (error) {
    console.warn('Orders fetch failed', error);
    return [];
  }
};

export const cancelOrderApi = async (orderId: string) => {
  const res = await restClient.patch(`/orders/${orderId}/cancel`);
  return res.data?.data;
};
