import mongoose from 'mongoose';
import { Product } from '../Models/product.model.js';
import { Category } from '../Models/category.model.js';
import { SubCategory } from '../Models/subCategory.model.js';
import { Brand } from '../Models/brand.model.js';
import { Review } from '../Models/review.model.js';
import { User } from '../Models/users.model.js';
import { Order } from '../Models/order.model.js';
import { Cart } from '../Models/cart.model.js';

export const resolvers = {
  async products({ filter = {} }) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      category,
      subCategory,
      brand,
      gender,
      minPrice,
      maxPrice,
      size,
      color,
      inStock
    } = filter;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const pipeline = [];
    const matchStage = {};

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) matchStage.category = new mongoose.Types.ObjectId(category);
    if (subCategory) matchStage.subCategory = new mongoose.Types.ObjectId(subCategory);
    if (brand) matchStage.brand = new mongoose.Types.ObjectId(brand);
    if (gender) matchStage.gender = gender;
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = parseFloat(minPrice);
      if (maxPrice) matchStage.price.$lte = parseFloat(maxPrice);
    }
    if (size) matchStage.size = { $in: Array.isArray(size) ? size : [size] };
    if (color) matchStage.color = { $in: Array.isArray(color) ? color : [color] };
    if (inStock) matchStage.quantity = { $gt: 0 };

    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });

    pipeline.push(
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
      { $lookup: { from: 'subcategories', localField: 'subCategory', foreignField: '_id', as: 'subCategory' } },
      { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } }
    );

    const sortStage = {};
    if (String(sort).startsWith('-')) sortStage[String(sort).substring(1)] = -1; else sortStage[sort] = 1;
    pipeline.push({ $sort: sortStage });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Product.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: skip }, { $limit: limitNum });
    const products = await Product.aggregate(pipeline);

    return {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    };
  },

  async product({ identifier }) {
    const match = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: new mongoose.Types.ObjectId(identifier) }
      : { slug: identifier };

    const pipeline = [
      { $match: match },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
      { $lookup: { from: 'subcategories', localField: 'subCategory', foreignField: '_id', as: 'subCategory' } },
      { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      { $limit: 1 }
    ];

    const res = await Product.aggregate(pipeline);
    return res[0] || null;
  },

  async categories() {
    return Category.aggregate([
      { $lookup: { from: 'products', localField: '_id', foreignField: 'category', as: 'products' } },
      { $addFields: { productCount: { $size: '$products' } } },
      { $project: { products: 0 } },
      { $sort: { name: 1 } }
    ]);
  },

  async category({ identifier }) {
    const match = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: new mongoose.Types.ObjectId(identifier) }
      : { slug: identifier };

    const res = await Category.aggregate([
      { $match: match },
      { $lookup: { from: 'subcategories', localField: '_id', foreignField: 'category', as: 'subCategories' } },
      { $lookup: { from: 'products', localField: '_id', foreignField: 'category', as: 'products' } },
      { $addFields: { productCount: { $size: '$products' }, subCategoryCount: { $size: '$subCategories' } } },
      { $project: { products: 0 } },
      { $limit: 1 }
    ]);
    return res[0] || null;
  },

  async subCategories({ categoryId }) {
    const pipeline = [];
    if (categoryId) {
      pipeline.push({ $match: { category: new mongoose.Types.ObjectId(categoryId) } });
    }
    pipeline.push(
      { $lookup: { from: 'products', localField: '_id', foreignField: 'subCategory', as: 'products' } },
      { $addFields: { productCount: { $size: '$products' } } },
      { $project: { products: 0 } },
      { $sort: { name: 1 } }
    );
    return SubCategory.aggregate(pipeline);
  },

  async subCategory({ identifier }) {
    const match = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: new mongoose.Types.ObjectId(identifier) }
      : { slug: identifier };

    const res = await SubCategory.aggregate([
      { $match: match },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $lookup: { from: 'products', localField: '_id', foreignField: 'subCategory', as: 'products' } },
      { $addFields: { productCount: { $size: '$products' } } },
      { $project: { products: 0 } },
      { $limit: 1 }
    ]);
    return res[0] || null;
  },

  async brands({ search }) {
    const pipeline = [];
    if (search) pipeline.push({ $match: { name: { $regex: search, $options: 'i' } } });
    pipeline.push(
      { $lookup: { from: 'products', localField: '_id', foreignField: 'brand', as: 'products' } },
      { $addFields: { productCount: { $size: '$products' } } },
      { $project: { products: 0 } },
      { $sort: { name: 1 } }
    );
    return Brand.aggregate(pipeline);
  },

  async brand({ identifier }) {
    const match = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: new mongoose.Types.ObjectId(identifier) }
      : { slug: identifier };

    const res = await Brand.aggregate([
      { $match: match },
      { $lookup: { from: 'products', localField: '_id', foreignField: 'brand', as: 'products' } },
      { $addFields: { productCount: { $size: '$products' } } },
      { $project: { products: 0 } },
      { $limit: 1 }
    ]);
    return res[0] || null;
  },

  async reviews({ productId, userId, rating, page = 1, limit = 10 }) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];
    const matchStage = {};
    if (productId) matchStage.productId = new mongoose.Types.ObjectId(productId);
    if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId);
    if (rating) matchStage.rating = parseInt(rating);
    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });

    pipeline.push(
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { rating: 1, comment: 1, createdAt: 1, 'user.username': 1, 'user.fullName': 1 } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    return Review.aggregate(pipeline);
  },

  async review({ id }) {
    const res = await Review.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { rating: 1, comment: 1, createdAt: 1, 'user.username': 1, 'user.fullName': 1 } },
      { $limit: 1 }
    ]);
    return res[0] || null;
  },

  async me(args, req) {
    const userId = req?.req?.user?._id;
    if (!userId) return null;
    const users = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $project: { password: 0, refreshToken: 0 } },
      { $limit: 1 }
    ]);
    return users[0] || null;
  },

  async myOrders({ page = 1, limit = 10 }, req) {
    const userId = req?.req?.user?._id;
    if (!userId) return [];
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    return Order.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    ]);
  },

  async myCart(args, req) {
    const userId = req?.req?.user?._id;
    if (!userId) return null;

    const carts = await Cart.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(userId) } },
      { $unwind: { path: '$cartItem', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'products', localField: 'cartItem.productId', foreignField: '_id', as: 'cartItem.product' } },
      { $unwind: { path: '$cartItem.product', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$_id', cartItem: { $push: '$cartItem' }, totalCartPrice: { $first: '$totalCartPrice' }, priceAfterDiscount: { $first: '$priceAfterDiscount' }, customer: { $first: '$customer' }, createdAt: { $first: '$createdAt' } } },
      { $limit: 1 }
    ]);

    return carts[0] || null;
  }
};
