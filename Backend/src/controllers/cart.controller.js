import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Cart } from '../Models/cart.model.js';
import { Product } from '../Models/product.model.js';
import { Coupon } from '../Models/coupon.model.js';
import mongoose from 'mongoose';

// ===============================
// CART CONTROLLERS
// ===============================

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
    const customerId = req.user._id;

    const cart = await Cart.aggregate([
        {
            $match: { customer: new mongoose.Types.ObjectId(customerId) }
        },
        {
            $unwind: {
                path: '$cartItem',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'cartItem.productId',
                foreignField: '_id',
                as: 'cartItem.productDetails'
            }
        },
        {
            $unwind: {
                path: '$cartItem.productDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                customer: { $first: '$customer' },
                totalCartPrice: { $first: '$totalCartPrice' },
                discount: { $first: '$discount' },
                priceAfterDiscount: { $first: '$priceAfterDiscount' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                cartItem: {
                    $push: {
                        productId: '$cartItem.productId',
                        quantity: '$cartItem.quantity',
                        price: '$cartItem.price',
                        size: '$cartItem.size',
                        color: '$cartItem.color',
                        product: {
                            _id: '$cartItem.productDetails._id',
                            name: '$cartItem.productDetails.name',
                            slug: '$cartItem.productDetails.slug',
                            coverImage: '$cartItem.productDetails.coverImage',
                            price: '$cartItem.productDetails.price',
                            priceAfterDiscount: '$cartItem.productDetails.priceAfterDiscount',
                            quantity: '$cartItem.productDetails.quantity'
                        }
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'coupons',
                localField: 'discount',
                foreignField: '_id',
                as: 'discountDetails'
            }
        },
        {
            $unwind: {
                path: '$discountDetails',
                preserveNullAndEmptyArrays: true
            }
        }
    ]);

    if (!cart || cart.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { cartItem: [], totalCartPrice: 0 }, "Cart is empty")
        );
    }

    res.status(200).json(new ApiResponse(200, cart[0], "Cart fetched successfully"));
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1, size, color } = req.body;
    const customerId = req.user._id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }
    if (!size || !color) {
        throw new ApiError(400, "Size and color are required");
    }

    // Check if product exists and has sufficient quantity
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.quantity < quantity) {
        throw new ApiError(400, "Insufficient product quantity");
    }
    if (Array.isArray(product.size) && !product.size.includes(size)) {
        throw new ApiError(400, "Selected size is not available");
    }
    if (Array.isArray(product.color) && !product.color.includes(color)) {
        throw new ApiError(400, "Selected color is not available");
    }

    const price = product.priceAfterDiscount || product.price;

    // Find or create cart
    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
        // Create new cart
        cart = await Cart.create({
            customer: customerId,
            cartItem: [{ productId, quantity, price, size, color }],
            totalCartPrice: price * quantity
        });
    } else {
        // Check if product already in cart
        const existingItemIndex = cart.cartItem.findIndex(
            item =>
                item.productId.toString() === productId.toString() &&
                item.size === size &&
                item.color === color
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.cartItem[existingItemIndex].quantity += quantity;
            cart.cartItem[existingItemIndex].price = price;
        } else {
            // Add new item
            cart.cartItem.push({ productId, quantity, price, size, color });
        }

        // Recalculate total
        cart.calculateTotalPrice();
        await cart.save();
    }

    // Fetch updated cart with product details
    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'cartItem.productId',
            select: 'name slug coverImage price priceAfterDiscount quantity'
        })
        .populate('discount');

    res.status(200).json(new ApiResponse(200, updatedCart, "Item added to cart successfully"));
});

