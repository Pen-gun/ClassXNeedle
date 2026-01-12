import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Coupon } from '../Models/coupon.model.js';
import mongoose from 'mongoose';

// ===============================
// COUPON CONTROLLERS
// ===============================

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountPercentage, expirationDate, maxUsage } = req.body;

    // Validation
    if (!code || !discountPercentage || !expirationDate) {
        throw new ApiError(400, "Code, discount percentage, and expiration date are required");
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
        throw new ApiError(400, "Discount percentage must be between 0 and 100");
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
        throw new ApiError(409, "Coupon code already exists");
    }

    const coupon = await Coupon.create({
        code: code.toUpperCase(),
        discountPercentage,
        expirationDate: new Date(expirationDate),
        maxUsage: maxUsage !== undefined ? Number(maxUsage) : undefined
    });

    res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

/**
 * @desc    Get all coupons with filtering and pagination
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        active,
        sort = '-createdAt'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // Filter active/expired coupons
    if (active === 'true') {
        pipeline.push({
            $match: {
                expirationDate: { $gte: new Date() }
            }
        });
    } else if (active === 'false') {
        pipeline.push({
            $match: {
                expirationDate: { $lt: new Date() }
            }
        });
    }

    // Add isExpired field
    pipeline.push({
        $addFields: {
            isExpired: {
                $lt: ['$expirationDate', new Date()]
            },
            daysUntilExpiration: {
                $divide: [
                    { $subtract: ['$expirationDate', new Date()] },
                    1000 * 60 * 60 * 24
                ]
            }
        }
    });

    // Lookup usage statistics
    pipeline.push(
        {
            $lookup: {
                from: 'carts',
                localField: '_id',
                foreignField: 'discount',
                as: 'usageInCarts'
            }
        },
        {
            $addFields: {
                activeUsageCount: { $size: '$usageInCarts' }
            }
        },
        {
            $project: {
                usageInCarts: 0
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
    const countResult = await Coupon.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const coupons = await Coupon.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                coupons,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalCoupons: total,
                    limit: limitNum
                }
            },
            "Coupons fetched successfully"
        )
    );
});

/**
 * @desc    Get single coupon by ID or code
 * @route   GET /api/coupons/:identifier
 * @access  Private/Admin
 */
export const getCouponById = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    const pipeline = [
        {
            $match: mongoose.Types.ObjectId.isValid(identifier)
                ? { _id: new mongoose.Types.ObjectId(identifier) }
                : { code: identifier.toUpperCase() }
        },
        {
            $addFields: {
                isExpired: {
                    $lt: ['$expirationDate', new Date()]
                },
                daysUntilExpiration: {
                    $divide: [
                        { $subtract: ['$expirationDate', new Date()] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $lookup: {
                from: 'carts',
                localField: '_id',
                foreignField: 'discount',
                as: 'usageInCarts'
            }
        },
        {
            $addFields: {
                activeUsageCount: { $size: '$usageInCarts' }
            }
        },
        {
            $project: {
                usageInCarts: 0
            }
        }
    ];

    const coupons = await Coupon.aggregate(pipeline);

    if (!coupons || coupons.length === 0) {
        throw new ApiError(404, "Coupon not found");
    }

    res.status(200).json(new ApiResponse(200, coupons[0], "Coupon fetched successfully"));
});

/**
 * @desc    Validate coupon code
 * @route   POST /api/coupons/validate
 * @access  Public
 */
export const validateCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        throw new ApiError(400, "Coupon code is required");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        throw new ApiError(404, "Invalid coupon code");
    }

    // Check expiration
    const isExpired = new Date(coupon.expirationDate) < new Date();

    if (isExpired) {
        throw new ApiError(400, "Coupon has expired");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                expirationDate: coupon.expirationDate,
                isValid: true
            },
            "Coupon is valid"
        )
    );
});

/**
 * @desc    Update coupon
 * @route   PATCH /api/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, discountPercentage, expirationDate, maxUsage } = req.body;

    const updateData = {};

    if (code) {
        // Check if new code already exists
        const existingCoupon = await Coupon.findOne({
            code: code.toUpperCase(),
            _id: { $ne: id }
        });
        if (existingCoupon) {
            throw new ApiError(409, "Coupon code already exists");
        }
        updateData.code = code.toUpperCase();
    }

    if (discountPercentage !== undefined) {
        if (discountPercentage < 0 || discountPercentage > 100) {
            throw new ApiError(400, "Discount percentage must be between 0 and 100");
        }
        updateData.discountPercentage = discountPercentage;
    }

    if (expirationDate) {
        updateData.expirationDate = new Date(expirationDate);
    }
    if (maxUsage !== undefined) {
        updateData.maxUsage = maxUsage === null || maxUsage === '' ? undefined : Number(maxUsage);
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    res.status(200).json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if coupon is currently being used
    const cartsUsingCoupon = await mongoose.model('Cart').countDocuments({ discount: id });
    if (cartsUsingCoupon > 0) {
        throw new ApiError(400, "Cannot delete coupon that is currently in use");
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

/**
 * @desc    Get coupon statistics
 * @route   GET /api/coupons/stats
 * @access  Private/Admin
 */
export const getCouponStats = asyncHandler(async (req, res) => {
    const stats = await Coupon.aggregate([
        {
            $facet: {
                overall: [
                    {
                        $group: {
                            _id: null,
                            totalCoupons: { $sum: 1 },
                            activeCoupons: {
                                $sum: {
                                    $cond: [
                                        { $gte: ['$expirationDate', new Date()] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            expiredCoupons: {
                                $sum: {
                                    $cond: [
                                        { $lt: ['$expirationDate', new Date()] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            averageDiscount: { $avg: '$discountPercentage' }
                        }
                    }
                ],
                mostUsed: [
                    {
                        $lookup: {
                            from: 'carts',
                            localField: '_id',
                            foreignField: 'discount',
                            as: 'usage'
                        }
                    },
                    {
                        $addFields: {
                            usageCount: { $size: '$usage' }
                        }
                    },
                    {
                        $match: {
                            usageCount: { $gt: 0 }
                        }
                    },
                    { $sort: { usageCount: -1 } },
                    { $limit: 10 },
                    {
                        $project: {
                            code: 1,
                            discountPercentage: 1,
                            usageCount: 1,
                            expirationDate: 1
                        }
                    }
                ],
                expiringInWeek: [
                    {
                        $match: {
                            expirationDate: {
                                $gte: new Date(),
                                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    { $sort: { expirationDate: 1 } },
                    {
                        $project: {
                            code: 1,
                            discountPercentage: 1,
                            expirationDate: 1
                        }
                    }
                ]
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, stats[0], "Coupon statistics fetched successfully"));
});

/**
 * @desc    Get active coupons (for customers)
 * @route   GET /api/coupons/active
 * @access  Public
 */
export const getActiveCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.aggregate([
        {
            $match: {
                expirationDate: { $gte: new Date() }
            }
        },
        {
            $addFields: {
                daysUntilExpiration: {
                    $divide: [
                        { $subtract: ['$expirationDate', new Date()] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $sort: { discountPercentage: -1 }
        },
        {
            $project: {
                code: 1,
                discountPercentage: 1,
                expirationDate: 1,
                daysUntilExpiration: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, coupons, "Active coupons fetched successfully"));
});
