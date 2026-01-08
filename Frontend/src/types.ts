export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Product = {
  _id: string;
  /** Product title/name - use 'name' for display */
  name: string;
  /** Alias for compatibility */
  title?: string;
  slug: string;
  description?: string;
  price?: number;
  priceAfterDiscount?: number;
  /** Rating average (0-5) */
  ratingsAverage?: number;
  ratingAvg?: number;
  ratingQty?: number;
  /** Product stock quantity */
  stock?: number;
  coverImage?: string;
  images?: string[];
  category?: Category;
  brand?: Brand | string;
};

export type User = {
  _id: string;
  username: string;
  fullName: string;
  email?: string;
  role?: string;
};

export type CartItem = {
  productId: {
    _id: string;
    name: string;
    slug: string;
    price?: number;
    coverImage?: string;
  };
  quantity: number;
  price: number;
};

export type Cart = {
  _id: string;
  cartItem: CartItem[];
  totalCartPrice: number;
  priceAfterDiscount?: number;
};

export type Order = {
  _id: string;
  orderItems: { productId: string; quantity: number }[];
  orderPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalProducts?: number;
  totalOrders?: number;
  totalUsers?: number;
  totalReviews?: number;
  totalCoupons?: number;
  totalBrands?: number;
  totalCategories?: number;
  totalSubCategories?: number;
};

export type AdminProduct = Product & {
  quantity?: number;
  material?: string;
  gender?: string;
  size?: string[];
  color?: string[];
  subCategory?: Category;
  discountPercentage?: number;
};

export type AdminCategory = Category & { productCount?: number };
export type AdminBrand = Brand & { productCount?: number; averagePrice?: number; averageRating?: number };
export type AdminSubCategory = {
  _id: string;
  name: string;
  slug: string;
  category: Category;
  productCount?: number;
};

export type AdminCoupon = {
  _id: string;
  code: string;
  discountPercentage: number;
  expirationDate: string;
  isExpired?: boolean;
  daysUntilExpiration?: number;
  activeUsageCount?: number;
};

export type AdminOrder = {
  _id: string;
  customer: User;
  address: string;
  shippingCost: number;
  orderPrice: number;
  status: string;
  isPaid: boolean;
  isDelivered?: boolean;
  createdAt: string;
  orderItems: {
    productId: string;
    quantity: number;
    product?: { name: string; slug: string; price?: number; coverImage?: string };
  }[];
};

export type AdminUser = User & {
  active: boolean;
  totalOrders?: number;
  totalSpent?: number;
};

export type AdminReview = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { _id: string; username: string; fullName: string };
  product: { _id: string; name: string; slug: string; coverImage?: string };
};
