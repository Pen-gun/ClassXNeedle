export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  priceAfterDiscount?: number;
  ratingsAverage?: number;
  coverImage?: string;
  images?: string[];
  category?: Category;
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
