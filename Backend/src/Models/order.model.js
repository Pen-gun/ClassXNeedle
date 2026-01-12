import mongoose from 'mongoose';

//can also create orderItem schema separately if needed

const orderSchema = new mongoose.Schema({
    orderItems: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    phoneNumber:{
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    shippingCost:{
        type: Number,
        required: true
    },
    orderPrice: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ["Pending", "Delivered", "Cancelled"],
        default: "Pending"
    }
},{timestamps: true})

export const Order = mongoose.model("Order", orderSchema)