import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Order } from '../Models/order.model.js';
import { Cart } from '../Models/cart.model.js';
import { Product } from '../Models/product.model.js';
import { Coupon } from '../Models/coupon.model.js';
import mongoose from 'mongoose';

// ===============================
// ORDER CONTROLLERS
// ===============================

/**
 * @desc    Create a new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { address, shippingCost = 0, items } = req.body;
    const customerId = req.user._id;

    if (!address) {
        throw new ApiError(400, "Delivery address is required");
    }

    // Get user's cart
    const cart = await Cart.findOne({ customer: customerId }).populate('cartItem.productId');

    if (!cart || cart.cartItem.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    const selectedItems = Array.isArray(items) && items.length > 0
        ? items
        : cart.cartItem.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity
        }));

    // Validate product availability and quantities
    for (const item of selectedItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new ApiError(404, `Product ${item.productId} not found`);
        }
        if (product.quantity < item.quantity) {
            throw new ApiError(400, `Insufficient quantity for product: ${product.name}`);
        }
    }

    // Create order items
    const cartMap = new Map(
        cart.cartItem.map((item) => [item.productId._id.toString(), item])
    );
    const orderItems = selectedItems.map((item) => {
        const cartItem = cartMap.get(item.productId.toString());
        if (!cartItem) {
            throw new ApiError(400, "Selected item not found in cart");
        }
        if (cartItem.quantity < item.quantity) {
            throw new ApiError(400, "Selected quantity exceeds cart quantity");
        }
        return {
            productId: cartItem.productId._id,
            quantity: item.quantity
        };
    });

    const subtotal = selectedItems.reduce((sum, item) => {
        const cartItem = cartMap.get(item.productId.toString());
        return sum + (cartItem?.price || 0) * item.quantity;
    }, 0);
    const discountRate = cart.totalCartPrice > 0 && cart.priceAfterDiscount
        ? cart.priceAfterDiscount / cart.totalCartPrice
        : 1;
    const discountedSubtotal = subtotal * discountRate;
    const orderPrice = discountedSubtotal + shippingCost;

    // Create order
    const order = await Order.create({
        orderItems,
        customer: customerId,
        address,
        shippingCost,
        orderPrice
    });

    // Update product quantities
    for (const item of selectedItems) {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { quantity: -item.quantity } }
        );
    }

    // Remove selected items from cart
    cart.cartItem = cart.cartItem.filter(
        (item) => !selectedItems.find((selected) => selected.productId.toString() === item.productId._id.toString())
    );
    if (cart.cartItem.length === 0) {
        await Cart.findByIdAndDelete(cart._id);
    } else {
        cart.calculateTotalPrice();
        if (cart.discount) {
            const coupon = await Coupon.findById(cart.discount);
            if (coupon && (!coupon.expirationDate || new Date(coupon.expirationDate) >= new Date())) {
                cart.priceAfterDiscount = cart.totalCartPrice - (cart.totalCartPrice * coupon.discountPercentage / 100);
            } else {
                cart.discount = undefined;
                cart.priceAfterDiscount = undefined;
            }
        } else {
            cart.priceAfterDiscount = undefined;
        }
        await cart.save();
    }

    // Fetch created order with populated fields
    const createdOrder = await Order.findById(order._id)
        .populate('customer', 'username fullName email phone')
        .populate('orderItems.productId', 'name slug price coverImage');

    res.status(201).json(new ApiResponse(201, createdOrder, "Order created successfully"));
});

/**
 * @desc    Get all orders with filtering and pagination
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status,
        isPaid,
        isDelivered,
        customerId,
        sort = '-createdAt'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // Match stage for filtering
    const matchStage = {};

    if (status) {
        matchStage.status = status;
    }

    if (isPaid !== undefined) {
        matchStage.isPaid = isPaid === 'true';
    }

    if (isDelivered !== undefined) {
        matchStage.isDelivered = isDelivered === 'true';
    }

    if (customerId) {
        matchStage.customer = new mongoose.Types.ObjectId(customerId);
    }

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // Lookup customer details
    pipeline.push(
        {
            $lookup: {
                from: 'users',
                localField: 'customer',
                foreignField: '_id',
                as: 'customerDetails'
            }
        },
        {
            $unwind: '$customerDetails'
        },
        {
            $unwind: {
                path: '$orderItems',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'orderItems.productId',
                foreignField: '_id',
                as: 'orderItems.productDetails'
            }
        },
        {
            $unwind: {
                path: '$orderItems.productDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                customer: { $first: '$customerDetails' },
                address: { $first: '$address' },
                shippingCost: { $first: '$shippingCost' },
                orderPrice: { $first: '$orderPrice' },
                isPaid: { $first: '$isPaid' },
                paidAt: { $first: '$paidAt' },
                isDelivered: { $first: '$isDelivered' },
                deliveredAt: { $first: '$deliveredAt' },
                status: { $first: '$status' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                orderItems: {
                    $push: {
                        productId: '$orderItems.productId',
                        quantity: '$orderItems.quantity',
                        product: {
                            name: '$orderItems.productDetails.name',
                            slug: '$orderItems.productDetails.slug',
                            price: '$orderItems.productDetails.price',
                            coverImage: '$orderItems.productDetails.coverImage'
                        }
                    }
                }
            }
        },
        {
            $project: {
                'customer.password': 0,
                'customer.refreshToken': 0
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
    const countResult = await Order.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const orders = await Order.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalOrders: total,
                    limit: limitNum
                }
            },
            "Orders fetched successfully"
        )
    );
});

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const customerId = req.user._id;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
        {
            $match: {
                customer: new mongoose.Types.ObjectId(customerId),
                ...(status && { status })
            }
        },
        {
            $unwind: {
                path: '$orderItems',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'orderItems.productId',
                foreignField: '_id',
                as: 'orderItems.productDetails'
            }
        },
        {
            $unwind: {
                path: '$orderItems.productDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                address: { $first: '$address' },
                shippingCost: { $first: '$shippingCost' },
                orderPrice: { $first: '$orderPrice' },
                isPaid: { $first: '$isPaid' },
                paidAt: { $first: '$paidAt' },
                isDelivered: { $first: '$isDelivered' },
                deliveredAt: { $first: '$deliveredAt' },
                status: { $first: '$status' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                orderItems: {
                    $push: {
                        productId: '$orderItems.productId',
                        quantity: '$orderItems.quantity',
                        product: {
                            name: '$orderItems.productDetails.name',
                            slug: '$orderItems.productDetails.slug',
                            price: '$orderItems.productDetails.price',
                            coverImage: '$orderItems.productDetails.coverImage'
                        }
                    }
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ];

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Order.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const orders = await Order.aggregate(pipeline);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalOrders: total,
                    limit: limitNum
                }
            },
            "Orders fetched successfully"
        )
    );
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const orders = await Order.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(id) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'customer',
                foreignField: '_id',
                as: 'customer'
            }
        },
        {
            $unwind: '$customer'
        },
        {
            $unwind: {
                path: '$orderItems',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'orderItems.productId',
                foreignField: '_id',
                as: 'orderItems.productDetails'
            }
        },
        {
            $unwind: {
                path: '$orderItems.productDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                customer: { $first: '$customer' },
                address: { $first: '$address' },
                shippingCost: { $first: '$shippingCost' },
                orderPrice: { $first: '$orderPrice' },
                isPaid: { $first: '$isPaid' },
                paidAt: { $first: '$paidAt' },
                isDelivered: { $first: '$isDelivered' },
                deliveredAt: { $first: '$deliveredAt' },
                status: { $first: '$status' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                orderItems: {
                    $push: {
                        productId: '$orderItems.productId',
                        quantity: '$orderItems.quantity',
                        product: '$orderItems.productDetails'
                    }
                }
            }
        },
        {
            $project: {
                'customer.password': 0,
                'customer.refreshToken': 0
            }
        }
    ]);

    if (!orders || orders.length === 0) {
        throw new ApiError(404, "Order not found");
    }

    const order = orders[0];

    // Check if user owns this order or is admin
    if (order.customer._id.toString() !== userId.toString() && userRole !== 'admin') {
        throw new ApiError(403, "You can only view your own orders");
    }

    res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const validStatuses = ["Pending", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const updateData = { status };

    if (status === "Delivered") {
        updateData.isDelivered = true;
        updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    })
        .populate('customer', 'username fullName email phone')
        .populate('orderItems.productId', 'name slug price coverImage');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

/**
 * @desc    Mark order as paid
 * @route   PATCH /api/orders/:id/pay
 * @access  Private/Admin
 */
