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
