import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { User } from '../Models/users.model.js';
import mongoose from 'mongoose';

// ===============================
// USER MANAGEMENT CONTROLLERS
// ===============================

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        role,
        active,
        search,
        sort = '-createdAt'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // Match stage for filtering
    const matchStage = {};

    if (role) {
        matchStage.role = role;
    }

    if (active !== undefined) {
        matchStage.active = active === 'true';
    }

    if (search) {
        matchStage.$or = [
            { username: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // Lookup orders
    pipeline.push(
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'customer',
                as: 'orders'
            }
        },
        {
            $addFields: {
                totalOrders: { $size: '$orders' },
                totalSpent: { $sum: '$orders.orderPrice' }
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                orders: 0
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
    const countResult = await User.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const users = await User.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalUsers: total,
                    limit: limitNum
                }
            },
            "Users fetched successfully"
        )
    );
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const users = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(id) }
        },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'customer',
                as: 'orders',
                pipeline: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 10 },
                    {
                        $project: {
                            _id: 1,
                            orderPrice: 1,
                            status: 1,
                            isPaid: 1,
                            isDelivered: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'wishlist',
                foreignField: '_id',
                as: 'wishlistDetails'
            }
        },
        {
            $addFields: {
                totalOrders: { $size: '$orders' },
                totalSpent: {
                    $sum: '$orders.orderPrice'
                }
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0
            }
        }
    ]);

    if (!users || users.length === 0) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, users[0], "User fetched successfully"));
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, phone, email } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email.toLowerCase();

    // Check if email or phone already exists
    if (email || phone) {
        const existingUser = await User.findOne({
            $and: [
                { _id: { $ne: userId } },
                {
                    $or: [
                        ...(email ? [{ email: email.toLowerCase() }] : []),
                        ...(phone ? [{ phone }] : [])
                    ]
                }
            ]
        });

        if (existingUser) {
            throw new ApiError(409, "Email or phone already in use");
        }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    }).select('-password -refreshToken');

    res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

/**
 * @desc    Update user role
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['customer', 'admin'].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, user, "User role updated successfully"));
});

/**
 * @desc    Deactivate/Activate user account
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined) {
        throw new ApiError(400, "Active status is required");
    }

    const user = await User.findByIdAndUpdate(
        id,
        { active },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            user,
            `User ${active ? 'activated' : 'deactivated'} successfully`
        )
    );
});

/**
 * @desc    Add address to user
 * @route   POST /api/users/addresses
 * @access  Private
 */
export const addAddress = asyncHandler(async (req, res) => {
    const { address } = req.body;
    const userId = req.user._id;

    if (!address) {
        throw new ApiError(400, "Address is required");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $push: { addresses: address } },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(200).json(new ApiResponse(200, user, "Address added successfully"));
});

/**
 * @desc    Remove address from user
 * @route   DELETE /api/users/addresses
 * @access  Private
 */
export const removeAddress = asyncHandler(async (req, res) => {
    const { address } = req.body;
    const userId = req.user._id;

    if (!address) {
        throw new ApiError(400, "Address is required");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { addresses: address } },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(200).json(new ApiResponse(200, user, "Address removed successfully"));
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/users/wishlist
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    // Check if product exists
    const product = await mongoose.model('Product').findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if product already in wishlist
    const user = await User.findById(userId);
    if (user.wishlist.includes(productId)) {
        throw new ApiError(409, "Product already in wishlist");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { wishlist: productId } },
        { new: true, runValidators: true }
    )
        .select('-password -refreshToken')
        .populate('wishlist', 'name slug price coverImage');

    res.status(200).json(new ApiResponse(200, updatedUser, "Product added to wishlist"));
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/users/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId } },
        { new: true, runValidators: true }
    )
        .select('-password -refreshToken')
        .populate('wishlist', 'name slug price coverImage');

    res.status(200).json(new ApiResponse(200, user, "Product removed from wishlist"));
});

/**
 * @desc    Get user wishlist
 * @route   GET /api/users/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const users = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'wishlist',
                foreignField: '_id',
                as: 'wishlistProducts',
                pipeline: [
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $unwind: {
                            path: '$category',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            slug: 1,
                            price: 1,
                            priceAfterDiscount: 1,
                            coverImage: 1,
                            ratingsAverage: 1,
                            quantity: 1,
                            'category.name': 1,
                            'category.slug': 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                wishlistProducts: 1
            }
        }
    ]);

    if (!users || users.length === 0) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(200, users[0].wishlistProducts, "Wishlist fetched successfully")
    );
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user has active orders
    const activeOrders = await mongoose.model('Order').countDocuments({
        customer: id,
        status: { $in: ['Pending'] }
    });

    if (activeOrders > 0) {
        throw new ApiError(400, "Cannot delete user with active orders");
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
export const getUserStats = asyncHandler(async (req, res) => {
    const stats = await User.aggregate([
        {
            $facet: {
                overall: [
                    {
                        $group: {
                            _id: null,
                            totalUsers: { $sum: 1 },
                            activeUsers: {
                                $sum: { $cond: ['$active', 1, 0] }
                            },
                            inactiveUsers: {
                                $sum: { $cond: ['$active', 0, 1] }
                            },
                            admins: {
                                $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                            },
                            customers: {
                                $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] }
                            }
                        }
                    }
                ],
                newUsersThisMonth: [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                            }
                        }
                    },
                    {
                        $count: 'count'
                    }
                ],
                topSpenders: [
                    {
                        $lookup: {
                            from: 'orders',
                            localField: '_id',
                            foreignField: 'customer',
                            as: 'orders'
                        }
                    },
                    {
                        $addFields: {
                            totalSpent: { $sum: '$orders.orderPrice' },
                            orderCount: { $size: '$orders' }
                        }
                    },
                    {
                        $match: {
                            orderCount: { $gt: 0 }
                        }
                    },
                    { $sort: { totalSpent: -1 } },
                    { $limit: 10 },
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            email: 1,
                            totalSpent: 1,
                            orderCount: 1
                        }
                    }
                ]
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, stats[0], "User statistics fetched successfully"));
});
