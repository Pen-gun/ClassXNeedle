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
