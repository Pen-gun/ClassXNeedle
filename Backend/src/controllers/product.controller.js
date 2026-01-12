import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Product } from '../Models/product.model.js';
import { upLoadOnCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// ===============================
// PRODUCT CONTROLLERS
// ===============================

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        priceAfterDiscount,
        quantity,
        material,
        gender,
        size,
        color,
        variants,
        category,
        subCategory,
        brand
    } = req.body;

    let parsedVariants = variants;
    if (typeof variants === 'string') {
        try {
            parsedVariants = JSON.parse(variants);
        } catch (error) {
            throw new ApiError(400, "Invalid variants format");
        }
    }

    // Validation
    if (!name || !description || !price || !gender || !category) {
        throw new ApiError(400, "Name, description, price, gender, and category are required");
    }

    // Upload images
    let coverImageUrl = "";
    let imageUrls = [];

    if (req.files?.coverImage) {
        const coverImageResult = await upLoadOnCloudinary(req.files.coverImage[0].path);
        if (!coverImageResult) {
            throw new ApiError(500, "Cover image upload failed");
        }
        coverImageUrl = coverImageResult.secure_url;
    } else {
        throw new ApiError(400, "Cover image is required");
    }

    if (req.files?.images) {
        for (const file of req.files.images) {
            const result = await upLoadOnCloudinary(file.path);
            if (result) {
                imageUrls.push(result.secure_url);
            }
        }
    }

    // Create product
    const product = await Product.create({
        name,
        description,
        price,
        priceAfterDiscount,
        quantity,
        material,
        gender,
        size,
        color,
        variants: parsedVariants,
        category,
        subCategory,
        brand,
        coverImage: coverImageUrl,
        images: imageUrls
    });

    const createdProduct = await Product.findById(product._id)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .populate('brand', 'name slug');

    res.status(201).json(new ApiResponse(201, createdProduct, "Product created successfully"));
});

