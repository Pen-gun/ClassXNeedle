export type CartLineItem = {
  productId: {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
    category?: { name: string };
    quantity?: number;
  };
  quantity: number;
  price: number;
};