export const markOrderAsPaid = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
        id,
        {
            isPaid: true,
            paidAt: new Date()
        },
        { new: true, runValidators: true }
    )
        .populate('customer', 'username fullName email phone')
        .populate('orderItems.productId', 'name slug price coverImage');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(new ApiResponse(200, order, "Order marked as paid successfully"));
});

/**
 * @desc    Cancel order
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check if user owns this order or is admin
    if (order.customer.toString() !== userId.toString() && userRole !== 'admin') {
        throw new ApiError(403, "You can only cancel your own orders");
    }

    // Check if order can be cancelled
    if (order.status === "Delivered") {
        throw new ApiError(400, "Cannot cancel delivered order");
    }

    if (order.status === "Cancelled") {
        throw new ApiError(400, "Order is already cancelled");
    }

    // Restore product quantities
    for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { quantity: item.quantity } }
        );
    }

    order.status = "Cancelled";
    await order.save();

    const updatedOrder = await Order.findById(order._id)
        .populate('customer', 'username fullName email phone')
        .populate('orderItems.productId', 'name slug price coverImage');

    res.status(200).json(new ApiResponse(200, updatedOrder, "Order cancelled successfully"));
});

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res) => {
    const stats = await Order.aggregate([
        {
            $facet: {
                overall: [
                    {
                        $group: {
                            _id: null,
                            totalOrders: { $sum: 1 },
                            totalRevenue: { $sum: '$orderPrice' },
                            averageOrderValue: { $avg: '$orderPrice' },
                            paidOrders: {
                                $sum: { $cond: ['$isPaid', 1, 0] }
                            },
                            deliveredOrders: {
                                $sum: { $cond: ['$isDelivered', 1, 0] }
                            }
                        }
                    }
                ],
                byStatus: [
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 },
                            totalValue: { $sum: '$orderPrice' }
                        }
                    },
                    { $sort: { count: -1 } }
                ],
                recentOrders: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 10 },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'customer',
                            foreignField: '_id',
                            as: 'customer'
                        }
                    },
                    { $unwind: '$customer' },
                    {
                        $project: {
                            orderPrice: 1,
                            status: 1,
                            isPaid: 1,
                            isDelivered: 1,
                            createdAt: 1,
                            'customer.username': 1,
                            'customer.fullName': 1
                        }
                    }
                ],
                topCustomers: [
                    {
                        $group: {
                            _id: '$customer',
                            orderCount: { $sum: 1 },
                            totalSpent: { $sum: '$orderPrice' }
                        }
                    },
                    { $sort: { totalSpent: -1 } },
                    { $limit: 10 },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'customerDetails'
                        }
                    },
                    { $unwind: '$customerDetails' },
                    {
                        $project: {
                            username: '$customerDetails.username',
                            fullName: '$customerDetails.fullName',
                            orderCount: 1,
                            totalSpent: 1
                        }
                    }
                ],
                salesByMonth: [
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            orders: { $sum: 1 },
                            revenue: { $sum: '$orderPrice' }
                        }
                    },
                    { $sort: { '_id.year': -1, '_id.month': -1 } },
                    { $limit: 12 }
                ]
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, stats[0], "Order statistics fetched successfully"));
});
