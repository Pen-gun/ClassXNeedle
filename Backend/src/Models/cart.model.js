import mongoose, { Schema } from 'mongoose';

const cartSchema = new mongoose.Schema({
    cartItem:[{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }],
    totalCartPrice: {
        type: Number,
        required: true,
        default: 0
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    priceAfterDiscount: {
        type: Number
    }
});

export const Cart = mongoose.model("Cart", cartSchema)