import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { SubCategory } from '../Models/subCategory.model.js';
import mongoose from 'mongoose';

// ===============================
// SUBCATEGORY CONTROLLERS
// ===============================

/**
 * @desc    Create a new subcategory
 * @route   POST /api/subcategories
 * @access  Private/Admin
 */
export const createSubCategory = asyncHandler(async (req, res) => {
    const { name, category } = req.body;

    if (!name || !category) {
        throw new ApiError(400, "Name and category are required");
    }

    // Check if subcategory already exists
    const existingSubCategory = await SubCategory.findOne({ name, category });
    if (existingSubCategory) {
        throw new ApiError(409, "Subcategory already exists in this category");
    }

    const subCategory = await SubCategory.create({ name, category });

    const populatedSubCategory = await SubCategory.findById(subCategory._id).populate('category', 'name slug');

    res.status(201).json(new ApiResponse(201, populatedSubCategory, "Subcategory created successfully"));
});

/**
 * @desc    Get all subcategories
 * @route   GET /api/subcategories
 * @access  Public
 */
export const getAllSubCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, category, sort = 'name' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // Filter by category if provided
    if (category) {
        pipeline.push({
            $match: { category: new mongoose.Types.ObjectId(category) }
        });
    }

    // Lookup category details
    pipeline.push(
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        },
        {
            $unwind: '$categoryDetails'
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'subCategory',
                as: 'products'
            }
        },
        {
            $addFields: {
                productCount: { $size: '$products' },
                category: {
                    _id: '$categoryDetails._id',
                    name: '$categoryDetails.name',
                    slug: '$categoryDetails.slug'
                }
            }
        },
        {
            $project: {
                categoryDetails: 0,
                products: 0
            }
        }
    );

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
    const countResult = await SubCategory.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const subCategories = await SubCategory.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                subCategories,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalSubCategories: total,
                    limit: limitNum
                }
            },
            "Subcategories fetched successfully"
        )
    );
});

/**
 * @desc    Get single subcategory by ID or slug
 * @route   GET /api/subcategories/:identifier
 * @access  Public
 */
export const getSubCategoryById = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    const pipeline = [
        {
            $match: mongoose.Types.ObjectId.isValid(identifier)
                ? { _id: new mongoose.Types.ObjectId(identifier) }
                : { slug: identifier }
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: '$category'
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'subCategory',
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

    const subCategories = await SubCategory.aggregate(pipeline);

    if (!subCategories || subCategories.length === 0) {
        throw new ApiError(404, "Subcategory not found");
    }

    res.status(200).json(new ApiResponse(200, subCategories[0], "Subcategory fetched successfully"));
});

/**
 * @desc    Update subcategory
 * @route   PATCH /api/subcategories/:id
 * @access  Private/Admin
 */
export const updateSubCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, category } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;

    const subCategory = await SubCategory.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    }).populate('category', 'name slug');

    if (!subCategory) {
        throw new ApiError(404, "Subcategory not found");
    }

    res.status(200).json(new ApiResponse(200, subCategory, "Subcategory updated successfully"));
});

/**
 * @desc    Delete subcategory
 * @route   DELETE /api/subcategories/:id
 * @access  Private/Admin
 */
export const deleteSubCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if subcategory has products
    const productCount = await mongoose.model('Product').countDocuments({ subCategory: id });
    if (productCount > 0) {
        throw new ApiError(400, "Cannot delete subcategory with associated products");
    }

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
        throw new ApiError(404, "Subcategory not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Subcategory deleted successfully"));
});

/**
 * @desc    Get subcategories by category
 * @route   GET /api/categories/:categoryId/subcategories
 * @access  Public
 */
export const getSubCategoriesByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const subCategories = await SubCategory.aggregate([
        {
            $match: { category: new mongoose.Types.ObjectId(categoryId) }
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'subCategory',
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
        },
        {
            $sort: { name: 1 }
        }
    ]);

    res.status(200).json(new ApiResponse(200, subCategories, "Subcategories fetched successfully"));
});
