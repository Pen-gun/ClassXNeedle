import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Category } from '../Models/category.model.js';
import { upLoadOnCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// ===============================
// CATEGORY CONTROLLERS
// ===============================

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(409, "Category already exists");
    }

    // Upload image
    let imageUrl = "";
    if (req.file) {
        const imageResult = await upLoadOnCloudinary(req.file.path);
        if (!imageResult) {
            throw new ApiError(500, "Image upload failed");
        }
        imageUrl = imageResult.secure_url;
    } else {
        throw new ApiError(400, "Category image is required");
    }

    const category = await Category.create({
        name,
        image: imageUrl
    });

    res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

/**
 * @desc    Get all categories with product count
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sort = 'name' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: 'products'
            }
        },
        {
            $addFields: {
                productCount: { $size: '$products' }
            }
        },
        {
            $project: {
                products: 0
            }
        }
    ];

    // Sorting
    const sortStage = {};
    if (sort.startsWith('-')) {
        sortStage[sort.substring(1)] = -1;
    } else {
        sortStage[sort] = 1;
    }
    pipeline.push({ $sort: sortStage });

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Category.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const categories = await Category.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                categories,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalCategories: total,
                    limit: limitNum
                }
            },
            "Categories fetched successfully"
        )
    );
});

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:identifier
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    const pipeline = [
        {
            $match: mongoose.Types.ObjectId.isValid(identifier)
                ? { _id: new mongoose.Types.ObjectId(identifier) }
                : { slug: identifier }
        },
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'category',
                as: 'subCategories'
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: 'products'
            }
        },
        {
            $addFields: {
                productCount: { $size: '$products' },
                subCategoryCount: { $size: '$subCategories' }
            }
        },
        {
            $project: {
                products: 0
            }
        }
    ];

    const categories = await Category.aggregate(pipeline);

    if (!categories || categories.length === 0) {
        throw new ApiError(404, "Category not found");
    }

    res.status(200).json(new ApiResponse(200, categories[0], "Category fetched successfully"));
});

/**
 * @desc    Update category
 * @route   PATCH /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const updateData = {};
    if (name) updateData.name = name;

    // Upload new image if provided
    if (req.file) {
        const imageResult = await upLoadOnCloudinary(req.file.path);
        if (imageResult) {
            updateData.image = imageResult.secure_url;
        }
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if category has products
    const productCount = await mongoose.model('Product').countDocuments({ category: id });
    if (productCount > 0) {
        throw new ApiError(400, "Cannot delete category with associated products");
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});

/**
 * @desc    Get category statistics
 * @route   GET /api/categories/stats
 * @access  Private/Admin
 */
export const getCategoryStats = asyncHandler(async (req, res) => {
    const stats = await Category.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: 'products'
            }
        },
        {
            $addFields: {
                productCount: { $size: '$products' },
                totalValue: {
                    $sum: {
                        $map: {
                            input: '$products',
                            as: 'product',
                            in: { $multiply: ['$$product.price', '$$product.quantity'] }
                        }
                    }
                },
                averagePrice: { $avg: '$products.price' }
            }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                productCount: 1,
                totalValue: 1,
                averagePrice: 1
            }
        },
        {
            $sort: { productCount: -1 }
        }
    ]);

    res.status(200).json(new ApiResponse(200, stats, "Category statistics fetched successfully"));
});
