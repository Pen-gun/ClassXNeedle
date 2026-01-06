import dotenv from 'dotenv';
import connectToDB from './connectionToDb.helper.js';
import { Category } from '../Models/category.model.js';
import { SubCategory } from '../Models/subCategory.model.js';
import { Brand } from '../Models/brand.model.js';
import { Product } from '../Models/product.model.js';

dotenv.config({ path: '../.env' });

const categories = [
  { name: 'Outerwear', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Tech Layers', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1521572153540-5102f3aa7c59?auto=format&fit=crop&w=1200&q=80' }
];

const subCategories = [
  { name: 'Bombers', category: 'Outerwear' },
  { name: 'Shells', category: 'Outerwear' },
  { name: 'Hoodies', category: 'Tech Layers' },
  { name: 'Tees', category: 'Tech Layers' },
  { name: 'Bags', category: 'Accessories' }
];

const brands = [
  { name: 'ClassX Core', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' },
  { name: 'Needle Labs', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' }
];

const products = [
  {
    name: 'Carbon Stitch Bomber',
    description: 'Structured bomber with moisture-wicking mesh, reflective seams, and modular chest pocket.',
    quantity: 120,
    price: 180,
    priceAfterDiscount: 165,
    coverImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
    ],
    material: 'Recycled nylon blend',
    gender: 'Unisex',
    size: ['S', 'M', 'L', 'XL'],
    color: ['Carbon', 'Graphite'],
    category: 'Outerwear',
    subCategory: 'Bombers',
    brand: 'ClassX Core'
  },
  {
    name: 'Nocturne Cargo Set',
    description: 'Two-piece cargo set with articulated knees, water-repellent finish, and magnetic closures.',
    quantity: 90,
    price: 140,
    priceAfterDiscount: 128,
    coverImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
    ],
    material: 'Ripstop polyester',
    gender: 'Unisex',
    size: ['S', 'M', 'L', 'XL'],
    color: ['Obsidian', 'Shadow'],
    category: 'Outerwear',
    subCategory: 'Shells',
    brand: 'Needle Labs'
  },
  {
    name: 'Signal Tech Hoodie',
    description: 'Breathable mid-layer with heat-map venting, hidden media pocket, and glove-friendly zips.',
    quantity: 140,
    price: 125,
    priceAfterDiscount: 115,
    coverImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'
    ],
    material: 'Technical fleece',
    gender: 'Unisex',
    size: ['S', 'M', 'L', 'XL'],
    color: ['Midnight', 'Cobalt'],
    category: 'Tech Layers',
    subCategory: 'Hoodies',
    brand: 'ClassX Core'
  },
  {
    name: 'Chromatic Knit',
    description: 'Gradient knit tee with sweat-map zones, stretch collar, and anti-microbial finish.',
    quantity: 200,
    price: 110,
    priceAfterDiscount: 99,
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'
    ],
    material: 'Performance cotton blend',
    gender: 'Unisex',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Iris', 'Amber'],
    category: 'Tech Layers',
    subCategory: 'Tees',
    brand: 'Needle Labs'
  },
  {
    name: 'Transit Modular Sling',
    description: 'Weatherproof sling with modular pouches, Fidlock buckle, and quick-access phone sleeve.',
    quantity: 160,
    price: 95,
    priceAfterDiscount: 89,
    coverImage: 'https://images.unsplash.com/photo-1521572153540-5102f3aa7c59?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572153540-5102f3aa7c59?auto=format&fit=crop&w=900&q=80'
    ],
    material: 'Waterproof coated nylon',
    gender: 'Unisex',
    size: ['M', 'L'],
    color: ['Black Sand', 'Ash'],
    category: 'Accessories',
    subCategory: 'Bags',
    brand: 'ClassX Core'
  }
];

const upsertByName = async (Model, doc) =>
  Model.findOneAndUpdate({ name: doc.name }, { $set: doc }, { upsert: true, new: true, setDefaultsOnInsert: true });

const seed = async () => {
  await connectToDB();

  const categoryDocs = {};
  for (const category of categories) {
    const doc = await upsertByName(Category, category);
    categoryDocs[category.name] = doc._id;
  }

  const subCategoryDocs = {};
  for (const subCategory of subCategories) {
    const parentId = categoryDocs[subCategory.category];
    const doc = await SubCategory.findOneAndUpdate(
      { name: subCategory.name },
      { $set: { ...subCategory, category: parentId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    subCategoryDocs[subCategory.name] = doc._id;
  }

  const brandDocs = {};
  for (const brand of brands) {
    const doc = await upsertByName(Brand, brand);
    brandDocs[brand.name] = doc._id;
  }

  for (const product of products) {
    const categoryId = categoryDocs[product.category];
    const subCategoryId = subCategoryDocs[product.subCategory];
    const brandId = brandDocs[product.brand];

    await Product.findOneAndUpdate(
      { name: product.name },
      {
        $set: {
          ...product,
          category: categoryId,
          subCategory: subCategoryId,
          brand: brandId
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

seed()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  });
