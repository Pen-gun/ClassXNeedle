import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Brand } from '../Models/brand.model.js';
import { upLoadOnCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// ===============================
// BRAND CONTROLLERS
// ===============================

/**
 * @desc    Create a new brand
 * @route   POST /api/brands
 * @access  Private/Admin
 */
export const createBrand = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Brand name is required");
    }

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
        throw new ApiError(409, "Brand already exists");
    }

    // Upload image if provided
    let imageUrl = "";
    if (req.file) {
        const imageResult = await upLoadOnCloudinary(req.file.path);
        if (imageResult) {
            imageUrl = imageResult.secure_url;
        }
    }

    const brand = await Brand.create({
        name,
        image: imageUrl
    });

    res.status(201).json(new ApiResponse(201, brand, "Brand created successfully"));
});

/**
 * @desc    Get all brands with product count
 * @route   GET /api/brands
 * @access  Public
 */
export const getAllBrands = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sort = 'name', search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // Search filter
    if (search) {
        pipeline.push({
            $match: {
                name: { $regex: search, $options: 'i' }
            }
        });
    }

    // Lookup products
    pipeline.push(
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'brand',
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
    const countResult = await Brand.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const brands = await Brand.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                brands,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalBrands: total,
                    limit: limitNum
                }
            },
            "Brands fetched successfully"
        )
    );
});

/**
 * @desc    Get single brand by ID or slug
 * @route   GET /api/brands/:identifier
 * @access  Public
 */
export const getBrandById = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    const pipeline = [
        {
            $match: mongoose.Types.ObjectId.isValid(identifier)
                ? { _id: new mongoose.Types.ObjectId(identifier) }
                : { slug: identifier }
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'brand',
                as: 'products',
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            slug: 1,
                            price: 1,
                            coverImage: 1,
                            ratingsAverage: 1
                        }
                    },
                    { $limit: 10 }
                ]
            }
        },
        {
            $addFields: {
                productCount: { $size: '$products' }
            }
        }
    ];

    const brands = await Brand.aggregate(pipeline);

    if (!brands || brands.length === 0) {
        throw new ApiError(404, "Brand not found");
    }

    res.status(200).json(new ApiResponse(200, brands[0], "Brand fetched successfully"));
});

/**
 * @desc    Update brand
 * @route   PATCH /api/brands/:id
 * @access  Private/Admin
 */
export const updateBrand = asyncHandler(async (req, res) => {
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

    const brand = await Brand.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    res.status(200).json(new ApiResponse(200, brand, "Brand updated successfully"));
});

/**
 * @desc    Delete brand
 * @route   DELETE /api/brands/:id
 * @access  Private/Admin
 */
export const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if brand has products
    const productCount = await mongoose.model('Product').countDocuments({ brand: id });
    if (productCount > 0) {
        throw new ApiError(400, "Cannot delete brand with associated products");
    }

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Brand deleted successfully"));
});

/**
 * @desc    Get brand statistics
 * @route   GET /api/brands/stats
 * @access  Private/Admin
 */
export const getBrandStats = asyncHandler(async (req, res) => {
    const stats = await Brand.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'brand',
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
                averagePrice: { $avg: '$products.price' },
                averageRating: { $avg: '$products.ratingsAverage' }
            }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                productCount: 1,
                totalValue: 1,
                averagePrice: 1,
                averageRating: 1
            }
        },
        {
            $sort: { productCount: -1 }
        }
    ]);

    res.status(200).json(new ApiResponse(200, stats, "Brand statistics fetched successfully"));
});
