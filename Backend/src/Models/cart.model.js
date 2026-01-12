import mongoose, { Schema } from 'mongoose';

const cartSchema = new mongoose.Schema({
    cartItem:[{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },
        size: {
            type: String
        },
        color: {
            type: String
        },
        price:{
            type: Number,
            required: true
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
    discount:{
        type: Schema.Types.ObjectId,
        ref: "Coupon"
    },
    priceAfterDiscount: {
        type: Number
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

cartSchema.methods.calculateTotalPrice = function() {
    this.totalCartPrice =  this.cartItem.reduce((total, item)=> total + (item.price * item.quantity), 0);
    return this.totalCartPrice;
}
cartSchema.methods.applyDiscount = function (discount) {
  if (!discount || !discount.isActive) {
    this.priceAfterDiscount = this.totalCartPrice;
    return this.priceAfterDiscount;
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    throw new Error("Discount expired");
  }

  if (discount.minCartValue && this.totalCartPrice < discount.minCartValue) {
    throw new Error("Cart value too low for this discount");
  }

  let discountAmount = 0;

  if (discount.type === "percentage") {
    discountAmount = (this.totalCartPrice * discount.value) / 100;
  }

  if (discount.type === "flat") {
    discountAmount = discount.value;
  }

  if (discount.maxDiscount) {
    discountAmount = Math.min(discountAmount, discount.maxDiscount);
  }

  this.priceAfterDiscount = Math.max(
    this.totalCartPrice - discountAmount,
    0
  );

  return this.priceAfterDiscount;
};


export const Cart = mongoose.model("Cart", cartSchema)
