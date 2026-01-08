import axios from 'axios';
import type {
  Category,
  Product,
  User,
  Cart,
  Order,
  AdminProduct,
  AdminCategory,
  AdminBrand,
  AdminSubCategory,
  AdminCoupon,
  AdminOrder,
  AdminUser,
  AdminReview,
  Pagination
} from '../types';

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
            quantity
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
            quantity
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
              quantity
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

export const createOrder = async (payload: { address: string; shippingCost?: number; items?: { productId: string; quantity: number }[] }) => {
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

export const adminGetProducts = async (params?: { page?: number; limit?: number; search?: string }) => {
  const res = await restClient.get<{ data: { products: AdminProduct[]; pagination: Pagination } }>('/products', { params });
  return res.data?.data;
};

export const adminCreateProduct = async (payload: FormData) => {
  const res = await restClient.post('/products', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data?.data;
};

export const adminUpdateProduct = async (id: string, payload: FormData) => {
  const res = await restClient.patch(`/products/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data?.data;
};

export const adminDeleteProduct = async (id: string) => {
  const res = await restClient.delete(`/products/${id}`);
  return res.data?.data;
};

export const adminGetProductStats = async () => {
  const res = await restClient.get('/products/stats');
  return res.data?.data;
};

export const adminGetCategories = async (params?: { page?: number; limit?: number; sort?: string }) => {
  const res = await restClient.get<{ data: { categories: AdminCategory[]; pagination: Pagination } }>('/categories', { params });
  return res.data?.data;
};

export const adminCreateCategory = async (payload: FormData) => {
  const res = await restClient.post('/categories', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data?.data as AdminCategory;
};

export const adminUpdateCategory = async (id: string, payload: FormData) => {
  const res = await restClient.patch(`/categories/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data?.data as AdminCategory;
};

export const adminDeleteCategory = async (id: string) => {
  const res = await restClient.delete(`/categories/${id}`);
  return res.data?.data;
};

export const adminGetCategoryStats = async () => {
  const res = await restClient.get('/categories/stats');
  return res.data?.data;
};

export const adminGetBrands = async (params?: { page?: number; limit?: number; search?: string }) => {
  const res = await restClient.get<{ data: { brands: AdminBrand[]; pagination: Pagination } }>('/brands', { params });
  return res.data?.data;
};

export const adminCreateBrand = async (payload: FormData) => {
  const res = await restClient.post('/brands', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data?.data as AdminBrand;
};

export const adminUpdateBrand = async (id: string, payload: FormData) => {
  const res = await restClient.patch(`/brands/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data?.data as AdminBrand;
};

export const adminDeleteBrand = async (id: string) => {
  const res = await restClient.delete(`/brands/${id}`);
  return res.data?.data;
};

export const adminGetBrandStats = async () => {
  const res = await restClient.get('/brands/stats');
  return res.data?.data;
};

export const adminGetSubCategories = async (params?: { page?: number; limit?: number; category?: string }) => {
  const res = await restClient.get<{ data: { subCategories: AdminSubCategory[]; pagination: Pagination } }>('/subcategories', { params });
  return res.data?.data;
};

export const adminCreateSubCategory = async (payload: { name: string; category: string }) => {
  const res = await restClient.post('/subcategories', payload);
  return res.data?.data as AdminSubCategory;
};

export const adminUpdateSubCategory = async (id: string, payload: { name?: string; category?: string }) => {
  const res = await restClient.patch(`/subcategories/${id}`, payload);
  return res.data?.data as AdminSubCategory;
};

export const adminDeleteSubCategory = async (id: string) => {
  const res = await restClient.delete(`/subcategories/${id}`);
  return res.data?.data;
};

export const adminGetCoupons = async (params?: { page?: number; limit?: number; active?: boolean }) => {
  const res = await restClient.get<{ data: { coupons: AdminCoupon[]; pagination: Pagination } }>('/coupons', { params });
  return res.data?.data;
};

export const adminCreateCoupon = async (payload: { code: string; discountPercentage: number; expirationDate: string }) => {
  const res = await restClient.post('/coupons', payload);
  return res.data?.data as AdminCoupon;
};

export const adminUpdateCoupon = async (id: string, payload: { code?: string; discountPercentage?: number; expirationDate?: string }) => {
  const res = await restClient.patch(`/coupons/${id}`, payload);
  return res.data?.data as AdminCoupon;
};

export const adminDeleteCoupon = async (id: string) => {
  const res = await restClient.delete(`/coupons/${id}`);
  return res.data?.data;
};

export const adminGetCouponStats = async () => {
  const res = await restClient.get('/coupons/stats');
  return res.data?.data;
};

export const adminGetOrders = async (params?: { page?: number; limit?: number; status?: string }) => {
  const res = await restClient.get<{ data: { orders: AdminOrder[]; pagination: Pagination } }>('/orders', { params });
  return res.data?.data;
};

export const adminUpdateOrderStatus = async (id: string, status: string) => {
  const res = await restClient.patch(`/orders/${id}/status`, { status });
  return res.data?.data as AdminOrder;
};

export const adminMarkOrderPaid = async (id: string) => {
  const res = await restClient.patch(`/orders/${id}/pay`);
  return res.data?.data as AdminOrder;
};

export const adminCancelOrder = async (id: string) => {
  const res = await restClient.patch(`/orders/${id}/cancel`);
  return res.data?.data as AdminOrder;
};

export const adminGetOrderStats = async () => {
  const res = await restClient.get('/orders/stats');
  return res.data?.data;
};

export const adminGetUsers = async (params?: { page?: number; limit?: number; active?: boolean; search?: string }) => {
  const res = await restClient.get<{ data: { users: AdminUser[]; pagination: Pagination } }>('/users', { params });
  return res.data?.data;
};

export const adminToggleUserStatus = async (id: string, active: boolean) => {
  const res = await restClient.patch(`/users/${id}/status`, { active });
  return res.data?.data as AdminUser;
};

export const adminDeleteUser = async (id: string) => {
  const res = await restClient.delete(`/users/${id}`);
  return res.data?.data;
};

export const adminGetUserStats = async () => {
  const res = await restClient.get('/users/stats');
  return res.data?.data;
};

export const adminGetReviews = async (params?: { page?: number; limit?: number; rating?: number }) => {
  const res = await restClient.get<{ data: { reviews: AdminReview[]; pagination: Pagination } }>('/reviews', { params });
  return res.data?.data;
};

export const adminDeleteReview = async (id: string) => {
  const res = await restClient.delete(`/reviews/${id}`);
  return res.data?.data;
};

export const adminGetReviewStats = async () => {
  const res = await restClient.get('/reviews/stats');
  return res.data?.data;
};
