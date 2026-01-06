import axios from 'axios';
import type { Category, Product } from '../types';

const REST_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

const restClient = axios.create({
  baseURL: REST_BASE_URL,
  withCredentials: true,
  timeout: 8000
});

type GraphQLResponse<T> = { data: T; errors?: { message: string }[] };

const fallbackProducts: Product[] = [
  {
    _id: 'p1',
    name: 'Carbon Stitch Bomber',
    slug: 'carbon-stitch-bomber',
    description: 'Structured bomber with reflective seams and modular pocketing.',
    price: 180,
    priceAfterDiscount: 165,
    ratingsAverage: 4.9,
    coverImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    category: { _id: 'c1', name: 'Outerwear', slug: 'outerwear' }
  },
  {
    _id: 'p2',
    name: 'Signal Tech Hoodie',
    slug: 'signal-tech-hoodie',
    description: 'Breathable mid-layer with glove-friendly zips and vented panels.',
    price: 125,
    priceAfterDiscount: 115,
    ratingsAverage: 4.8,
    coverImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    category: { _id: 'c2', name: 'Tech Layers', slug: 'tech-layers' }
  },
  {
    _id: 'p3',
    name: 'Transit Modular Sling',
    slug: 'transit-modular-sling',
    description: 'Weatherproof sling with modular pouches and Fidlock buckle.',
    price: 95,
    priceAfterDiscount: 89,
    ratingsAverage: 4.7,
    coverImage: 'https://images.unsplash.com/photo-1521572153540-5102f3aa7c59?auto=format&fit=crop&w=1200&q=80',
    category: { _id: 'c3', name: 'Accessories', slug: 'accessories' }
  }
];

const fallbackCategories: Category[] = [
  { _id: 'c1', name: 'Outerwear', slug: 'outerwear' },
  { _id: 'c2', name: 'Tech Layers', slug: 'tech-layers' },
  { _id: 'c3', name: 'Accessories', slug: 'accessories' }
];

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const res = await axios.post<GraphQLResponse<{ products: { products: Product[] } }>>(GRAPHQL_URL, {
      query: `
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
      `
    });

    const errors = res.data.errors;
    if (errors?.length) {
      console.warn('GraphQL errors', errors);
    }

    return res.data.data?.products?.products ?? fallbackProducts;
  } catch (error) {
    console.warn('Falling back to sample products', error);
    return fallbackProducts;
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await axios.post<GraphQLResponse<{ categories: Category[] }>>(GRAPHQL_URL, {
      query: `
        query Categories {
          categories {
            _id
            name
            slug
            image
          }
        }
      `
    });

    const errors = res.data.errors;
    if (errors?.length) {
      console.warn('GraphQL errors', errors);
    }

    return res.data.data?.categories ?? fallbackCategories;
  } catch (error) {
    console.warn('Falling back to sample categories', error);
    return fallbackCategories;
  }
};

export { restClient };
