import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    sold: {
        type: Boolean
    },
    price: {
        type: Number,
        default: 0
    },
    priceAfterDiscount: {
        type: Number
    },
    coverImage: {
        type: String,
        required: true
    },
    images: [
        {
            type: String
        }
    ],
    material: {
        type: String,
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Unisex"]
    },
    size: {
        type: [String],
        enum: ["XS", "S", "M", "L", "XL", "XXL"],
        required: true
    },
    color: {
        type: [String],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory"
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand"
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    }
},{timestamps: true});


// AUTO-GENERATE SLUG BEFORE SAVE
productSchema.pre("save", function(next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }
    next();
});
//on update as well
productSchema.pre("findOneAndUpdate", function(next) {
    const update = this.getUpdate();

    if (update.name) {
        update.slug = slugify(update.name, {
            lower: true,
            strict: true,
            trim: true
        });
    }

    next();
});

export const Product = mongoose.model("Product", productSchema);
