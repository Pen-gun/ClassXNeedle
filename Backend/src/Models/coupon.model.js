import mongoose, { Schema } from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    }
},{timestamps: true});

export const Coupon = mongoose.model('Coupon', couponSchema);