import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Review } from '../Models/review.model.js';
import { Product } from '../Models/product.model.js';
import mongoose from 'mongoose';

// ===============================
// REVIEW CONTROLLERS
// ===============================

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
    const { rating, comment, productId } = req.body;
    const userId = req.user._id;

    // Validation
    if (!rating || !comment || !productId) {
        throw new ApiError(400, "Rating, comment, and product ID are required");
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
        throw new ApiError(409, "You have already reviewed this product");
    }

    // Create review
    const review = await Review.create({
        rating,
        comment,
        productId,
        userId
    });

    // Update product ratings
    await Product.calcAverageRatings(productId);

    const populatedReview = await Review.findById(review._id)
        .populate('userId', 'username fullName')
        .populate('productId', 'name slug');

    res.status(201).json(new ApiResponse(201, populatedReview, "Review created successfully"));
});

/**
 * @desc    Get all reviews with filtering and pagination
 * @route   GET /api/reviews
 * @access  Public
 */
export const getAllReviews = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        productId,
        userId,
        rating,
        sort = '-createdAt'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // Match stage for filtering
    const matchStage = {};

    if (productId) {
        matchStage.productId = new mongoose.Types.ObjectId(productId);
    }

    if (userId) {
        matchStage.userId = new mongoose.Types.ObjectId(userId);
    }

    if (rating) {
        matchStage.rating = parseInt(rating);
    }

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // Lookup user details
    pipeline.push(
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
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $project: {
                rating: 1,
                comment: 1,
                createdAt: 1,
                updatedAt: 1,
                'user._id': 1,
                'user.username': 1,
                'user.fullName': 1,
                'product._id': 1,
                'product.name': 1,
                'product.slug': 1,
                'product.coverImage': 1
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
    const countResult = await Review.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const reviews = await Review.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                reviews,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalReviews: total,
                    limit: limitNum
                }
            },
            "Reviews fetched successfully"
        )
    );
});

/**
 * @desc    Get reviews by product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
export const getReviewsByProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
        {
            $match: {
                productId: new mongoose.Types.ObjectId(productId),
                ...(rating && { rating: parseInt(rating) })
            }
        },
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
    ];

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Review.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const reviews = await Review.aggregate(pipeline);

    // Get rating statistics
    const ratingStats = await Review.aggregate([
        {
            $match: { productId: new mongoose.Types.ObjectId(productId) }
        },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 }
        }
    ]);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                reviews,
                ratingDistribution: ratingStats,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalReviews: total,
                    limit: limitNum
                }
            },
            "Product reviews fetched successfully"
        )
    );
});

/**
 * @desc    Get single review by ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReviewById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reviews = await Review.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(id) }
        },
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
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $project: {
                rating: 1,
                comment: 1,
                createdAt: 1,
                updatedAt: 1,
                'user._id': 1,
                'user.username': 1,
                'user.fullName': 1,
                'product._id': 1,
                'product.name': 1,
                'product.slug': 1
            }
        }
    ]);

    if (!reviews || reviews.length === 0) {
        throw new ApiError(404, "Review not found");
    }

    res.status(200).json(new ApiResponse(200, reviews[0], "Review fetched successfully"));
});

/**
 * @desc    Update review
 * @route   PATCH /api/reviews/:id
 * @access  Private
 */
export const updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(id);

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only update your own reviews");
    }

    const updateData = {};
    if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }
        updateData.rating = rating;
    }
    if (comment) updateData.comment = comment;

    const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    })
        .populate('userId', 'username fullName')
        .populate('productId', 'name slug');

    // Update product ratings
    await Product.calcAverageRatings(review.productId);

    res.status(200).json(new ApiResponse(200, updatedReview, "Review updated successfully"));
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const review = await Review.findById(id);

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== userId.toString() && userRole !== 'admin') {
        throw new ApiError(403, "You can only delete your own reviews");
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(id);

    // Update product ratings
    await Product.calcAverageRatings(productId);

    res.status(200).json(new ApiResponse(200, null, "Review deleted successfully"));
});

/**
 * @desc    Get review statistics
 * @route   GET /api/reviews/stats
 * @access  Public
 */
export const getReviewStats = asyncHandler(async (req, res) => {
    const stats = await Review.aggregate([
        {
            $facet: {
                overall: [
                    {
                        $group: {
                            _id: null,
                            totalReviews: { $sum: 1 },
                            averageRating: { $avg: '$rating' }
                        }
                    }
                ],
                ratingDistribution: [
                    {
                        $group: {
                            _id: '$rating',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } }
                ],
                topReviewedProducts: [
                    {
                        $group: {
                            _id: '$productId',
                            reviewCount: { $sum: 1 },
                            averageRating: { $avg: '$rating' }
                        }
                    },
                    { $sort: { reviewCount: -1 } },
                    { $limit: 10 },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    { $unwind: '$product' },
                    {
                        $project: {
                            productName: '$product.name',
                            productSlug: '$product.slug',
                            reviewCount: 1,
                            averageRating: 1
                        }
                    }
                ]
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, stats[0], "Review statistics fetched successfully"));
});