/**
 * @desc    Get all products with advanced filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = asyncHandler(async (req, res) => {
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
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline
    const pipeline = [];

    // Match stage for filtering
    const matchStage = {};

    if (search) {
        matchStage.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (category) {
        matchStage.category = new mongoose.Types.ObjectId(category);
    }

    if (subCategory) {
        matchStage.subCategory = new mongoose.Types.ObjectId(subCategory);
    }

    if (brand) {
        matchStage.brand = new mongoose.Types.ObjectId(brand);
    }

    if (gender) {
        matchStage.gender = gender;
    }

    if (minPrice || maxPrice) {
        matchStage.price = {};
        if (minPrice) matchStage.price.$gte = parseFloat(minPrice);
        if (maxPrice) matchStage.price.$lte = parseFloat(maxPrice);
    }

    if (size) {
        matchStage.size = { $in: Array.isArray(size) ? size : [size] };
    }

    if (color) {
        matchStage.color = { $in: Array.isArray(color) ? color : [color] };
    }

    if (inStock === 'true') {
        matchStage.quantity = { $gt: 0 };
    }

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // Lookup stages for populating references
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
            $lookup: {
                from: 'subcategories',
                localField: 'subCategory',
                foreignField: '_id',
                as: 'subCategoryDetails'
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brandDetails'
            }
        },
        {
            $unwind: {
                path: '$categoryDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$subCategoryDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$brandDetails',
                preserveNullAndEmptyArrays: true
            }
        }
    );

    // Add fields for easier access
    pipeline.push({
        $addFields: {
            category: '$categoryDetails',
            subCategory: '$subCategoryDetails',
            brand: '$brandDetails',
            discountPercentage: {
                $cond: {
                    if: { $and: [{ $gt: ['$priceAfterDiscount', 0] }, { $gt: ['$price', 0] }] },
                    then: {
                        $multiply: [
                            { $divide: [{ $subtract: ['$price', '$priceAfterDiscount'] }, '$price'] },
                            100
                        ]
                    },
                    else: 0
                }
            }
        }
    });

    // Remove unnecessary fields
    pipeline.push({
        $project: {
            categoryDetails: 0,
            subCategoryDetails: 0,
            brandDetails: 0
        }
    });

    // Sorting
    const sortStage = {};
    if (sort.startsWith('-')) {
        sortStage[sort.substring(1)] = -1;
    } else {
        sortStage[sort] = 1;
    }
    pipeline.push({ $sort: sortStage });

    // Count total documents
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Product.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Execute aggregation
    const products = await Product.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalProducts: total,
                    limit: limitNum
                }
            },
            "Products fetched successfully"
        )
    );
});

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:identifier
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
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
            $lookup: {
                from: 'subcategories',
                localField: 'subCategory',
                foreignField: '_id',
                as: 'subCategory'
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            }
        },
        {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'productId',
                as: 'reviews',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: '$user'
                    },
                    {
                        $project: {
                            rating: 1,
                            comment: 1,
                            createdAt: 1,
                            'user.username': 1,
                            'user.fullName': 1
                        }
                    },
                    { $sort: { createdAt: -1 } }
                ]
            }
        },
        {
            $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
        },
        {
            $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true }
        },
        {
            $unwind: { path: '$brand', preserveNullAndEmptyArrays: true }
        },
        {
            $addFields: {
                discountPercentage: {
                    $cond: {
                        if: { $and: [{ $gt: ['$priceAfterDiscount', 0] }, { $gt: ['$price', 0] }] },
                        then: {
                            $multiply: [
                                { $divide: [{ $subtract: ['$price', '$priceAfterDiscount'] }, '$price'] },
                                100
                            ]
                        },
                        else: 0
                    }
                }
            }
        }
    ];

    const products = await Product.aggregate(pipeline);

    if (!products || products.length === 0) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(new ApiResponse(200, products[0], "Product fetched successfully"));
});

/**
 * @desc    Update product
 * @route   PATCH /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Handle image uploads
    if (req.files?.coverImage) {
        const coverImageResult = await upLoadOnCloudinary(req.files.coverImage[0].path);
        if (coverImageResult) {
            updateData.coverImage = coverImageResult.secure_url;
        }
    }

    if (req.files?.images) {
        const imageUrls = [];
        for (const file of req.files.images) {
            const result = await upLoadOnCloudinary(file.path);
            if (result) {
                imageUrls.push(result.secure_url);
            }
        }
        updateData.images = [...(product.images || []), ...imageUrls];
    }

    if (updateData.variants && typeof updateData.variants === 'string') {
        try {
            updateData.variants = JSON.parse(updateData.variants);
        } catch (error) {
            throw new ApiError(400, "Invalid variants format");
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    )
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .populate('brand', 'name slug');

    res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

/**
 * @desc    Get related products
 * @route   GET /api/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 6;

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const relatedProducts = await Product.aggregate([
        {
            $match: {
                _id: { $ne: new mongoose.Types.ObjectId(id) },
                $or: [
                    { category: product.category },
                    { subCategory: product.subCategory },
                    { brand: product.brand }
                ]
            }
        },
        {
            $addFields: {
                relevanceScore: {
                    $sum: [
                        { $cond: [{ $eq: ['$category', product.category] }, 3, 0] },
                        { $cond: [{ $eq: ['$subCategory', product.subCategory] }, 2, 0] },
                        { $cond: [{ $eq: ['$brand', product.brand] }, 1, 0] }
                    ]
                }
            }
        },
        { $sort: { relevanceScore: -1, ratingsAverage: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                relevanceScore: 0
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, relatedProducts, "Related products fetched successfully"));
});

/**
 * @desc    Get product statistics
 * @route   GET /api/products/stats
 * @access  Private/Admin
 */
export const getProductStats = asyncHandler(async (req, res) => {
    const stats = await Product.aggregate([
        {
            $facet: {
                totalStats: [
                    {
                        $group: {
                            _id: null,
                            totalProducts: { $sum: 1 },
                            averagePrice: { $avg: '$price' },
                            totalQuantity: { $sum: '$quantity' },
                            totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
                        }
                    }
                ],
                categoryStats: [
                    {
                        $group: {
                            _id: '$category',
                            count: { $sum: 1 },
                            avgPrice: { $avg: '$price' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'categoryInfo'
                        }
                    },
                    { $unwind: '$categoryInfo' },
                    {
                        $project: {
                            category: '$categoryInfo.name',
                            count: 1,
                            avgPrice: 1
                        }
                    },
                    { $sort: { count: -1 } }
                ],
                topRated: [
                    { $sort: { ratingsAverage: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            name: 1,
                            ratingsAverage: 1,
                            ratingsQuantity: 1,
                            price: 1
                        }
                    }
                ],
                lowStock: [
                    { $match: { quantity: { $lt: 10, $gt: 0 } } },
                    { $sort: { quantity: 1 } },
                    { $limit: 10 },
                    {
                        $project: {
                            name: 1,
                            quantity: 1,
                            price: 1
                        }
                    }
                ]
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, stats[0], "Product statistics fetched successfully"));
});