/**
 * @desc    Update cart item quantity
 * @route   PATCH /api/cart/items/:productId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity, size, color } = req.body;
    const customerId = req.user._id;

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Valid quantity is required");
    }
    if (!size || !color) {
        throw new ApiError(400, "Size and color are required");
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.quantity < quantity) {
        throw new ApiError(400, "Insufficient product quantity");
    }

    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.cartItem.findIndex(
        item =>
            item.productId.toString() === productId.toString() &&
            item.size === size &&
            item.color === color
    );

    if (itemIndex === -1) {
        throw new ApiError(404, "Item not found in cart");
    }

    // Update quantity and price
    const price = product.priceAfterDiscount || product.price;
    cart.cartItem[itemIndex].quantity = quantity;
    cart.cartItem[itemIndex].price = price;

    // Recalculate total
    cart.calculateTotalPrice();
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'cartItem.productId',
            select: 'name slug coverImage price priceAfterDiscount quantity'
        })
        .populate('discount');

    res.status(200).json(new ApiResponse(200, updatedCart, "Cart item updated successfully"));
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { size, color } = req.body;
    const customerId = req.user._id;

    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    if (!size || !color) {
        throw new ApiError(400, "Size and color are required");
    }

    cart.cartItem = cart.cartItem.filter(
        item =>
            item.productId.toString() !== productId.toString() ||
            item.size !== size ||
            item.color !== color
    );

    if (cart.cartItem.length === 0) {
        // Delete cart if empty
        await Cart.findByIdAndDelete(cart._id);
        return res.status(200).json(
            new ApiResponse(200, { cartItem: [], totalCartPrice: 0 }, "Cart is now empty")
        );
    }

    cart.calculateTotalPrice();
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'cartItem.productId',
            select: 'name slug coverImage price priceAfterDiscount quantity'
        })
        .populate('discount');

    res.status(200).json(new ApiResponse(200, updatedCart, "Item removed from cart successfully"));
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
    const customerId = req.user._id;

    const cart = await Cart.findOneAndDelete({ customer: customerId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Cart cleared successfully"));
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/cart/coupon
 * @access  Private
 */
export const applyCoupon = asyncHandler(async (req, res) => {
    const { couponCode } = req.body;
    const customerId = req.user._id;

    if (!couponCode) {
        throw new ApiError(400, "Coupon code is required");
    }

    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    if (cart.cartItem.length === 0) {
        throw new ApiError(400, "Cannot apply coupon to empty cart");
    }

    // Find and validate coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
        throw new ApiError(404, "Invalid coupon code");
    }

    // Check expiration
    if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
        throw new ApiError(400, "Coupon has expired");
    }
    if (coupon.maxUsage !== undefined && coupon.usedCount >= coupon.maxUsage) {
        throw new ApiError(400, "Coupon usage limit reached");
    }

    // Apply discount
    cart.discount = coupon._id;
    cart.priceAfterDiscount = cart.totalCartPrice - (cart.totalCartPrice * coupon.discountPercentage / 100);
    
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'cartItem.productId',
            select: 'name slug coverImage price priceAfterDiscount quantity'
        })
        .populate('discount');

    res.status(200).json(new ApiResponse(200, updatedCart, "Coupon applied successfully"));
});

/**
 * @desc    Remove coupon from cart
 * @route   DELETE /api/cart/coupon
 * @access  Private
 */
export const removeCoupon = asyncHandler(async (req, res) => {
    const customerId = req.user._id;

    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.discount = undefined;
    cart.priceAfterDiscount = undefined;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'cartItem.productId',
            select: 'name slug coverImage price priceAfterDiscount quantity'
        });

    res.status(200).json(new ApiResponse(200, updatedCart, "Coupon removed successfully"));
});

/**
 * @desc    Get cart summary
 * @route   GET /api/cart/summary
 * @access  Private
 */
export const getCartSummary = asyncHandler(async (req, res) => {
    const customerId = req.user._id;

    const summary = await Cart.aggregate([
        {
            $match: { customer: new mongoose.Types.ObjectId(customerId) }
        },
        {
            $unwind: '$cartItem'
        },
        {
            $group: {
                _id: '$_id',
                totalItems: { $sum: 1 },
                totalQuantity: { $sum: '$cartItem.quantity' },
                subtotal: { $first: '$totalCartPrice' },
                discount: { $first: '$discount' },
                total: {
                    $first: {
                        $ifNull: ['$priceAfterDiscount', '$totalCartPrice']
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'coupons',
                localField: 'discount',
                foreignField: '_id',
                as: 'couponDetails'
            }
        },
        {
            $unwind: {
                path: '$couponDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                totalItems: 1,
                totalQuantity: 1,
                subtotal: 1,
                total: 1,
                savings: {
                    $subtract: ['$subtotal', '$total']
                },
                coupon: {
                    code: '$couponDetails.code',
                    discountPercentage: '$couponDetails.discountPercentage'
                }
            }
        }
    ]);

    if (!summary || summary.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, {
                totalItems: 0,
                totalQuantity: 0,
                subtotal: 0,
                total: 0,
                savings: 0
            }, "Cart is empty")
        );
    }

    res.status(200).json(new ApiResponse(200, summary[0], "Cart summary fetched successfully"));
});
