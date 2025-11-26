import mongoose from 'mongoose';

//can also create orderItem schema separately if needed

const orderSchema = new mongoose.Schema({
    orderPrice: {
        type: Number,
        required: true
    },
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
    address: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Delivered", "Cancelled"],
        default: "Pending"
    }
},{timestamps: true})

export const Order = mongoose.model("Order", orderSchema)